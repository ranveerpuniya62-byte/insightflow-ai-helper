import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { listThreads, createThread, deleteThread } from "@/lib/chat.functions";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatIndex,
  head: () => ({ meta: [{ title: "AI Chat — AI Study Chat" }] }),
});

function ChatIndex() {
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const delFn = useServerFn(deleteThread);
  const qc = useQueryClient();
  const nav = useNavigate();
  const [creating, setCreating] = useState(false);
  const { data: threads = [] } = useQuery({ queryKey: ["threads"], queryFn: () => listFn() });

  async function startNewChat() {
    if (creating) return;
    setCreating(true);
    try {
      const t = await createFn({ data: { title: "New chat" } });
      await nav({ to: "/chat/$threadId", params: { threadId: t.id } });
      qc.invalidateQueries({ queryKey: ["threads"] });
    } catch (e) {
      toast.error((e as Error).message);
      setCreating(false);
    }
  }

  async function onDelete(id: string) {
    try {
      await delFn({ data: { id } });
      qc.invalidateQueries({ queryKey: ["threads"] });
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl p-4 md:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your chats</h1>
          <Button onClick={startNewChat} disabled={creating} className="gradient-bg text-white border-0">
            <Plus className="mr-2 h-4 w-4" /> {creating ? "Opening…" : "New chat"}
          </Button>
        </div>
        {threads.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center space-y-4">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No chats yet. Start your first conversation.</p>
            <Button onClick={startNewChat} disabled={creating} className="gradient-bg text-white border-0">
              <Plus className="mr-2 h-4 w-4" /> Start New Chat
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {threads.map((t) => (
              <div key={t.id} className="glass rounded-xl p-4 flex items-center justify-between gap-2">
                <Link to="/chat/$threadId" params={{ threadId: t.id }} className="flex-1 min-w-0 block">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(t.updated_at).toLocaleString()}</div>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => onDelete(t.id)} aria-label="Delete chat">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
