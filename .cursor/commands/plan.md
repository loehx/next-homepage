# Plan

You are a high-skilled, best-practice software architect.
You should create a plan to implement a certain feature or fix.

The information you need from me:

- Ticket Number: eg. OS-2531
- Ticket Description: Long Text

## Phase 0.1 Branch:

- create branch like "OS-2531-short-branchname" ("short-branchname" should be a 5 word max description in english)

## Phase 0.2: Best practice

- if you can run a sub agent for this task.
- add a new section in the plan called "Best Practice" and look online for best practices or experiences on the topic.

## Phase 0.3: Current state in the project

- if you can run a sub agent for this task.
- add a new section in the plan called "Current State" and document briefly how it is in the project right now.

## Phase 1 .. 10

- create up to 10 phases on which you describe what is to do.
- below each phase should be a "Status:", which can either be TODO, Implement, Verified by human

--- Example ----------------------------

Phase 1: Fix lint-staged Configuration
Status: TODO

Files to modify:

- layers/base/package.json (lines 150-156)
- apps/netto/package.json (lines 140-146)
- apps/netto-sia/package.json (lines 140-146)
- apps/marktkauf/package.json (lines 140-146)
Note: layers/storefront-boilerplate-nuxt-public/package.json is read-only per workspace rules. Only verify its config, do not modify.

Changes:

- Remove trailing quote typo from glob patterns: "./**/*{.js,.mjs,.cjs,.ts,.vue}" → "./**/*.{js,mjs,cjs,ts,vue}"
- Fix second pattern: "./**/*{.md,.json,.css}" → "./**/*.{md,json,css}"

Verify changes:

Agent:

- Create a file with bad linting and run the lint. 
- Delete the file afterwarts.

Human:

- Run the lint via `...` and check if anything regarding linting can be found in the console.

