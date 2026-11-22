import { test } from "node:test";
import assert from "node:assert/strict";
import {
  ValidationError,
  validateTransactions,
  analyzeExpenses,
  calculateBudget,
  planSavings,
} from "../src/finance.mjs";
import { validateOutput } from "../src/output-validation.mjs";

const DATA = validateTransactions([
  { date: "2026-11-01", description: "Salary", category: "salary", type: "income", amount: 450000 },
  { date: "2026-11-03", description: "Rent", category: "housing", type: "expense", amount: 150000 },
  { date: "2026-11-04", description: "Groceries", category: "food", type: "expense", amount: 41000 },
]);

test("validateOutput accepts real results of all tools", () => {
  const expenses = analyzeExpenses(DATA, { startDate: "2026-11-01", endDate: "2026-11-30" });
  const budget = calculateBudget(DATA, { month: "2026-11", monthlyLimit: 100000 });
  const savings = planSavings({ goalAmount: 100000, currentSavings: 0, months: 3 });
  assert.equal(validateOutput("analyzeExpenses", expenses), expenses);
  assert.equal(validateOutput("calculateBudget", budget), budget);
  assert.equal(validateOutput("planSavings", savings), savings);
});

test("validateOutput accepts empty and limit-free results", () => {
  const empty = analyzeExpenses(DATA, { startDate: "2027-01-01", endDate: "2027-01-31" });
  const noLimit = calculateBudget(DATA, { month: "2026-11" });
  assert.doesNotThrow(() => validateOutput("analyzeExpenses", empty));
  assert.doesNotThrow(() => validateOutput("calculateBudget", noLimit));
});

test("validateOutput rejects NaN and wrong types", () => {
  const budget = calculateBudget(DATA, { month: "2026-11" });
  assert.throws(() => validateOutput("calculateBudget", { ...budget, balance: NaN }), ValidationError);
  assert.throws(() => validateOutput("calculateBudget", { ...budget, income: "450000" }), ValidationError);
});

test("validateOutput rejects inconsistent numbers", () => {
  const expenses = analyzeExpenses(DATA);
  assert.throws(() => validateOutput("analyzeExpenses", { ...expenses, totalExpenses: 1 }), ValidationError);
  const savings = planSavings({ goalAmount: 600000, currentSavings: 120000, months: 6 });
  assert.throws(() => validateOutput("planSavings", { ...savings, monthlyRequired: 1 }), ValidationError);
  const budget = calculateBudget(DATA, { month: "2026-11", monthlyLimit: 100000 });
  assert.throws(() => validateOutput("calculateBudget", { ...budget, overLimit: false }), ValidationError);
});

test("validateOutput rejects unknown tools, wrong currency and non-objects", () => {
  assert.throws(() => validateOutput("deleteEverything", {}), ValidationError);
  assert.throws(() => validateOutput("constructor", {}), ValidationError);
  assert.throws(() => validateOutput("planSavings", null), ValidationError);
  const savings = planSavings({ goalAmount: 1000, currentSavings: 0, months: 2 });
  assert.throws(() => validateOutput("planSavings", { ...savings, currency: "USD" }), ValidationError);
});