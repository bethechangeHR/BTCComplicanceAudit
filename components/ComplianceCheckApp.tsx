"use client";

import { useEffect, useState } from "react";
import { Hero } from "./Hero";
import { ProgressTrail } from "./ProgressTrail";
import { QuestionStep } from "./QuestionStep";
import { EmailGateStep, type GateSubmission } from "./EmailGateStep";
import { ResultView } from "./ResultView";
import { QUESTIONS } from "@/data/questions";
import type { ComplianceAnswers } from "@/lib/engine/types";
import type { OnPageResult } from "@/lib/recommendation/types";
import type { ChannelMode } from "@/channels/types";
import { trackPixelEvent } from "@/channels/pixel";

type Stage =
  | { name: "intro" }
  | { name: "question"; index: number }
  | { name: "gate" }
  | { name: "submitting" }
  | { name: "result"; onPageResult: OnPageResult; reportUrl: string }
  | { name: "error"; message: string };

export function ComplianceCheckApp({
  mode,
  fbclid,
}: {
  mode: ChannelMode;
  fbclid?: string;
}) {
  const [stage, setStage] = useState<Stage>({ name: "intro" });
  const [answers, setAnswers] = useState<Partial<ComplianceAnswers>>({});

  useEffect(() => {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, fbclid }),
    }).catch(() => {
      // Ungated view tracking is best-effort; never block the tool on it.
    });
    // Fire once per page load only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleStart() {
    setStage({ name: "question", index: 0 });
  }

  function handleAnswer(value: string) {
    if (stage.name !== "question") return;
    const question = QUESTIONS[stage.index];
    if (!question) return;
    if (stage.index === 0 && Object.keys(answers).length === 0) {
      trackPixelEvent("ToolStart");
    }
    const nextAnswers = { ...answers, [question.key]: value };
    setAnswers(nextAnswers);

    if (stage.index + 1 < QUESTIONS.length) {
      setStage({ name: "question", index: stage.index + 1 });
    } else {
      setStage({ name: "gate" });
    }
  }

  async function handleGateSubmit(submission: GateSubmission) {
    trackPixelEvent("Lead");
    setStage({ name: "submitting" });
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          fbclid,
          answers,
          email: submission.email,
          phone: submission.phone,
          smsOptIn: submission.smsOptIn,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(
          body.error ?? "Something went wrong grading your business.",
        );
      }

      const data = await response.json();
      trackPixelEvent("ToolComplete", { grade: data.onPageResult?.grade });
      setStage({
        name: "result",
        onPageResult: data.onPageResult,
        reportUrl: data.reportUrl,
      });
    } catch (err) {
      setStage({
        name: "error",
        message:
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again.",
      });
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      {stage.name === "intro" && <Hero onStart={handleStart} />}

      {stage.name === "question" && QUESTIONS[stage.index] && (
        <div className="space-y-10">
          <ProgressTrail step={stage.index + 1} total={QUESTIONS.length} />
          <QuestionStep
            question={QUESTIONS[stage.index]!}
            onAnswer={handleAnswer}
          />
        </div>
      )}

      {stage.name === "gate" && (
        <EmailGateStep onSubmit={handleGateSubmit} submitting={false} />
      )}

      {stage.name === "submitting" && (
        <EmailGateStep onSubmit={() => {}} submitting />
      )}

      {stage.name === "result" && (
        <ResultView result={stage.onPageResult} reportUrl={stage.reportUrl} />
      )}

      {stage.name === "error" && (
        <div className="mx-auto max-w-md space-y-4 text-center">
          <p className="text-sm text-[#b3452f]">{stage.message}</p>
          <button
            type="button"
            onClick={() => setStage({ name: "gate" })}
            className="rounded-lg bg-btc-teal px-6 py-3 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
