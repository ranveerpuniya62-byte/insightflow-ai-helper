import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Home, MessageSquare, BookOpen, ScanLine, Image as ImageIcon, History, User, LogOut, Sparkles, Settings, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/chat", label: "AI Chat", icon: MessageSquare },
  { to: "/homework", label: "Homework", icon: BookOpen },
  { to: "/analyze", label: "Analyze", icon: ScanLine },
  { to: "/generate", label: "Generate", icon: ImageIcon },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const mobileNav = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: MessageSquare },
  { to: "/history", label: "History", icon: History },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const state = useRouterState();
  const pathname = state.location.pathname;

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border/50 bg-sidebar p-4">
        <Link to="/dashboard" className="flex items-center gap-2 mb-6">
          <div className="grid h-8 w-8 place-items-center rounded-lg gradient-bg shadow-glow">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold">AI Study Chat</span>
        </Link>
        <nav className="flex-1 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"}`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" size="sm" className="justify-start" onClick={signOut}><LogOut className="h-4 w-4 mr-2" /> Sign out</Button>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-background/70 backdrop-blur px-4 h-14">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg gradient-bg"><Sparkles className="h-3.5 w-3.5 text-white" /></div>
            <span className="font-semibold text-sm">AI Study Chat</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out"><LogOut className="h-4 w-4" /></Button>
        </header>

        <main className="flex-1 min-w-0">{children}</main>

        <nav className="md:hidden sticky bottom-0 z-30 grid grid-cols-5 border-t border-border/50 bg-background/80 backdrop-blur">
          {nav.slice(0, 5).map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-0.5 py-2 text-[10px] ${active ? "text-primary" : "text-muted-foreground"}`}>
                <n.icon className="h-4 w-4" />{n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
