import assert from "node:assert/strict";
import { test } from "node:test";
import { finalizeBrief, mergeBrief } from "./specialists";

test("finalizeBrief never invents testimonials", () => {
  const brief = finalizeBrief({ brandName: "Northwind" });
  assert.equal(brief.brandName, "Northwind");
  assert.equal(brief.version, 1);
  assert.ok(brief.assumptions.length >= 1);
  assert.equal(brief.approvedByUser, false);
});

test("mergeBrief keeps previous facts", () => {
  const merged = mergeBrief(
    { confirmedFacts: [{ id: "a", text: "one", field: "x", confirmed: true }] },
    { confirmedFacts: [{ id: "b", text: "two", field: "y", confirmed: true }] },
  );
  assert.equal(merged.confirmedFacts?.length, 2);
});
