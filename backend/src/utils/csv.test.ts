import test from "node:test";
import assert from "node:assert/strict";
import { parseCsv } from "./csv";

test("parseCsv parses headers and rows", () => {
  const csv = "name,email,department\nAlice,a@example.com,CS\nBob,b@example.com,Math";
  const rows = parseCsv(csv);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].name, "Alice");
  assert.equal(rows[1].department, "Math");
});

test("parseCsv handles quoted values", () => {
  const csv = 'name,email,department\n"Doe, Jane",j@example.com,"Computer Science"';
  const rows = parseCsv(csv);

  assert.equal(rows[0].name, "Doe, Jane");
  assert.equal(rows[0].department, "Computer Science");
});
