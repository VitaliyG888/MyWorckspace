import assert from "node:assert/strict";
import { test } from "node:test";
import { validateBlock } from "./validate";

test("rejects empty hero", () => {
  const result = validateBlock("hero", {});
  assert.equal(result.ok, false);
});

test("accepts complete hero", () => {
  const result = validateBlock("hero", {
    eyebrow: "Brand",
    title: "A meaningful hero title here",
    subtitle: "This subtitle explains the offer without fake metrics or invented proof.",
    primaryCta: { label: "Contact", href: "/contact" },
    imageAlt: "Abstract draft cover visual",
  });
  assert.equal(result.ok, true, result.errors.join(", "));
});

test("rejects placeholder copy", () => {
  const result = validateBlock("features", {
    title: "Features",
    items: [
      { title: "One", body: "lorem" },
      { title: "Two", body: "Enough body text here" },
      { title: "Three", body: "Enough body text here" },
    ],
  });
  assert.equal(result.ok, false);
});
