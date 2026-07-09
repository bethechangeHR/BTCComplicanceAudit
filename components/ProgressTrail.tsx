export function ProgressTrail({
  step,
  total,
}: {
  step: number;
  total: number;
}) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-ink">
          Question {step} of {total}
        </span>
        <span className="text-btc-gray/70">
          {Math.round((step / total) * 100)}%
        </span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${
              i < step ? "bg-btc-teal" : "bg-ink/10"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
