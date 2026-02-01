---
name: minimal-diff-changes
description: Enforces minimal-diff code changes following local patterns. Use when making any code modifications, refactoring, or when concerned about breaking changes.
---

# Minimal Diff Code Changes

Guides AI to make surgical, pattern-respecting code changes that minimize risk.

## Core Principle

**Touch only files required for the requested change.** Target maximum 10% line changes per file.

## Change Scope Rules

**DO NOT:**
- Refactor unrelated code
- Reformat existing code
- Rename variables/functions unless specifically requested
- "Improve" code outside the task scope

**Example:**

```typescript
// Task: Fix button onClick

// ❌ Wrong: Reformatted everything
export const Button = ({ onClick, label }: ButtonProps) => {
  const handleClick = useCallback((e: MouseEvent) => {
    onClick?.(e);
  }, [onClick]);
  return <button onClick={handleClick}>{label}</button>;
};

// ✅ Correct: Only fixed the issue
export const Button = ({ onClick, label }: ButtonProps) => {
  return (
    <button onClick={onClick}>  {/* Only this changed */}
      {label}
    </button>
  );
}
```

## Follow Local Patterns

**Match existing patterns in the same directory** even if they differ from best practices.

**Pattern resolution:**
1. Count usage of each pattern in the directory
2. Choose pattern used in >50% of files
3. If no clear majority, choose simpler pattern

**Example:**

```typescript
// Directory has 4 files with arrow functions, 2 with function declarations

// ✅ Use arrow functions (4/6 = 66%)
const NewComponent = () => {
  // implementation
};
```

## No New Architecture

**DO NOT introduce:**
- New libraries (without permission)
- New architectural layers (services, repositories)
- New patterns (HOCs, custom hooks) if not already present
- New tooling (linters, formatters)

**Follow existing patterns even if you think alternatives are better.**

## Abstraction Rules

**Extract only when duplicated 2+ times** AND reduces lines by 20%+.

```typescript
// ❌ Wrong: Premature abstraction
function formatUserName(user: User) {
  return `${user.firstName} ${user.lastName}`;
}
const name = formatUserName(user); // Only used once

// ✅ Correct: Inline for single use
const name = `${user.firstName} ${user.lastName}`;
```

**Prefer deletion over refactoring:**
- Dead code → delete immediately
- Unused imports → delete
- Commented code → delete

## Behavior Preservation

**All changes must preserve 100% of existing behavior** unless explicitly changing it.

**Visual changes forbidden** unless task is UI modification.

**API stability:**
- Public APIs: Zero breaking changes
- Internal APIs: ≤5% acceptable risk if required

**Before moving logic:**
1. Check how many files use it
2. Verify execution order dependencies
3. Identify implicit dependencies

## Naming Rules

When conflicts exist:
1. Choose convention from same directory
2. If equal usage, choose shorter name
3. Default to:
   - Booleans: `is`, `has`, `can`, `should` prefix
   - Event handlers: `handle` prefix
   - Event props: `on` prefix
   - Constants: SCREAMING_SNAKE_CASE

**Target 3-20 characters for names.**

## Comments

**Add single-line comments only for non-obvious decisions.**

```typescript
// ✅ Good: Explains non-obvious behavior
// Safari requires explicit width to prevent overflow
const containerStyle = { width: '100%' };

// ❌ Bad: Restates code
// Set width to 100%
const containerStyle = { width: '100%' };
```

## Default Decisions

When context unclear:

| Area | Default |
|------|---------|
| Pattern choice | Match local files |
| Complexity | Simplest option |
| Abstraction | Inline first |
| Risk | Zero behavior change |
| Naming conflict | Shorter name |

## Absolute Prohibitions

**NEVER without explicit request:**
- Speculative optimizations
- Future-proofing
- Unsolicited cleanup
- Framework evangelism
- Architectural recommendations
- Performance micro-optimizations
- Adding dependencies "just in case"

## Priority Hierarchy

1. **Readability (50%)** - Obvious to humans
2. **Simplicity (30%)** - Fewer concepts
3. **Redundancy reduction (20%)** - DRY when justified

**Readability beats cleverness 100% of the time.**

## Error Handling

**Every user-facing operation must handle failures.**

```typescript
// ❌ Wrong: No error handling
async function saveUser(user: User) {
  await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(user)
  });
}

// ✅ Correct: Explicit error handling
async function saveUser(user: User): Promise<Result> {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(user)
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to save' };
    }
    
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Network error' };
  }
}
```

## Verification Checklist

Before completing any change:

- [ ] Only modified required files
- [ ] No unrelated formatting changes
- [ ] Existing behavior preserved
- [ ] No new dependencies
- [ ] No new architectural patterns
- [ ] Followed local directory conventions
- [ ] Comments only for non-obvious decisions
- [ ] Error cases handled
- [ ] No unused imports/variables
