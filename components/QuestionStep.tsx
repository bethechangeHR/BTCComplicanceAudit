"use client";

import type { Question } from "@/data/questions";

export function QuestionStep({
  question,
  onAnswer,
  onBack,
}: {
  question: Question;
  onAnswer: (value: string) => void;
  onBack?: () => void;
}) {
  return (
    <div key={question.key} className="animate-rise-in space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
          {question.prompt}
        </h2>
        {question.helper && (
          <p className="text-sm text-btc-gray/80">{question.helper}</p>
        )}
      </div>
      <div className="mx-auto grid max-w-lg gap-3">
        {question.options.map((option, index) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onAnswer(option.value)}
            className="animate-rise-in group flex items-center justify-between rounded-xl border border-ink/10 bg-white px-5 py-4 text-left shadow-document transition-all duration-200 hover:-translate-y-0.5 hover:border-btc-teal/60 hover:shadow-[0_20px_40px_-18px_rgba(15,111,98,0.35)] focus:outline-none focus-visible:ring-2 focus-visible:ring-btc-teal focus-visible:ring-offset-2"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="text-base text-ink sm:text-lg">
              {option.label}
            </span>
            <span className="ml-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-ink/15 text-btc-teal opacity-0 transition-opacity group-hover:opacity-100">
              &#8594;
            </span>
          </button>
        ))}
      </div>
      {onBack && (
        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-medium text-btc-gray underline underline-offset-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-btc-teal focus-visible:ring-offset-2"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
