import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { q: "Is AI Study Chat free?", a: "Yes. Every account gets daily credits that reset every 24 hours." },
  { q: "How many messages can I send per day?", a: "10 AI chat messages, 10 homework questions, and 5 image credits (analysis + generation)." },
  { q: "Do I need an account?", a: "Yes — an account keeps your history and credits synced across devices." },
  { q: "Can I upload images?", a: "Yes. Chat, Homework, and Analyze all accept image uploads for photo problems and diagrams." },
  { q: "Is my data private?", a: "Your content is private to your account. See our Privacy Policy for full details." },
];

export const Route = createFileRoute("/faq")({
  component: () => (
    <LegalPage title="Frequently Asked Questions">
      <Accordion type="single" collapsible className="not-prose">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`i${i}`}>
            <AccordionTrigger>{f.q}</AccordionTrigger>
            <AccordionContent>{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </LegalPage>
  ),
  head: () => ({ meta: [{ title: "FAQ — AI Study Chat" }] }),
});
