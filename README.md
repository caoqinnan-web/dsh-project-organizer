# Organize Workspace Sessions

Rename DeepSeek Harness (DSH) workspace sessions into clear, content-based `类别｜主题` (Category｜Topic) titles, and report safe-to-archive / rename / needs-judgment suggestions.

This Skill organizes the sessions in the current DSH workspace through the host's local RPC interface (`workspace.list` / `session.list` / `session.history` / `session.rename`). It renames every visible session to `类别｜主题`. Because DSH currently has no way to view archived sessions, it does **not** archive anything — it only lists safe-to-archive candidates in the report.

[中文说明](README.zh-CN.md)

## Usage

1. Open the DeepSeek Harness workspace you want to organize.
2. Start a new session in that workspace.
3. Say **“整理对话”** (or “整理会话” / “整理工作区会话” / “清理会话”, etc.).

The Skill then inventories the workspace's sessions, renames them as `类别｜主题`, and reports archive/rename/judgment suggestions.

## Compatibility

| Environment | Status | Notes |
|---|---|---|
| DeepSeek Harness / DSH | ✅ Supported | Renames workspace sessions via the host's local RPC interface. |
| ChatGPT | ✅ Supported | Verified by the author (the same Category｜Topic renaming workflow). |
| Claude | ❌ Not supported | Tested by the author; Claude does not expose the required capabilities. |
| Other Agent hosts | Capability-dependent | The host must expose session listing, full-content reading, title updates, and result rereading. |

## What the Skill does

```text
锁定工作区 → 建立清单 → 阅读正文 → 分级 → 改名 → 回读验证
```

- Locks to the current workspace and reconciles visible sessions against archived ones.
- Reads each session's real content (only `source.kind === "user"` messages count as the user's question).
- Classifies each session as A (safe-to-archive), B (needs judgment), or C (keep).
- Renames every visible session as `类别｜主题` (exactly one full-width separator).
- Because DSH has no archive-view entry, it does **not** archive; A-class sessions are reported as archive suggestions.
- Rereads the session list to verify every rename.

It changes session titles only. It does not archive, delete, move, merge, or edit session content.

## How it works

The Skill drives the DSH host through its local RPC interface (`POST /api/<method>` on `$DSH_WEB_URL`, default `http://127.0.0.1:3080`):

- `workspace.list` / `session.list` — inventory
- `session.history` — read real content
- `session.rename` — pin a `类别｜主题` title
- `workspace.archiveSession` — documented but intentionally not called for now

It ships two helper scripts:

- `skills/organize-workspace-sessions/scripts/dsh_rpc.sh` — the RPC envelope
- `skills/organize-workspace-sessions/scripts/session_digest.py` — one-pass content digest for fast grading

## Installation

As a DSH plugin:

```bash
dsh plugin --profile web add "github:caoqinnan-web/organize-workspace-sessions#main"
```

Or use the skill folder directly: drop `skills/organize-workspace-sessions` into your skills directory.

## Repository structure

- `skills/organize-workspace-sessions/SKILL.md` — the skill instructions.
- `skills/organize-workspace-sessions/scripts/` — helper scripts (`dsh_rpc.sh`, `session_digest.py`).
- `skills/organize-workspace-sessions/agents/openai.yaml` — interface metadata.
- `src/`, `cordis.patch.yml` — the DSH plugin wrapper that registers the skill.

## Development and validation

```bash
npm install
npm run check
```

## License

[MIT](LICENSE)
