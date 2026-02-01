---
name: feature-workflow
description: Guides feature development using structured documentation workflow with draft, tech, research, progress, and tasks files. Use when creating new features, implementing feature requests, or when the user asks to start a feature.
---

# Feature Development Workflow

Guides AI through structured feature development with proper documentation in `.cursor/features/`.

## File Structure

Each feature uses 4-5 files:

**1. `[feature].draft.md`** - Requirements only (NO technical details)
**2. `[feature].tech.md`** - Technical analysis
**3. `[feature].research.md`** - Optional research (50 lines max)
**4. `[feature].progress.md`** - Development log
**5. `[feature].tasks.md`** - Task checklist

## Workflow Steps

### Step 1: Create Draft (STOP after)

```markdown
# [Feature Name]

## Purpose
[Why this feature exists]

## Requirements
- Requirement 1
- Requirement 2

## Technical Approach
[High-level implementation plan]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
```

**STOP and wait for user input after creating draft.**

### Step 2: Create Tech Analysis (STOP after)

```markdown
# [Feature] - Technical Analysis

## Available Components/Composables
- Component name - location - purpose

## Reusable Code
- File path - what can be reused - why

## Third-Party Libraries
- Library name - purpose - why needed

## Technical Constraints
- Constraint description

## Proposed Folder Structure
path/to/feature/
├── Component1.tsx
├── Component2.tsx
└── styles.module.css
```

**STOP and wait for user input after creating tech file.**

### Step 3: Optional Research

Create only for complex features:

```markdown
# [Feature] - Research & Best Practices

## Best Practices
- Performance optimization techniques
- Implementation patterns

## Recommended Packages
- Package name - purpose - size/benefits

## Accessibility Considerations
- Motion preferences
- Screen reader support

## Performance Targets
- Metrics to track
```

**Keep under 50 lines.**

### Step 4: Development

Update both files continuously:

**Progress log:**
```markdown
## [Date] - Initial Implementation
- Created `src/components/Feature.tsx` - main component
- Modified `src/layout/index.tsx` - integrated feature
- Reason: [explain why]

## [Date] - Bug Fix
- Fixed: [describe bug]
- Changed: `src/components/Feature.tsx` line 42
- Root cause: [explain]
```

**Tasks:**
```markdown
- [ ] Task 1
- [ ] Task 2
- [x] Completed task
```

## Critical Rules

**MUST update progress log when:**
- Creating new files
- Modifying existing files
- Fixing bugs
- Making design decisions

**Include "why" not just "what"** in progress entries.

**Task only complete after browser testing** (using Playwright MCP).

**NEVER delete completed tasks** - mark with `[x]`.

## Naming Convention

- Simple names: `scene2` not `scene2-redesign`
- Avoid unnecessary suffixes
- Use tree-style pipes (├── └──) for folder structures

## Testing Requirement

After EVERY task:
1. Test in browser using Playwright
2. Verify visual changes
3. Check console for errors
4. Only then mark task complete

## Example Workflow

```
User: "Create a dark mode feature"

Agent:
1. Creates .cursor/features/dark-mode.draft.md with requirements
2. STOPS - waits for approval
3. Creates .cursor/features/dark-mode.tech.md with technical plan
4. STOPS - waits for approval
5. Updates .cursor/features/dark-mode.progress.md during development
6. Updates .cursor/features/dark-mode.tasks.md after each change
7. Tests in browser before marking complete
```

## File Locations

All feature files go in: `.cursor/features/[feature-name].[type].md`

## Verification Checklist

Before considering feature work complete:

- [ ] Progress log updated with all file changes
- [ ] "Why" explanations included in progress log
- [ ] Tasks marked complete only after browser testing
- [ ] All files follow naming convention
- [ ] Tech file includes folder structure
