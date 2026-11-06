# Semester Week 10 Progress Report

## Completed Work

- Selected the project topic **AI Financial Assistant** and difficulty **C — Intermediate**.
- Defined the initial project scope: an LLM-powered personal finance assistant that analyzes expenses, calculates budgets, and supports savings planning.
- Prepared `reports/proposal.md` with the project concept, planned functions and tools, architecture, evaluation approach, and weekly milestones.
- Ran `npm run proposal` and obtained the result: `Complete (instructor review still required).`
- Reviewed the instructor's repository structure and reporting requirements.

## Important Commits

- Commit hash: **To be added after committing and pushing the Week 10 work.**
- Description: Add the AI Financial Assistant project proposal and Week 10 progress report.
- Link: **To be added after pushing to GitHub.**

## Current Functionality

The project is currently in the planning stage. The proposal has passed automated validation. The Python application, LLM integration, and financial tools have not yet been implemented.

## Problems Encountered

- Initially, `npm run proposal` failed with `ENOENT` because it was executed in a directory without `package.json`.
- The proposal validator initially rejected the `Selected Difficulty` field because its format did not match the required convention.

## Solutions

- Located the correct instructor repository containing `package.json` and ran the validation command there.
- Updated the `Selected Difficulty` section so that its value starts with `C`.
- Re-ran the validator successfully.

## What I Learned

- How the required GitHub fork and reporting structure are organized.
- Why npm scripts must be run from a project directory containing `package.json`.
- How the automated proposal validator checks required fields.
- The difference between a basic LLM application and a C-level agent that lets the LLM select and call tools.

## Next Week

- Set up a Python virtual environment and install the initial dependencies.
- Create the first application modules and a small fictional CSV transaction dataset.
- Integrate an LLM API and demonstrate a first working request.
- Document the setup steps, make meaningful commits, and prepare `reports/week-11.md`.
