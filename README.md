# Project Conversation Organizer

Rename vague AI-generated project conversation titles into clear, content-based `Category｜Topic` names.

This is an open-source Agent Skill created and verified in ChatGPT. DeepSeek Harness / DSH is currently **not supported** because the author’s end-to-end test could not complete project conversation renaming.

[中文说明](README.zh-CN.md)

## Compatibility

| Environment | Status | Evidence |
|---|---|---|
| ChatGPT | Verified by the author | Direct invocation renamed the conversations in the selected project. |
| DeepSeek Harness / DSH | Not currently supported | The author tested the current DSH Agent and it could not organize the project’s conversation titles. |
| Other Agent hosts | Capability-dependent | The host must expose project-level conversation listing, full-content reading, title updates, and result rereading. |

The repository previously included an experimental DSH adapter and was submitted to a DSH community list before a live end-to-end test. That submission has been withdrawn. The adapter source remains temporarily for research and history, but it must not be presented as working DSH support.

## Origin

This Skill began in ChatGPT.

Projects often accumulate many conversations whose titles were generated automatically by AI. Those titles can be vague, repetitive, or based only on the opening request, so the conversation list no longer reveals what each conversation actually contains.

The author created this Skill to read each conversation’s full content, identify its overall category and concrete topic, and rename it as `Category｜Topic`. The goal is simple: understand what a conversation is for by looking at its title.

## What the Skill does

```text
Scope → Inventory → Read → Classify → Rename → Verify
```

- Limits all operations to the selected project.
- Reads the complete accessible conversation instead of trusting the old title.
- Assigns a stable content category and a concrete topic.
- Uses exactly one full-width separator: `Category｜Topic`.
- Preserves titles that are already accurate and compliant.
- Rereads the project conversation list to verify every change.

It changes conversation titles only. It does not create project documents, edit message content, move conversations, archive conversations, or delete anything.

## Use in ChatGPT

With the Skill available in a ChatGPT project, invoke it directly:

```text
Organize the names of all conversations in this project.
Read each complete conversation and rename it using Category｜Topic.
```

The author has verified this workflow in ChatGPT. This repository does not claim that npm is a ChatGPT Skill installation mechanism.

## Required host capabilities

The workflow can run only when the Agent host can:

1. identify the selected project;
2. list all conversations in that project with stable IDs;
3. read their complete accessible content;
4. update a conversation title by stable ID;
5. reread the list and verify the result.

If any capability is missing, the Skill must stop and report the limitation. It may provide a proposed title mapping only when it can read the necessary conversations.

## Repository structure

- [`skills/project-organizer/SKILL.md`](skills/project-organizer/SKILL.md) contains the host-independent conversation naming workflow.
- [`skills/project-organizer/agents/openai.yaml`](skills/project-organizer/agents/openai.yaml) contains Skill interface metadata.
- `src/`, `cordis.patch.yml`, and `dsh.bundle` are the paused experimental DSH adapter. They do not establish working DSH compatibility.

## Development and validation

```bash
npm install
npm run check
python3 /path/to/skill-creator/scripts/quick_validate.py skills/project-organizer
```

These checks validate Skill structure, parsing, build output, and adapter registration only. They do not validate project conversation renaming in DSH.

## Distribution status

- The Skill remains public for ChatGPT use and host-independent development.
- DSH installation is not recommended.
- Published npm versions are deprecated pending real DSH support.
- The DSH community listing has been withdrawn.
- The project should not use the `dsh-plugin` topic or be resubmitted until an end-to-end DSH test passes.

## Security and scope

The Skill must operate only inside the selected project and only on conversation titles. Review the proposed scope before granting a host permission to rename conversations.

## License

[MIT](LICENSE)
