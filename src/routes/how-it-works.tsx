import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { MessageSquare, BookOpen, ScanLine, Image as ImageIcon, ArrowRight } from "lucide-react";
import { siteHead } from "@/lib/seo";

export const Route = createFileRoute("/how-it-works")({
  component: HowItWorks,
  head: () =>
    siteHead({
      title: "How It Works — AI Study Chat",
      description:
        "See how AI Study Chat works: create a free account, chat with an AI tutor, get step-by-step homework help, analyse images of problems, and generate study visuals.",
      path: "/how-it-works",
    }),
});

const steps = [
  {
    icon: MessageSquare,
    title: "AI Chat",
    text: "Start a conversation and ask anything — a concept you didn't understand in class, a formula you can't decode, or an essay plan. Answers stream in as you read, with math, code, and formatting rendered properly. You can attach a photo of a question if typing is easier.",
  },
  {
    icon: BookOpen,
    title: "Homework Helper",
    text: "Pick your subject, paste or photograph the problem, and get a structured, step-by-step solution — the method first, then the working, then the final answer. It's built to teach the approach, not just hand over results.",
  },
  {
    icon: ScanLine,
    title: "Image Analysis",
    text: "Upload a photo of a worksheet, diagram, or your handwritten notes. The AI reads it and gives you a structured breakdown: what the question asks, the steps involved, and what to check. Great for printed problems you'd rather not retype.",
  },
  {
    icon: ImageIcon,
    title: "Image Generator",
    text: "Describe any concept — the water cycle, a force diagram, a historical scene — and get a visual you can study from and save. Visuals make abstract ideas much easier to remember.",
  },
];

function HowItWorks() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 pt-16 pb-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            How <span className="gradient-text">AI Study Chat</span> works
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Four study tools, one calm app. Create a free account, get daily credits that reset
            every 24 hours, and use them across chat, homework help, image analysis, and image
            generation — no credit card needed.
          </p>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-8 space-y-4">
          {steps.map((s, i) => (
            <div key={s.title} className="glass rounded-2xl p-6 flex gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl gradient-bg shadow-glow">
                <s.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">
                  {i + 1}. {s.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-8">
          <div className="glass rounded-2xl p-6">
            <h2 className="font-semibold">Free daily credits</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every account gets 10 AI chat messages, 10 homework questions, and 5 image credits
              (analysis + generation combined) each day. Credits reset automatically every 24 hours
              — just come back tomorrow and continue.
            </p>
            <h2 className="mt-6 font-semibold">Your history stays yours</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Every conversation, homework session, and generated image is saved to your History so
              you can revisit, rename, or delete it anytime. Your content is private to your account
              — see our{" "}
              <Link to="/privacy" className="text-primary underline">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-20 text-center">
          <Link
            to="/auth"
            className="mt-2 inline-flex items-center rounded-md gradient-bg px-6 py-3 text-sm font-medium text-white border-0 shadow-elegant"
          >
            Create your free account <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <p className="mt-3 text-xs text-muted-foreground">
            Questions? Read the{" "}
            <Link to="/faq" className="text-primary underline">
              FAQ
            </Link>{" "}
            or{" "}
            <Link to="/contact" className="text-primary underline">
              contact us
            </Link>
            .
          </p>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
