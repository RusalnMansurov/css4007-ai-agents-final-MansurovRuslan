import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

const DEFAULT_DATA = fileURLToPath(
  new URL("../data/transactions.json", import.meta.url)
);

// Проверяет формат YYYY-MM-DD и что такая дата реально существует
export function isValidDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }
  const d = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === value;
}

// null и undefined означают "параметр не задан" (LLM может передать null)
function checkDate(name, value) {
  if (value != null && !isValidDate(value)) {
    throw new ValidationError(
      `${name} must be a valid date in YYYY-MM-DD format, got: ${value}`
    );
  }
}

const CURRENCY = "KZT";
const round2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;

function checkMonth(month) {
  if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
    throw new ValidationError(
      `month must be in YYYY-MM format, got: ${month}`
    );
  }
}

// null и undefined означают "лимит не задан"
function checkLimit(value) {
  if (value != null) {
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      throw new ValidationError("monthlyLimit must be a non-negative number");
    }
  }
}

export function validateTransactions(data) {
  if (!Array.isArray(data)) {
    throw new ValidationError("transactions must be an array");
  }
  return data.map((t, i) => {
    const where = `Transaction #${i + 1}`;
    if (typeof t !== "object" || t === null) {
      throw new ValidationError(`${where}: must be an object`);
    }
    if (!isValidDate(t.date)) {
      throw new ValidationError(`${where}: bad date "${t.date}"`);
    }
    for (const field of ["description", "category"]) {
      if (typeof t[field] !== "string" || t[field].trim() === "") {
        throw new ValidationError(`${where}: ${field} must be a non-empty string`);
      }
    }
    if (!["income", "expense"].includes(t.type)) {
      throw new ValidationError(`${where}: type must be income or expense`);
    }
    if (typeof t.amount !== "number" || !Number.isFinite(t.amount) || t.amount <= 0) {
      throw new ValidationError(`${where}: amount must be a positive number`);
    }
    return {
      date: t.date,
      description: t.description.trim(),
      category: t.category.trim(),
      type: t.type,
      amount: t.amount,
    };
  });
}

export function parseTransactions(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new ValidationError("transactions file is not valid JSON");
  }
  return validateTransactions(data);
}

export async function loadTransactions(path = DEFAULT_DATA) {
  return parseTransactions(await readFile(path, "utf8"));
}

// Соответствует get_transactions(start_date, end_date) из proposal
export function getTransactions(
  transactions,
  { startDate, endDate, category, type } = {}
) {
  checkDate("startDate", startDate);
  checkDate("endDate", endDate);
  if (startDate != null && endDate != null && startDate > endDate) {
    throw new ValidationError("startDate must not be after endDate");
  }
  if (type != null && !["income", "expense"].includes(type)) {
    throw new ValidationError("type must be income or expense");
  }
  // ISO-даты одинаковой длины корректно сравниваются как строки
  return transactions.filter(
    (t) =>
      (startDate == null || t.date >= startDate) &&
      (endDate == null || t.date <= endDate) &&
      (category == null || t.category === category) &&
      (type == null || t.type === type)
  );
}

// Соответствует analyze_expenses(start_date, end_date) из proposal
export function analyzeExpenses(transactions, { startDate, endDate } = {}) {
  const expenses = getTransactions(transactions, {
    startDate,
    endDate,
    type: "expense",
  });
  const byCategory = {};
  for (const t of expenses) {
    byCategory[t.category] = (byCategory[t.category] ?? 0) + t.amount;
  }
  const categories = Object.entries(byCategory)
    .map(([category, total]) => ({ category, total: round2(total) }))
    .sort((a, b) => b.total - a.total);
  return {
    currency: CURRENCY,
    startDate: startDate ?? null,
    endDate: endDate ?? null,
    totalExpenses: round2(categories.reduce((sum, c) => sum + c.total, 0)),
    categories,
    largestCategory: categories[0]?.category ?? null,
  };
}

// Соответствует calculate_budget(month, monthly_limit=None) из proposal
export function calculateBudget(transactions, { month, monthlyLimit } = {}) {
  checkMonth(month);
  checkLimit(monthlyLimit);

  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, mon, 0)).getUTCDate();
  const rows = getTransactions(transactions, {
    startDate: `${month}-01`,
    endDate: `${month}-${String(lastDay).padStart(2, "0")}`,
  });

  const sum = (type) =>
    rows.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  const income = round2(sum("income"));
  const expenses = round2(sum("expense"));

  const result = {
    currency: CURRENCY,
    month,
    income,
    expenses,
    balance: round2(income - expenses),
    monthlyLimit: monthlyLimit ?? null,
  };

  if (monthlyLimit != null) {
    result.remainingLimit = round2(monthlyLimit - expenses);
    result.overLimit = expenses > monthlyLimit;
    result.limitUsedPercent =
      monthlyLimit === 0 ? null : round2((expenses / monthlyLimit) * 100);
  }
  return result;
}