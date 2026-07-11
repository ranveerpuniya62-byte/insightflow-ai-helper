import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCredits } from "@/lib/credits.functions";
import { Crown, LogOut, MessageSquare, BookOpen, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  component: Profile,
  head: () => ({ meta: [{ title: "Profile — AI Study Chat" }] }),
});

function Profile() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const qc = useQueryClient();
  const fn = useServerFn(getCredits);
  const { data: credits } = useQuery({ queryKey: ["credits"], queryFn: () => fn() });

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email || "");
      const { data: p } = await supabase.from("profiles").select("full_name").eq("id", data.user.id).maybeSingle();
      setName(p?.full_name || "");
    });
  }, []);

  async function save() {
    setLoading(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;
    const { error } = await supabase.from("profiles").update({ full_name: name, updated_at: new Date().toISOString() }).eq("id", u.user.id);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Profile updated");
  }

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  const stats = [
    { icon: MessageSquare, label: "AI Chats", value: credits?.chats_remaining ?? 0, total: 10 },
    { icon: BookOpen, label: "Homework", value: credits?.homework_remaining ?? 0, total: 10 },
    { icon: ImageIcon, label: "Images", value: credits?.image_credits_remaining ?? 0, total: 5 },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-xl p-4 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold">Profile</h1>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div><Label>Email</Label><Input value={email} disabled /></div>
          <div><Label>Full name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <Button onClick={save} disabled={loading} className="gradient-bg text-white border-0">Save</Button>
        </div>

        <div className="glass rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">Subscription</div>
              <div className="mt-1 font-semibold">Free Plan</div>
            </div>
            <Link to="/upgrade"><Button size="sm" className="gradient-bg text-white border-0"><Crown className="h-4 w-4 mr-1.5" /> Upgrade</Button></Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border/50 p-3 text-center">
                <s.icon className="h-4 w-4 mx-auto text-muted-foreground" />
                <div className="mt-1.5 text-lg font-bold">{s.value}<span className="text-xs text-muted-foreground font-normal">/{s.total}</span></div>
                <div className="text-[10px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={signOut} className="w-full"><LogOut className="h-4 w-4 mr-2" /> Logout</Button>
      </div>
    </AppShell>
  );
}

