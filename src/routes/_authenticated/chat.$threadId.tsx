import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { AppShell } from "@/components/app-shell";
import { getThread, deleteMessage, createThread, renameThread, listThreads } from "@/lib/chat.functions";
import { suggestFollowups } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useEffect, useMemo, useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import { toast } from "sonner";
import {
  ArrowLeft, Send, X, Plus, Mic, Camera, ImageIcon, FileText, MoreVertical,
  Copy, Share2, RefreshCw, Trash2, Pencil, MessageSquarePlus, Menu, Search,
} from "lucide-react";
import { compressImage } from "@/lib/image";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
  head: () => ({ meta: [{ title: "Chat — AI Study Chat" }] }),
});

type SpeechRecognitionCtor = new () => {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: (e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void;
  onerror: (e: unknown) => void; onend: () => void;
  start: () => void; stop: () => void;
};

function ChatThread() {
  const { threadId } = Route.useParams();
  const nav = useNavigate();
  const getFn = useServerFn(getThread);
  const suggestFn = useServerFn(suggestFollowups);
  const delMsgFn = useServerFn(deleteMessage);
  const createFn = useServerFn(createThread);
  const renameFn = useServerFn(renameThread);
  const listFn = useServerFn(listThreads);
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["thread", threadId], queryFn: () => getFn({ data: { id: threadId } }) });
  const { data: threads = [] } = useQuery({ queryKey: ["threads"], queryFn: () => listFn() });

  const [input, setInput] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [attachName, setAttachName] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [optimisticUser, setOptimisticUser] = useState<string | null>(null);
  const [streaming, setStreaming] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [renameVal, setRenameVal] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recogRef = useRef<ReturnType<SpeechRecognitionCtor> | null>(null);

  const messages = data?.messages ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, streaming, optimisticUser]);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Auto-resize textarea
  useEffect(() => {
    const t = textareaRef.current;
    if (!t) return;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 200) + "px";
  }, [input]);

  const filteredThreads = useMemo(() => {
    if (!search.trim()) return threads;
    const q = search.toLowerCase();
    return threads.filter((t) => t.title.toLowerCase().includes(q));
  }, [threads, search]);

  async function send(overrideText?: string, imgOverride?: string | null) {
    const content = (overrideText ?? input).trim();
    if ((!content && !image && !imgOverride) || pending) return;
    const img = imgOverride !== undefined ? imgOverride : image;
    setInput("");
    setImage(null);
    setAttachName(null);
    setSuggestions([]);
    setOptimisticUser(content || "(image)");
    setStreaming("");
    setPending(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      if (!token) throw new Error("Not signed in");

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ threadId, content: content || "Please analyze this.", imageDataUrl: img || undefined }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const t = await res.text();
        throw new Error(t || `Error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreaming(acc);
      }

      await qc.invalidateQueries({ queryKey: ["thread", threadId] });
      qc.invalidateQueries({ queryKey: ["credits"] });
      qc.invalidateQueries({ queryKey: ["threads"] });

      const ctx = messages.slice(-6).map((m) => `${m.role}: ${m.content}`).join("\n") + `\nuser: ${content}\nassistant: ${acc}`;
      suggestFn({ data: { context: ctx } }).then((r) => setSuggestions(r.suggestions)).catch(() => {});
    } catch (e) {
      const err = e as Error;
      if (err.name !== "AbortError") toast.error(err.message);
    } finally {
      setPending(false);
      setOptimisticUser(null);
      setStreaming("");
      abortRef.current = null;
    }
  }

  async function pickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) return toast.error("Image too large (10 MB max)");
    setImage(await compressImage(f));
    setAttachName(f.name);
    setSheetOpen(false);
  }

  async function pickDoc(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) return toast.error("Document too large (4 MB max)");
    // Simple text extraction for txt; for pdf/docx we inline as text prompt if possible
    try {
      const text = await f.text();
      const snippet = text.slice(0, 6000);
      setInput((prev) => (prev ? prev + "\n\n" : "") + `[Attached ${f.name}]\n${snippet}`);
      setAttachName(f.name);
      toast.success(`Attached ${f.name}`);
    } catch {
      toast.error("Couldn't read document");
    }
    setSheetOpen(false);
  }

  function toggleMic() {
    const W = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor };
    const SR = W.SpeechRecognition || W.webkitSpeechRecognition;
    if (!SR) return toast.error("Voice input not supported in this browser");
    if (listening) { recogRef.current?.stop(); return; }
    const r = new SR();
    r.lang = "en-US"; r.continuous = false; r.interimResults = true;
    r.onresult = (e) => {
      let t = "";
      for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
      setInput(t);
    };
    r.onerror = () => setListening(false);
    r.onend = () => setListening(false);
    recogRef.current = r;
    r.start();
    setListening(true);
  }

  async function copyMsg(text: string) {
    try { await navigator.clipboard.writeText(text); toast.success("Copied"); }
    catch { toast.error("Copy failed"); }
  }

  async function shareMsg(text: string) {
    const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
    if (nav.share) { try { await nav.share({ text }); return; } catch { /* cancelled */ } }
    copyMsg(text);
  }

  async function onDeleteMessage(id: string) {
    try {
      await delMsgFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["thread", threadId] });
    } catch (e) { toast.error((e as Error).message); }
  }

  async function regenerate() {
    // Find last user message; delete last assistant message; resend user text
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    if (lastAssistant) {
      try { await delMsgFn({ data: { id: lastAssistant.id } }); }
      catch (e) { toast.error((e as Error).message); return; }
    }
    // Also delete last user (server re-inserts it)
    try { await delMsgFn({ data: { id: lastUser.id } }); } catch { /* noop */ }
    await qc.invalidateQueries({ queryKey: ["thread", threadId] });
    send(lastUser.content, null);
  }

  function editLastUser() {
    const lastUser = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUser) return;
    setInput(lastUser.content);
    textareaRef.current?.focus();
  }

  async function newChat() {
    try {
      const t = await createFn({ data: { title: "New chat" } });
      qc.invalidateQueries({ queryKey: ["threads"] });
      nav({ to: "/chat/$threadId", params: { threadId: t.id } });
      setDrawerOpen(false);
    } catch (e) { toast.error((e as Error).message); }
  }

  const renameMut = useMutation({
    mutationFn: (title: string) => renameFn({ data: { id: threadId, title } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["thread", threadId] });
      qc.invalidateQueries({ queryKey: ["threads"] });
      setRenameVal(null);
      toast.success("Renamed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const canSend = !!input.trim() || !!image;

  return (
    <AppShell>
      <div className="flex flex-col h-[calc(100vh-3.5rem)] md:h-screen">
        {/* Header */}
        <div className="flex items-center gap-1 border-b border-border/50 p-2">
          <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(true)} aria-label="Chats">
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/chat" className="hidden md:inline-flex"><Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button></Link>
          <div className="flex-1 min-w-0 px-1">
            {renameVal !== null ? (
              <div className="flex gap-2">
                <Input autoFocus value={renameVal} onChange={(e) => setRenameVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && renameVal.trim()) renameMut.mutate(renameVal.trim()); if (e.key === "Escape") setRenameVal(null); }}
                  className="h-8" />
                <Button size="sm" onClick={() => renameVal.trim() && renameMut.mutate(renameVal.trim())}>Save</Button>
              </div>
            ) : (
              <div className="font-medium truncate">{data?.thread?.title || "Chat"}</div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={newChat} className="gap-1">
            <MessageSquarePlus className="h-4 w-4" /> <span className="hidden sm:inline">New</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRenameVal(data?.thread?.title || "")}><Pencil className="h-4 w-4 mr-2" /> Rename</DropdownMenuItem>
              <DropdownMenuItem onClick={regenerate} disabled={pending}><RefreshCw className="h-4 w-4 mr-2" /> Regenerate</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="mx-auto max-w-3xl space-y-4">
            {messages.length === 0 && !optimisticUser && (
              <div className="text-center text-muted-foreground py-16">
                Ask me anything about your studies. Attach an image or document to get started.
              </div>
            )}
            {messages.map((m) => (
              <div key={m.id} className={`group flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className="max-w-[85%]">
                  <div className={`rounded-2xl px-4 py-3 ${m.role === "user" ? "gradient-bg text-white" : "glass"}`}>
                    {m.role === "assistant" ? <Markdown>{m.content}</Markdown> : <div className="text-sm whitespace-pre-wrap">{m.content}</div>}
                  </div>
                  <div className="mt-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => copyMsg(m.content)} className="text-xs text-muted-foreground hover:text-foreground p-1" aria-label="Copy"><Copy className="h-3.5 w-3.5" /></button>
                    <button onClick={() => shareMsg(m.content)} className="text-xs text-muted-foreground hover:text-foreground p-1" aria-label="Share"><Share2 className="h-3.5 w-3.5" /></button>
                    {m.role === "user" && (
                      <button onClick={() => { setInput(m.content); textareaRef.current?.focus(); }} className="text-xs text-muted-foreground hover:text-foreground p-1" aria-label="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                    )}
                    {m.role === "assistant" && (
                      <button onClick={regenerate} className="text-xs text-muted-foreground hover:text-foreground p-1" aria-label="Regenerate"><RefreshCw className="h-3.5 w-3.5" /></button>
                    )}
                    <button onClick={() => onDeleteMessage(m.id)} className="text-xs text-muted-foreground hover:text-destructive p-1" aria-label="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            ))}
            {optimisticUser && (
              <div className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 gradient-bg text-white">
                  <div className="text-sm whitespace-pre-wrap">{optimisticUser}</div>
                </div>
              </div>
            )}
            {pending && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-2xl px-4 py-3 glass">
                  {streaming ? (
                    <Markdown>{streaming}</Markdown>
                  ) : (
                    <div className="flex gap-1 items-center h-5">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "120ms" }} />
                      <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "240ms" }} />
                    </div>
                  )}
                </div>
              </div>
            )}
            {suggestions.length > 0 && !pending && (
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

        {/* Composer */}
        <div className="p-3">
          <div className="mx-auto max-w-3xl">
            {image && (
              <div className="mb-2 relative inline-block">
                <img src={image} alt="attach" className="h-20 rounded-lg" />
                <button onClick={() => { setImage(null); setAttachName(null); }} className="absolute -top-2 -right-2 bg-background border rounded-full p-1"><X className="h-3 w-3" /></button>
              </div>
            )}
            {attachName && !image && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-full glass px-3 py-1.5 text-xs">
                <FileText className="h-3.5 w-3.5" /> {attachName}
                <button onClick={() => setAttachName(null)}><X className="h-3 w-3" /></button>
              </div>
            )}
            <div className="glass rounded-3xl p-2 flex gap-1 items-end shadow-elegant">
              <Button type="button" variant="ghost" size="icon" className="shrink-0 rounded-full" onClick={() => setSheetOpen(true)} aria-label="Attach">
                <Plus className="h-5 w-5" />
              </Button>
              <Textarea
                ref={textareaRef}
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Message AI Study Chat…" rows={1}
                className="flex-1 border-0 bg-transparent resize-none focus-visible:ring-0 min-h-[40px] max-h-52 py-2"
              />
              <Button type="button" variant="ghost" size="icon" onClick={toggleMic} className={`shrink-0 rounded-full ${listening ? "text-red-500" : ""}`} aria-label="Voice">
                <Mic className="h-5 w-5" />
              </Button>
              {canSend && (
                <Button size="icon" className="shrink-0 rounded-full gradient-bg text-white border-0" disabled={pending} onClick={() => send()} aria-label="Send">
                  <Send className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Hidden inputs */}
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={pickImage} />
        <input ref={galleryRef} type="file" accept="image/*" className="hidden" onChange={pickImage} />
        <input ref={docRef} type="file" accept=".pdf,.docx,.txt,text/plain" className="hidden" onChange={pickDoc} />

        {/* Attachment sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-3xl">
            <SheetHeader><SheetTitle>Add attachment</SheetTitle></SheetHeader>
            <div className="grid grid-cols-3 gap-3 py-4">
              <button onClick={() => cameraRef.current?.click()} className="flex flex-col items-center gap-2 p-4 rounded-2xl glass hover:bg-accent">
                <Camera className="h-6 w-6" /><span className="text-sm">Camera</span>
              </button>
              <button onClick={() => galleryRef.current?.click()} className="flex flex-col items-center gap-2 p-4 rounded-2xl glass hover:bg-accent">
                <ImageIcon className="h-6 w-6" /><span className="text-sm">Gallery</span>
              </button>
              <button onClick={() => docRef.current?.click()} className="flex flex-col items-center gap-2 p-4 rounded-2xl glass hover:bg-accent">
                <FileText className="h-6 w-6" /><span className="text-sm">Document</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Chats drawer */}
        <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
          <SheetContent side="left" className="w-80 p-0 flex flex-col">
            <SheetHeader className="p-4 border-b"><SheetTitle>Your chats</SheetTitle></SheetHeader>
            <div className="p-3 space-y-2">
              <Button onClick={newChat} className="w-full gap-2 gradient-bg text-white border-0"><MessageSquarePlus className="h-4 w-4" /> New chat</Button>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search chats" className="pl-8" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-1">
              {filteredThreads.map((t) => (
                <Link key={t.id} to="/chat/$threadId" params={{ threadId: t.id }} onClick={() => setDrawerOpen(false)}
                  className={`block rounded-lg px-3 py-2 hover:bg-accent ${t.id === threadId ? "bg-accent" : ""}`}>
                  <div className="text-sm font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleDateString()}</div>
                </Link>
              ))}
              {filteredThreads.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">No chats found</div>
              )}
            </div>
            <div className="p-3 border-t">
              <Link to="/history" onClick={() => setDrawerOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">History</Button>
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </AppShell>
  );
}
