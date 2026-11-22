import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ValidationError,
  validateTransactions,
  parseTransactions,
  loadTransactions,
  getTransactions,
} from "../src/finance.mjs";

const SAMPLE = validateTransactions([
  { date: "2026-11-01", description: "Salary", category: "salary", type: "income", amount: 450000 },
  { date: "2026-11-03", description: "Rent", category: "housing", type: "expense", amount: 150000 },
  { date: "2026-11-04", description: "Groceries", category: "food", type: "expense", amount: 41000 },
  { date: "2026-11-11", description: "Groceries", category: "food", type: "expense", amount: 36000 },
  { date: "2026-10-05", description: "Groceries", category: "food", type: "expense", amount: 38000 },
]);

test("validateTransactions accepts valid data", () => {
  assert.equal(SAMPLE.length, 5);
  assert.equal(SAMPLE[0].amount, 450000);
});

test("validateTransactions rejects negative amount and wrong type", () => {
  const bad = { date: "2026-11-01", description: "X", category: "food", type: "expense", amount: -5 };
  assert.throws(() => validateTransactions([bad]), ValidationError);
  assert.throws(() => validateTransactions([{ ...bad, amount: 5, type: "gift" }]), ValidationError);
});

test("validateTransactions rejects impossible calendar date", () => {
  const bad = { date: "2026-02-30", description: "X", category: "food", type: "expense", amount: 5 };
  assert.throws(() => validateTransactions([bad]), ValidationError);
});

test("parseTransactions rejects invalid JSON", () => {
  assert.throws(() => parseTransactions("not json"), ValidationError);
});

test("real JSON file loads", async () => {
  const data = await loadTransactions();
  assert.ok(data.length > 0);
});

test("getTransactions filters by date range and type", () => {
  const r = getTransactions(SAMPLE, {
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    type: "expense",
  });
  assert.equal(r.length, 3);
});

test("getTransactions returns empty array when nothing matches", () => {
  const r = getTransactions(SAMPLE, { startDate: "2027-01-01", endDate: "2027-01-31" });
  assert.deepEqual(r, []);
});

test("getTransactions rejects bad dates and reversed range", () => {
  assert.throws(() => getTransactions(SAMPLE, { startDate: "11-2026" }), ValidationError);
  assert.throws(
    () => getTransactions(SAMPLE, { startDate: "2026-11-30", endDate: "2026-11-01" }),
    ValidationError
  );
});