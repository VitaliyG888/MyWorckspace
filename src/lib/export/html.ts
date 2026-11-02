import type { SiteDocument } from "@/lib/schema/site-document";

export function buildExportHtml(site: SiteDocument): string {
  const pages = site.pages
    .map((page) => {
      const sections = page.sections
        .filter((s) => s.status === "ready")
        .map((s) => `<section data-block="${s.type}" data-id="${s.id}"><pre>${escapeHtml(JSON.stringify(s.props, null, 2))}</pre></section>`)
        .join("\n");
      return `<article id="${page.slug}"><h1>${escapeHtml(page.name)}</h1>${sections}</article>`;
    })
    .join("\n");
  return `<!doctype html>
<html lang="${site.locale}">
<head>
  <meta charset="utf-8"/>
  <title>${escapeHtml(site.pages[0]?.seo.title || site.name)}</title>
  <meta name="description" content="${escapeHtml(site.pages[0]?.seo.description || site.brief.description)}"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
</head>
<body>
${pages}
<script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@type": site.pages[0]?.seo.jsonLdType || "Organization",
    name: site.brief.brandName,
    description: site.brief.description,
  })}</script>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
