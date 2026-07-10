import { SiteNav } from "./site-nav";
import { SiteFooter } from "./site-footer";

export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteNav />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-12">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="prose-chat mt-6 text-sm leading-relaxed space-y-4">{children}</div>
      </main>
      <SiteFooter />
    </div>
  );
}
