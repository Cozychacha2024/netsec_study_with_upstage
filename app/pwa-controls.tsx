"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { useOnline } from "./use-online";

const serverFalse = () => false;
const hasWorker = () => "serviceWorker" in navigator && !!navigator.serviceWorker.controller;
function subscribeWorker(callback: () => void) {
  if (!("serviceWorker" in navigator)) return () => {};
  navigator.serviceWorker.addEventListener("controllerchange", callback);
  return () => navigator.serviceWorker.removeEventListener("controllerchange", callback);
}

export default function PwaControls() {
  const online = useOnline();
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const offlineReady = useSyncExternalStore(subscribeWorker, hasWorker, serverFalse);
  const applying = useRef(false);

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

  return <>
    {(!online || waiting) && <div className="pwa-status" role="status">
      {!online ? <><WifiOff size={18}/><p>{offlineReady ? "오프라인 복습 중이에요." : "인터넷 연결이 끊겼어요."}<small>보안냥이와 용어 추가는 연결 후 이용해 주세요.</small></p></>
        : <><RefreshCw size={18}/><p>새 버전이 준비됐어요.<small>새로고침하면 진행 중인 게임과 대화 화면이 초기화돼요.</small></p><button onClick={() => { applying.current = true; waiting?.postMessage({ type: "ACTIVATE_UPDATE" }); }}>새로고침</button></>}
    </div>}
  </>;
}
