import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getCredits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("ensure_credits", { _uid: context.userId });
    if (error) throw new Error(error.message);
    return data as {
      user_id: string;
      chats_remaining: number;
      homework_remaining: number;
      image_credits_remaining: number;
      reset_at: string;
    };
  });
