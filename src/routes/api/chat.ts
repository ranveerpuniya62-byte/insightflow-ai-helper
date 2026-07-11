import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type Body = {
  threadId: string;
  content: string;
  imageDataUrl?: string;
};

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = request.headers.get("authorization");
        if (!auth?.startsWith("Bearer ")) return new Response("Unauthorized", { status: 401 });
        const token = auth.slice(7);

        const url = process.env.SUPABASE_URL;
        const anon = process.env.SUPABASE_PUBLISHABLE_KEY;
        const aiKey = process.env.LOVABLE_API_KEY;
        if (!url || !anon || !aiKey) return new Response("Server misconfigured", { status: 500 });

        const supabase = createClient<Database>(url, anon, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
        });

        const { data: userData, error: uErr } = await supabase.auth.getUser(token);
        if (uErr || !userData.user) return new Response("Unauthorized", { status: 401 });
        const userId = userData.user.id;

        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return new Response("Bad request", { status: 400 });
        }
        const content = String(body.content ?? "").slice(0, 8000).trim();
        const threadId = String(body.threadId ?? "");
        if (!content || !threadId) return new Response("Bad request", { status: 400 });

        const { error: cErr } = await supabase.rpc("consume_credit", { _uid: userId, _kind: "chat" });
        if (cErr) {
          const msg = cErr.message.includes("no_credits")
            ? "Daily chat credits exhausted. They reset every 24 hours."
            : cErr.message;
          return new Response(msg, { status: 402 });
        }

        await supabase.from("chat_messages").insert({
          thread_id: threadId, user_id: userId, role: "user", content,
        });

        const { data: history } = await supabase.from("chat_messages")
          .select("role,content").eq("thread_id", threadId).eq("user_id", userId)
          .order("created_at").limit(30);

        const messages: unknown[] = [
          { role: "system", content: "You are AI Study Chat, a friendly, expert study companion. Use clean markdown. Use LaTeX ($...$ or $$...$$) for math. Give concise, exam-focused explanations. Include step-by-step when helpful." },
          ...(history ?? []).slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
        ];
        messages.push(
          body.imageDataUrl
            ? { role: "user", content: [{ type: "text", text: content }, { type: "image_url", image_url: { url: body.imageDataUrl } }] }
            : { role: "user", content }
        );

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey}` },
          body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages, stream: true }),
        });
        if (!upstream.ok || !upstream.body) {
          const t = await upstream.text();
          return new Response(t || "Upstream error", { status: upstream.status });
        }

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const reader = upstream.body!.getReader();
            const decoder = new TextDecoder();
            const encoder = new TextEncoder();
            let full = "";
            let buffer = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() ?? "";
                for (const line of lines) {
                  const trimmed = line.trim();
                  if (!trimmed.startsWith("data:")) continue;
                  const data = trimmed.slice(5).trim();
                  if (!data || data === "[DONE]") continue;
                  try {
                    const j = JSON.parse(data);
                    const delta: string | undefined = j.choices?.[0]?.delta?.content;
                    if (delta) {
                      full += delta;
                      controller.enqueue(encoder.encode(delta));
                    }
                  } catch { /* ignore malformed chunk */ }
                }
              }

              if (full) {
                await supabase.from("chat_messages").insert({
                  thread_id: threadId, user_id: userId, role: "assistant", content: full,
                });
                const { data: msgs } = await supabase.from("chat_messages")
                  .select("id").eq("thread_id", threadId).order("created_at").limit(3);
                const patch: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
                if ((msgs?.length ?? 0) <= 3) patch.title = content.slice(0, 60);
                await supabase.from("chat_threads").update(patch).eq("id", threadId);
              }
              controller.close();
            } catch (e) {
              controller.error(e);
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
          },
        });
      },
    },
  },
});
