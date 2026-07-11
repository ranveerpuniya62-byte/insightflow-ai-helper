import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { getCredits } from "@/lib/credits.functions";
import { MessageSquare, BookOpen, ScanLine, Image as ImageIcon, History, User, Settings, Crown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: Dashboard,
  head: () => ({ meta: [{ title: "Dashboard — AI Study Chat" }] }),
});

const cards = [
  { to: "/chat", icon: MessageSquare, title: "AI Chat", desc: "Ask anything, get instant help", gradient: "from-violet-500 to-fuchsia-500" },
  { to: "/homework", icon: BookOpen, title: "Homework Helper", desc: "Step-by-step exam solutions", gradient: "from-blue-500 to-cyan-500" },
  { to: "/analyze", icon: ScanLine, title: "Image Analysis", desc: "Explain any photo or diagram", gradient: "from-emerald-500 to-teal-500" },
  { to: "/generate", icon: ImageIcon, title: "Image Generator", desc: "Create study visuals from text", gradient: "from-orange-500 to-pink-500" },
  { to: "/history", icon: History, title: "History", desc: "Revisit past sessions", gradient: "from-slate-500 to-slate-700" },
  { to: "/profile", icon: User, title: "Profile", desc: "Account and preferences", gradient: "from-indigo-500 to-purple-500" },
  { to: "/settings", icon: Settings, title: "Settings", desc: "Theme, language, and more", gradient: "from-pink-500 to-rose-500" },
] as const;

function useCountdown(iso?: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60_000); return () => clearInterval(t); }, []);
  if (!iso) return "";
  const diff = new Date(iso).getTime() - now;
  if (diff <= 0) return "resetting…";
  const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function Dashboard() {
  const fn = useServerFn(getCredits);
  const { data: credits } = useQuery({ queryKey: ["credits"], queryFn: () => fn() });
  const [name, setName] = useState("");
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setName((data.user?.user_metadata as any)?.full_name || data.user?.email?.split("@")[0] || "friend")); }, []);
  const reset = useCountdown(credits?.reset_at);

  return (
    <AppShell>
      <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Hi {name} 👋</h1>
          <p className="text-muted-foreground mt-1">What are we tackling today?</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <CreditCard label="Chat" value={credits?.chats_remaining} total={10} reset={reset} />
          <CreditCard label="Homework" value={credits?.homework_remaining} total={10} reset={reset} />
          <CreditCard label="Images" value={credits?.image_credits_remaining} total={5} reset={reset} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.to} to={c.to} className="group glass rounded-2xl p-5 hover:shadow-elegant transition-all hover:-translate-y-0.5">
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${c.gradient} shadow-glow`}>
                <c.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function CreditCard({ label, value, total, reset }: { label: string; value?: number; total: number; reset: string }) {
  const v = value ?? 0;
  const pct = Math.min(100, (v / total) * 100);
  return (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">Resets in {reset}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1"><span className="text-3xl font-bold">{v}</span><span className="text-muted-foreground">/ {total}</span></div>
      <div className="mt-3 h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full gradient-bg" style={{ width: `${pct}%` }} /></div>
    </div>
  );
}
