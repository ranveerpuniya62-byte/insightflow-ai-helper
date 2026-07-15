import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("chat_threads").select("id,title,updated_at,created_at")
      .eq("user_id", context.userId).order("updated_at", { ascending: false }).limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getThread = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    let thread = await context.supabase
      .from("chat_threads")
      .select("id,title")
      .eq("id", data.id)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (thread.error) throw new Error(thread.error.message);
    if (!thread.data) {
      thread = await context.supabase
        .from("chat_threads")
        .insert({ id: data.id, user_id: context.userId, title: "New chat" })
        .select("id,title")
        .single();
      if (thread.error) throw new Error(thread.error.message);
    }

    const messages = await context.supabase
      .from("chat_messages")
      .select("id,role,content,created_at")
      .eq("thread_id", data.id)
      .eq("user_id", context.userId)
      .order("created_at");
    if (messages.error) throw new Error(messages.error.message);
    return { thread: thread.data, messages: messages.data ?? [] };
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ title: z.string().max(200).optional() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase.from("chat_threads")
      .insert({ user_id: context.userId, title: data.title || "New chat" })
      .select("id,title").single();
    if (error) throw new Error(error.message);
    return row;
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chat_threads").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chat_messages").delete().eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => z.object({ id: z.string().uuid(), title: z.string().min(1).max(200) }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("chat_threads").update({ title: data.title }).eq("id", data.id).eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const SendSchema = z.object({
  threadId: z.string().uuid(),
  content: z.string().min(1).max(8000),
  imageDataUrl: z.string().optional(),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => SendSchema.parse(v))
  .handler(async ({ data, context }) => {
    // consume credit
    const { error: cErr } = await context.supabase.rpc("consume_credit", { _uid: context.userId, _kind: "chat" });
    if (cErr) {
      if (cErr.message.includes("no_credits")) throw new Error("You've used all your daily chat credits. They reset every 24 hours.");
      throw new Error(cErr.message);
    }

    // insert user message
    await context.supabase.from("chat_messages").insert({
      thread_id: data.threadId, user_id: context.userId, role: "user", content: data.content,
    });

    // load history
    const { data: history } = await context.supabase.from("chat_messages")
      .select("role,content").eq("thread_id", data.threadId).eq("user_id", context.userId)
      .order("created_at").limit(30);

    const messages: any[] = [
      { role: "system", content: "You are AI Study Chat, a fast, friendly study companion. Answer ONLY what was asked — no filler. Be concise; give step-by-step detail only when explicitly requested. Use clean markdown and LaTeX ($...$ or $$...$$) for math." },
      ...(history ?? []).slice(0, -1).map((m) => ({ role: m.role, content: m.content })),
    ];

    const userMsg = data.imageDataUrl
      ? { role: "user", content: [{ type: "text", text: data.content }, { type: "image_url", image_url: { url: data.imageDataUrl } }] }
      : { role: "user", content: data.content };
    messages.push(userMsg);

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");
    const CHAT_MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];
    let answer = "";
    let lastErr = "";
    for (const model of CHAT_MODELS) {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
        body: JSON.stringify({ model, messages }),
      });
      if (res.ok) {
        const json = await res.json();
        answer = json.choices?.[0]?.message?.content ?? "";
        break;
      }
      lastErr = await res.text();
      if (res.status === 429) throw new Error("Rate limit. Please try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      if (res.status === 401 || res.status === 400) break;
    }
    if (!answer) throw new Error(`AI error: ${lastErr.slice(0, 200)}`);

    await context.supabase.from("chat_messages").insert({
      thread_id: data.threadId, user_id: context.userId, role: "assistant", content: answer,
    });

    // title if first message
    const { data: firstMsg } = await context.supabase.from("chat_messages").select("id").eq("thread_id", data.threadId).order("created_at").limit(3);
    if ((firstMsg?.length ?? 0) <= 3) {
      await context.supabase.from("chat_threads").update({ title: data.content.slice(0, 60), updated_at: new Date().toISOString() }).eq("id", data.threadId);
    } else {
      await context.supabase.from("chat_threads").update({ updated_at: new Date().toISOString() }).eq("id", data.threadId);
    }

    return { answer };
  });
