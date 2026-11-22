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