import Image from "next/image";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-reveal-in mx-auto max-w-2xl space-y-8 text-center">
      <Image
        src="/btc-logo-color.png"
        alt="be the change HR"
        width={168}
        height={56}
        className="mx-auto h-auto w-36 sm:w-40"
        priority
      />
      <div className="space-y-6">
        <h1 className="text-balance font-display text-4xl font-medium text-ink sm:text-5xl">
          The HR gaps exposing your California business, before they become a
          claim.
        </h1>
        <p className="text-base text-btc-gray sm:text-lg">
          11 quick questions. A real A-F grade and the specific gaps putting you
          at risk right now.
        </p>
      </div>
      <button
        type="button"
        onClick={onStart}
        className="rounded-lg bg-btc-teal px-8 py-4 text-base font-semibold text-white shadow-seal transition-transform hover:-translate-y-0.5"
      >
        Start my free risk audit
      </button>
      <p className="text-xs text-btc-gray/60">
        Built by California HR professionals. About 90 seconds, no cost, no
        obligation.
      </p>
    </div>
  );
}
