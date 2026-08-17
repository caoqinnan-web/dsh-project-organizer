# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/v2.0.0.html).

## [Unreleased]

### Changed

- Renamed the package to `organize-workspace-sessions` and shipped it as a DeepSeek Harness skill, driving the host through its local RPC interface (`workspace.list` / `session.list` / `session.history` / `session.rename`).
- Withdrew the unsupported DSH distribution and clarified unsupported-host reporting.
- Documented the trigger usage (start a session, then say “整理对话”) and the ChatGPT / Claude support status.

## [0.2.0] - 2026-08-15

### Changed

- Refocused the skill on project conversation titles.

## [0.1.0] - 2026-08-14

### Added

- Initial publish of the project organizer skill for DSH.
