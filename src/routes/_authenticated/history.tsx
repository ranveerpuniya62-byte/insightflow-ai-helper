import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { listHistory, deleteHistory } from "@/lib/history.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Trash2, BookOpen, ScanLine, Image as ImageIcon } from "lucide-react";
import { Markdown } from "@/components/markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/_authenticated/history")({
  component: HistoryPage,
  head: () => ({ meta: [{ title: "History — AI Study Chat" }] }),
});

const iconFor = { homework: BookOpen, analysis: ScanLine, generation: ImageIcon } as const;

function HistoryPage() {
  const listFn = useServerFn(listHistory);
  const delFn = useServerFn(deleteHistory);
  const qc = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["history"], queryFn: () => listFn() });
  const del = useMutation({ mutationFn: (id: string) => delFn({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["history"] }) });
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<any>(null);
  const filtered = data.filter((h) => h.title.toLowerCase().includes(q.toLowerCase()));

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-4">
        <h1 className="text-2xl font-bold">History</h1>
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history…" />
        <div className="space-y-2">
          {filtered.length === 0 && <div className="glass rounded-2xl p-8 text-center text-muted-foreground">Nothing here yet.</div>}
          {filtered.map((h) => {
            const Icon = iconFor[h.kind as keyof typeof iconFor];
            return (
              <div key={h.id} className="glass rounded-xl p-4 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent"><Icon className="h-4 w-4" /></div>
                <button onClick={() => setOpen(h)} className="flex-1 min-w-0 text-left">
                  <div className="font-medium truncate">{h.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{h.kind} · {new Date(h.created_at).toLocaleString()}</div>
                </button>
                <Button variant="ghost" size="icon" onClick={() => del.mutate(h.id)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            );
          })}
        </div>

        <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{open?.title}</DialogTitle></DialogHeader>
            {open?.payload?.imageUrl && <img src={open.payload.imageUrl} className="w-full rounded-lg" />}
            {open?.payload?.answer && <Markdown>{open.payload.answer}</Markdown>}
            {open?.payload?.question && <div className="text-sm text-muted-foreground mt-2"><strong>Question:</strong> {open.payload.question}</div>}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
