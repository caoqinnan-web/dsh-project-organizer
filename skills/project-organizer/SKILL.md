---
name: project-organizer
description: Turn messy project conversations, files, decisions, tasks, and fragmented context into a clear, actionable project workspace. Use when starting from scattered notes or chats, resuming an old project, consolidating project knowledge, preparing a handoff, reconstructing current status, or reducing excessive project documentation without losing facts, decisions, open questions, risks, or next actions.
---

# Project Organizer

Reconstruct the project's operational state so a human or another agent can continue without rereading the full history. Treat this as Project Context Engineering, not file tidying or a generic summary.

## Operating principles

- Inspect before editing. Read the available conversations, files, repository structure, notes, plans, and task records.
- Separate facts, decisions, assumptions, proposals, and unresolved questions. Never promote an inference into a fact.
- Prefer current source material over memory. Surface conflicts instead of silently merging them.
- Create the minimum documentation needed to resume work. For a simple project, prefer one `PROJECT.md`.
- Preserve provenance with links or paths to important source material when available.
- Keep archival actions reversible. Never delete, overwrite, or move potentially important material without explicit approval.
- Optimize for continuation: the result must make the next decision and next action obvious.

## Workflow

### 1. Inspect

Establish the project boundary and inventory the available sources. Read representative and high-value content, including recent work, decisions, corrections, blockers, deliverables, and files referenced by other files.

Do not modify project files during this step. If the requested scope is ambiguous and choosing incorrectly could affect unrelated material, ask one focused question.

### 2. Understand

Identify:

- purpose and intended outcome;
- current stage and completion state;
- stakeholders, owners, and users;
- constraints, dependencies, and important resources;
- authoritative sources and conflicting accounts.

State important uncertainty explicitly.

### 3. Distill

Classify project information into:

- verified facts;
- decisions and their rationale;
- completed outcomes;
- active tasks and owners, when known;
- open questions and assumptions;
- risks, blockers, and dependencies;
- historical context that still explains the present state.

Remove repetition while preserving user corrections, rejected options, and evidence that materially affects future work.

### 4. Structure

Choose the smallest structure that remains usable.

For a simple project, create or update one `PROJECT.md` containing:

```markdown
# Project name

## Goal
## Current status
## Key context
## Decisions
## Open questions
## Next actions
## Resources
```

For a growing project, split only overloaded sections. Common optional files are `DECISIONS.md`, `TASKS.md`, `STATUS.md`, and `CONTEXT.md`. Do not create empty files or duplicate the same information across documents.

Preserve an existing useful structure unless changing it has a clear continuation benefit.

### 5. Archive

Mark stale, superseded, duplicate, or historical material and explain why it is no longer current. Prefer an archive section, archive directory, or recoverable platform archive.

Before any move or archive, verify that current documentation retains the material facts, decisions, and provenance. Ask for approval before irreversible deletion or when archival confidence is low.

### 6. Handoff

Ensure the final workspace answers:

1. What is this project and why does it exist?
2. What has actually happened?
3. What decisions are settled, and why?
4. What is the current state?
5. What remains uncertain, blocked, or risky?
6. What should happen next, by whom, and in what order?
7. Where are the authoritative resources?

Finish with a concise report of files created or updated, material that was archived or left untouched, unresolved issues, and the next recommended action.

## Quality check

Before finishing, verify that:

- every major claim is supported by source material or labeled as an inference;
- current status is distinct from plans and aspirations;
- next actions are concrete and ordered;
- no important correction or unresolved decision disappeared during compression;
- simple projects did not acquire unnecessary documentation;
- archived material remains recoverable unless the user explicitly authorized deletion.
