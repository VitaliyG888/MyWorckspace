import assert from "node:assert/strict";
import { test } from "node:test";
import { motionConfigSchema } from "./motion";

test("motion schema defaults are safe", () => {
  const cfg = motionConfigSchema.parse({});
  assert.equal(cfg.preset, "none");
  assert.equal(cfg.respectReducedMotion, true);
});
