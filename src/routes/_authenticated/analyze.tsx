import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyzeImage } from "@/lib/ai.functions";
import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { toast } from "sonner";
import { ScanLine, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/analyze")({
  component: Analyze,
  head: () => ({ meta: [{ title: "Image Analysis — AI Study Chat" }] }),
});

async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });
}

function Analyze() {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [answer, setAnswer] = useState("");
  const fn = useServerFn(analyzeImage);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => fn({ data: { imageDataUrl: image!, prompt } }),
    onSuccess: (r) => { setAnswer(r.answer); qc.invalidateQueries({ queryKey: ["credits"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error("Image too large");
    setImage(await fileToDataUrl(f));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500"><ScanLine className="h-5 w-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold">Image Analysis</h1><p className="text-sm text-muted-foreground">Upload a problem, diagram, or photo.</p></div>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          {!image ? (
            <label className="block cursor-pointer rounded-xl border-2 border-dashed border-border p-12 text-center hover:bg-accent/30">
              <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
              <div className="mt-2 text-sm">Click to upload or take a photo</div>
              <input type="file" accept="image/*" className="hidden" onChange={pick} />
            </label>
          ) : (
            <div className="space-y-3">
              <img src={image} alt="upload" className="w-full max-h-96 object-contain rounded-lg" />
              <Input value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Optional: what should I focus on?" />
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => { setImage(null); setAnswer(""); }}>Replace</Button>
                <Button className="gradient-bg text-white border-0 flex-1" disabled={m.isPending} onClick={() => m.mutate()}>
                  {m.isPending ? "Analyzing…" : "Analyze"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {answer && <div className="glass rounded-2xl p-5"><Markdown>{answer}</Markdown></div>}
      </div>
    </AppShell>
  );
}
