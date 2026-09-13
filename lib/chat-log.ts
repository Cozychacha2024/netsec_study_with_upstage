import "server-only";

export type ChatLogEnv = {
  SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  CHAT_SITE_ID?: string;
};

// No read API is exposed to visitors. Only the server writes chat records.
export async function saveChatTurn(
  env: ChatLogEnv,
  input: { question: string; answer: string; site: string; token?: unknown },
  fetcher: typeof fetch = fetch,
): Promise<string | undefined> {
  const url = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secret) {
    console.warn("[chat-log] missing_config: set SUPABASE_URL and SUPABASE_SECRET_KEY");
    return;
  }
  if (secret.startsWith("sb_publishable_")) {
    console.warn("[chat-log] wrong_key_type: server secret key required");
    return;
  }
  let stage = "configuration";
  try {
    const base = new URL(url);
    if (base.protocol !== "https:" || base.username || base.password) throw new Error();
    const site = (env.CHAT_SITE_ID || input.site).slice(0, 100);
    const encoder = new TextEncoder();
    const signingKey = await crypto.subtle.importKey(
      "raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
    );
    const payload = (id: string) => encoder.encode(`${site}:${id}`);
    let conversationId: string | undefined;
    if (typeof input.token === "string" && /^[0-9a-f-]{36}\.[0-9a-f]{64}$/.test(input.token)) {
      const [id, signature] = input.token.split(".");
      const bytes = Uint8Array.from(signature.match(/../g)!, value => parseInt(value, 16));
      if (await crypto.subtle.verify("HMAC", signingKey, bytes, payload(id))) conversationId = id;
    }
    const headers: Record<string, string> = {
      apikey: secret, "Content-Type": "application/json", Prefer: "return=minimal",
    };
    // Modern secret keys aren't JWTs. Legacy service_role keys need Bearer auth.
    if (!secret.startsWith("sb_secret_")) headers.Authorization = `Bearer ${secret}`;
    const signal = AbortSignal.timeout(8000);
    const request = (table: string, init: RequestInit = {}) => fetcher(
      new URL(`/rest/v1/${table}`, base), { ...init, headers, signal, cache: "no-store" },
    );
    const ok = (response: Response) => {
      if (!response.ok) throw new Error(`http_${response.status}`);
    };
    if (!conversationId) {
      stage = "create_conversation";
      conversationId = crypto.randomUUID();
      ok(await request("boannyang_conversations", {
        method: "POST", body: JSON.stringify({ id: conversationId, site_id: site }),
      }));
    }
    // The unique (conversation_id, position) constraint handles concurrent sends.
    for (let attempt = 0; attempt < 3; attempt++) {
      stage = "read_position";
      const response = await request(`boannyang_messages?conversation_id=eq.${conversationId}&select=position&order=position.desc&limit=1`);
      ok(response);
      const rows = await response.json() as { position: number }[];
      const position = (rows[0]?.position || 0) + 1;
      stage = "insert_messages";
      const inserted = await request("boannyang_messages", {
        method: "POST",
        body: JSON.stringify([
          { conversation_id: conversationId, position, role: "user", content: input.question },
          { conversation_id: conversationId, position: position + 1, role: "assistant", content: input.answer },
        ]),
      });
      if (inserted.status === 409 && attempt < 2) continue;
      ok(inserted);
      const signature = await crypto.subtle.sign("HMAC", signingKey, payload(conversationId));
      const hex = Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, "0")).join("");
      return `${conversationId}.${hex}`;
    }
  } catch (error) {
    // Never log keys, message contents, URLs or raw Supabase error bodies.
    const code = error instanceof Error && /^http_\d{3}$/.test(error.message) ? error.message : "request_failed";
    console.error(`[chat-log] ${stage}: ${code}`);
  }
}
