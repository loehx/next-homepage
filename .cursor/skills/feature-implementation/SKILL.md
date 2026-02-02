---
name: feature-implementation
description: Strict isolation-first workflow using Storybook for component implementation, verification, and human-in-the-loop approval before main app integration.
---

# Feature Implementation

Implement UI components in isolation to ensure visual perfection and architectural cleanliness.

## 1. Deconstruct
- Break the feature into **Atoms**, **Molecules**, and **Organisms**.
- Define clear interfaces (Props) for each part.

## 2. Isolate & Implement
- Create the component and its corresponding `.stories` file **first**.
- Implement all states (e.g., loading, open, closed, hovered) as separate stories.
- **DO NOT** integrate into the main application yet.

## 3. Verify
- Run automated visual checks (e.g., using Playwright or Verifier sub-agents) against the Storybook URLs.
- Ensure the component matches design specs and handles edge cases.

## 4. Human Approval (Gate)
- Present the Storybook implementation to the user.
- Provide Storybook URLs for manual inspection.
- **WAIT** for explicit approval before proceeding to the next step.

## 5. Integrate
- Only after user approval, add the component to the main application.
- Verify that the integrated component works within the app context.
