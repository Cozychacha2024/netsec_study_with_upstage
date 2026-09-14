"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Download, RefreshCw, Smartphone, WifiOff } from "lucide-react";
import { useOnline } from "./use-online";

type InstallPrompt = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const serverFalse = () => false;
const subscribeDevice = () => () => {};
const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => matchMedia("(display-mode: standalone)").matches ||
  !!(navigator as Navigator & { standalone?: boolean }).standalone;
function subscribeDisplay(callback: () => void) {
  const display = matchMedia("(display-mode: standalone)");
  display.addEventListener("change", callback);
  return () => display.removeEventListener("change", callback);
}
const hasWorker = () => "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
function subscribeWorker(callback: () => void) {
  if (!("serviceWorker" in navigator)) return () => {};
  navigator.serviceWorker.addEventListener("controllerchange", callback);
  return () => navigator.serviceWorker.removeEventListener("controllerchange", callback);
}

export default function PwaControls() {
  const online = useOnline();
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);
  const ios = useSyncExternalStore(subscribeDevice, isIos, serverFalse);
  const standalone = useSyncExternalStore(subscribeDisplay, isStandalone, serverFalse);
  const [installed, setInstalled] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [error, setError] = useState("");
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const offlineReady = useSyncExternalStore(subscribeWorker, hasWorker, serverFalse);
  const applying = useRef(false);

  useEffect(() => {
    const offer = (event: Event) => { event.preventDefault(); setPrompt(event as InstallPrompt); };
    const finish = () => { setInstalled(true); setPrompt(null); };
    window.addEventListener("beforeinstallprompt", offer);
    window.addEventListener("appinstalled", finish);
    return () => {
      window.removeEventListener("beforeinstallprompt", offer);
      window.removeEventListener("appinstalled", finish);
    };
  }, []);

  useEffect(() => {
    // Dev/HMR assets must never be persisted by a service worker.
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    let disposed = false;
    let registration: ServiceWorkerRegistration | undefined;
    const changed = () => {
      setWaiting(null);
      if (applying.current) window.location.reload();
    };
    const check = () => {
      if (registration && !disposed) {
        setWaiting(navigator.serviceWorker.controller ? registration.waiting : null);
      }
    };
    const found = () => {
      const worker = registration?.installing;
      worker?.addEventListener("statechange", () => {
        check();
        if (!disposed && worker.state === "installed" && navigator.serviceWorker.controller) {
          setWaiting(worker);
        }
      });
    };
    const update = () => {
      if (document.visibilityState === "visible" && navigator.onLine) {
        void registration?.update().catch(() => {});
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", changed);
    document.addEventListener("visibilitychange", update);
    void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(reg => {
        if (disposed) return;
        registration = reg;
        check();
        found();
        reg.addEventListener("updatefound", found);
      }).catch(() => { /* Installing remains optional; normal online study still works. */ });
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", changed);
      document.removeEventListener("visibilitychange", update);
      registration?.removeEventListener("updatefound", found);
    };
  }, []);

  async function install() {
    if (!prompt) return;
    setInstalling(true);
    setError("");
    try {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") setInstalled(true);
      setPrompt(null);
    } catch { setError("브라우저 메뉴에서 ‘앱 설치’ 또는 ‘홈 화면에 추가’를 선택해 주세요."); }
    finally { setInstalling(false); }
  }

  return <>
    {!installed && !standalone && (prompt || ios) && <section className="pwa-install" aria-label="보안노트 설치">
      <Smartphone size={24} aria-hidden="true"/>
      <div><strong>보안노트를 홈 화면에</strong><p>앱처럼 열고, 틈날 때마다 복습해요.</p>
        {ios && !prompt && <details><summary>아이폰·아이패드 설치 방법</summary><p>브라우저의 공유 메뉴에서<br/>‘홈 화면에 추가’를 선택해 주세요.</p></details>}
        {error && <p role="status">{error}</p>}
      </div>
      {prompt && <button onClick={install} disabled={installing}><Download size={16}/>{installing ? "설치 중" : "앱 설치"}</button>}
    </section>}
    {(!online || waiting) && <div className="pwa-status" role="status">
      {!online ? <><WifiOff size={18}/><p>{offlineReady ? "오프라인 복습 중이에요." : "인터넷 연결이 끊겼어요."}<small>보안냥이와 용어 추가는 연결 후 이용해 주세요.</small></p></>
        : <><RefreshCw size={18}/><p>새 버전이 준비됐어요.<small>새로고침하면 진행 중인 게임과 대화 화면이 초기화돼요.</small></p><button onClick={() => { applying.current = true; waiting?.postMessage({ type: "ACTIVATE_UPDATE" }); }}>새로고침</button></>}
    </div>}
  </>;
}
