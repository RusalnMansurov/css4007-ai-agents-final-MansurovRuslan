## Week 11 Progress Report

## Completed Work

Set up the Node.js development environment and installed the `openai` and `dotenv` dependencies. Implemented `src/model-client.mjs`, which wraps the OpenAI Responses API and loads the API key and model name from `.env`. Added `test-llm.mjs`, a manual script that sends the first request to the model. The model responded successfully. Documented setup and run instructions in README.md.

## Important Commits

- Commit hash: acd143a
- Description: feat: add LLM client and first working model request
- Link: https://github.com/RusalnMansurov/css4007-ai-agents-final-MansurovRuslan/commit/acd143a

- Commit hash: 7b00b94
- Description: docs: add setup instructions and week 11 report (README setup section, openai and dotenv dependencies with lockfile, week 11 report)
- Link: https://github.com/RusalnMansurov/css4007-ai-agents-final-MansurovRuslan/commit/7b00b94

## Current Functionality

The application can send a message to the LLM and print the reply. `complete()` returns `{ text, toolCalls }`; tool calling is not implemented yet. It throws a clear error if `OPENAI_API_KEY` or `MODEL_NAME` is missing.

## Problems Encountered

Dependency changes and the first test script were not committed right away. Russian text printed in PowerShell was displayed incorrectly.

## Solutions

Checked `git status` to find the uncommitted files, committed the client and test script first, then the dependencies, README and report. Verified that `.env` is ignored with `git check-ignore`.

## What I Learned

How to call an LLM through an API, why API keys are stored in `.env` and excluded from Git, and how environment variables are loaded with dotenv.

## Next Week

Implement the core finance functions (get_transactions, analyze_expenses, calculate_budget, plan_savings) with input validation and the first tests.

Note: AI coding assistants were used to help write and review the code. I tested the result myself and can explain it.