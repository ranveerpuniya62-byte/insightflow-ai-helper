import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { BookOpen, Clock, PenLine, Brain, Sparkles, ArrowRight } from "lucide-react";
import { siteHead } from "@/lib/seo";

export const Route = createFileRoute("/study-tips")({
  component: StudyTipsHub,
  head: () =>
    siteHead({
      title: "Study Tips — Practical Guides for Students | AI Study Chat",
      description:
        "Free, practical study guides: exam preparation, time management, note-taking, memory techniques, and how to use AI to study smarter. Written for real students.",
      path: "/study-tips",
    }),
});

const articles = [
  {
    to: "/study-tips/exam-preparation",
    icon: BookOpen,
    title: "How to Prepare for Exams: A Simple Plan That Works",
    desc: "Why cramming fails, how to space your revision, and a week-by-week plan you can start today.",
  },
  {
    to: "/study-tips/time-management",
    icon: Clock,
    title: "Time Management for Students Who Feel Behind",
    desc: "Plan your week in 20 minutes, beat procrastination, and protect your focus with simple time blocks.",
  },
  {
    to: "/study-tips/note-taking",
    icon: PenLine,
    title: "How to Take Notes You'll Actually Use",
    desc: "Stop transcribing and start thinking: the question-based note system that makes revision easier.",
  },
  {
    to: "/study-tips/memory-techniques",
    icon: Brain,
    title: "Memory Techniques That Actually Work",
    desc: "Active recall, spaced repetition, mnemonics and memory palaces — what the science supports and how to apply it.",
  },
  {
    to: "/study-tips/ai-for-studying",
    icon: Sparkles,
    title: "How to Use AI to Study Smarter (Not to Cheat)",
    desc: "Turn AI into a personal tutor: practice questions, explanations, feedback on your drafts — while still doing the thinking.",
  },
];

function StudyTipsHub() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="mx-auto max-w-4xl px-4 pt-16 pb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Study tips that <span className="gradient-text">actually work</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Short, practical guides written for students — no fluff, no jargon. Each one takes
            about five minutes to read and gives you something you can use in tonight's study
            session.
          </p>
        </section>
        <section className="mx-auto max-w-4xl px-4 pb-20 grid gap-4 sm:grid-cols-2">
          {articles.map((a) => (
            <Link
              key={a.to}
              to={a.to}
              className="glass rounded-2xl p-6 transition-shadow hover:shadow-elegant"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl gradient-bg shadow-glow">
                <a.icon className="h-4 w-4 text-white" />
              </div>
              <h2 className="mt-4 font-semibold leading-snug">{a.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                Read guide <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          ))}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
