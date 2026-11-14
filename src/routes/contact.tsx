import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal-page";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { contactSubmissionSchema, submitContactMessage } from "@/lib/contact.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({ meta: [{ title: "Contact — AI Study Chat" }] }),
});

function Contact() {
  const [f, setF] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const submitContact = useServerFn(submitContactMessage);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = contactSubmissionSchema.safeParse(f);
    if (!parsed.success) return toast.error(parsed.error.issues[0]?.message ?? "Invalid form");
    setLoading(true);
    try {
      await submitContact({ data: parsed.data });
      toast.success("Thanks — we'll be in touch");
      setF({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <LegalPage title="Contact us">
      <form onSubmit={submit} className="space-y-3 not-prose">
        <div>
          <Label>Name</Label>
          <Input
            value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })}
            required
            maxLength={100}
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
            type="email"
            value={f.email}
            onChange={(e) => setF({ ...f, email: e.target.value })}
            required
            maxLength={255}
          />
        </div>
        <div>
          <Label>Subject</Label>
          <Input
            value={f.subject}
            onChange={(e) => setF({ ...f, subject: e.target.value })}
            required
            maxLength={200}
          />
        </div>
        <div>
          <Label>Message</Label>
          <Textarea
            rows={5}
            value={f.message}
            onChange={(e) => setF({ ...f, message: e.target.value })}
            required
            maxLength={2000}
          />
        </div>
        <Button type="submit" disabled={loading} className="gradient-bg text-white border-0">
          Send message
        </Button>
      </form>
    </LegalPage>
  );
}
