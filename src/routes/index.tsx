import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { MessageSquare, BookOpen, Image as ImageIcon, ScanLine, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({ component: Landing });

const features = [
  { icon: MessageSquare, title: "AI Chat", desc: "Conversational AI tuned for study help. Streaming answers with math, code, and citations." },
  { icon: BookOpen, title: "Homework Helper", desc: "Step-by-step, exam-focused solutions across math, science, English, history, and GK." },
  { icon: ScanLine, title: "Image Analysis", desc: "Upload a photo of a problem or diagram — get an instant, structured explanation." },
  { icon: ImageIcon, title: "Image Generator", desc: "Turn any concept into a visual. Perfect for diagrams, notes, and revision." },
];

function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-40" style={{ background: "var(--gradient-hero)", filter: "blur(120px)" }} />
          <div className="mx-auto max-w-5xl px-4 pt-20 pb-24 text-center">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Your AI-powered <span className="gradient-text">study companion</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Chat, solve homework, analyze images, and generate visuals — all in one beautifully crafted app built for how you actually study.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/auth"><Button size="lg" className="gradient-bg text-white border-0 shadow-elegant">Start free <ArrowRight className="ml-2 h-4 w-4" /></Button></Link>
              <Link to="/about"><Button size="lg" variant="outline">Learn more</Button></Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 hover:shadow-elegant transition-shadow">
              <div className="grid h-11 w-11 place-items-center rounded-xl gradient-bg shadow-glow">
                <f.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </section>

        <section className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Built for the way students learn</h2>
          <p className="mt-4 text-muted-foreground">Daily credits reset every 24 hours. No credit card. No noise.</p>
          <Link to="/auth" className="mt-8 inline-flex"><Button size="lg" className="gradient-bg text-white border-0">Create your free account</Button></Link>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
