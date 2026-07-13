import { createFileRoute } from "@tanstack/react-router";
import { ChatScreen } from "@/features/chat/chat-screen";

export const Route = createFileRoute("/_authenticated/chat/$threadId")({
  component: ChatThread,
  head: () => ({ meta: [{ title: "Chat — AI Study Chat" }] }),
});

function ChatThread() {
  const { threadId } = Route.useParams();
  return <ChatScreen initialThreadId={threadId} />;
}
