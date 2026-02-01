---
name: plan-project
description: Creates structured, executable project plans through draft iterations. Use when planning complex features, multi-step implementations, or when the user requests a project plan or roadmap.
---

# Project Planning Workflow

Guides AI through creating actionable plans via iterative drafts.

## File Naming

```
{ticket-number}-draft-1.md   # Requirements
{ticket-number}-draft-2.md   # Technical analysis
{ticket-number}-draft-3.md   # Research (optional)
{ticket-number}.md           # Final plan
{ticket-number}-progress.md  # Execution log
```

## Draft 1: Requirements

Define WHAT without HOW.

```markdown
# Draft 1: Requirements Gathering

## Branch Name
`feature/TICKET-123-user-authentication`

## Ticket Requirements
- [ ] User can log in with email and password
- [ ] System validates credentials
- [ ] Invalid credentials show error
- [ ] Successful login redirects to dashboard

## General Requirements
- [ ] Agent can verify by testing login flow
- [ ] Agent can test error cases
- [ ] Changes preserve existing session behavior
```

**Include:**
- Branch name
- Ticket requirements (checklist)
- Testing requirements for agent

**DO NOT include:**
- Implementation details
- Specific code changes
- File names

## Draft 2: Technical Analysis

Identify WHICH files need modification without specifying exact changes.

```markdown
# Draft 2: Technical Analysis

## Files to Modify

### Authentication Flow
- `layers/base/composables/useAuth.ts` – Add login function
- `layers/base/components/LoginForm.vue` – Create login UI
- `layers/base/types/auth.ts` – Define auth types

### API Integration
- `layers/base/server/api/auth/login.post.ts` – Handle login
- `layers/base/server/middleware/auth.ts` – Validate sessions

### Testing
- `layers/base/composables/useAuth.spec.ts` – Unit tests
```

**Include:**
- File paths only
- Brief reason for each file
- Grouped by logical area

**DO NOT include:**
- Specific code changes
- Line numbers
- Implementation details

**Ensure optimization loop:**
- How agent tests implementation
- How agent verifies correctness
- Non-functional requirements (performance, security)

## Draft 3: Research (Optional)

Agent decides if needed based on:
- Unfamiliar domain/technology
- Multiple valid approaches
- Risk of breaking patterns
- Library selection needed

```markdown
# Draft 3: Research

## Research Topics

### Authentication Best Practices
- Reviewed Nuxt auth module docs
- Found existing composable pattern: `useAuth()`
- Pattern uses `login()`, `logout()`, `user` ref

### Session Management
- Existing: server-side sessions
- Stored in Redis via utils
- Middleware validates tokens on protected routes

## Recommended Approach
Extend existing `useAuth()` pattern rather than replace.
```

**Include:**
- What was researched
- What was found
- Key patterns discovered
- Recommended approach

**Skip if:**
- Implementation is straightforward
- Patterns are clear
- No architectural decisions needed

## Final Plan

Condense into actionable task list.

```markdown
# Final Plan: TICKET-123 User Authentication

## Goals
- Implement secure user login
- Maintain existing session management

## Requirements
[From Draft 1]

## Implementation Plan
1. Create authentication types (Req #1)
2. Implement login API endpoint (Req #1)
3. Create login UI component (Req #1, #2)
4. Add authentication composable (Req #1, #2)
5. Write tests (All requirements)

## Tasks

### Task 1: Create Authentication Types
**Status:** TODO

**Files to modify:**
- `layers/base/types/auth.ts`

**Changes:**
[Specific implementation details]

#### Testing:
**Agent:**
- Create test user
- Verify type exports

**Human:**
- Review type definitions
- Confirm matches requirements
```

**Task requirements:**
- Clear status: TODO, In Progress, Done, Blocked
- Ordered by dependency
- References Draft 2 file list
- Includes testing instructions
- Links back to requirements

## Progress Tracking

After each task, log in `{ticket-number}-progress.md`:

```markdown
# Progress Log: TICKET-123

## Task 1: Create Authentication Types
**Completed:** 2026-01-16 14:30
**Agent:** agent-session-abc123

Created `auth.ts` with `User`, `LoginCredentials`, `AuthState` types.
Files modified: `layers/base/types/auth.ts`

## Task 2: Implement Login API
**Completed:** 2026-01-16 15:15
**Agent:** agent-session-def456

Implemented `/api/auth/login` endpoint.
Files modified: `layers/base/server/api/auth/login.post.ts`
Issue: Session middleware needed update for new token format. Fixed.
```

**Each entry must include:**
- Task name and number
- Completion timestamp
- Agent session ID
- Brief summary (2-4 sentences)
- Files modified
- Issues and resolutions

**Purpose:**
- Enables agent continuity
- Provides debugging context
- Documents decisions
- Tracks actual vs planned

## Checklists

**Draft 1:**
- [ ] Branch name specified
- [ ] Ticket requirements in checklist format
- [ ] Agent testing instructions included
- [ ] Requirements clear and verifiable
- [ ] No implementation details

**Draft 2:**
- [ ] All relevant files identified
- [ ] Each file has brief reason
- [ ] Files grouped by logical area
- [ ] No specific code changes
- [ ] No line numbers

**Draft 3 (if created):**
- [ ] Research topics defined
- [ ] Findings documented with sources
- [ ] Recommended approach specified
- [ ] Research justifies decisions

**Final Plan:**
- [ ] Labeled sections (Goals, Requirements, Implementation, Tasks)
- [ ] Requirements include user stories and acceptance criteria
- [ ] Tasks have Status field
- [ ] Each task includes Files and Changes sections
- [ ] Each task includes Testing section
- [ ] Error handling explicit
- [ ] Output examples provided
- [ ] All tasks link to requirements
- [ ] Progress tracking file created

**Progress Log:**
- [ ] Task completion logged with timestamp
- [ ] Agent session ID recorded
- [ ] Brief summary provided
- [ ] Files modified listed
- [ ] Issues documented
- [ ] Next agent can understand what was done

## Example Usage

```
User: "Plan user authentication feature"

Agent:
1. Creates TICKET-123-draft-1.md with requirements
2. Creates TICKET-123-draft-2.md with file list
3. Decides if Draft 3 research needed
4. Creates TICKET-123.md with final plan
5. Creates TICKET-123-progress.md
6. During implementation, logs each task completion
```

## Verification

Before considering plan complete:

- [ ] All three drafts created (or 2 if research skipped)
- [ ] Final plan has all required sections
- [ ] Tasks are actionable and ordered
- [ ] Testing instructions included
- [ ] Progress tracking file ready
