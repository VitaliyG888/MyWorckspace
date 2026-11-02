import assert from "node:assert/strict";
import { test } from "node:test";
import { encryptSecret, decryptSecret, maskSecret } from "./secrets";

test("roundtrips secrets", () => {
  const cipher = encryptSecret("sk-test-123456789");
  assert.equal(decryptSecret(cipher), "sk-test-123456789");
  assert.notEqual(cipher, "sk-test-123456789");
});

test("masks secrets", () => {
  assert.equal(maskSecret("sk-abcdefgh"), "sk-a••••efgh");
});
