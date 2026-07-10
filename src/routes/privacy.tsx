import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/privacy")({
  component: () => (
    <LegalPage title="Privacy Policy">
      <p>We respect your privacy. This policy describes what we collect and how we use it.</p>
      <h2>Information we collect</h2>
      <p>Account information (email, name), content you submit (chats, uploads), and basic usage analytics.</p>
      <h2>How we use it</h2>
      <p>To provide the service, improve features, and communicate with you.</p>
      <h2>Data storage</h2>
      <p>Your data is stored securely and never sold. You can delete your account and data at any time by contacting us.</p>
      <h2>Third-party AI</h2>
      <p>Prompts you submit are sent to AI providers for processing. Do not submit sensitive personal or confidential information.</p>
      <p>Last updated: {new Date().toLocaleDateString()}.</p>
    </LegalPage>
  ),
  head: () => ({ meta: [{ title: "Privacy Policy — AI Study Chat" }] }),
});
