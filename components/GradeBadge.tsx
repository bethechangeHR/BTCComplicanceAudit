import type { RiskGrade } from "@/lib/engine/types";

const GRADE_RING: Record<RiskGrade, string> = {
  A: "from-btc-teal to-btc-teal-dark",
  B: "from-btc-teal to-btc-teal-dark",
  C: "from-btc-gold to-[#8f7442]",
  D: "from-[#c17a3d] to-[#8a4f22]",
  F: "from-[#b3452f] to-[#7a2318]",
};

export function GradeBadge({
  grade,
  animated = true,
}: {
  grade: RiskGrade;
  animated?: boolean;
}) {
  return (
    <div
      className={`relative mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br shadow-seal sm:h-48 sm:w-48 ${GRADE_RING[grade]} ${animated ? "animate-seal-in" : ""}`}
    >
      <div className="flex h-[85%] w-[85%] items-center justify-center rounded-full border-2 border-white/40 bg-white/10">
        <span className="font-display text-7xl font-medium text-white sm:text-8xl">
          {grade}
        </span>
      </div>
      <span className="absolute -bottom-2 rounded-full bg-btc-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-btc-gray shadow-document">
        Risk Grade
      </span>
    </div>
  );
}
