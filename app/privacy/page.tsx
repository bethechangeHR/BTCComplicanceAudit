import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | be the change HR",
  description:
    "How Be the Change HR, Inc. collects, uses, and protects information submitted through the California HR Risk Audit tool.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-btc-gray">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-medium text-ink">
            Privacy Policy
          </h1>
          <p className="text-sm text-btc-gray/70">Last updated: July 14, 2026</p>
        </div>

        <section className="space-y-3">
          <p>
            Be the Change HR, Inc. (&ldquo;Be the Change HR,&rdquo;
            &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects
            your privacy. This Privacy Policy explains what
            information we collect through the California HR Risk Audit tool
            and our other websites, how we use it, and the choices you have.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Information we collect
          </h2>
          <p>
            When you use the California HR Risk Audit, we collect the answers
            you provide to the audit questions along with any contact
            information you choose to submit: your name, email address,
            company name, and phone number. We also automatically collect
            standard technical information such as your IP address, browser
            type, and referring URL, and we use analytics and advertising
            tools (including the Meta Pixel) to understand how visitors use
            the tool.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            How we use your information
          </h2>
          <p>
            We use the information you provide to generate your personalized
            HR risk audit report, to email that report to you, to follow up
            about scheduling a free HR risk assessment, and to improve the
            audit tool. We do not use your information to make any automated
            decision that has a legal or similarly significant effect on you.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Text Messaging (SMS)
          </h2>
          <p>
            When you provide your mobile number and check the consent box,
            Be the Change HR may send you text messages about your HR risk
            audit results and scheduling your assessment. Message frequency
            varies. Message and data rates may apply. Reply STOP to
            unsubscribe or HELP for help at any time. We do not sell, rent,
            or share your mobile opt-in information or SMS consent with any
            third parties or affiliates for their marketing purposes. Mobile
            information will not be shared with third parties for marketing
            under any circumstances.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            How we share information
          </h2>
          <p>
            We share information with service providers who help us operate
            the audit tool and follow up with you, such as our customer
            relationship management platform, workflow automation provider,
            and email and text messaging providers. These service providers
            are only permitted to use your information to perform services
            on our behalf. We do not sell your personal information, and we
            do not share your mobile opt-in information or SMS consent with
            any third party for their own marketing purposes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Cookies and advertising
          </h2>
          <p>
            We use the Meta Pixel and similar technologies to measure the
            performance of our advertising and to understand how visitors
            interact with the audit tool. You can control cookies and
            tracking through your browser settings and through the ad
            preference tools offered by advertising platforms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Data retention
          </h2>
          <p>
            We retain the information you submit for as long as reasonably
            necessary to provide the audit report, respond to your inquiries,
            and maintain business records, unless a longer retention period
            is required or permitted by law.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Your rights
          </h2>
          <p>
            If you are a California resident, you may have rights under the
            California Consumer Privacy Act (CCPA), as amended by the
            California Privacy Rights Act (CPRA), including the right to
            know what personal information we collect, the right to request
            deletion of your personal information, and the right to opt out
            of certain sharing. To exercise any of these rights, or to
            unsubscribe from text messages or email, contact us using the
            information below.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="font-display text-xl font-medium text-ink">
            Contact us
          </h2>
          <p>
            If you have questions about this Privacy Policy or how we handle
            your information, contact us at{" "}
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
