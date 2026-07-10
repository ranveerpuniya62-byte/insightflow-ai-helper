import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/terms")({
  component: () => (
    <LegalPage title="Terms of Service">
      <p>By using AI Study Chat you agree to these terms.</p>
      <h2>Acceptable use</h2>
      <p>Don't use the service to break the law, harass others, or generate harmful content.</p>
      <h2>Accuracy</h2>
      <p>AI responses may be incorrect. Always verify important information from trusted sources.</p>
      <h2>Limits</h2>
      <p>Daily usage is limited by credits that reset every 24 hours.</p>
      <h2>Changes</h2>
      <p>We may update these terms. Continued use means acceptance.</p>
    </LegalPage>
  ),
  head: () => ({ meta: [{ title: "Terms of Service — AI Study Chat" }] }),
});
