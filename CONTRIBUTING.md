# Contributing

Thanks for helping improve `organize-workspace-sessions`.

## Prerequisites

- Node.js ≥ 22
- Python 3 (used by the bundled `session_digest.py` helper)

## Setup

```bash
npm ci
```

## Development loop

`npm run check` runs the full validation in order:

```bash
npm run check   # = typecheck (tsc --noEmit) + build (tsc) + test (node --test)
```

Run the individual steps while iterating:

```bash
npm run typecheck
npm run build
npm test
```

## Where things live

- `skills/organize-workspace-sessions/SKILL.md` — the skill instructions (the real product).
- `skills/organize-workspace-sessions/scripts/` — the bundled helpers (`dsh_rpc.sh`, `session_digest.py`).
- `src/index.ts` — the Cordis plugin wrapper that parses and registers the skill.
- `test/` — Node's built-in test runner (`node --test`).

## Conventions

- The skill must never archive, delete, or merge sessions, and must never write to `~/.dsh/storages/*.json` or session log files directly — all changes go through the host's local RPC interface.
- Keep the trigger words and the `类别｜主题` renaming format intact; they are covered by tests.
- Update `CHANGELOG.md` under `[Unreleased]` for user-visible changes.
