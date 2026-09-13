import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';

const source = readFileSync(new URL('../lib/chat-log.ts', import.meta.url), 'utf8').replace('import "server-only";', '');
const js = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext } }).outputText;
const { saveChatTurn } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_SECRET_KEY: 'sb_secret_test_only', CHAT_SITE_ID: 'site-a' };
const conversations = new Map();
const messages = new Map();
let conflict = false;
async function fakeFetch(url, options) {
  assert.equal(options.headers.apikey, env.SUPABASE_SECRET_KEY);
  assert.equal(options.headers.Authorization, undefined);
  assert(options.signal);
  const body = options.body && JSON.parse(options.body);
  if (url.pathname.endsWith('boannyang_conversations')) {
    conversations.set(body.id, body); return new Response(null, { status: 201 });
  }
  if (options.method === 'POST') {
    if (conflict) { conflict = false; return new Response(null, { status: 409 }); }
    for (const row of body) {
      assert(conversations.has(row.conversation_id));
      const rows = messages.get(row.conversation_id) || [];
      assert(!rows.some(m => m.position === row.position));
      rows.push(row); messages.set(row.conversation_id, rows);
    }
    return new Response(null, { status: 201 });
  }
  const id = url.searchParams.get('conversation_id').slice(3);
  const rows = messages.get(id) || [];
  return Response.json(rows.slice(-1).map(row => ({ position: row.position })));
}
const input = { question: 'TCP란?', answer: '**연결형** 전송 프로토콜입니다.', site: 'first.example' };
const token = await saveChatTurn(env, input, fakeFetch);
assert(token);
conflict = true;
assert.equal(await saveChatTurn(env, { ...input, question: 'UDP는?', token }, fakeFetch), token);
assert.equal(conversations.size, 1);
assert.deepEqual([...messages.values()][0].map(m => m.position), [1, 2, 3, 4]);
assert.equal([...messages.values()][0][1].content, input.answer);
// A forged token or a different site's token cannot append to the old conversation.
await saveChatTurn(env, { ...input, token: token.slice(0, -1) + (token.endsWith('0') ? '1' : '0') }, fakeFetch);
await saveChatTurn({ ...env, CHAT_SITE_ID: 'site-b' }, { ...input, token }, fakeFetch);
assert.equal(conversations.size, 3);
const logs = [];
const oldWarn = console.warn, oldError = console.error;
console.warn = console.error = value => logs.push(value);
try {
  const noFetch = () => { throw Error('Unexpected request'); };
  assert.equal(await saveChatTurn({}, input, noFetch), undefined);
  assert.equal(await saveChatTurn({ ...env, SUPABASE_SECRET_KEY: 'sb_publishable_test' }, input, noFetch), undefined);
  assert.equal(await saveChatTurn(env, input, async () => new Response('private database detail', { status: 403 })), undefined);
  assert.equal(await saveChatTurn(env, input, async () => { throw Error('private key details'); }), undefined);
} finally { console.warn = oldWarn; console.error = oldError; }
assert(logs.some(s => s.includes('missing_config')));
assert(logs.some(s => s.includes('http_403')));
assert(logs.every(s => !s.includes('private') && !s.includes(env.SUPABASE_SECRET_KEY)));
console.log('PASS: paired inserts, multi-turn grouping, conflict retry, token isolation and safe failure logging.');
