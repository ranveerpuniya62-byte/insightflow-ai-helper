import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

const STORAGE_KEY = "asc-cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // storage unavailable (private mode) — keep the banner hidden
    }
  }, []);

  function choose(value: "accepted" | "rejected") {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore — consent still applies for this visit
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border/60 bg-background/95 backdrop-blur shadow-elegant"
    >
      <div className="mx-auto flex max-w-4xl flex-col items-start gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          We use essential cookies to keep you signed in and remember your preferences, plus
          anonymous analytics to improve the app. Read our{" "}
          <Link to="/cookies" className="text-primary underline">
            Cookie Policy
          </Link>
          .
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={() => choose("rejected")}
            className="rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent/50"
          >
            Decline
          </button>
          <button
            onClick={() => choose("accepted")}
            className="rounded-md gradient-bg px-3 py-1.5 text-xs font-medium text-white border-0"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
