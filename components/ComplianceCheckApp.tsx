"use client";

import { useEffect, useState } from "react";
import { Hero } from "./Hero";
import { ProgressTrail } from "./ProgressTrail";
import { QuestionStep } from "./QuestionStep";
import { EmailGateStep, type GateSubmission } from "./EmailGateStep";
import { ResultView } from "./ResultView";
import { ClientErrorBeacon } from "./ClientErrorBeacon";
import { QUESTIONS } from "@/data/questions";
import { gradeAnswers, previewFlaggedCategoryCount } from "@/data/scoring";
import type { ComplianceAnswers } from "@/lib/engine/types";
import type { OnPageResult } from "@/lib/recommendation/types";
import type { ChannelMode } from "@/channels/types";
import type { HeadlineVariant } from "@/lib/copy/headline";
import {
  trackPixelEvent,
  generateEventId,
  getFbCookies,
  buildFbcFromClickId,
} from "@/channels/pixel";

// "intro" stage removed 2026-07-18: the tool now opens directly on question
// 1 to close the intro-to-Q1 drop-off (see components/Hero.tsx, repurposed
// into a slim header shown above question 1 only).
type Stage =
  | { name: "question"; index: number }
  | { name: "gate" }
  | { name: "submitting" }
  | { name: "result"; onPageResult: OnPageResult; reportUrl: string }
  | { name: "error"; message: string };

