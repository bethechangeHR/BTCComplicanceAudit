"use client";

import Script from "next/script";
import {
  getMetaPixelId,
  getPixelAllowedHosts,
  isPixelEnabled,
} from "@/channels/pixel";

/**
 * components/MetaPixel.tsx
 *
 * Injects the standard Meta Pixel base snippet, ONLY when the pixel is
 * feature-flagged on and a pixel ID is configured. Renders nothing and
 * injects no script tag otherwise, per Hard Gate 5 in CLAUDE.md (pixel/CAPI
 * events live before spend, stays flagged off by default).
 *
 * The injected snippet also self-gates by hostname (getPixelAllowedHosts):
 * on any host not in the allowlist (Vercel preview/dev URLs, localhost) it
 * returns before defining window.fbq, so PageView never fires AND every
 * later trackPixelEvent() call no-ops (it checks typeof window.fbq). Added
 * 2026-07-21 to stop the dev domain btc-complicance-audit.vercel.app from
 * polluting the live dataset. The check runs in-browser, so nothing here
 * changes the server-rendered markup (no hydration risk).
 *
 * The base snippet's own `fbq('track', 'PageView')` call handles PageView,
 * no separate manual call is needed. ToolStart, ToolStep, Lead, and
 * ToolComplete are fired separately via channels/pixel.ts's trackPixelEvent().
 */
export function MetaPixel() {
  const pixelId = getMetaPixelId();
  if (!isPixelEnabled() || !pixelId) return null;
  const allowedHosts = getPixelAllowedHosts();

  return (
    <Script id="meta-pixel-base" strategy="afterInteractive">
      {`
        (function(){
          var allowedHosts = ${JSON.stringify(allowedHosts)};
          if (allowedHosts.length && allowedHosts.indexOf(window.location.hostname) === -1) return;
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        })();
      `}
    </Script>
  );
}
