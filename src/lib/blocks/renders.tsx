import type { ReactNode } from "react";
import { asArray, asCta, asString } from "./types";

function SectionShell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`px-6 py-16 md:px-10 md:py-20 ${className}`}>{children}</section>;
}

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="text-3xl font-semibold tracking-tight text-[var(--site-fg)] md:text-4xl">{children}</h2>;
}

function CtaLink({ cta, primary = true }: { cta: { label: string; href: string }; primary?: boolean }) {
  return (
    <a
      href={cta.href}
      className={
        primary
          ? "inline-flex min-h-11 items-center rounded-full bg-[var(--site-primary)] px-5 text-sm font-medium text-white"
          : "inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm font-medium text-[var(--site-fg)]"
      }
    >
      {cta.label}
    </a>
  );
}

export function NavbarRender({ props }: { props: Record<string, unknown> }) {
  const links = asArray<{ label: string; href: string }>(props.links);
  const cta = asCta(props.cta);
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[var(--site-bg)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <a href="/home" className="text-sm font-semibold tracking-wide">
          {asString(props.brand, "Brand")}
        </a>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <a key={link.href + link.label} href={link.href} className="text-sm text-[var(--site-muted)] hover:text-white">
              {link.label}
            </a>
          ))}
        </nav>
        <CtaLink cta={cta} />
      </div>
    </header>
  );
}

export function HeroRender({ props }: { props: Record<string, unknown> }) {
  return (
    <SectionShell className="grid gap-10 md:grid-cols-2 md:items-center">
      <div className="space-y-6">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--site-accent)]">{asString(props.eyebrow)}</p>
        <h1 className="text-4xl font-semibold leading-tight md:text-6xl">{asString(props.title)}</h1>
        <p className="max-w-xl text-lg text-[var(--site-muted)]">{asString(props.subtitle)}</p>
        <div className="flex flex-wrap gap-3">
          <CtaLink cta={asCta(props.primaryCta)} />
          {props.secondaryCta ? <CtaLink cta={asCta(props.secondaryCta)} primary={false} /> : null}
        </div>
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-6">
        {typeof props.imageSrc === "string" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={props.imageSrc} alt={asString(props.imageAlt, "Hero visual")} className="h-80 w-full object-cover" />
        ) : (
          <div className="flex h-80 items-end rounded-2xl bg-gradient-to-br from-[var(--site-primary)]/40 to-[var(--site-accent)]/30 p-6 text-sm text-white/80">
            {asString(props.imageAlt, "Draft visual")}
          </div>
        )}
      </div>
    </SectionShell>
  );
}

export function LogoCloudRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ label: string }>(props.items);
  return (
    <SectionShell>
      <p className="mb-8 text-center text-sm uppercase tracking-[0.18em] text-[var(--site-muted)]">{asString(props.title)}</p>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl border border-white/10 px-4 py-6 text-center text-sm">
            {item.label}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function StatsRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ label: string; value: string; source: string }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 p-6">
            <div className="text-4xl font-semibold">{item.value}</div>
            <div className="mt-2 text-sm text-[var(--site-muted)]">{item.label}</div>
            <div className="mt-3 text-xs uppercase tracking-wide text-[var(--site-accent)]">{item.source}</div>
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function FeaturesRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ title: string; body: string }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <article key={item.title} className="rounded-3xl border border-white/10 p-6">
            <h3 className="text-xl font-medium">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">{item.body}</p>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function SplitContentRender({ props }: { props: Record<string, unknown> }) {
  return (
    <SectionShell className="grid gap-10 md:grid-cols-2 md:items-center">
      <div className="space-y-5">
        <Heading>{asString(props.title)}</Heading>
        <p className="text-base leading-7 text-[var(--site-muted)]">{asString(props.body)}</p>
        <CtaLink cta={asCta(props.cta)} />
      </div>
      <div className="h-72 rounded-3xl bg-gradient-to-br from-white/10 to-[var(--site-primary)]/20 p-6 text-sm text-white/70">
        {asString(props.imageAlt)}
      </div>
    </SectionShell>
  );
}

