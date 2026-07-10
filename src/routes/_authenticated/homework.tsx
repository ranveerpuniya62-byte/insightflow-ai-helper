import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { answerHomework } from "@/lib/ai.functions";
import { Markdown } from "@/components/markdown";
import { toast } from "sonner";
import { Image as ImageIcon, X, BookOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/homework")({
  component: Homework,
  head: () => ({ meta: [{ title: "Homework Helper — AI Study Chat" }] }),
});

async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });
}

function Homework() {
  const [subject, setSubject] = useState("Math");
  const [question, setQuestion] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [answer, setAnswer] = useState("");
  const fn = useServerFn(answerHomework);
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => fn({ data: { subject, question, imageDataUrl: image || undefined } }),
    onSuccess: (r) => { setAnswer(r.answer); qc.invalidateQueries({ queryKey: ["credits"] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error("Image too large");
    setImage(await fileToDataUrl(f));
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500"><BookOpen className="h-5 w-5 text-white" /></div>
          <div><h1 className="text-2xl font-bold">Homework Helper</h1><p className="text-sm text-muted-foreground">Step-by-step, exam-focused solutions.</p></div>
        </div>

        <div className="glass rounded-2xl p-4 space-y-3">
          <Select value={subject} onValueChange={setSubject}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Math","Science","Physics","Chemistry","Biology","English","History","Geography","Computer Science","General Knowledge"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Type your question here…" rows={5} />
          <div className="flex items-center gap-2">
            <label className="cursor-pointer text-sm inline-flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ImageIcon className="h-4 w-4" /> Attach image
              <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
            </label>
            {image && <div className="relative"><img src={image} alt="" className="h-14 rounded" /><button onClick={() => setImage(null)} className="absolute -top-1 -right-1 bg-background border rounded-full p-0.5"><X className="h-3 w-3" /></button></div>}
            <div className="flex-1" />
            <Button className="gradient-bg text-white border-0" disabled={m.isPending || !question.trim()} onClick={() => m.mutate()}>
              {m.isPending ? "Solving…" : "Get solution"}
            </Button>
          </div>
        </div>

        {answer && (
          <div className="glass rounded-2xl p-5"><Markdown>{answer}</Markdown></div>
        )}
      </div>
    </AppShell>
  );
}
