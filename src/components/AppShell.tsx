"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Blocks,
  Bot,
  FolderKanban,
  Globe,
  Inbox,
  Plug,
  Settings2,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Projects", icon: FolderKanban },
  { href: "/settings/ai", label: "AI settings", icon: Bot },
  { href: "/integrations", label: "Integrations", icon: Plug },
  { href: "/leads", label: "Leads", icon: Inbox },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const preview = pathname.startsWith("/preview") || pathname.startsWith("/p/");
  if (preview) return <>{children}</>;

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-white/10 lg:border-b-0 lg:border-r lg:border-white/10">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[var(--color-primary)]">
            <Blocks className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold">AI Website Studio</div>
            <div className="text-xs text-[var(--color-muted)]">Multi-agent builder</div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm ${
                  active ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="hidden px-5 py-6 text-xs text-slate-500 lg:block">
          <Globe className="mb-2 h-4 w-4" />
          Custom LLM, image and content providers are configured from day one. Secrets stay on the server.
        </div>
      </aside>
      <main className="min-w-0">
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="text-sm text-slate-400">Workspace · Studio</div>
          <Link href="/settings/ai" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 text-sm">
            <Settings2 className="h-4 w-4" />
            Models
          </Link>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
