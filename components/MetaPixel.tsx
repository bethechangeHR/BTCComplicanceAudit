"use client";

import Script from "next/script";
import { getMetaPixelId, isPixelEnabled } from "@/channels/pixel";

/**
 * components/MetaPixel.tsx
 *
 * Injects the standard Meta Pixel base snippet, ONLY when the pixel is
 * feature-flagged on and a pixel ID is configured. Renders nothing and
 * injects no script tag otherwise, per Hard Gate 5 in CLAUDE.md (pixel/CAPI
 * events live before spend, stays flagged off by default).
 *
 * The base snippet's own `fbq('track', 'PageView')` call handles PageView,
 * no separate manual call is needed. ToolStart, Lead, and ToolComplete are
 * fired separately via channels/pixel.ts's trackPixelEvent().
 */
export function MetaPixel() {
  const pixelId = getMetaPixelId();
  if (!isPixelEnabled() || !pixelId) return null;

  return (
    <Script id="meta-pixel-base" strategy="afterInteractive">
      {`
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
      `}
    </Script>
  );
}
