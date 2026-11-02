# AI generation pipeline

1. Interviewer -> `SiteBrief` (facts / assumptions / open questions).
2. Visual director -> design tokens.
3. Architect -> sitemap and planned sections.
4. SEO agent -> per-page metadata.
5. Block builder -> one section JSON at a time.
6. Validator + up to 2 repair attempts.
7. Image generator (hero/split/gallery only, draft-labelled if placeholder).
8. Motion designer -> `MotionConfig` only.
9. Article writer -> CMS draft.
10. QA agent -> blocking issues listed, failed sections stay `failed`.

Progress is stored on `GenerationRun` / `GenerationStep`. A single section can be retried without regenerating neighbors.
