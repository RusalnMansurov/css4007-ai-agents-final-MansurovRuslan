import { ValidationError } from "./finance.mjs";

const isNumber = (v) => typeof v === "number" && Number.isFinite(v);
const isNonNegative = (v) => isNumber(v) && v >= 0;
const close = (a, b, tolerance = 0.01) => Math.abs(a - b) <= tolerance;

// Каждая проверка дописывает найденные проблемы в список problems
const checkers = {
  analyzeExpenses(r, problems) {
    if (!isNonNegative(r.totalExpenses)) {
      problems.push("totalExpenses must be a non-negative number");
    }
    if (!Array.isArray(r.categories)) {
      problems.push("categories must be an array");
      return;
    }
    const wellFormed = r.categories.every(
      (c) => typeof c?.category === "string" && isNonNegative(c?.total)
    );
    if (!wellFormed) {
      problems.push("each category needs a name and a non-negative total");
      return;
    }
    const sum = r.categories.reduce((s, c) => s + c.total, 0);
    if (isNumber(r.totalExpenses) && !close(sum, r.totalExpenses)) {
      problems.push("category totals do not add up to totalExpenses");
    }
    const expectedLargest = r.categories[0]?.category ?? null;
    if (r.largestCategory !== expectedLargest) {
      problems.push("largestCategory does not match the category list");
    }
  },

  calculateBudget(r, problems) {
    if (!isNonNegative(r.income)) problems.push("income must be a non-negative number");
    if (!isNonNegative(r.expenses)) problems.push("expenses must be a non-negative number");
    if (!isNumber(r.balance)) {
      problems.push("balance must be a number");
    } else if (isNumber(r.income) && isNumber(r.expenses) && !close(r.balance, r.income - r.expenses)) {
      problems.push("balance must equal income minus expenses");
    }
    if (r.monthlyLimit != null) {
      if (!isNumber(r.remainingLimit) || !close(r.remainingLimit, r.monthlyLimit - r.expenses)) {
        problems.push("remainingLimit must equal monthlyLimit minus expenses");
      }
      if (r.overLimit !== r.expenses > r.monthlyLimit) {
        problems.push("overLimit does not match expenses and monthlyLimit");
      }
    }
  },

  planSavings(r, problems) {
    if (!isNonNegative(r.remaining)) problems.push("remaining must be a non-negative number");
    if (!isNonNegative(r.monthlyRequired)) problems.push("monthlyRequired must be a non-negative number");
    if (typeof r.goalReached !== "boolean") {
      problems.push("goalReached must be a boolean");
    } else if (r.goalReached !== (r.remaining === 0)) {
      problems.push("goalReached does not match remaining");
    }
    if (
      isNonNegative(r.remaining) &&
      isNonNegative(r.monthlyRequired) &&
      isNumber(r.months) &&
      !close(r.monthlyRequired * r.months, r.remaining, 0.005 * r.months + 0.01)
    ) {
      problems.push("monthlyRequired times months must equal remaining");
    }
  },
};

export function validateOutput(toolName, result) {
  if (!Object.hasOwn(checkers, toolName)) {
    throw new ValidationError(`unknown tool: ${toolName}`);
  }
  if (typeof result !== "object" || result === null) {
    throw new ValidationError(`${toolName} output must be an object`);
  }
  const problems = [];
  if (result.currency !== "KZT") problems.push('currency must be "KZT"');
  checkers[toolName](result, problems);
  if (problems.length > 0) {
    throw new ValidationError(`${toolName} output is invalid: ${problems.join("; ")}`);
  }
  return result;
}