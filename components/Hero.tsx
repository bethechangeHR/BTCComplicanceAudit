import Image from "next/image";

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <div className="animate-rise-in mx-auto max-w-xl space-y-8 text-center">
      <Image
        src="/btc-logo-color.png"
        alt="Be the Change HR"
        width={168}
        height={56}
        className="mx-auto h-auto w-36 sm:w-40"
        priority
      />
      <div className="space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-btc-teal-dark">
          California HR Risk Audit
        </p>
        <h1 className="font-display text-3xl font-medium leading-tight text-ink sm:text-4xl">
          Find out what your HR practices are actually exposing you to.
        </h1>
        <p className="text-base text-btc-gray sm:text-lg">
          Eight quick questions. An instant A to F risk grade. A named list of
          exactly where your business is exposed, before it becomes a claim.
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
        Takes about 90 seconds. No cost, no obligation.
      </p>
    </div>
  );
}
