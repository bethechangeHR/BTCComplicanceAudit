export function SiteFooter() {
  return (
    <footer className="relative z-10 mx-auto max-w-2xl px-6 py-8 text-center text-xs text-btc-gray/60">
      <p>
        &copy; {new Date().getFullYear()} Be the Change HR, Inc.{" "}
        <a
          href="/privacy"
          className="underline underline-offset-2 hover:text-btc-gray"
        >
          Privacy Policy
        </a>{" "}
        &middot;{" "}
        <a
          href="/terms"
          className="underline underline-offset-2 hover:text-btc-gray"
        >
          Terms of Service
        </a>
      </p>
    </footer>
  );
}
