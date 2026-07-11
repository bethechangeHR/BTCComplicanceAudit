import type { CategoryRisk } from "@/lib/engine/types";

const SEVERITY_STYLE: Record<
  CategoryRisk["severity"],
  { dot: string; label: string; text: string; border: string }
> = {
  high: {
    dot: "bg-[#b3452f]",
    label: "High exposure",
    text: "text-[#8a3421]",
    border: "border-[#b3452f]/25",
  },
  medium: {
    dot: "bg-btc-gold",
    label: "Moderate exposure",
    text: "text-[#8f7442]",
    border: "border-btc-gold/30",
  },
  low: {
    dot: "bg-btc-teal",
    label: "Worth reviewing",
    text: "text-btc-teal-dark",
    border: "border-btc-teal/25",
  },
};

export function CategoryRiskList({
  categoryRisks,
}: {
  categoryRisks: CategoryRisk[];
}) {
  if (categoryRisks.length === 0) {
    return (
      <div className="rounded-2xl border border-btc-teal/25 bg-btc-teal/5 p-6 text-center">
        <p className="font-display text-lg text-btc-teal-dark">
          No flagged categories from your answers.
        </p>
        <p className="mt-1 text-sm text-btc-gray">
          That is a genuinely strong result. A second look never hurts.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {categoryRisks.map((risk, index) => {
        const style = SEVERITY_STYLE[risk.severity];
        return (
          <li
            key={risk.category}
            className="animate-rise-in flex items-center justify-between gap-4 rounded-xl border border-ink/10 bg-white px-5 py-4 shadow-document"
            style={{ animationDelay: `${index * 70}ms` }}
          >
            <span className="font-display text-base font-medium text-ink sm:text-lg">
              {risk.category}
            </span>
            <span
              className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${style.text} ${style.border}`}
            >
              <span className={`h-2 w-2 rounded-full ${style.dot}`} />
              {style.label}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