export function ComplianceCheckApp({
  mode,
  fbclid,
  headlineVariant,
}: {
  mode: ChannelMode;
  fbclid?: string;
  headlineVariant: HeadlineVariant;
}) {
  const [stage, setStage] = useState<Stage>({ name: "question", index: 0 });
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

  // Per-question funnel instrumentation, added 2026-07-21. Fires a ToolStep
  // Pixel event as each question renders so Meta Events Manager shows which
  // question people abandon on (there was previously no per-step signal
  // between ToolStart and Lead). Client-only, like ToolComplete: it is a
  // diagnostic funnel event, not an optimization event, so it needs no CAPI
  // twin. Guarded so a tracking failure can never affect the question flow.
  const currentStepIndex = stage.name === "question" ? stage.index : -1;
  useEffect(() => {
    if (currentStepIndex < 0) return;
    const question = QUESTIONS[currentStepIndex];
    if (!question) return;
    try {
      trackPixelEvent("ToolStep", {
        step_number: currentStepIndex + 1,
        step_key: question.key,
      });
    } catch {
      // Never let a tracking failure affect the question flow.
    }
  }, [currentStepIndex]);

  function handleBack() {
    if (stage.name === "question" && stage.index > 0) {
      setStage({ name: "question", index: stage.index - 1 });
    } else if (stage.name === "gate") {
      setStage({ name: "question", index: QUESTIONS.length - 1 });
    }
  }

  function handleAnswer(value: string) {
    if (stage.name !== "question") return;
    const question = QUESTIONS[stage.index];
    if (!question) return;
    const isFirstAnswer =
      stage.index === 0 && Object.keys(answers).length === 0;

    // Advance the UI FIRST, before any tracking runs. Tracking used to run
    // synchronously ahead of this and could throw (see fireToolStartTracking
    // below), which froze the tool on question 1 before it ever advanced.
    // The state update itself must never depend on tracking succeeding.
    const nextAnswers = { ...answers, [question.key]: value };
    setAnswers(nextAnswers);

    if (stage.index + 1 < QUESTIONS.length) {
      setStage({ name: "question", index: stage.index + 1 });
    } else {
      setStage({ name: "gate" });
    }

    if (isFirstAnswer) {
      fireToolStartTracking();
    }
  }

  /**
   * Guarded, best-effort ToolStart tracking. Wrapped so nothing inside can
   * throw back into the caller: generateEventId() is itself hardened
   * (channels/pixel.ts), but this guard is the second line of defense so a
   * future change to the tracking call chain can never again freeze the
   * question flow. Shared eventId, passed to BOTH the browser Pixel fire
   * and the server-side CAPI twin (app/api/tool-start), so Meta dedupes the
   * pair per btc-meta-launch-tracking-plan Section 3c. This is the launch's
   * actual optimization event (Section 4), do not drop the server post even
   * though the browser fire alone looks sufficient.
   */
  function fireToolStartTracking() {
    try {
      const eventId = generateEventId();
      trackPixelEvent("ToolStart", undefined, eventId);
      const { fbp, fbc: cookieFbc } = getFbCookies();
      const fbc =
        cookieFbc ?? (fbclid ? buildFbcFromClickId(fbclid) : undefined);
      fetch("/api/tool-start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, fbclid, eventId, fbp, fbc }),
      }).catch(() => {
        // Best-effort, same as the tool_viewed POST above, never block the
        // tool on a tracking call.
      });
    } catch {
      // Never let a tracking failure affect the question flow.
    }
  }

  async function handleGateSubmit(submission: GateSubmission) {
    // Shared eventId, same dedup pattern as ToolStart above: the browser
    // Lead fire and the server-side CAPI Lead send (app/api/submit → n8n)
    // must carry the same id so Meta counts one lead, not two. Guarded so a
    // tracking failure can never block the actual submit.
    let eventId: string | undefined;
    let fbp: string | undefined;
    let fbc: string | undefined;
    try {
      eventId = generateEventId();
      trackPixelEvent("Lead", undefined, eventId);
      const cookies = getFbCookies();
      fbp = cookies.fbp;
      fbc = cookies.fbc ?? (fbclid ? buildFbcFromClickId(fbclid) : undefined);
    } catch {
      // Never let a tracking failure block the actual grade submission.
    }
    setStage({ name: "submitting" });
    try {
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          fbclid,
          eventId,
          fbp,
          fbc,
          answers,
          name: submission.name,
          email: submission.email,
          company: submission.company,
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

  // Top-align on the opening question so the eyebrow, title, progress bar,
  // and all four answer options are visible together without scrolling
  // (see CLAUDE.md revision, 2026-07-20). Every other stage keeps the
  // original vertical centering.
  const isOpeningQuestion = stage.name === "question" && stage.index === 0;

  return (
    <>
      <ClientErrorBeacon />
      <div
        className={`mx-auto flex min-h-screen max-w-2xl flex-col px-6 py-8 sm:py-16 ${
          isOpeningQuestion ? "justify-start pt-12 sm:pt-20" : "justify-center"
        }`}
      >
        {stage.name === "question" && QUESTIONS[stage.index] && (
          <div className="space-y-6 sm:space-y-8">
            {stage.index === 0 && <Hero headlineVariant={headlineVariant} />}
            <div className="space-y-6 sm:space-y-10">
              <ProgressTrail step={stage.index + 1} total={QUESTIONS.length} />
              <QuestionStep
                question={QUESTIONS[stage.index]!}
                onAnswer={handleAnswer}
                onBack={stage.index > 0 ? handleBack : undefined}
              />
            </div>
          </div>
        )}

        {(stage.name === "gate" || stage.name === "submitting") && (
          <EmailGateStep
            onSubmit={handleGateSubmit}
            submitting={stage.name === "submitting"}
            onBack={stage.name === "gate" ? handleBack : undefined}
            // All 11 questions are answered by the time the gate renders, so
            // this cast is safe. gradeAnswers() and previewFlaggedCategoryCount()
            // are both client-safe paths (see data/scoring.ts), neither imports
            // gap-library, so nothing gated leaks into the client bundle for
            // this teaser. The count makes the value of unlocking concrete;
            // the category names themselves stay gated behind submit.
            grade={gradeAnswers(answers as ComplianceAnswers)}
            flaggedCount={previewFlaggedCategoryCount(
              answers as ComplianceAnswers,
            )}
          />
        )}

        {stage.name === "result" && <ResultView result={stage.onPageResult} />}

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
    </>
  );
}
