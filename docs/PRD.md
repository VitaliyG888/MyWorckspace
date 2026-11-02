# PRD — AI Website Studio

## Problem

Teams need professional multi-page sites without locking into one LLM vendor or regenerating an entire site for a local edit.

## MVP user path

1. Create a workspace project and choose a site type.
2. Connect a custom LLM (or use the built-in demo provider).
3. Assign models to interviewer, builder, motion, SEO, image and article roles.
4. Complete an adaptive interview.
5. Review the `SiteBrief` (facts vs assumptions).
6. Generate the site section by section.
7. Edit, move, delete or regenerate one block.
8. Submit a contact form and see the lead stored.
9. Export `SiteDocument` JSON.

## Non-goals for this cut

Enterprise billing, full e-commerce, marketplace of blocks, Git two-way sync, Vercel/Netlify production adapters. Interfaces exist; they are marked `requires-setup` until implemented.

## Honesty rules

- No invented testimonials, metrics, licenses or addresses.
- Forms do not show success until storage succeeds.
- Integrations without credentials stay `requires-setup`.
