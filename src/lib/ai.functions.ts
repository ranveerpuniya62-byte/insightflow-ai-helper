import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const MODELS = ["google/gemini-2.5-flash", "google/gemini-2.5-flash-lite"];

async function callAI(body: Record<string, unknown>): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");
  let lastErr = "";
  for (const model of MODELS) {
    const res = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ ...body, model }),
    });
    if (res.ok) {
      const json = await res.json();
      return (json.choices?.[0]?.message?.content as string) ?? "";
    }
    lastErr = await res.text();
    if (res.status === 429) throw new Error("Rate limit. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits.");
    if (res.status === 401 || res.status === 400) break;
  }
  throw new Error(`AI error: ${lastErr.slice(0, 200)}`);
}

const HomeworkSchema = z.object({
  subject: z.string().min(1).max(60),
  question: z.string().min(1).max(4000),
  imageDataUrl: z.string().optional(),
});

export const answerHomework = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => HomeworkSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { data: consumed, error: cErr } = await context.supabase.rpc("consume_credit", { _uid: context.userId, _kind: "homework" });
    if (cErr) {
      if (cErr.message.includes("no_credits")) throw new Error("You've used all your daily homework credits. They reset every 24 hours.");
      throw new Error(cErr.message);
    }

    const userContent: unknown[] = [{ type: "text", text: `Subject: ${data.subject}\n\nQuestion:\n${data.question}` }];
    if (data.imageDataUrl) userContent.push({ type: "image_url", image_url: { url: data.imageDataUrl } });

    const answer = await callAI({
      messages: [
        { role: "system", content: "You are an exam-focused study tutor. Answer ONLY the question asked. Be concise. Give step-by-step working only when the user explicitly requests steps or the problem clearly needs them (math/proofs). End with a bold 'Answer:' line. Use LaTeX ($...$ or $$...$$) for math. Student-friendly language. No unrelated topics." },
        { role: "user", content: userContent },
      ],
    });

    await context.supabase.from("history_items").insert({
      user_id: context.userId, kind: "homework",
      title: data.question.slice(0, 80),
      payload: { subject: data.subject, question: data.question, answer, hasImage: !!data.imageDataUrl },
    });

    return { answer, credits: consumed };
  });

const AnalyzeSchema = z.object({ imageDataUrl: z.string().min(20), prompt: z.string().max(1000).optional() });

export const analyzeImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => AnalyzeSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { data: consumed, error: cErr } = await context.supabase.rpc("consume_credit", { _uid: context.userId, _kind: "image" });
    if (cErr) {
      if (cErr.message.includes("no_credits")) throw new Error("You've used all your daily image credits.");
      throw new Error(cErr.message);
    }
    const answer = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "You analyze images for learners. Describe what you see, extract any text (OCR), then explain step-by-step. Use clear formatting." },
        { role: "user", content: [
          { type: "text", text: data.prompt || "Please analyze this image and explain everything relevant." },
          { type: "image_url", image_url: { url: data.imageDataUrl } },
        ] },
      ],
    });
    await context.supabase.from("history_items").insert({
      user_id: context.userId, kind: "analysis",
      title: (data.prompt || "Image analysis").slice(0, 80),
      payload: { prompt: data.prompt, answer },
    });
    return { answer, credits: consumed };
  });

const SuggestSchema = z.object({ context: z.string().transform((s) => s.slice(-4000)) });

export const suggestFollowups = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => SuggestSchema.parse(v))
  .handler(async ({ data }) => {
    const answer = await callAI({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: "Return exactly 4 short study follow-up questions related to the context. One per line. No numbering. Max 12 words each." },
        { role: "user", content: data.context.slice(-2000) },
      ],
    });
    return { suggestions: answer.split("\n").map((s) => s.replace(/^[-•\d.\s]+/, "").trim()).filter(Boolean).slice(0, 5) };
  });
