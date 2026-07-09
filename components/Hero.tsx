import Image from "next/image";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-reveal-in mx-auto max-w-xl space-y-8 text-center">
      <Image
        src="/btc-logo-color.png"
        alt="Be the Change HR"
        width={168}
        height={56}
        className="mx-auto h-auto w-36 sm:w-40"
        priority
      />
      <div className="space-y-4">
        <h1 className="text-balance font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
          See exactly where your HR practices are exposing your business,
          before it becomes a claim.
        </h1>
        <p className="text-base text-btc-gray sm:text-lg">
          California employment law leaves little room for guesswork. Answer
          a few short questions and get a real HR risk grade for your
          business, plus the specific areas creating exposure right now.
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
