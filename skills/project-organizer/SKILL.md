---
name: project-organizer
description: Rename project conversations from vague or misleading AI-generated titles into clear, content-based `Category｜Topic` names. Use when a user asks to organize, standardize, clean up, or batch rename the conversations inside a project and the Agent host exposes project-level conversation listing, full-content reading, title updates, and result rereading.
---

# Project Conversation Organizer

Rename conversations in the selected project so the conversation list becomes an accurate, scannable index of the work. Base every title on the conversation's full content, not only its current title.

## Compatibility gate

- Proceed only when the host can identify the selected project, list all of its conversations with stable identifiers, read their complete accessible contents, update titles by identifier, and reread the results.
- Stop before classification or mutation when any required capability is unavailable. State exactly which capability is missing.
- Do not simulate completion by renaming only the current conversation, editing a local file, or returning invented mappings.
- Known status: the author verified this workflow in ChatGPT. The author's latest end-to-end test in the current DeepSeek Harness Agent could not complete project conversation organization, so treat DSH as unsupported until a later verified test establishes otherwise.

## Boundaries

- Work only inside the selected project.
- Rename conversation titles only. Do not archive, delete, move, merge, or edit conversation content.
- Do not create project summaries, handoff documents, task files, or `PROJECT.md`.
- Treat the user's request to organize the selected project's conversation names as authorization to rename those titles, unless the user explicitly requests a preview, proposal, or dry run.
- Before changing anything, apply the compatibility gate.
- If the host can read but cannot rename, produce a proposed old-to-new title mapping only when the user asks for a preview or alternative output. Do not present the mapping as completed work.

## Naming format

Use exactly this format:

```text
Category｜Topic
```

- Use one full-width separator: `｜`.
- Make `Category` a stable content class that helps related conversations sort together, such as `Project Management`, `Research`, `Writing`, `Development`, or `Troubleshooting`. Use the user's language.
- Make `Topic` name the concrete subject or outcome of that conversation.
- Keep the title concise but specific enough to distinguish it from other conversations in the same project.
- Prefer the conversation's dominant purpose. Do not build a title by joining every minor subject.
- Preserve an existing title when it already follows the format and accurately describes the content.
- Never infer confidential facts or outcomes that are not present in the conversation.

Examples:

```text
Help me look at this issue → Troubleshooting｜Login failure cause
Weekly meeting notes → Project Management｜August progress and actions
整理一下这份材料 → 文档整理｜客户访谈纪要定稿
```

## Workflow

### 1. Scope

Confirm the selected project and exclude conversations outside it. If the project boundary cannot be determined safely, ask one focused question before renaming.

### 2. Inventory

List every conversation in scope, following all available pagination, with its stable identifier, current title, project identifier, and update metadata when available. Keep the identifier-to-title mapping throughout the operation so duplicate or similar titles do not cause the wrong conversation to be renamed.

### 3. Read

Read the complete accessible message history for each conversation, following all available pagination. Include relevant accessible attachments, branches, and tool results when they materially change the conversation's purpose. Give extra weight to user corrections and later messages because they may supersede the opening request.

Do not classify from the current AI-generated title alone.

### 4. Classify

Create one proposed `Category｜Topic` title for each conversation. Check the set as a whole:

- reuse category wording consistently;
- distinguish conversations with similar topics;
- avoid generic topics such as `Discussion`, `Help`, `Analysis`, or `New chat`;
- keep titles in the user's primary language unless the project uses another convention.

### 5. Rename

If the user requested a preview, return the mapping without writing. Otherwise, rename every in-scope conversation whose proposed title is materially clearer or more accurate. Leave accurate, compliant titles unchanged. Use the stable conversation identifier for each write, and avoid writing when available update metadata shows that the conversation changed after inventory.

If one rename fails, record the failure and continue only when doing so cannot affect the wrong conversation.

### 6. Verify

Reread the project's conversation list after the writes. Confirm that:

- every intended conversation is present;
- every changed title matches the planned title;
- every changed title contains exactly one `｜`;
- the before-and-after inventory shows no out-of-scope title change;
- available metadata shows no unexpected archive, deletion, move, or content change caused by the operation.

Retry a safe failed rename once only when the stable identifier still resolves to the same project and conversation snapshot. Otherwise report it as incomplete. State when the host lacks the metadata or audit surface needed to verify a boundary fully.

## Final report

Return a concise result containing:

- total conversations inspected;
- number renamed and number left unchanged;
- verified `old title → new title` mappings;
- failures or host capability limitations;
- explicit confirmation that no conversation content or project structure was changed.
