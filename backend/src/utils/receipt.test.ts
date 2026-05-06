import test from "node:test";
import assert from "node:assert/strict";
import { generateReceiptCode } from "./receipt";

test("generateReceiptCode creates receipt with expected prefix", () => {
  const value = generateReceiptCode();
  assert.match(value, /^rcpt_\d+_[a-f0-9]{8}$/);
});

test("generateReceiptCode returns different values", () => {
  const one = generateReceiptCode();
  const two = generateReceiptCode();
  assert.notEqual(one, two);
});
