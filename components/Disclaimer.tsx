export function Disclaimer({ text }: { text: string }) {
  return (
    <p className="mx-auto max-w-xl text-center text-xs leading-relaxed text-btc-gray/70">
      {text}
    </p>
  );
}
