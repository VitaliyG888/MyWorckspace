import assert from "node:assert/strict";
import { test } from "node:test";
import { extractJson } from "./json";

test("parses fenced json", () => {
  const value = extractJson('note\n```json\n{"ok":true}\n```');
  assert.deepEqual(value, { ok: true });
});

test("parses raw object", () => {
  const value = extractJson('prefix {"a":1} trailing');
  assert.deepEqual(value, { a: 1 });
});
