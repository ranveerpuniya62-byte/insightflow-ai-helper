import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { generateImage } from "@/lib/generate-image.functions";
import { compressImage } from "@/lib/image";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Download, Plus, Camera, ImagePlus, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/generate")({
  component: Generate,
  head: () => ({ meta: [{ title: "Image Generator — AI Study Chat" }] }),
});

function Generate() {
  const [prompt, setPrompt] = useState("");
  const [url, setUrl] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const fn = useServerFn(generateImage);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => fn({ data: { prompt, referenceImageDataUrl: reference ?? undefined } }),
    onSuccess: (r) => { setUrl(r.imageUrl); qc.invalidateQueries({ queryKey: ["credits"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error("Image too large (10 MB max)");
    try {
      setReference(await compressImage(f));
    } catch {
      toast.error("Couldn't read image");
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange-500 to-pink-500"><ImageIcon className="h-5 w-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold">Image Generator</h1><p className="text-sm text-muted-foreground">Turn ideas into study visuals. Attach a reference for image-to-image.</p></div>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Describe the image you want…" rows={4} />

          {reference && (
            <div className="relative w-fit">
              <img src={reference} alt="reference" className="max-h-40 rounded-lg border" />
              <button
                type="button"
                onClick={() => setReference(null)}
                aria-label="Remove reference"
                className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-background border shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="icon" aria-label="Attach reference image">
                  <Plus className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => cameraRef.current?.click()}>
                  <Camera className="h-4 w-4 mr-2" /> Camera
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => galleryRef.current?.click()}>
                  <ImagePlus className="h-4 w-4 mr-2" /> Gallery
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              className="flex-1 gradient-bg text-white border-0"
              disabled={m.isPending || prompt.trim().length < 3}
              onClick={() => m.mutate()}
            >
              {m.isPending ? "Generating…" : reference ? "Generate from reference" : "Generate image"}
            </Button>
          </div>

          <input ref={cameraRef} type="file" accept="image/*" capture="environment" hidden onChange={pickImage} />
          <input ref={galleryRef} type="file" accept="image/*" hidden onChange={pickImage} />
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
