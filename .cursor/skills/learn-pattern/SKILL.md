---
name: learn-pattern
description: Creates learning rule files from code changes or explicit instructions. Use when the user says "learn this" or wants to document a pattern for future use.
---

# Learn Pattern Command

Creates dated learning rule files to capture patterns and decisions.

## Usage Scenarios

**Explicit learning:**
```
User: "@learn: Always use arrow functions for React components"
```

**Implicit learning:**
```
User: "@learn"
```
Agent compares current file with session changes and extracts patterns.

## Workflow

When user invokes learning:

### Step 1: Get Date
```typescript
const date = new Date().toISOString().split('T')[0] // "2026-02-01"
```

### Step 2: Create File Path
```
.cursor/rules/learnings/YYYY-MM-DD.mdc
```

### Step 3: Determine Content

**If explicit instruction provided:**
- Document the instruction as a rule
- Add concrete examples
- Include ✅ ❌ patterns

**If no instruction (implicit):**
- Compare current file with recent changes in session
- Extract patterns from modifications
- Generalize into reusable rule
- Add examples from actual changes

### Step 4: Follow Rule Structure

Use standard `.mdc` format from `rules.mdc`:

```markdown
---
description: USE WHEN [specific trigger condition]
globs: 
  - "**/*.relevant.extension"
alwaysApply: false
---

# [Learning Title]

**Purpose:** [One sentence explaining what was learned]

---

## [Pattern Name]

**[Key principle]**

```typescript
// ❌ Wrong: [Why this is wrong]
[bad example]

// ✅ Correct: [Why this is right]
[good example]
```

**Context:** [Why this pattern emerged, what problem it solves]
```

## Example: Explicit Learning

**User request:**
```
@learn: Always use arrow functions for React components
```

**Generated file:** `.cursor/rules/learnings/2026-02-01.mdc`

```markdown
---
description: USE WHEN writing React components
globs: 
  - "**/*.tsx"
  - "**/*.jsx"
alwaysApply: false
---

# React Component Function Style

**Purpose:** Enforce arrow function syntax for React components for consistency.

---

## Component Declaration

**Use arrow functions for all React components.**

```typescript
// ❌ Wrong: Function declaration
function UserProfile({ user }: Props) {
  return <div>{user.name}</div>;
}

// ✅ Correct: Arrow function
const UserProfile = ({ user }: Props) => {
  return <div>{user.name}</div>;
};
```

**Context:** Arrow functions provide consistent syntax and avoid issues with `this` binding.
```

## Example: Implicit Learning

**Session changes:**
- Refactored 3 components from function declarations to arrow functions
- Added consistent prop destructuring
- Moved from named exports to default exports

**User request:**
```
@learn
```

**Agent analyzes changes and creates:** `.cursor/rules/learnings/2026-02-01.mdc`

```markdown
---
description: USE WHEN writing React components in this project
globs: 
  - "src/components/**/*.tsx"
alwaysApply: false
---

# Component Patterns - Session Learning

**Purpose:** Document patterns established in recent refactoring session.

---

## Component Declaration Style

**Use arrow functions with default exports.**

```typescript
// ❌ Before: Function declaration with named export
export function UserCard({ user }: Props) {
  return <div>{user.name}</div>;
}

// ✅ After: Arrow function with default export
const UserCard = ({ user }: Props) => {
  return <div>{user.name}</div>;
};

export default UserCard;
```

## Props Destructuring

**Destructure props inline in function parameters.**

```typescript
// ❌ Before: Props object reference
const UserCard = (props: Props) => {
  return <div>{props.user.name}</div>;
};

// ✅ After: Inline destructuring
const UserCard = ({ user }: Props) => {
  return <div>{user.name}</div>;
};
```

**Context:** These patterns emerged from refactoring UserCard, ProfileCard, and SettingsCard components for consistency.
```

## Implementation Steps

1. **Check if file exists:**
   - If `.cursor/rules/learnings/YYYY-MM-DD.mdc` exists, append to it
   - If not, create new file

2. **For explicit learning:**
   - Extract the principle
   - Create examples demonstrating the pattern
   - Add context about why

3. **For implicit learning:**
   - Review session history (last 10 file changes)
   - Identify recurring patterns
   - Extract common modifications
   - Generalize into reusable rule
   - Use actual code from changes as examples

4. **Format with rule standards:**
   - Include frontmatter with description and globs
   - Use ✅ ❌ pattern
   - Add context section
   - Keep examples concise

5. **Confirm creation:**
   - Show user the file path
   - Summarize what was learned
   - Ask if adjustments needed

## File Naming

**Date-based learning files:**
```
.cursor/rules/learnings/
  2026-02-01.mdc
  2026-02-05.mdc
  2026-02-15.mdc
```

**Benefits:**
- Chronological organization
- Multiple learnings per day combined in one file
- Easy to review recent patterns
- Can be consolidated later

## Verification Checklist

Before saving learning file:

- [ ] Date-based filename (`YYYY-MM-DD.mdc`)
- [ ] Frontmatter with description and globs
- [ ] Clear pattern title
- [ ] Purpose statement
- [ ] ✅ ❌ examples
- [ ] Context explaining why
- [ ] Examples are concrete, not abstract
- [ ] Follows standard rule structure
