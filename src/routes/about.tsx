import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/about")({
  component: () => (
    <LegalPage title="About AI Study Chat">
      <p>AI Study Chat is a modern, AI-powered study companion built for students, learners, and anyone chasing an "aha" moment.</p>
      <p>We combine chat, homework help, image analysis, and generative visuals in a single, calm interface — powered by Lovable AI.</p>
      <p>Our goal is simple: give every learner an always-available tutor.</p>
    </LegalPage>
  ),
  head: () => ({ meta: [{ title: "About — AI Study Chat" }, { name: "description", content: "About AI Study Chat, the AI-powered study companion." }] }),
});
