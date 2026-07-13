import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { listThreads, createThread } from "@/lib/chat.functions";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/chat")({
  component: ChatEntry,
  head: () => ({ meta: [{ title: "AI Chat — AI Study Chat" }] }),
});

function ChatEntry() {
  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const qc = useQueryClient();
  const nav = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const threads = await qc.fetchQuery({
          queryKey: ["threads"],
          queryFn: () => listFn(),
        });
        if (threads && threads.length > 0) {
          nav({ to: "/chat/$threadId", params: { threadId: threads[0].id }, replace: true });
          return;
        }
        const t = await createFn({ data: { title: "New chat" } });
        qc.invalidateQueries({ queryKey: ["threads"] });
        nav({ to: "/chat/$threadId", params: { threadId: t.id }, replace: true });
      } catch (e) {
        toast.error((e as Error).message);
        started.current = false;
      }
    })();
  }, [listFn, createFn, qc, nav]);

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="grid h-9 w-9 place-items-center rounded-lg gradient-bg shadow-glow animate-pulse">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm">Opening chat…</span>
      </div>
    </div>
  );
}
