import {
  loadTransactions,
  getTransactions,
  analyzeExpenses,
  calculateBudget,
  planSavings,
  ValidationError,
} from "./src/finance.mjs";

function show(title, result) {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(result, null, 2));
}

const transactions = await loadTransactions();
console.log(`Loaded ${transactions.length} transactions from data/transactions.json`);

show(
  "1. Largest expense category in November 2026",
  analyzeExpenses(transactions, { startDate: "2026-11-01", endDate: "2026-11-30" })
);

show(
  "2. Income, spending and balance in November 2026",
  calculateBudget(transactions, { month: "2026-11" })
);

show(
  "3. Savings goal: 600,000 KZT in 6 months, 120,000 KZT saved",
  planSavings({ goalAmount: 600000, currentSavings: 120000, months: 6 })
);

show(
  "4. November spending vs a 180,000 KZT limit",
  calculateBudget(transactions, { month: "2026-11", monthlyLimit: 180000 })
);

show(
  "5. Salary transactions only",
  getTransactions(transactions, { category: "salary" })
);

console.log("\n=== 6. Invalid input is rejected ===");
try {
  calculateBudget(transactions, { month: "2026-13" });
} catch (error) {
  if (error instanceof ValidationError) {
    console.log(`${error.name}: ${error.message}`);
  } else {
    throw error;
  }
}