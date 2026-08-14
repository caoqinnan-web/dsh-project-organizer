# 项目对话标题整理器

根据完整对话内容，把模糊的 AI 自动标题整理为清晰的 `类别｜主题` 名称。

这是一个最先在 ChatGPT 中创建并完成验证的开源 Agent Skill。作者实际测试后确认，当前 DeepSeek Harness / DSH Agent **暂时无法完成项目对话整理**，因此目前不支持 DSH。

[English](README.md)

## 兼容状态

| 使用环境 | 状态 | 依据 |
|---|---|---|
| ChatGPT | 作者已验证 | 在选定项目中直接调用，可以修改该项目下的对话名称。 |
| DeepSeek Harness / DSH | 当前不支持 | 作者已在当前 DSH Agent 中实际测试，但无法完成项目对话标题整理。 |
| 其他 Agent 宿主 | 取决于宿主能力 | 必须提供项目级对话发现、完整内容读取、标题修改和结果回读能力。 |

这个仓库曾在完成真实 DSH 端到端测试前加入实验性 DSH 适配层，并提交到 DSH 社区列表。该社区提交现已撤回。适配层源码暂时保留用于研究和记录，但不能再被描述为可用的 DSH 支持。

## 项目缘起

这个 Skill 最先诞生于 ChatGPT。

一个项目下往往会积累大量对话，但名称通常由 AI 自动生成。名称可能很模糊、彼此重复，或者只反映最开始的问题，无法体现整段对话后来真正完成了什么。对话一多，仅看列表很难判断每段对话的具体内容。

因此，作者创建了这个 Skill：读取每段对话的完整内容，识别整体内容类别和具体主题，再按 `类别｜主题` 的格式修改名称。初心很直接——只看名字，就能清楚知道这段对话是做什么的。

## Skill 做什么

```text
Scope → Inventory → Read → Classify → Rename → Verify
确定范围    建立清单      阅读    分类        改名      回读验证
```

- 只处理当前选定项目内的对话。
- 读取可访问的完整对话，不根据旧标题猜测。
- 为每段对话确定稳定的内容类别和具体主题。
- 标题严格使用一个全角分隔符：`类别｜主题`。
- 已经准确且符合格式的标题保持不变。
- 修改后重新读取项目对话列表，逐项核验结果。

它只修改对话标题，不创建项目文档，不修改消息内容，也不移动、归档或删除对话。

## 在 ChatGPT 中使用

当这个 Skill 已经可以在 ChatGPT 项目中使用时，直接调用：

```text
整理这个项目下所有对话的名称。
请阅读每段完整对话，并按“类别｜主题”修改标题。
```

作者已经验证过这种使用方式。这里不声称 npm 是 ChatGPT Skill 的安装方式。

## 对 Agent 宿主的能力要求

宿主必须能够：

1. 确认当前选定项目；
2. 使用稳定 ID 列出项目下的全部对话；
3. 读取每段对话可访问的完整内容；
4. 按稳定 ID 修改对话标题；
5. 重新读取列表并验证结果。

缺少任何一项时，Skill 都必须停止并明确报告限制。只有确实读到了必要对话内容，才能提供拟修改的标题清单。

## 仓库结构

- [`skills/project-organizer/SKILL.md`](skills/project-organizer/SKILL.md)：与宿主无关的对话命名工作流。
- [`skills/project-organizer/agents/openai.yaml`](skills/project-organizer/agents/openai.yaml)：Skill 界面元数据。
- `src/`、`cordis.patch.yml` 和 `dsh.bundle`：已经暂停的实验性 DSH 适配层，不能证明 DSH 兼容性。

## 本地开发与验证

```bash
npm install
npm run check
python3 /path/to/skill-creator/scripts/quick_validate.py skills/project-organizer
```

这些检查只能验证 Skill 结构、解析、构建产物和适配层注册，不能验证 DSH 中的项目对话改名能力。

## 分发状态

- Skill 继续公开，用于 ChatGPT 和其他具备必要能力的 Agent 宿主。
- 不建议在 DSH 中安装。
- 已发布的 npm 版本会标记为废弃，等待真实 DSH 支持。
- DSH 社区收录已经撤回。
- 在 DSH 端到端验证通过前，不使用 `dsh-plugin` topic，也不重新提交社区收录。

## 安全与范围

Skill 只能处理选定项目内的对话标题。向任何宿主授予改名权限前，都应核对拟处理范围。

## 许可证

[MIT](LICENSE)
