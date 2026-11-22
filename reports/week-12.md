## Week 12 Progress Report

## Completed Work

Implemented the core of the AI Financial Assistant: four finance functions in `src/finance.mjs` (`getTransactions`, `analyzeExpenses`, `calculateBudget`, `planSavings`) that follow the function specification in the proposal. Created a synthetic dataset of 18 transactions in `data/transactions.json`. Added input validation (`ValidationError`, real calendar dates, date ranges, month format, non-negative amounts, integer months) and output validation in `src/output-validation.mjs`, which checks that tool results contain real numbers and that totals are consistent with each other (for example balance equals income minus expenses). Wrote 26 project tests with `node --test`. Added `demo.mjs` (`npm run demo`) that runs all functions on the dataset without an LLM. Documented the changes from the original proposal (Node.js instead of Python, JSON instead of CSV, CLI instead of Streamlit, `node:test` instead of pytest) in the Revisions section of `reports/proposal.md`.

## Important Commits

- Commit hash: 5169279
- Description: feat: add JSON transaction loader, date validation and range filtering with tests
- Link: https://github.com/RusalnMansurov/css4007-ai-agents-final-MansurovRuslan/commit/5169279

- Commit hash: a1c58e5
- Description: feat: add expense analysis by date range and budget calculation with optional limit
- Link: https://github.com/RusalnMansurov/css4007-ai-agents-final-MansurovRuslan/commit/a1c58e5

- Commit hash: 7d48d32
- Description: feat: add savings planning with input validation and tests
- Link: https://github.com/RusalnMansurov/css4007-ai-agents-final-MansurovRuslan/commit/7d48d32

- Commit hash: c7d6a00
- Description: feat: add demo script for finance functions
- Link: https://github.com/RusalnMansurov/css4007-ai-agents-final-MansurovRuslan/commit/c7d6a00

- Commit hash: 7379894
- Description: feat: add output validation for tool results with tests
- Link: https://github.com/RusalnMansurov/css4007-ai-agents-final-MansurovRuslan/commit/7379894

- Commit hash: 5cf2ed7
- Description: docs: record proposal revisions (Node.js, JSON, CLI, node:test)
- Link: https://github.com/RusalnMansurov/css4007-ai-agents-final-MansurovRuslan/commit/5cf2ed7

## Current Functionality

The core logic works without an LLM. `getTransactions` filters transactions by date range, category and type. `analyzeExpenses` returns spending per category, the total and the largest category for an optional date range. `calculateBudget` returns income, expenses and balance for a month and, if a limit is given, the remaining limit and whether it is exceeded. `planSavings` returns the remaining amount and the monthly saving needed for a goal. `validateOutput` checks tool results before they would be passed to an LLM. `npm run demo` prints results for the example requests from the proposal (for example, savings of 80,000 KZT per month for a 600,000 KZT goal with 120,000 KZT saved, and November spending of 288,500 KZT against a 180,000 KZT limit). `npm test` runs 36 tests: 26 project tests and 10 starter utility tests; all pass.

## Problems Encountered

My first version of the functions filtered by month, but the proposal specifies date ranges for `get_transactions` and `analyze_expenses` and an optional limit for `calculate_budget`, so the code did not match the proposal. The month check by regular expression also accepted impossible dates such as 2026-02-30. After editing the test file the tests failed with "test is not defined" because the import lines at the top of the file had been deleted by mistake. One `git push` failed with "Could not resolve host: github.com" because of a network problem.

## Solutions

Changed the functions to use `startDate` and `endDate`, made the limit optional (null or undefined means no limit) and added a real calendar-date check with a test for 2026-02-30. Restored the missing import lines in the test file and re-ran the tests. Repeated the push after the connection returned and confirmed with `git status` that the branch matched `origin/main`.

## What I Learned

How to separate deterministic calculations from the LLM so that numerical claims come from code, why inputs and outputs of tools must be validated (the LLM may send null or malformed arguments, and results must be checked before the model uses them), how to check consistency between numbers (balance, totals, savings), how to write tests with `node:test` and `assert`, and why a function should not accept inherited object properties such as `constructor` as tool names.

## Next Week

Register `analyzeExpenses`, `calculateBudget` and `planSavings` as LLM-callable tools with JSON Schema arguments, implement a dispatcher that validates tool names and arguments, extend `complete()` in `src/model-client.mjs` to pass tools and return real tool calls, and let the LLM choose and execute tools. Add tests with a mocked LLM client.

AI assistance: ChatGPT and Claude (Anthropic) were used for planning, drafting code and review. I ran and tested all code and can explain it.