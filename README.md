# Project Conversation Organizer

Rename vague AI-generated project conversation titles into clear, content-based `Category｜Topic` names.

This repository packages a ChatGPT-verified conversation-organizing skill as an experimental DeepSeek Harness / DSH Skill and installable plugin.

[中文说明](README.zh-CN.md)

## Status

| Environment | Status | Evidence |
|---|---|---|
| ChatGPT | Verified by the author | Directly invoking the installed skill renamed all conversations in the selected project. |
| DeepSeek Harness / DSH | Experimental; not yet verified end to end | The repository contains and tests the DSH registration adapter, but the author has not tested live conversation discovery, reading, and renaming in DSH. |

DSH can complete the workflow only if its host environment exposes capabilities to list project conversations, read their contents, rename them, and reread the results. The Skill detects missing capabilities and reports them instead of claiming success.

## Origin

This skill began in ChatGPT, not in DSH.

Projects often accumulate many conversations whose titles were generated automatically by AI. Those titles can be vague, repetitive, or disconnected from what the conversation ultimately became, making it difficult to understand a project's contents from the conversation list.

The author created and verified this skill in ChatGPT to solve that specific problem: read each conversation's full content, identify its overall category and concrete topic, then rename it in the form `Category｜Topic`. The goal is simple—a person should be able to understand what each conversation is for by looking at its title.

This repository is the next step in that history: sharing the method publicly and testing whether the same workflow can be used through DeepSeek Harness.

## What the Skill does

```text
Scope → Inventory → Read → Classify → Rename → Verify
```

- Limits all operations to the selected project.
- Reads conversation content instead of trusting the old AI-generated title.
- Assigns a stable content category and a concrete topic.
- Uses exactly one full-width separator: `Category｜Topic`.
- Preserves accurate titles that already follow the convention.
- Rereads the conversation list to verify every change.

It only changes conversation titles. It does not create `PROJECT.md`, summarize the project into files, edit messages, move conversations, archive conversations, or delete anything.

## Use in ChatGPT

With the skill installed in a ChatGPT project, invoke it directly, for example:

```text
Organize the names of all conversations in this project.
Use Category｜Topic titles based on each conversation's full content.
```

The author has verified this direct invocation workflow in ChatGPT. This repository does not claim that npm is a ChatGPT Skill installation mechanism; the npm package exists for the DSH adapter.

## Install in DSH (experimental)

From npm:

```bash
dsh plugin --profile web add dsh-project-organizer
```

From GitHub:

```bash
dsh plugin --profile web add github:caoqinnan-web/dsh-project-organizer
```

For reproducible installs, pin a reviewed commit:

```bash
dsh plugin --profile web add github:caoqinnan-web/dsh-project-organizer#<commit-sha>
```

Restart the selected DSH surface after installation. The adapter registers `project-organizer` with `ctx.skills`.

Verify the bundle layer without booting the full profile:

```bash
dsh --profile web --dump-config
```

The output should include the `dsh-project-organizer` bundle and a `project-organizer` plugin row. This verifies plugin configuration, not the live conversation-renaming capability.

## Use in DSH (experimental)

Ask DSH:

```text
Organize the names of all conversations in this project.
Use Category｜Topic titles based on each conversation's full content.
```

If DSH cannot access or rename project conversations, the Skill should stop, explain the missing capability, and provide a proposed title mapping when possible.

## Architecture

- [`skills/project-organizer/SKILL.md`](skills/project-organizer/SKILL.md) contains the host-aware naming workflow.
- [`src/index.ts`](src/index.ts) loads the Skill and registers it with the DSH Skill registry.
- [`cordis.patch.yml`](cordis.patch.yml) mounts the runtime plugin into a DSH profile.
- `package.json` declares `dsh.bundle.patch`, making the package installable with `dsh plugin add`.

Official DSH packages are peer dependencies so the plugin uses the host's runtime services instead of installing a competing copy.

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm run check
npm pack --dry-run
```

Validate the standalone Skill:

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skills/project-organizer
```

## Publishing checklist

- Publish the repository publicly on GitHub.
- Add topics: `dsh-plugin`, `deepseek-harness`, `agent-skills`, `ai-agents`, `chatgpt`, `conversation-management`.
- Keep `dsh.bundle.patch`, `cordis.patch.yml`, built `lib/`, and the Skill in the published package.
- Keep community listings in draft or experimental status until the DSH workflow is tested end to end.

## Security and scope

Review third-party plugins before installation. This Skill requests only conversation listing, reading, renaming, and verification within the selected project. It must not modify message contents or archive, delete, move, or merge conversations.

## License

[MIT](LICENSE)
