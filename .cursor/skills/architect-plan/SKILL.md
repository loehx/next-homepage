---
name: architect-plan
description: Creates comprehensive implementation plans as a software architect. Use when planning features, fixes, or complex implementations, especially with ticket numbers.
---

# Software Architect Planning

Creates detailed, phase-based implementation plans following best practices.

## Required Information

Ask user for:
- **Ticket Number:** e.g., OS-2531
- **Ticket Description:** Full requirements

## Planning Phases

### Phase 0.1: Branch Creation

Create descriptive branch name:

```
[TICKET-NUMBER]-short-description
```

**Example:**
```
OS-2531-fix-lint-staged-config
```

**Branch name rules:**
- Include ticket number
- 5 words max for description
- Use kebab-case
- English language
- Descriptive but concise

### Phase 0.2: Best Practice Research

**If possible, run exploration subagent:**

Add "Best Practice" section:
- Search online for best practices on the topic
- Document relevant patterns
- Note common pitfalls
- Reference authoritative sources

**Example:**
```markdown
## Best Practice

Lint-staged configuration glob patterns:
- Use proper glob syntax: "*.{ext1,ext2}"
- Common error: "*{.ext1,.ext2}" (invalid syntax)
- Best practice: Test with `npx lint-staged --debug`
- Reference: lint-staged documentation v13+
```

### Phase 0.3: Current State Analysis

**If possible, run exploration subagent:**

Add "Current State" section:
- Document how feature/area currently works
- Identify relevant files
- Note existing patterns
- Highlight what needs changing

**Example:**
```markdown
## Current State

Lint-staged configured in 4 package.json files:
- layers/base/package.json
- apps/netto/package.json
- apps/netto-sia/package.json
- apps/marktkauf/package.json

All have same typo: trailing quote in glob pattern.
```

### Phase 1-10: Implementation Phases

Create up to 10 phases describing what to do.

**Phase structure:**

```markdown
## Phase [N]: [Clear Phase Name]
**Status:** TODO

### Files to modify:
- path/to/file.ts (lines X-Y)
- path/to/another.ts (lines A-B)

Note: [Any special considerations]

### Changes:
- Specific change 1
- Specific change 2
- Specific change 3

### Verification:

**Agent:**
- Test step 1
- Test step 2
- Cleanup step

**Human:**
- Verification command/action
- What to check for
```

## Complete Example

```markdown
# Implementation Plan: OS-2531

## Ticket Description
Fix lint-staged glob pattern syntax errors causing linter to skip files.

## Branch Name
`OS-2531-fix-lint-staged-config`

## Best Practice

Lint-staged glob patterns:
- Use proper syntax: "**/*.{js,ts,vue}"
- Invalid: "**/*{.js,.ts,.vue}"
- Test with: `npx lint-staged --debug`

## Current State

Four package.json files have lint-staged config with typo:
- Trailing quote before opening brace
- Second pattern has same issue
- Files affected: base layer + all 3 apps

## Phase 1: Fix lint-staged Configuration
**Status:** TODO

### Files to modify:
- layers/base/package.json (lines 150-156)
- apps/netto/package.json (lines 140-146)
- apps/netto-sia/package.json (lines 140-146)
- apps/marktkauf/package.json (lines 140-146)

Note: layers/storefront-boilerplate-nuxt-public/package.json is read-only. Only verify config, do not modify.

### Changes:
- Remove trailing quote: "./**/*{.js,.mjs,.cjs,.ts,.vue}" → "./**/*.{js,mjs,cjs,ts,vue}"
- Fix second pattern: "./**/*{.md,.json,.css}" → "./**/*.{md,json,css}"

### Verification:

**Agent:**
- Create test file with linting issues
- Run lint-staged
- Verify file is linted
- Delete test file

**Human:**
- Run: `npm run lint-staged`
- Check console for errors
- Verify files are being processed

## Phase 2: Test Across All Apps
**Status:** TODO

### Files to test:
- Create temporary files in each app
- Verify lint-staged runs correctly

### Changes:
- No code changes, verification only

### Verification:

**Agent:**
- Create .js file with bad formatting in apps/netto/
- Create .vue file with bad formatting in apps/marktkauf/
- Run lint-staged
- Verify both are corrected
- Delete test files

**Human:**
- Commit changes
- Verify pre-commit hook runs
- Check that linting executes
```

## Phase Status Values

Each phase has one status:

- **TODO** - Not started
- **In Progress** - Currently implementing
- **Done** - Completed and verified
- **Blocked** - Cannot proceed (document blocker)
- **Skipped** - Not needed (document reason)

## Agent vs Human Verification

**Agent verification:**
- Automated tests the agent can run
- File creation/deletion for testing
- Running commands
- Checking outputs
- Cleanup actions

**Human verification:**
- Manual testing steps
- UI checks
- External system verification
- Final approval points
- Deployment verification

## Best Practices for Plans

**DO:**
- ✅ Be specific about files and line numbers
- ✅ Include verification steps for both agent and human
- ✅ Document special considerations
- ✅ Reference best practices
- ✅ Keep phases focused (single responsibility)
- ✅ Order phases by dependency
- ✅ Include cleanup steps

**DON'T:**
- ❌ Create vague phases like "fix the bug"
- ❌ Skip verification steps
- ❌ Forget to document current state
- ❌ Make phases too large (split if needed)
- ❌ Ignore read-only constraints
- ❌ Skip best practice research

## Running Subagents

When possible, launch subagents for:
- Best practice research (use explore or generalPurpose agent)
- Current state analysis (use explore agent)
- Complex codebase searches

**Example:**
```typescript
// Launch explore agent for current state
Task: "Analyze all package.json files for lint-staged configuration"
```

## Workflow

1. **Gather information** from user
2. **Create branch name**
3. **Research best practices** (if applicable)
4. **Analyze current state** (if applicable)
5. **Create phases** (1-10)
6. **Add verification steps** to each phase
7. **Present plan** to user
8. **Update status** as phases complete

## Verification Checklist

Before presenting plan:

- [ ] Branch name includes ticket number
- [ ] Branch description is concise (5 words max)
- [ ] Best practice section included (if applicable)
- [ ] Current state documented (if applicable)
- [ ] All phases have clear names
- [ ] Each phase has status field
- [ ] Files to modify listed with line numbers
- [ ] Changes are specific
- [ ] Agent verification steps included
- [ ] Human verification steps included
- [ ] Phases ordered by dependency
- [ ] Special considerations noted
