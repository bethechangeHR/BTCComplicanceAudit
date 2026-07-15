"use client";

import { useState, type FormEvent } from "react";

export interface GateSubmission {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  smsOptIn: boolean;
}

export function EmailGateStep({
  onSubmit,
  submitting,
  error,
  onBack,
}: {
  onSubmit: (submission: GateSubmission) => void;
  submitting: boolean;
  error?: string;
  onBack?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [smsOptIn, setSmsOptIn] = useState(false);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      phone: phone.trim() || undefined,
      smsOptIn: smsOptIn && phone.trim().length > 0,
    });
  }

  return (
    <div className="animate-rise-in mx-auto max-w-md space-y-6 text-center">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-medium text-ink sm:text-3xl">
          Your grade is ready.
        </h2>
        <p className="text-sm text-btc-gray/80">
          Enter your email to see your grade now and get the full audit report
          sent to your inbox.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-btc-gray/70"
          >
            Your name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Smith"
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-btc-teal focus:outline-none focus:ring-2 focus:ring-btc-teal/30"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-btc-gray/70"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-btc-teal focus:outline-none focus:ring-2 focus:ring-btc-teal/30"
          />
        </div>
        <div>
          <label
            htmlFor="company"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-btc-gray/70"
          >
            Company (optional)
          </label>
          <input
            id="company"
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Acme Co"
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-btc-teal focus:outline-none focus:ring-2 focus:ring-btc-teal/30"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="mb-1 block text-xs font-semibold uppercase tracking-wide text-btc-gray/70"
          >
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(555) 555-5555"
            className="w-full rounded-lg border border-ink/15 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-btc-teal focus:outline-none focus:ring-2 focus:ring-btc-teal/30"
          />
        </div>
        {phone.trim().length > 0 && (
          <label className="flex items-start gap-2 text-sm text-btc-gray">
            <input
              type="checkbox"
              checked={smsOptIn}
              onChange={(e) => setSmsOptIn(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-ink/25 text-btc-teal focus:ring-btc-teal/40"
            />
            <span>
              I agree to receive text messages from Be the Change HR about my
              HR audit results and scheduling my free assessment. Consent is
              not a condition of purchase. Message and data rates may apply.
              Message frequency varies. Reply HELP for help and STOP to opt
              out. See our{" "}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-btc-teal underline underline-offset-2 hover:text-btc-teal-dark"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-btc-teal underline underline-offset-2 hover:text-btc-teal-dark"
              >
                Terms of Service
              </a>
              .
            </span>
          </label>
        )}
        {error && <p className="text-sm text-[#b3452f]">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-btc-teal px-6 py-3.5 text-base font-semibold text-white shadow-seal transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60"
        >
          {submitting ? "Grading your business..." : "Reveal my grade"}
        </button>
        <p className="text-center text-xs text-btc-gray/60">
          No spam. Just your result and, if you want it, a follow-up from be the
          change HR.
        </p>
      </form>
      {onBack && !submitting && (
        <button
          type="button"
          onClick={onBack}
          className="text-sm font-medium text-btc-gray underline underline-offset-2 hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-btc-teal focus-visible:ring-offset-2"
        >
          Back
        </button>
      )}
    </div>
  );
}
