# 项目对话标题整理器

根据完整对话内容，把模糊的 AI 自动标题整理为清晰的 `类别｜主题` 名称。

这个仓库把一个已经在 ChatGPT 中验证过的对话整理 Skill，包装成实验性的 DeepSeek Harness / DSH Skill 和可安装插件。

[English](README.md)

## 当前状态

| 使用环境 | 状态 | 依据 |
|---|---|---|
| ChatGPT | 作者已验证 | 在选定项目中直接调用已安装的 Skill，可以修改该项目下全部对话的名称。 |
| DeepSeek Harness / DSH | 实验性，尚未完成端到端验证 | 仓库已实现并测试 DSH 注册适配层，但作者还没有在真实 DSH 环境中验证对话发现、读取和改名。 |

DSH 只有在宿主环境提供“列出项目对话、读取对话内容、修改标题、回读验证”能力时，才能完成整个流程。如果缺少必要能力，Skill 会明确报告限制，不会声称已经完成。

## 项目缘起

这个 Skill 最先诞生于 ChatGPT，而不是 DSH。

一个项目下往往会积累大量对话，但对话名称通常由 AI 自动生成。名称可能很模糊、彼此重复，或者只反映最初的问题，无法体现整段对话后来真正完成了什么。对话一多，仅看列表很难判断每个对话的具体内容。

因此，作者在 ChatGPT 中创建并验证了这个 Skill：读取每段对话的完整内容，识别它的整体内容类别和具体主题，再按 `类别｜主题` 的格式修改名称。初心很直接——只看名字，就能清楚知道这段对话是做什么的。

这个仓库记录了下一段历程：把方法公开出来，并尝试验证同样的工作流能否在 DeepSeek Harness 中使用。

## Skill 做什么

```text
Scope → Inventory → Read → Classify → Rename → Verify
确定范围    建立清单      阅读    分类        改名      回读验证
```

- 只处理当前选定项目内的对话。
- 读取真实对话内容，不根据旧的 AI 自动标题猜测。
- 为每段对话确定稳定的内容类别和具体主题。
- 标题严格使用一个全角分隔符：`类别｜主题`。
- 已经准确且符合格式的标题保持不变。
- 修改后重新读取对话列表，逐项核验结果。

它只修改对话标题，不创建 `PROJECT.md`，不把项目总结成文件，不修改消息内容，也不移动、归档或删除对话。

## 在 ChatGPT 中使用

在 ChatGPT 项目中安装这个 Skill 后，可以直接调用，例如：

```text
整理这个项目下所有对话的名称。
请阅读每段完整对话，并按“类别｜主题”修改标题。
```

作者已经验证过这种直接调用方式。这里不声称 npm 是 ChatGPT Skill 的安装方式；npm 包用于 DSH 适配层。

## 在 DSH 中安装（实验性）

从 npm 安装：

```bash
dsh plugin --profile web add dsh-project-organizer
```

从 GitHub 安装：

```bash
dsh plugin --profile web add github:caoqinnan-web/dsh-project-organizer
```

长期使用建议固定到已审查的 commit：

```bash
dsh plugin --profile web add github:caoqinnan-web/dsh-project-organizer#<commit-sha>
```

安装后重启对应的 DSH 运行界面。适配层会把 `project-organizer` 注册到 `ctx.skills`。

不启动完整运行时也可以检查 bundle 是否进入配置：

```bash
dsh --profile web --dump-config
```

输出中应出现 `dsh-project-organizer` bundle 和 `project-organizer` 插件行。这只能验证插件配置，不能证明真实对话改名能力已经可用。

## 在 DSH 中使用（实验性）

可以要求 DSH：

```text
整理这个项目下所有对话的名称。
请阅读每段完整对话，并按“类别｜主题”修改标题。
```

如果 DSH 无法访问或修改项目对话，Skill 应停止执行，说明缺少的能力；在可以读取对话时，仍可给出拟修改的标题清单。

## 项目结构

- [`skills/project-organizer/SKILL.md`](skills/project-organizer/SKILL.md)：与宿主能力适配的对话命名工作流。
- [`src/index.ts`](src/index.ts)：读取 Skill 并注册到 DSH Skill registry。
- [`cordis.patch.yml`](cordis.patch.yml)：把运行时插件挂载进 DSH profile。
- `package.json`：声明 `dsh.bundle.patch`，使项目可通过 `dsh plugin add` 安装。

官方 DSH 包使用 `peerDependencies`，避免插件额外安装一套可能冲突的运行时服务。

## 本地开发与验证

需要 Node.js 22 或更高版本。

```bash
npm install
npm run check
npm pack --dry-run
```

单独验证 Skill：

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skills/project-organizer
```

## 发布检查清单

- 在 GitHub 创建公开仓库。
- 添加 topics：`dsh-plugin`、`deepseek-harness`、`agent-skills`、`ai-agents`、`chatgpt`、`conversation-management`。
- 确保发布包包含 `dsh.bundle.patch`、`cordis.patch.yml`、构建后的 `lib/` 和 Skill。
- 在 DSH 端到端验证完成前，将社区收录保持为草稿或实验状态。

## 安全与范围

安装第三方插件前应检查源码。这个 Skill 只申请当前项目内的对话列出、读取、改名和回读验证能力；不得修改消息内容，也不得移动、归档、删除或合并对话。

## 许可证

[MIT](LICENSE)
