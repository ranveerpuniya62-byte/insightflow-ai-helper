import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/cookies")({
  component: () => (
    <LegalPage title="Cookie Policy">
      <p>We use cookies and similar technologies to keep you signed in and remember preferences.</p>
      <h2>Essential cookies</h2><p>Required for authentication and session management.</p>
      <h2>Analytics</h2><p>Aggregate, anonymized usage data to improve the product.</p>
      <p>You can clear cookies from your browser settings at any time.</p>
    </LegalPage>
  ),
  head: () => ({ meta: [{ title: "Cookie Policy — AI Study Chat" }] }),
});