export function ServicesRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ title: string; body: string; href: string }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <a key={item.title} href={item.href} className="rounded-3xl border border-white/10 p-6 hover:border-white/30">
            <h3 className="text-xl font-medium">{item.title}</h3>
            <p className="mt-3 text-sm text-[var(--site-muted)]">{item.body}</p>
          </a>
        ))}
      </div>
    </SectionShell>
  );
}

export function PricingRender({ props }: { props: Record<string, unknown> }) {
  const plans = asArray<{
    name: string;
    price: string;
    features: string[];
    highlighted?: boolean;
    cta: { label: string; href: string };
  }>(props.plans);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <p className="mt-4 max-w-2xl text-sm text-[var(--site-muted)]">{asString(props.note)}</p>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-3xl border p-6 ${plan.highlighted ? "border-[var(--site-primary)] bg-white/5" : "border-white/10"}`}
          >
            <h3 className="text-lg">{plan.name}</h3>
            <div className="mt-2 text-3xl font-semibold">{plan.price}</div>
            <ul className="mt-6 space-y-2 text-sm text-[var(--site-muted)]">
              {plan.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
            <div className="mt-8">
              <CtaLink cta={asCta(plan.cta)} />
            </div>
          </article>
        ))}
      </div>
    </SectionShell>
  );
}

export function TestimonialsRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ quote: string; author: string; role: string; draft: boolean }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <p className="mt-3 text-sm text-amber-200">{asString(props.disclaimer)}</p>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <blockquote key={item.author + item.quote} className="rounded-3xl border border-white/10 p-6">
            <p className="text-base leading-7">{item.quote}</p>
            <footer className="mt-4 text-sm text-[var(--site-muted)]">
              {item.author} · {item.role}
              {item.draft ? " · DRAFT" : ""}
            </footer>
          </blockquote>
        ))}
      </div>
    </SectionShell>
  );
}

export function CaseStudiesRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ title: string; summary: string; href: string; draft: boolean }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {items.map((item) => (
          <a key={item.title} href={item.href} className="rounded-3xl border border-white/10 p-6">
            <h3 className="text-xl">{item.title}</h3>
            <p className="mt-3 text-sm text-[var(--site-muted)]">{item.summary}</p>
            {item.draft ? <span className="mt-4 inline-block text-xs uppercase text-amber-200">Draft</span> : null}
          </a>
        ))}
      </div>
    </SectionShell>
  );
}

export function TeamRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ name: string; role: string; draft: boolean }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.name} className="rounded-3xl border border-white/10 p-6">
            <div className="h-24 rounded-2xl bg-white/5" />
            <h3 className="mt-4 text-lg">{item.name}</h3>
            <p className="text-sm text-[var(--site-muted)]">{item.role}</p>
            {item.draft ? <p className="mt-2 text-xs uppercase text-amber-200">Draft</p> : null}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function GalleryRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ alt: string; src?: string }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.alt} className="h-40 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--site-primary)]/30 to-white/5">
            {item.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.src} alt={item.alt} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-end p-4 text-xs text-white/70">{item.alt}</div>
            )}
          </div>
        ))}
      </div>
    </SectionShell>
  );
}

export function VideoEmbedRender({ props }: { props: Record<string, unknown> }) {
  const url = asString(props.url);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <p className="mt-3 text-sm text-[var(--site-muted)]">{asString(props.caption)}</p>
      {url ? (
        <iframe title={asString(props.title)} src={url} className="mt-8 h-80 w-full rounded-3xl border-0" />
      ) : (
        <div className="mt-8 flex h-64 items-center justify-center rounded-3xl border border-dashed border-white/20 text-sm text-amber-200">
          Source required — video URL is empty
        </div>
      )}
    </SectionShell>
  );
}

export function FaqRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ q: string; a: string }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <div className="mt-8 space-y-4">
        {items.map((item) => (
          <details key={item.q} className="rounded-2xl border border-white/10 p-5">
            <summary className="cursor-pointer text-base font-medium">{item.q}</summary>
            <p className="mt-3 text-sm leading-6 text-[var(--site-muted)]">{item.a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}

export function CtaRender({ props }: { props: Record<string, unknown> }) {
  return (
    <SectionShell>
      <div className="rounded-[2rem] bg-[var(--site-primary)] px-8 py-12 text-white">
        <h2 className="text-3xl font-semibold">{asString(props.title)}</h2>
        <p className="mt-4 max-w-2xl text-white/80">{asString(props.body)}</p>
        <div className="mt-8">
          <a href={asCta(props.primaryCta).href} className="inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-medium text-slate-950">
            {asCta(props.primaryCta).label}
          </a>
        </div>
      </div>
    </SectionShell>
  );
}

export function ContactFormRender({ props }: { props: Record<string, unknown> }) {
  const fields = asArray<string>(props.fields);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <p className="mt-3 max-w-xl text-sm text-[var(--site-muted)]">{asString(props.body)}</p>
      <form method="post" action="/api/leads" className="mt-8 max-w-xl space-y-4">
        <input type="hidden" name="formId" value="contact" />
        {fields.map((field) => (
          <label key={field} className="block text-sm">
            <span className="mb-2 block capitalize">{field}</span>
            {field === "message" ? (
              <textarea name={field} required className="min-h-28 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3" />
            ) : (
              <input
                name={field}
                type={field === "email" ? "email" : "text"}
                required
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4"
              />
            )}
          </label>
        ))}
        <button type="submit" className="min-h-11 rounded-full bg-[var(--site-primary)] px-5 text-sm font-medium text-white">
          {asString(props.submitLabel, "Send")}
        </button>
      </form>
    </SectionShell>
  );
}

export function NewsletterFormRender({ props }: { props: Record<string, unknown> }) {
  return (
    <SectionShell>
      <div className="rounded-3xl border border-white/10 p-8 md:flex md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{asString(props.title)}</h2>
          <p className="mt-2 text-sm text-[var(--site-muted)]">{asString(props.body)}</p>
        </div>
        <form method="post" action="/api/leads" className="mt-6 flex gap-3 md:mt-0">
          <input type="hidden" name="formId" value="newsletter" />
          <label className="sr-only" htmlFor="newsletter-email">
            Email
          </label>
          <input id="newsletter-email" name="email" type="email" required className="min-h-11 rounded-full border border-white/10 bg-white/5 px-4" />
          <button type="submit" className="min-h-11 rounded-full bg-[var(--site-primary)] px-5 text-sm text-white">
            {asString(props.submitLabel, "Subscribe")}
          </button>
        </form>
      </div>
    </SectionShell>
  );
}

export function BlogGridRender({ props }: { props: Record<string, unknown> }) {
  const items = asArray<{ title: string; excerpt: string; href: string }>(props.items);
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <a key={item.title} href={item.href} className="rounded-3xl border border-white/10 p-6">
            <h3 className="text-lg">{item.title}</h3>
            <p className="mt-3 text-sm text-[var(--site-muted)]">{item.excerpt}</p>
          </a>
        ))}
      </div>
    </SectionShell>
  );
}

export function MapRender({ props }: { props: Record<string, unknown> }) {
  return (
    <SectionShell>
      <Heading>{asString(props.title)}</Heading>
      <p className="mt-3 text-sm">{asString(props.address)}</p>
      <p className="mt-2 text-sm text-amber-200">{asString(props.note)}</p>
    </SectionShell>
  );
}

export function AnnouncementBarRender({ props }: { props: Record<string, unknown> }) {
  return (
    <a href={asString(props.href, "/contact")} className="block bg-[var(--site-accent)] px-4 py-3 text-center text-sm text-slate-950">
      {asString(props.text)}
    </a>
  );
}

export function FooterRender({ props }: { props: Record<string, unknown> }) {
  const links = asArray<{ label: string; href: string }>(props.links);
  return (
    <footer className="border-t border-white/10 px-6 py-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="font-semibold">{asString(props.brand)}</div>
          <p className="mt-2 max-w-md text-sm text-[var(--site-muted)]">{asString(props.legal)}</p>
        </div>
        <nav className="flex gap-4 text-sm">
          {links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
