import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";

export const Route = createFileRoute("/help")({
  component: () => (
    <LegalPage title="Help Center">
      <p>Need a hand? Here's how to get the most out of AI Study Chat:</p>
      <ul>
        <li><strong>AI Chat:</strong> Start a new thread and ask anything. Attach an image if it helps.</li>
        <li><strong>Homework Helper:</strong> Pick a subject and paste your problem. Get a structured, step-by-step solution.</li>
        <li><strong>Image Analysis:</strong> Upload a photo of a diagram, worksheet, or notes for a full breakdown.</li>
        <li><strong>Image Generator:</strong> Describe a concept and get a visual you can save.</li>
      </ul>
      <p>Still stuck? <Link to="/contact" className="text-primary underline">Contact us</Link>.</p>
    </LegalPage>
  ),
  head: () => ({ meta: [{ title: "Help — AI Study Chat" }] }),
});
