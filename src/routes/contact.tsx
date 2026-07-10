import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [{ title: "Contact — AI Study Chat" }] }),
});

const Schema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Schema.safeParse(f);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid form");
    setLoading(true);
    const { error } = await supabase.from("contact_messages").insert(parsed.data);
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Thanks — we'll be in touch");
    setF({ name: "", email: "", subject: "", message: "" });
  }
  return (
    <LegalPage title="Contact us">
      <form onSubmit={submit} className="space-y-3 not-prose">
        <div><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={100} /></div>
        <div><Label>Email</Label><Input type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} maxLength={255} /></div>
        <div><Label>Subject</Label><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} maxLength={200} /></div>
        <div><Label>Message</Label><Textarea rows={5} value={f.message} onChange={(e) => setF({ ...f, message: e.target.value })} maxLength={2000} /></div>
        <Button type="submit" disabled={loading} className="gradient-bg text-white border-0">Send message</Button>
      </form>
    </LegalPage>
  );
}
