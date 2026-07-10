import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { getThread, sendChatMessage } from "@/lib/chat.functions";
import { suggestFollowups } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import { toast } from "sonner";
import { ArrowLeft, Send, Image as ImageIcon, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
  head: () => ({ meta: [{ title: "Chat — AI Study Chat" }] }),
});

async function fileToDataUrl(f: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(f); });
}

function ChatThread() {
  const { threadId } = Route.useParams();
  const getFn = useServerFn(getThread);
  const sendFn = useServerFn(sendChatMessage);
  const suggestFn = useServerFn(suggestFollowups);
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["thread", threadId], queryFn: () => getFn({ data: { id: threadId } }) });
  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);

  const messages = data?.messages ?? [];

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  const send = useMutation({
    mutationFn: async () => {
      const content = input.trim(); if (!content) throw new Error("Empty");
      setInput(""); const img = image; setImage(null);
      await sendFn({ data: { threadId, content, imageDataUrl: img || undefined } });
    },
    onSuccess: async () => {
      qc.invalidateQueries({ queryKey: ["thread", threadId] });
      qc.invalidateQueries({ queryKey: ["credits"] });
      // suggestions
      const ctx = messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n") + `\nuser: ${input}`;
      try { const r = await suggestFn({ data: { context: ctx } }); setSuggestions(r.suggestions); } catch {}
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error("Image too large (10 MB max)");
    setImage(await fileToDataUrl(f));
  }

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
        <div className="flex items-center gap-2 border-b border-border/50 p-3">
          <Link to="/chat"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="font-medium truncate">{data?.thread?.title || "Chat"}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-16">
                Ask me anything about your studies. Attach an image if helpful.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${m.role === "user" ? "gradient-bg text-white" : "glass"}`}>
                  {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : <div className="text-sm whitespace-pre-wrap">{m.content}</div>}
                </div>
              </div>
            ))}
            {send.isPending && <div className="text-sm text-muted-foreground animate-pulse">Thinking…</div>}
            {suggestions.length > 0 && !send.isPending && (
              <div className="glass rounded-2xl p-4">
                <div className="text-xs font-semibold text-muted-foreground mb-2">You may also ask:</div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s, i) => (
                    <button key={i} onClick={() => setInput(s)} className="text-xs rounded-full border border-border/50 px-3 py-1.5 hover:bg-accent">{s}</button>
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </div>
        <div className="border-t border-border/50 p-3">
          <div className="mx-auto max-w-3xl">
            {image && (
              <div className="mb-2 relative inline-block">
                <img src={image} alt="attach" className="h-20 rounded-lg" />
                <button onClick={() => setImage(null)} className="absolute -top-2 -right-2 bg-background border rounded-full p-1"><X className="h-3 w-3" /></button>
              </div>
            )}
            <div className="glass rounded-2xl p-2 flex gap-2 items-end">
              <label className="cursor-pointer p-2 text-muted-foreground hover:text-foreground">
                <ImageIcon className="h-4 w-4" />
                <input type="file" accept="image/*" className="hidden" onChange={pickImage} />
              </label>
              <Textarea
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!send.isPending) send.mutate(); } }}
                placeholder="Ask anything…" rows={1}
                className="flex-1 border-0 bg-transparent resize-none focus-visible:ring-0 min-h-[40px] max-h-40"
              />
              <Button size="icon" className="gradient-bg text-white border-0" disabled={send.isPending || !input.trim()} onClick={() => send.mutate()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
