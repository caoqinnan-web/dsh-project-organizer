# Project Organizer for DeepSeek Harness

Turn messy project conversations, files, decisions, and tasks into a clear, actionable project workspace.

**Project Context Engineering for AI agents.**

[中文说明](README.zh-CN.md)

## Why this exists

Most project organizers sort files. Project Organizer reconstructs the project's operational state: what is true, what was decided, what remains unresolved, and what should happen next. The result is compact enough for another human or AI agent to continue the work without rereading the full history.

## What the skill does

```text
Inspect → Understand → Distill → Structure → Archive → Handoff
```

- Inspects conversations, files, notes, plans, tasks, and repository context before editing.
- Separates verified facts, decisions, tasks, assumptions, open questions, and risks.
- Uses the minimum-documentation principle: a simple project should usually have one `PROJECT.md`.
- Preserves provenance and user corrections instead of flattening everything into a summary.
- Keeps archive operations reversible and requires explicit approval for destructive deletion.
- Produces a handoff that makes current state and next actions immediately visible.

## Install

### From npm (recommended after publication)

```bash
dsh plugin --profile web add dsh-project-organizer
```

### From GitHub

This repository commits its built `lib/` output, so GitHub installation does not require an install-time build script:

```bash
dsh plugin --profile web add github:caoqinnan-web/dsh-project-organizer
```

For reproducible installs, pin a reviewed commit:

```bash
dsh plugin --profile web add github:caoqinnan-web/dsh-project-organizer#<commit-sha>
```

Restart the selected DSH surface after installation. The runtime registers `project-organizer` with `ctx.skills`, where it can be discovered by the model or invoked by the user.

Verify the bundle layer without booting the profile:

```bash
dsh --profile web --dump-config
```

The output should include the `dsh-project-organizer` bundle and a `project-organizer` plugin row.

## Use

Ask DSH to:

- “Organize this project so another agent can continue it.”
- “Reconstruct the current state from these conversations and files.”
- “Prepare a clean project handoff with decisions, risks, and next actions.”
- “Reduce this documentation to the minimum useful project context.”

The skill prefers this shape for a simple project:

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

It splits information into `DECISIONS.md`, `TASKS.md`, `STATUS.md`, or `CONTEXT.md` only when one file has become genuinely hard to use.

## Architecture

- [`skills/project-organizer/SKILL.md`](skills/project-organizer/SKILL.md) contains the agent workflow.
- [`src/index.ts`](src/index.ts) loads that file and registers it with the DSH Skill registry.
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

Validate the standalone Skill with the Agent Skills validator:

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skills/project-organizer
```

## Publishing checklist

- Publish the repository publicly on GitHub.
- Add topics: `dsh-plugin`, `deepseek-harness`, `agent-skills`, `ai-agents`, `context-engineering`, `project-management`.
- Keep `dsh.bundle.patch`, `cordis.patch.yml`, built `lib/`, and the Skill in the published package.
- Publish the prebuilt package to npm for the smoothest install experience.
- After the repository is working and maintained, add one neutral English line and one neutral Chinese line to the matching category in [`awesome-dsh-plugin/awesome-dsh-plugin`](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin).

## Security

Skills are trusted instructions and plugins are third-party code. Review the source before installing, prefer a pinned commit for GitHub installs, and do not authorize destructive archival actions without checking the proposed scope.

## License

[MIT](LICENSE)
