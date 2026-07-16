import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const Schema = z.object({
  prompt: z.string().min(3).max(1000),
  referenceImageDataUrl: z.string().optional(),
});

export const generateImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v: unknown) => Schema.parse(v))
  .handler(async ({ data, context }) => {
    const { error: cErr } = await context.supabase.rpc("consume_credit", { _uid: context.userId, _kind: "image" });
    if (cErr) {
      if (cErr.message.includes("no_credits")) throw new Error("You've used all your daily image credits.");
      throw new Error(cErr.message);
    }

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const userContent: unknown[] = [{ type: "text", text: data.prompt }];
    if (data.referenceImageDataUrl) {
      userContent.push({ type: "image_url", image_url: { url: data.referenceImageDataUrl } });
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        modalities: ["image", "text"],
        messages: [{ role: "user", content: userContent }],
      }),
    });
    if (!res.ok) {
      const t = await res.text();
      if (res.status === 429) throw new Error("Rate limit. Try again shortly.");
      if (res.status === 402) throw new Error("AI credits exhausted.");
      throw new Error(`AI error ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = await res.json();
    const url: string | undefined = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    if (!url) throw new Error("No image returned");

    await context.supabase.from("history_items").insert({
      user_id: context.userId, kind: "generation",
      title: data.prompt.slice(0, 80),
      payload: { prompt: data.prompt, imageUrl: url, hasReference: !!data.referenceImageDataUrl },
    });

    return { imageUrl: url };
  });
