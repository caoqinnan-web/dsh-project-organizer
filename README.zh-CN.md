# DeepSeek Harness 项目上下文整理器

把混乱的项目对话、文件、决策与任务，整理成清晰、可继续执行的项目工作空间。

**面向 AI Agent 的 Project Context Engineering（项目上下文工程）。**

[English](README.md)

## 为什么做这个项目

普通项目整理工具主要整理文件。本项目重建的是项目的“可运行状态”：哪些是已核实事实、做过什么决定、还有什么未确认、当前卡在哪里、接下来该做什么。整理后，新的协作者或 AI Agent 不必重读全部历史就能继续工作。

## 核心工作流

```text
Inspect → Understand → Distill → Structure → Archive → Handoff
检查      理解          提炼        组织         归档       交接
```

- 修改前先检查对话、文件、笔记、计划、任务和仓库上下文。
- 区分事实、决策、任务、假设、待确认问题和风险，不把推断写成事实。
- 遵循最小文档原则：简单项目优先只维护一个 `PROJECT.md`。
- 保留来源、用户纠正和被否决方案中仍影响后续工作的部分。
- 归档保持可恢复；未经明确授权不做不可逆删除。
- 交接结果直接呈现当前状态和下一步行动。

## 安装

### 从 npm 安装（发布后推荐）

```bash
dsh plugin --profile web add dsh-project-organizer
```

### 从 GitHub 安装

仓库会提交构建后的 `lib/`，从 GitHub 安装不需要执行安装期构建脚本：

```bash
dsh plugin --profile web add github:caoqinnan-web/dsh-project-organizer
```

生产或长期使用建议固定到已审查的 commit：

```bash
dsh plugin --profile web add github:caoqinnan-web/dsh-project-organizer#<commit-sha>
```

安装后重启对应的 DSH 运行界面。插件会把 `project-organizer` 注册到 `ctx.skills`，供模型发现或用户主动调用。

不启动完整运行时也可以检查 bundle 是否进入配置：

```bash
dsh --profile web --dump-config
```

输出中应出现 `dsh-project-organizer` bundle 和 `project-organizer` 插件行。

## 使用示例

可以要求 DSH：

- “整理这个项目，让另一个 Agent 可以直接接手。”
- “根据这些对话和文件，重建项目当前状态。”
- “生成包含决策、风险和下一步的项目交接。”
- “把这些文档压缩成最小但够用的项目上下文。”

简单项目默认采用：

```markdown
# 项目名称

## 目标
## 当前状态
## 关键上下文
## 已定决策
## 待确认问题
## 下一步行动
## 资源
```

只有一个文件已经明显难以维护时，才拆出 `DECISIONS.md`、`TASKS.md`、`STATUS.md` 或 `CONTEXT.md`。

## 项目结构

- [`skills/project-organizer/SKILL.md`](skills/project-organizer/SKILL.md)：Agent 工作协议。
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

还可以用 Agent Skills validator 单独检查 Skill：

```bash
python3 /path/to/skill-creator/scripts/quick_validate.py skills/project-organizer
```

## 发布检查清单

- 在 GitHub 创建公开仓库。
- 添加 topics：`dsh-plugin`、`deepseek-harness`、`agent-skills`、`ai-agents`、`context-engineering`、`project-management`。
- 确保发布包包含 `dsh.bundle.patch`、`cordis.patch.yml`、构建后的 `lib/` 和 Skill。
- 发布预构建 npm 包，提供最顺滑的安装体验。
- 仓库真实可用并保持维护后，向 [`awesome-dsh-plugin/awesome-dsh-plugin`](https://github.com/awesome-dsh-plugin/awesome-dsh-plugin) 对应分类分别增加一条中英文中性描述。

## 安全边界

Skill 属于可信指令，Plugin 属于第三方代码。安装前应检查源码；从 GitHub 安装时优先固定 commit；执行归档前核对范围，未经明确授权不做不可逆删除。

## 许可证

[MIT](LICENSE)
