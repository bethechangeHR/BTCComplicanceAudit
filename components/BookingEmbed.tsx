"use client";

import { useState } from "react";

export function BookingEmbed({ bookingUrl }: { bookingUrl: string }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <div
      className="animate-rise-in overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-document"
      style={{ animationDelay: "180ms" }}
    >
      <div className="border-b border-ink/8 px-6 py-4">
        <p className="font-display text-lg text-ink">
          Free 30-minute HR risk assessment
        </p>
      </div>
      <div className="relative min-h-[600px] w-full">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white text-sm text-btc-gray">
            Loading available times...
          </div>
        )}
        <iframe
          title="Book a free HR risk assessment"
          src={bookingUrl}
          onLoad={() => setLoaded(true)}
          className="h-[600px] w-full"
        />
      </div>
      <div className="border-t border-ink/8 px-6 py-2 text-center">
        <a
          href={bookingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-btc-gray/70 underline underline-offset-2"
        >
          Having trouble with the calendar? Open booking in a new tab.
        </a>
      </div>
    </div>
  );
}
