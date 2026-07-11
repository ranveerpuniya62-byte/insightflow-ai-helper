import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, Rocket } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/upgrade")({
  component: UpgradePage,
  head: () => ({ meta: [{ title: "Upgrade Plan — AI Study Chat" }] }),
});

const plans = [
  { id: "monthly", name: "Monthly", price: 12, period: "/month", icon: Zap, badge: null, gradient: "from-blue-500 to-cyan-500" },
  { id: "2m", name: "2 Months", price: 30, period: "/2 months", icon: Sparkles, badge: null, gradient: "from-violet-500 to-fuchsia-500" },
  { id: "6m", name: "6 Months", price: 60, period: "/6 months", icon: Crown, badge: "Best Value", gradient: "from-amber-500 to-orange-500" },
  { id: "yearly", name: "Yearly", price: 200, period: "/year", icon: Rocket, badge: "Save 30%", gradient: "from-emerald-500 to-teal-500" },
];

const benefits = [
  "Unlimited AI Chat",
  "Unlimited Homework Helper",
  "Unlimited Image Analysis",
  "Unlimited AI Image Generation",
  "Faster Responses",
  "No Ads",
  "Priority Access",
];

function UpgradePage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-bg shadow-glow">
            <Crown className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Upgrade to Premium</h1>
          <p className="text-muted-foreground">Unlock unlimited learning power</p>
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="font-semibold mb-4">Premium Benefits</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2 text-sm">
                <div className="grid h-5 w-5 place-items-center rounded-full gradient-bg"><Check className="h-3 w-3 text-white" /></div>
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((p) => (
            <div key={p.id} className="glass rounded-2xl p-6 relative flex flex-col">
              {p.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full gradient-bg text-white text-[10px] font-semibold px-3 py-1 uppercase tracking-wide">{p.badge}</div>
              )}
              <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${p.gradient} shadow-glow`}>
                <p.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-4 font-semibold text-lg">{p.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold">${p.price}</span>
                <span className="text-sm text-muted-foreground">{p.period}</span>
              </div>
              <Button className="mt-6 w-full gradient-bg text-white border-0" onClick={() => toast.info("Payments coming soon — contact us to be notified.")}>
                Choose {p.name}
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">Cancel anytime. Prices in USD.</p>
      </div>
    </AppShell>
  );
}
