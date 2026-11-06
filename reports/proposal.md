# Project Proposal — AI Financial Assistant

## Project Title
AI Financial Assistant: A Tool-Using Personal Budget Agent

## Problem Description
Many students and young adults find it difficult to understand where their money goes, calculate monthly balances, and plan realistic savings. Manual spreadsheet analysis takes time and may be confusing. This project builds an LLM-powered assistant that answers natural-language questions using deterministic financial calculation tools and a small, synthetic transaction dataset. It provides educational budgeting support, not investment, credit, or professional financial advice.

## Target Users
Students and young adults who want to understand spending patterns, manage monthly budgets, and plan savings goals. The prototype uses fictional data and does not connect to real bank accounts.

## Selected Difficulty

C — Intermediate

The project is designed as a C-level AI agent.
It will integrate a real LLM, implement at least two
LLM-callable tools, validate tool arguments, handle errors,
and include at least 8 automated tests.

## Expected Functionality
1. Ask questions in natural language through a Streamlit interface.
2. Load synthetic transaction records from a local CSV file.
3. Analyze spending by category and optional date range.
4. Calculate income, expenses, and remaining budget for a month.
5. Calculate a monthly savings target from a goal amount, current savings, and deadline in months.
6. Have the LLM select and invoke the appropriate tool(s), using their actual results in the final answer.
7. Reject invalid tool arguments and report missing data or provider errors clearly.
8. Display a concise, non-sensitive log of tool names, argument validation, and execution status.

## Proposed Functions

### `get_transactions(start_date: str | None, end_date: str | None) -> list[dict]`
- **Purpose:** Retrieve synthetic transactions for a date interval.
- **Input:** Optional ISO dates (`YYYY-MM-DD`).
- **Expected output:** List of records with date, category, type (`income`/`expense`), and amount in KZT.
- **Dependencies:** Python CSV reader, local `data/transactions.csv`, date validation.

### `analyze_expenses(start_date: str | None, end_date: str | None) -> dict`
- **Purpose:** Summarize expenses by category and find the largest category.
- **Input:** Optional ISO dates.
- **Expected output:** Total spending, category totals, largest category, and currency (`KZT`).
- **Dependencies:** `get_transactions`, Python decimal arithmetic.

### `calculate_budget(month: str, monthly_limit: float | None = None) -> dict`
- **Purpose:** Calculate income, expenses, balance, and optional difference from a spending limit.
- **Input:** Month in `YYYY-MM` format; optional nonnegative limit in KZT.
- **Expected output:** Monthly income, expenses, balance, and budget comparison.
- **Dependencies:** `get_transactions`, validated inputs, decimal arithmetic.

### `plan_savings(goal_amount: float, current_savings: float, months: int) -> dict`
- **Purpose:** Calculate how much to save each month to reach a goal.
- **Input:** Nonnegative goal/current amounts and a positive integer number of months.
- **Expected output:** Remaining amount and required monthly saving in KZT.
- **Dependencies:** Pydantic validation, Python decimal arithmetic; assumes no interest or investment returns.

### `run_agent(message: str) -> dict`
- **Purpose:** Process a user request, let the LLM select tools, execute approved calls, and generate a grounded answer.
- **Input:** Natural-language user message.
- **Expected output:** Answer and safe execution metadata.
- **Dependencies:** LLM API client, tool schemas, dispatcher, input validation, error handling, bounded tool-call loop.

## Proposed Agent Tools
The following Python functions will be registered as LLM-callable tools: `analyze_expenses`, `calculate_budget`, `plan_savings`, and optionally `get_transactions`. Each has a structured argument schema. The LLM must select tools itself through provider-supported tool calling; keyword-based hard-coded routing will not be used. The dispatcher will validate arguments and return tool outputs to the model. Tool results, not model guesses, are the source of numerical claims.

## Model Selection
Proposed: an OpenAI API model supporting tool calling (specific model chosen after verifying access, availability, and cost). The API key will be stored in an environment variable, never committed to GitHub. A compatible provider can be substituted if needed.

## Architecture
```text
User -> Streamlit UI -> Agent controller -> LLM API
                            ^                |
                            |          tool call + args
                            |                v
                            +-- validated dispatcher
                                      |
                     +----------------+----------------+
                     |                |                |
               analyze_expenses  calculate_budget  plan_savings
                     |                |                |
                     +------- synthetic CSV / math ----+
                                      |
                                tool result
                                      |
                            LLM grounded answer -> UI
```
The controller enforces a maximum number of tool calls per request, validates tool names and arguments, and returns understandable errors when calls fail.

## Example Requests
1. “Which expense category was the largest in November 2026?”
2. “What was my income, spending, and remaining balance in November 2026?”
3. “I want to save 600,000 KZT in six months and already have 120,000 KZT. How much should I save monthly?”
4. “Compare my November spending with a 180,000 KZT monthly spending limit.”

## Evaluation Plan
Use pytest and synthetic fixtures. At least eight application-specific tests:
1. Correct category totals for a known dataset.
2. Correct monthly income, expense, and balance calculation.
3. Correct savings calculation.
4. Reject invalid dates and month formats.
5. Reject negative amounts and zero months.
6. Return a clear result when no transactions match a date range.
7. Verify the LLM-selected tool is dispatched and its result included in the answer (mock LLM).
8. Handle malformed tool arguments or unknown tool names safely.
9. Handle an LLM API failure without crashing.
10. Verify tool calls are logged without leaking secrets.
Record pass/fail results, fixes, and example traces in the final report. Starter repository tests do not count toward these project tests.

## Weekly Milestones
- **Week 10 (Nov 2–8):** Fork repository, select C level, write proposal, define tools and architecture, commit proposal.
- **Week 11 (Nov 9–15):** Create Python environment, Streamlit skeleton, connect LLM, demonstrate first response.
- **Week 12 (Nov 16–22):** Build synthetic CSV dataset, calculation functions, validation, and initial tests.
- **Week 13 (Nov 23–29):** Register at least two tools, implement real LLM tool selection and execution.
- **Week 14 (Nov 30–Dec 6):** Complete end-to-end agent workflow and tool error handling.
- **Week 15 (Dec 7–13):** Improve reliability, argument checks, execution bounds, and logs; expand tests.
- **Week 16 (Dec 14–20):** Run evaluation, fix failures, finalize README and reports.
- **Week 17 (Dec 21–22):** Submit final report, fork URL, commit hash, and demonstrate/defend application.

## AI Coding Assistant Disclosure (planned)
ChatGPT may assist with planning, explanations, drafting code, and debugging. All generated code will be reviewed, executed, tested, and explained by the student. Actual assistance will be described in the final report.
