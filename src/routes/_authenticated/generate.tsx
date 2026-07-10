import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateImage } from "@/lib/generate-image.functions";
import { useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/generate")({
  component: Generate,
  head: () => ({ meta: [{ title: "Image Generator — AI Study Chat" }] }),
});

function Generate() {
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const fn = useServerFn(generateImage);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => fn({ data: { prompt } }),
    onSuccess: (r) => { setUrl(r.imageUrl); qc.invalidateQueries({ queryKey: ["credits"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500"><ImageIcon className="h-5 w-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold">Image Generator</h1><p className="text-sm text-muted-foreground">Turn ideas into study visuals.</p></div>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the image you want…" rows={4} />
          <Button className="w-full gradient-bg text-white border-0" disabled={m.isPending || prompt.trim().length < 3} onClick={() => m.mutate()}>
            {m.isPending ? "Generating…" : "Generate image"}
          </Button>
        </div>

        {url && (
          <div className="glass rounded-2xl p-4 space-y-3">
            <img src={url} alt="generated" className="w-full rounded-lg" />
            <a href={url} download="ai-study-chat.png"><Button variant="outline" className="w-full"><Download className="h-4 w-4 mr-2" /> Download</Button></a>
          </div>
        )}
      </div>
    </AppShell>
  );
}
