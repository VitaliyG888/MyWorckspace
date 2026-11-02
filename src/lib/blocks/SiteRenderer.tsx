import type { CSSProperties } from "react";
import { MOTION_PRESETS } from "@/lib/schema/motion";
import type { PageDocument, SiteDocument } from "@/lib/schema/site-document";
import { BLOCK_REGISTRY } from "./registry";

export function SiteRenderer({
  site,
  page,
  selectedId,
  onSelect,
  previewWidth,
}: {
  site: SiteDocument;
  page: PageDocument;
  selectedId?: string;
  onSelect?: (id: string) => void;
  previewWidth?: number;
}) {
  const style = {
    ["--site-primary" as string]: site.tokens.primary,
    ["--site-accent" as string]: site.tokens.accent,
    ["--site-bg" as string]: site.tokens.background,
    ["--site-fg" as string]: site.tokens.foreground,
    ["--site-muted" as string]: site.tokens.muted,
    width: previewWidth ? `${previewWidth}px` : "100%",
    background: site.tokens.background,
    color: site.tokens.foreground,
    fontFamily: `${site.tokens.bodyFont}, Inter, sans-serif`,
  } as CSSProperties;

  return (
    <div className="site-canvas overflow-hidden rounded-[28px] border border-white/10 shadow-2xl" style={style}>
      {page.sections.map((section) => {
        if (section.status !== "ready" && section.status !== "failed") {
          return (
            <div key={section.id} className="mx-6 my-4 h-32 animate-pulse rounded-3xl bg-white/5" />
          );
        }
        const def = BLOCK_REGISTRY[section.type];
        if (!def) {
          return (
            <div key={section.id} className="m-6 rounded-2xl border border-amber-400/30 p-6 text-sm">
              Unknown block type `{section.type}`
            </div>
          );
        }
        const motion = MOTION_PRESETS[section.motion.preset];
        const selected = selectedId === section.id;
        return (
          <div
            key={section.id}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            onClick={onSelect ? () => onSelect(section.id) : undefined}
            onKeyDown={
              onSelect
                ? (e) => {
                    if (e.key === "Enter" || e.key === " ") onSelect(section.id);
                  }
                : undefined
            }
            className={`relative ${motion.cssClass} ${selected ? "ring-2 ring-[var(--site-accent)]" : ""} ${section.motion.disabled ? "" : ""}`}
            data-status={section.status}
          >
            {section.status === "failed" ? (
              <div className="m-6 rounded-2xl border border-red-400/40 bg-red-500/10 p-6 text-sm">
                Section `{section.type}` failed validation: {section.generationMetadata?.error}
              </div>
            ) : (
              <def.Render props={section.props} variant={section.variant} />
            )}
          </div>
        );
      })}
    </div>
  );
}
