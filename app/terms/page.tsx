import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | be the change HR",
  description:
    "Terms governing use of the California HR Risk Audit tool provided by Be the Change HR, Inc.",
};

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-btc-gray">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium text-ink">
            Terms of Service
          </h1>
          <p className="text-sm text-btc-gray/70">Last updated: July 14, 2026</p>
        </div>

        <section className="space-y-3">
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your use of
            the California HR Risk Audit tool and related services provided
            by Be the Change HR, Inc. (&ldquo;Be the Change HR,&rdquo;
            &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By
            using the audit tool, you agree to these Terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Description of service
          </h2>
          <p>
            The California HR Risk Audit is a free, self-assessment tool that
            provides a general, on-screen risk grade based on the answers you
            provide, along with an emailed report describing general risk
            categories that may apply to a business with your profile. It
            also offers the option to book a free HR risk assessment call.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Not legal advice
          </h2>
          <p>
            The audit tool and any report it generates are provided for
            general informational purposes only and do not constitute legal
            advice. Results are based solely on the answers you provide and
            are not a substitute for consultation with a qualified employment
            attorney or HR professional about your specific circumstances.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            SMS Program Terms
          </h2>
          <p>
            By opting in, you agree to receive recurring automated text
            messages from Be the Change HR at the number provided. Consent is
            not a condition of purchase. Message frequency varies. Message
            and data rates may apply. Reply STOP to cancel and HELP for help.
            Carriers are not liable for delayed or undelivered messages. For
            support, contact operations@bethechangehr.com.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Acceptable use
          </h2>
          <p>
            You agree to use the audit tool only for its intended purpose and
            to provide accurate information. You may not use the tool to
            submit false information about a business you do not own or
            operate, or to attempt to disrupt, reverse engineer, or misuse the
            service.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Intellectual property
          </h2>
          <p>
            All content, scoring methodology, and report materials produced
            by the audit tool are the property of Be the Change HR, Inc. and
            may not be reproduced or redistributed without our permission.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Limitation of liability
          </h2>
          <p>
            The audit tool is provided &ldquo;as is&rdquo; without warranties
            of any kind. To the fullest extent permitted by law, Be the
            Change HR is not liable for any decisions made in reliance on
            the audit tool&apos;s results or report.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Governing law
          </h2>
          <p>
            These Terms are governed by the laws of the State of California,
            without regard to its conflict of law principles.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Contact us
          </h2>
          <p>
            Questions about these Terms can be sent to{" "}
            <a
              href="mailto:operations@bethechangehr.com"
              className="font-medium text-btc-teal underline underline-offset-2 hover:text-btc-teal-dark"
            >
              operations@bethechangehr.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
