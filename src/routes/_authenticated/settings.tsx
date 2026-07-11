import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { useTheme, type Theme } from "@/lib/theme";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon, Monitor, Languages, Bell, History, Info, Mail, Shield, FileText, Cookie, HelpCircle, LifeBuoy, LogOut, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — AI Study Chat" }] }),
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [lang, setLang] = useState("en");
  const [notif, setNotif] = useState(true);
  const nav = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    setLang(localStorage.getItem("asc-lang") || "en");
    setNotif(localStorage.getItem("asc-notif") !== "0");
  }, []);

  function updateLang(v: string) { setLang(v); localStorage.setItem("asc-lang", v); toast.success("Language updated"); }
  function updateNotif(v: boolean) { setNotif(v); localStorage.setItem("asc-notif", v ? "1" : "0"); }

  async function signOut() {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    nav({ to: "/auth", replace: true });
  }

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Monitor },
  ];

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl p-4 md:p-8 space-y-6">
        <h1 className="text-2xl font-bold">Settings</h1>

        <Section title="Appearance">
          <div className="grid grid-cols-3 gap-2">
            {themes.map((t) => {
              const active = theme === t.value;
              return (
                <button key={t.value} onClick={() => setTheme(t.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border p-4 transition-all ${active ? "border-primary bg-accent" : "border-border hover:bg-accent/50"}`}>
                  <t.icon className="h-5 w-5" />
                  <span className="text-sm">{t.label}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Preferences">
          <Row icon={Languages} label="Language">
            <Select value={lang} onValueChange={updateLang}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="de">Deutsch</SelectItem>
                <SelectItem value="hi">हिन्दी</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="zh">中文</SelectItem>
              </SelectContent>
            </Select>
          </Row>
          <Row icon={Bell} label="Notifications">
            <Switch checked={notif} onCheckedChange={updateNotif} />
          </Row>
          <LinkRow to="/history" icon={History} label="History" />
        </Section>

        <Section title="About & Legal">
          <LinkRow to="/about" icon={Info} label="About Us" />
          <LinkRow to="/contact" icon={Mail} label="Contact Us" />
          <LinkRow to="/privacy" icon={Shield} label="Privacy Policy" />
          <LinkRow to="/terms" icon={FileText} label="Terms & Conditions" />
          <LinkRow to="/cookies" icon={Cookie} label="Cookie Policy" />
          <LinkRow to="/faq" icon={HelpCircle} label="FAQ" />
          <LinkRow to="/help" icon={LifeBuoy} label="Help Center" />
        </Section>

        <Button variant="outline" onClick={signOut} className="w-full">
          <LogOut className="h-4 w-4 mr-2" /> Logout
        </Button>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl p-4 space-y-1">
      <h2 className="text-xs uppercase tracking-wide text-muted-foreground px-2 py-1">{title}</h2>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: typeof Sun; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg px-2 py-3">
      <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{label}</span></div>
      {children}
    </div>
  );
}

function LinkRow({ to, icon: Icon, label }: { to: string; icon: typeof Sun; label: string }) {
  return (
    <Link to={to} className="flex items-center justify-between rounded-lg px-2 py-3 hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-3"><Icon className="h-4 w-4 text-muted-foreground" /><span className="text-sm">{label}</span></div>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
