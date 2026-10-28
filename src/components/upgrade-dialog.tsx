import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { Hourglass } from "lucide-react";

type Ctx = { open: (reason?: string) => void };
const LimitCtx = createContext<Ctx>({ open: () => {} });

export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [openState, setOpen] = useState(false);
  const open = useCallback(() => setOpen(true), []);
  return (
    <LimitCtx.Provider value={{ open }}>
      {children}
      <Dialog open={openState} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl gradient-bg shadow-glow mb-2">
              <Hourglass className="h-6 w-6 text-white" />
            </div>
            <DialogTitle className="text-center text-2xl">Daily Limit Reached</DialogTitle>
            <DialogDescription className="text-center">
              You have used your free daily limit. Please wait until your daily credits reset — they refresh automatically every 24 hours.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button variant="ghost" className="w-full" onClick={() => setOpen(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </LimitCtx.Provider>
  );
}

export const useUpgrade = () => useContext(LimitCtx);

/** Detects credit-exhaustion errors and opens the daily-limit dialog. Returns true if handled. */
export function isCreditsError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return /no_credits|daily.*credit|used all your|credits exhausted|limit reached/i.test(msg);
}
