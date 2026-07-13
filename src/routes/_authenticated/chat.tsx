import { createFileRoute } from "@tanstack/react-router";
import { ChatScreen } from "@/features/chat/chat-screen";

export const Route = createFileRoute("/_authenticated/chat")({
  component: () => <ChatScreen />,
  head: () => ({ meta: [{ title: "AI Chat — AI Study Chat" }] }),
});
