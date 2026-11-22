import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ValidationError,
  validateTransactions,
  parseTransactions,
  loadTransactions,
  getTransactions,
  analyzeExpenses,
  calculateBudget,
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

test("analyzeExpenses sums by category and finds the largest", () => {
  const r = analyzeExpenses(SAMPLE, {
    startDate: "2026-11-01",
    endDate: "2026-11-30",
  });
  assert.equal(r.currency, "KZT");
  assert.equal(r.totalExpenses, 227000);
  assert.equal(r.largestCategory, "housing");
  assert.deepEqual(r.categories[1], { category: "food", total: 77000 });
});

test("analyzeExpenses without dates uses all transactions", () => {
  const r = analyzeExpenses(SAMPLE);
  assert.equal(r.totalExpenses, 265000);
  assert.equal(r.categories.find((c) => c.category === "food").total, 115000);
});

test("analyzeExpenses returns a clear empty result when nothing matches", () => {
  const r = analyzeExpenses(SAMPLE, {
    startDate: "2027-01-01",
    endDate: "2027-01-31",
  });
  assert.equal(r.totalExpenses, 0);
  assert.deepEqual(r.categories, []);
  assert.equal(r.largestCategory, null);
});

test("analyzeExpenses rejects invalid dates", () => {
  assert.throws(() => analyzeExpenses(SAMPLE, { startDate: "2026-13-01" }), ValidationError);
});

test("calculateBudget computes income, expenses, balance and limit usage", () => {
  const r = calculateBudget(SAMPLE, { month: "2026-11", monthlyLimit: 300000 });
  assert.equal(r.income, 450000);
  assert.equal(r.expenses, 227000);
  assert.equal(r.balance, 223000);
  assert.equal(r.remainingLimit, 73000);
  assert.equal(r.limitUsedPercent, 75.67);
  assert.equal(r.overLimit, false);
});

test("calculateBudget works without a limit", () => {
  const r = calculateBudget(SAMPLE, { month: "2026-11" });
  assert.equal(r.balance, 223000);
  assert.equal(r.monthlyLimit, null);
  assert.equal("overLimit" in r, false);
});

test("calculateBudget detects an exceeded limit", () => {
  const r = calculateBudget(SAMPLE, { month: "2026-11", monthlyLimit: 200000 });
  assert.equal(r.overLimit, true);
  assert.equal(r.remainingLimit, -27000);
});

test("calculateBudget rejects invalid month and negative limit", () => {
  assert.throws(() => calculateBudget(SAMPLE, { month: "11-2026" }), ValidationError);
  assert.throws(() => calculateBudget(SAMPLE, {}), ValidationError);
  assert.throws(
    () => calculateBudget(SAMPLE, { month: "2026-11", monthlyLimit: -1 }),
    ValidationError
  );
});

test("calculateBudget returns zeros for a month without transactions", () => {
  const r = calculateBudget(SAMPLE, { month: "2027-01", monthlyLimit: 100000 });
  assert.equal(r.income, 0);
  assert.equal(r.expenses, 0);
  assert.equal(r.balance, 0);
  assert.equal(r.limitUsedPercent, 0);
});