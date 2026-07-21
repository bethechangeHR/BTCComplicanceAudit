"use client";

import { useEffect } from "react";

/**
 * components/ClientErrorBeacon.tsx
 *
 * Registers global `error` and `unhandledrejection` handlers and reports them
 * to app/api/client-error, which logs them server-side (Vercel logs). This is
 * the server-visible half of crash detection: a frozen in-app WebView can
 * swallow a browser-only signal, so the report is best-effort via
 * fetch(keepalive) and every path is guarded so error reporting can never
 * itself throw and mask the original error. Added 2026-07-21, see
 * channels/pixel.ts for the in-app-browser crash history this exists to catch.
 * Renders nothing.
 */
export function ClientErrorBeacon() {
  useEffect(() => {
    function report(message: string, source: string) {
      try {
        fetch("/api/client-error", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message,
            source,
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
          keepalive: true,
        }).catch(() => {
          // Best-effort only, never surface a reporting failure.
        });
      } catch {
        // Never let error reporting throw and mask the original error.
      }
    }

    function onError(event: ErrorEvent) {
      report(String(event.message || event.error || "unknown"), "onerror");
    }
    function onRejection(event: PromiseRejectionEvent) {
      report(
        String(event.reason ?? "unhandledrejection"),
        "unhandledrejection",
      );
    }

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    };
  }, []);

  return null;
}
