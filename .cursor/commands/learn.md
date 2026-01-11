---
description: Create a new learning rule file from code changes or explicit instructions
---

# @learn Command

Creates a new `.mdc` rule file in `.cursor/rules/learnings/` directory with the current date as filename (e.g., `2026-01-15.mdc`).

## Usage

**Explicit learning:**
```
@learn: Always use arrow functions for React components
```

**Implicit learning:**
```
@learn
```
(Agent compares current file with session changes and extracts patterns)

## Behavior

When `@learn` is invoked:

1. **Get current date** in `YYYY-MM-DD` format
2. **Create file path:** `.cursor/rules/learnings/YYYY-MM-DD.mdc`
3. **If explicit instruction:** Document the instruction as a rule
4. **If no instruction:** Compare current file with session history, extract patterns, generalize into rule
5. **Follow `.cursor/rules/rules.mdc` structure** with frontmatter, examples, ✅ ❌ patterns

## Implementation

See `.cursor/rules/learnings.mdc` for detailed implementation guidelines.

