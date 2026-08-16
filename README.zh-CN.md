# 工作区会话整理

把 DeepSeek Harness（DSH）工作区会话整理成清晰、基于内容的 `类别｜主题` 名称，并输出“建议归档 / 改名 / 待判断”报告。

本技能通过宿主本地 RPC 接口（`workspace.list` / `session.list` / `session.history` / `session.rename`）整理当前工作区会话，把所有可见会话改名为 `类别｜主题`。由于当前 DSH 没有查看已归档会话的入口，本技能**不执行归档**，只把“可安全归档”的会话作为建议列入报告。

[English](README.md)

## 使用方法

1. 打开要整理的 DeepSeek Harness 工作区。
2. 在该工作区新建一个会话。
3. 说 **“整理对话”**（也可说“整理会话”“整理工作区会话”“清理会话”等）。

技能随后会盘点该工作区会话，把它们改名为 `类别｜主题`，并输出建议归档/改名/待判断报告。

## 兼容状态

| 使用环境 | 状态 | 说明 |
|---|---|---|
| DeepSeek Harness / DSH | ✅ 支持 | 通过宿主本地 RPC 接口整理工作区会话。 |
| ChatGPT | ✅ 支持 | 作者已验证（同一套“类别｜主题”改名流程）。 |
| Claude | ❌ 经测试不支持 | 作者实测 Claude 未暴露所需能力。 |
| 其他 Agent 宿主 | 取决于能力 | 必须提供会话列表、完整内容读取、标题修改与结果回读能力。 |

## Skill 做什么

```text
锁定工作区 → 建立清单 → 阅读正文 → 分级 → 改名 → 回读验证
```

- 锁定当前工作区，并对账可见会话与已归档会话。
- 读取每段会话真实内容（只有 `source.kind === "user"` 的消息才算用户提问）。
- 按删除安全性分级：A 级（可安全归档）、B 级（待判断）、C 级（保留）。
- 把所有可见会话改名为 `类别｜主题`（严格一个全角分隔符）。
- 由于 DSH 无归档查看入口，**不执行归档**，A 级仅列入“建议归档”清单。
- 修改后重新读取会话列表，逐项核验。

它只修改会话标题，不归档、不删除、不移动、不合并，也不修改会话正文。

## 工作原理

技能通过宿主本地 RPC 接口（`$DSH_WEB_URL` 的 `POST /api/<method>`，默认 `http://127.0.0.1:3080`）驱动 DSH：

- `workspace.list` / `session.list` —— 建立清单
- `session.history` —— 读取正文
- `session.rename` —— 钉死 `类别｜主题` 标题
- `workspace.archiveSession` —— 已文档化，但当前刻意不调用

随附两个辅助脚本：

- `skills/organize-workspace-sessions/scripts/dsh_rpc.sh` —— RPC 信封封装
- `skills/organize-workspace-sessions/scripts/session_digest.py` —— 一次拉取的内容摘要，用于快速分级

## 安装

作为 DSH 插件：

```bash
dsh plugin --profile web add "github:caoqinnan-web/organize-workspace-sessions#main"
```

或直接使用技能目录：把 `skills/organize-workspace-sessions` 放进你的 skills 目录。

## 仓库结构

- `skills/organize-workspace-sessions/SKILL.md` —— 技能说明。
- `skills/organize-workspace-sessions/scripts/` —— 辅助脚本（`dsh_rpc.sh`、`session_digest.py`）。
- `skills/organize-workspace-sessions/agents/openai.yaml` —— 界面元数据。
- `src/`、`cordis.patch.yml` —— 注册技能的 DSH 插件包装。

## 本地开发与验证

```bash
npm install
npm run check
```

## 许可证

[MIT](LICENSE)
