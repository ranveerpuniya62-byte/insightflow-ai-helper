import { Link } from "@tanstack/react-router";
import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function ArticlePage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 w-full mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          <Link to="/study-tips" className="hover:underline">
            Study Tips
          </Link>
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        <article className="prose-chat mt-8 space-y-4 text-sm leading-relaxed">{children}</article>
        <aside className="glass mt-12 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-semibold">Put it into practice</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            AI Study Chat turns any of these techniques into action — ask a question, paste a
            problem, or generate a diagram. Free daily credits, no credit card.
          </p>
          <Link
            to="/auth"
            className="mt-4 inline-flex rounded-md gradient-bg px-4 py-2 text-sm font-medium text-white border-0"
          >
            Try it free
          </Link>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
