import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useNavigate } from "@tanstack/react-router";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Sparkles } from "lucide-react";

type Ctx = { open: (reason?: string) => void };
const UpgradeCtx = createContext<Ctx>({ open: () => {} });

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [openState, setOpen] = useState(false);
  const navigate = useNavigate();
  const open = useCallback(() => setOpen(true), []);
  return (
    <UpgradeCtx.Provider value={{ open }}>
      {children}
      <Dialog open={openState} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-bg shadow-glow mb-2">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl">Daily Limit Reached</DialogTitle>
            <DialogDescription className="text-center">
              You have used your free daily limit. Upgrade your plan for unlimited AI Chat, Homework, Image Analysis, and Image Generation, or wait until your daily credits reset.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button className="w-full gradient-bg text-white border-0" onClick={() => { setOpen(false); navigate({ to: "/upgrade" }); }}>
              Upgrade Plan
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>Maybe Later</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </UpgradeCtx.Provider>
  );
}

export const useUpgrade = () => useContext(UpgradeCtx);

/** Detects credit-exhaustion errors and opens the upgrade dialog. Returns true if handled. */
export function isCreditsError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /no_credits|daily.*credit|used all your|credits exhausted|limit reached/i.test(msg);
}
