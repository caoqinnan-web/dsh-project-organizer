---
name: organize-workspace-sessions
description: 当用户说“整理会话”“整理工作区会话”“整理对话”“清理会话”“归档无用会话”“规范会话名称”“给会话分类改名”“重命名工作区会话”，或希望管理 DeepSeek Harness 左侧工作区会话列表时，必须使用本技能。这里的“整理会话”指管理 DSH（DeepSeek Harness）工作区中的会话（session），不是 Codex 项目线程，也不是把聊天内容整理成摘要或会议纪要。技能通过宿主本地 RPC 接口（POST /api/…）完成：准确核对当前工作区可见会话、判断哪些建议归档/保留/待用户判断、把所有可见会话改名为“类别｜主题”、最后输出建议归档/改名/待判断报告。默认只处理当前工作区，绝不永久删除，绝不直接改写存储 JSON 文件。注意：当前 DSH 没有查看已归档会话的入口，因此本技能暂时不执行归档，只把“可安全归档”的会话作为建议列入报告。
---

# 整理工作区会话

## 核心目标

用户输入“整理会话”后直接执行完整流程：

1. 准确核对当前工作区可见会话；
2. 判断哪些建议归档、哪些必须保留、哪些需要用户判断；
3. 把所有可见会话改名为 `类别｜主题`；
4. 输出建议归档、改名和待判断报告。

归档本是“未来可能删除”的预备区；但**当前 DSH 没有查看已归档会话的入口**，归档后用户无法在界面找回会话，因此本技能**暂时不执行归档**，只把“可安全归档”的会话作为建议列入报告。等 DSH 开放归档查看入口后再恢复执行归档。

## 默认授权与交互

- “整理会话”即授权对当前工作区所有可见会话改名（**暂不执行归档**），不再逐批询问。
- 判断不充分的会话也先改成清晰名称，最后列入“需要判断”。
- 仅在工作区范围无法可靠确定或接口无法读取时暂停；不要因存在边界项而中断整个流程。
- 始终禁止永久删除、迁移、合并或改变工作区归属，除非用户另行明确授权。
- 开始后直接进入工作区核对，不要先走摘要、复盘、材料上传或输出结构确认流程。
- 过程更新保持简短：范围核对一次、执行进度一次、最后完整报告一次。

## 技术底座：DSH 会话怎么存、怎么改

这是本技能与 Codex 版本 `organize-project-conversations` 的根本区别。DSH 的会话/标题/归档由宿主进程管理，**唯一安全的写入入口是宿主的本地 RPC 接口**，不是直接改文件。

### 存储位置与事实源

- 会话事件日志：`$DSH_HOME/sessions/<编码后的cwd>/<sessionId>/session.jsonl.zstd`（zstd 压缩，只读参考，绝不直接改）。
- 工作区注册表：`$DSH_HOME/storages/workspace.json`——`global.archivedSessionIds` 是归档集合，`tables.workspaces.<id>.sessionIds/path/title` 是归属与顺序。
- 投影缓存：`$DSH_HOME/storages/session_projcache.json`——`tables.sessions.<id>.rows.title.val` 只是标题的**缓存快照，不是事实源**。

三者的权威关系：

| 状态 | 事实源 | 说明 |
|------|--------|------|
| 标题 | 会话日志里的 `session/title` 事件 | 用 `session.rename` 追加一条 `source.kind="user"` 的 `session/title`，把标题“钉死”，阻止自动重生成；缓存只是投影 |
| 归档 | `workspace.json` 的 `archivedSessionIds` | 用 `workspace.archiveSession` 幂等加入；归档只隐藏，日志与 `sessionIds` 席位都保留，未来可恢复（**当前技能暂不调用**） |
| 归属 | `workspace.json` 的 `tables.workspaces.<id>.sessionIds` | 当前工作区 = 路径与本会话 `cwd` 相同的工作区记录 |

### 官方 RPC 接口（唯一安全入口）

- 基地址：`$DSH_WEB_URL`（默认 `http://127.0.0.1:3080`）。每次调用前先确认该地址可达；不可达时只做只读盘点并询问，不执行任何写入。
- 统一信封（HTTP `POST /api/<method>`，`Content-Type: application/json`）：

请求：

```json
{"type":"client-request","rpcId":"<uuid>","method":"<method>","payload":{...}}
```

响应：

```json
{"type":"server-response","rpcId":"<same>","result":{"ok":true,"value":{...}}}
```

或业务失败：

```json
{"type":"server-response","rpcId":"<same>","result":{"ok":false,"error":{"code":"...","message":"...","details":{...}}}}
```

- 业务错误恒为 HTTP 200 + `ok:false`；只有 404 / 415 / 400 / 500 是传输层错误。判断成败只看 `result.ok`，不要只看 HTTP 状态码。
- 本技能用到的方法（字段名与响应形状均已实测）：

| 方法 | 请求 payload | 响应 value |
|------|--------------|-----------|
| `workspace.list` | `{}` | `{items:[{workspaceId,path,title,sessionIds,createdAt,updatedAt}], archivedSessionIds:[...]}` |
| `session.list` | `{}` | `{items:[{sessionId,updatedAt,running,blank,parentSessionId?,origin?,cwd?,agentPreset?,projections:{asOfSeq,values:{title,...}}}]}` |
| `session.history` | `{sessionId, beforeSeq?, maxMessages?}` | `{events:[{event:{type,seq,time,data,...},view?}], hasMore, projections?}` |
| `session.rename` | `{sessionId, title}` | `{title, seq}`（标题归一化后为空则报 `title-invalid`） |
| `workspace.archiveSession` | `{sessionId}` | `{archivedSessionIds:[...]}`（**当前暂不调用**，保留备用） |

- **归档当前禁用**：现有版本**没有** `workspace.unarchiveSession` RPC，也没有查看已归档会话的界面入口——归档后用户无法在 UI 找回会话。因此本技能**不调用 `workspace.archiveSession`**。等 DSH 提供归档查看入口后再恢复；届时归档的恢复方式是移除 `archivedSessionIds` 里的该 id（宿主管理的状态，技能内不自动执行、也不直接改文件）。

### 关键事件与内容提取

`session.history` 返回原始事件流，读真实内容时必须按事件类型过滤：

- `user/message`：`data.content[]` 是文本块（`{type:"text",text:"..."}`）。**只有 `data.source.kind === "user"` 的才是用户真实提问**；`data.source.kind === "plugin"`（运行时上下文快照、system-reminder、可用技能列表等）是注入内容，不是用户意图，忽略。
- `assistant/message`：`data.message.content[]` 是助手回复文本。
- `tool/call` + `tool/result`：显示实际做了哪些操作（写/读/改了什么文件），用于判断“成果是否已外置”。
- `session/title`：`data.title` + `data.source.kind`。`source.kind==="user"` 表示已被手动钉死；`"provider"` 表示模型自动生成；`"fallback"` 表示首条消息截断。
- `turn/start` / `turn/end` / `step/start` / `step/end`：用于判断是否完整收尾。

分页：`session.history` 不传 `maxMessages` 时默认最多 50 条消息页；`hasMore:true` 时用 `beforeSeq` 继续向前翻，直到读完或达到读取上限。标题、首句、预览、`cwd`、`updatedAt` 都不能替代读正文。

## 执行流程

### 1. 锁定当前工作区

- 用本会话的 `$DSH_SESSION_ID` 和当前目录确定“当前工作区”。
- 调 `workspace.list`，找出 `path` 与本会话工作目录（`$DSH_HOME` 之外的真实项目目录，通常是当前 `cwd`）相同的工作区记录；取它的 `workspaceId` 和 `sessionIds`。
- 没有匹配工作区、或多个工作区路径歧义时，只做只读盘点并询问，不执行改名。

### 2. 建立可见清单并与归档/运行状态对账

- 调 `session.list` 拿全量会话行（含 `projections.values.title` 作为当前标题）。
- 与 `workspace.list` 的 `sessionIds`（工作区记账）和 `archivedSessionIds`（已归档）对账，区分：

  - **当前工作区可见会话**：在 `sessionIds` 中且**不在** `archivedSessionIds` 中的会话。
  - **已归档会话**：在 `archivedSessionIds` 中的会话（默认不动；若用户要求处理，只能提醒当前无归档查看入口、无 unarchive RPC）。
  - **子代理/内部会话**：`session.list` 中 `origin==="subagent"` 或带 `parentSessionId` 的会话，是内部副线程，可读取和改名，但**不计入“工作区可见会话数”**。

- 记录起始快照：工作区可见会话数、已归档会话数、内部会话数。
- 如果清单与用户侧边栏看到的数量对不上，先重新核对 `archivedSessionIds` 与 `sessionIds`，不要带着错误数量继续。

### 3. 阅读真实内容

**高效读法（必用）**：不要逐条反复拉取并打印整条事件流——大会话有数万条事件，输出会被截断、且来回重跑是整理任务最耗时的环节。改用技能自带摘要脚本，把全部可见会话 id 一次性传入：

```bash
python3 "$SKILL/scripts/session_digest.py" <sid1> <sid2> <sid3> ...
```

脚本对每条会话只拉一次 `session.history`，只输出分级真正需要的信息：接口错误（`ok:false`）、用户真实提问、写文件动作（write/edit 的 file_path）、归档/改名动作、末尾 5 条事件、事件总数。拿到摘要即可直接分级，不要一条条 head/tail 来回翻。

对每条会话核对：

- 用户最初要解决的问题（只看 `source.kind==="user"` 的 `user/message`）；
- 用户后续的修正、补充和否定；
- 最终完成的结果与外部成果位置（产物文件、报告、提交等）；
- 尚未完成、被中断、被阻塞、等待反馈的状态（`running:true`、末尾 `turn/end` 缺失、明显未完）；
- 独有的事实、决策、约束、客户沟通与业务认知；
- 是否被其他会话引用（作为父对话、证据或基线）。

禁止只根据标题、首句、预览、时间、`cwd` 或来源字段判断。读取失败时最多重试一次；仍失败则归入 B 级，保留并列入“需要判断”。

**已知失败模式（corrupt session log）**：`session.history` 返回 `ok:false` 且 message 含 `corrupt session log` / `seq gap` 时，说明该会话日志损坏——正文永久不可读，且 `session.rename` 也会因 `resume failed` 必然失败（改名要追加 `session/title` 事件，必须先 resume 该会话）。此时：直接归 B 级保留、**不要重试改名**（重试也不会成功，只会浪费轮次）；在最终报告“失败项”里说明“日志损坏属宿主进程层面问题，本技能无法修复”。这类会话标题若仍是自动生成的旧标题，只能保留原样。

### 4. 按删除安全性分级

分级用于判断“哪些会话未来可以安全归档、哪些必须保留”，**当前不执行归档**，只影响报告里的“建议归档”清单与保留判断。

#### A 级：建议归档（暂不执行）

只有高置信满足删除安全条件时才归入 A 级：

- 空会话、失败触发、误建会话、未开始执行且没有后续价值的记录（`blank:true` 且读正文确认无有效工作）；
- 与另一条会话内容和成果完全重复的副本；
- 已被正式会话完整替代、没有独有判断和依赖关系的准备会话；
- 已完成的一次性查询、修订、排查、整理、迁移、安装或测试，且结果已经安全外置；
- 子代理/内部副线程（`origin==="subagent"`）。

除明显内部会话外，A 级必须同时满足：

1. 任务已完成，没有待办、阻塞或续办意图；
2. 结果已沉淀到会话之外，并核实路径/页面/状态真实存在；
3. 不含外部成果未覆盖的独有决策、事实、用户纠正、业务认知或复盘；
4. 没有其他会话依赖它作为父对话、证据或基线；
5. 以后永久删除也能从现有材料低成本重建。

核心判断式：

`可归档 = 已完成 + 无后续 + 成果已外置并验证 + 无独有信息 + 无引用依赖 + 可低成本重建`

A 级**不执行归档**：与其他会话一样改名，并在最终报告“建议归档”清单中列出（含理由），供用户日后在 DSH 开放归档入口后手动处理。

#### B 级：保留并等待用户判断

出现以下情况时保留、不列入建议归档：

- 看起来可能已完成，但无法确认外部成果是否完整；
- 含有少量可能独有的过程判断、修正或审计信息；
- 是否被其他会话引用无法确认；
- 内容读取不完整、重复关系不确定或删除风险难以判断。

B 级仍然需要改名。最终报告列出新名称、建议倾向、判断理由和风险，让用户可以直接按名称决定。

#### C 级：明确保留

出现以下任一情况就保留：

- 尚未完成、被中断、被阻塞、等待输入、仍有待办或可能续办（含 `running:true`）；
- 包含关键决策、用户纠正、业务事实、客户沟通、项目约束或可复用方法；
- 是正式交付物、合同、会议记录、培训复盘、调研资料或业务认知的主要证据；
- 重要内容尚未进入正式文件、知识库或其他已验证载体；
- 被其他会话引用，或是后续工作的父对话、审计记录或增量基线；
- 外部成果无法访问、路径失效、内容不完整或尚未回读验证；
- **当前正在执行整理工作的会话**（`$DSH_SESSION_ID` 自身，绝不列入建议归档）。

### 5. 归档：暂不执行（仅记录建议）

当前 DSH 没有查看已归档会话的入口，归档后用户无法在界面找回会话，因此**本步骤不调用 `workspace.archiveSession`**。

- 把 A 级会话记入“建议归档”清单，**不执行归档**。
- A、B、C 级会话统一进入第 6 步改名。
- 等 DSH 提供归档查看入口后，恢复 `workspace.archiveSession` 调用（接口说明见“技术底座”）。

### 6. 重命名所有可见会话

对工作区可见清单中的所有会话（A、B、C 级）统一命名。严格使用**一个全角竖线**：

`类别｜主题`

命名规则：

- `类别` 表达稳定工作类型，优先沿用工作区已有且清晰的分类词。
- 没有可沿用分类时，从实际内容选择简短类别，例如：`项目管理`、`需求分析`、`方案设计`、`资料研究`、`内容整理`、`问题排查`、`代码开发`、`运营复盘`。
- `主题` 概括最终产出、结论或实际处理对象，不复述最初提问。
- 名称应短而可检索；删除“帮我”“如何”“讨论一下”等口语。
- 时间是主题核心时保留日期或周期，否则省略。
- 不额外添加工作区名、成果或状态段，不得形成 `类别｜主题｜成果`。
- 已符合格式且内容与名称一致时保持不变。
- 多主题以最终交付或主任务为准；无法判断主次时使用能准确定位的保守名称，并列入 B 级。

改名用 `session.rename`（`payload={"sessionId":...,"title":"类别｜主题"}`）。当前整理会话（`$DSH_SESSION_ID` 自身）最后改名。不得修改会话正文、工作区归属、`cwd` 或其他元数据。

### 7. 回读验收

- 每条改名后回读 `session.list` 的 `projections.values.title`（或再 `session.history` 看最新 `session/title`）。
- 未变化时只重试一次；第二次仍失败则停止并报告。
- 确认每个新名称只有一个全角 `｜`，且与真实内容一致。
- 重新计算工作区可见会话数和内部会话数，与起始快照和成功操作逐项对账（本流程不改变 `archivedSessionIds`）。

## 安全边界

- **当前不执行归档**（DSH 无归档查看入口）；永久删除或归档必须另行取得针对具体清单的明确授权。
- A 级仅列入“建议归档”并改名；B 级保留并改名；C 级保留并改名。
- 归属、内容或删除安全性证据不足时，宁可保留并报告，不为了全覆盖而猜测。
- **绝不直接改写 `~/.dsh/storages/*.json` 或会话日志文件**：标题的权威在事件日志、归档的权威在宿主进程持有的注册表，直接改文件会造成缓存覆盖、丢失更新或状态错乱。
- 不把子代理/内部会话包装成用户可见工作区会话，也不把它们混入工作区数量。

## 常见错误与反例（务必避免）

| 错误做法 | 为什么错 | 正确做法 |
|----------|----------|----------|
| 直接改 `session_projcache.json` 里的 `title.val` | 那是缓存快照，下一次 checkpoint 会被覆盖，且没在日志里“钉死”，自动标题会重新生成 | 用 `session.rename` RPC 追加 `session/title` 事件 |
| 直接改 `workspace.json` 的 `archivedSessionIds` | 文件被运行中的宿主进程持有，直接改会丢失更新或损坏 | 当前不归档；确需归档时用 `workspace.archiveSession` RPC |
| 把 `session.list` 的近期列表当完整清单 | 它不含归档维度，可能混入内部会话 | 与 `workspace.list` 的 `sessionIds` + `archivedSessionIds` 对账 |
| 把插件注入的 `user/message` 当用户问题 | 运行时上下文快照、system-reminder 是 `source.kind==="plugin"`，会误判会话主题 | 只读 `source.kind==="user"` 的消息 |
| 只看标题/首句就分级 | 标题可能是自动生成的旧标题，与真实内容不符 | 每条 `session.history` 读正文后分级 |
| 把 `running:true` 或正在执行的会话列入建议归档 | 会误判为可清理、打断进行中的工作 | 当前会话与运行中会话一律 C 级保留 |
| 把“建议归档”当成“已归档/永久删除” | 当前技能只建议、不执行归档；且 DSH 归档只隐藏，本质可恢复 | 归档是可恢复动作，且当前不执行；永久删除另行授权 |
| 用半角 `|` 或 `丨` 或两个竖线 | 命名格式不统一，后续检索混乱 | 严格一个全角 `｜`：`类别｜主题` |
| 反复拉取/打印整条事件流、逐条 head/tail | 大会话数万事件，输出被截断，浪费多轮往返（实测一次整理被拖到数分钟） | 用 `scripts/session_digest.py` 一次拉全、只打印摘要 |
| 对 corrupt log 会话反复重试 `session.rename` | 改名需先 resume，日志损坏时必然 `resume failed`，重试无意义 | 归 B 级、报告“日志损坏”，不要重试改名 |
| 在当前版本调用 `workspace.archiveSession` | DSH 无归档查看入口，归档后用户无法找回 | 不归档，只把 A 级列入“建议归档”报告 |

## 最终报告

一次性报告完整结果：

1. 起始与最终的工作区可见会话数，以及单列的内部会话数、已归档会话数（如有，仅供对账）；
2. “建议归档”清单（A 级，**未执行归档**）：新名称 + 理由；
3. 成功改名的 `旧名称 → 新名称` 清单；
4. B 级“需要判断”清单：新名称、建议倾向、理由和风险；
5. 失败项及原因。

只有回读确认后的改名才能计入成功。

## 附：dsh_rpc.sh 用法

技能目录自带 `scripts/dsh_rpc.sh`（相对本技能目录解析），封装了统一信封与 JSON 校验：

```bash
SKILL=~/.agents/skills/organize-workspace-sessions

# 列出工作区与归档集合
bash "$SKILL/scripts/dsh_rpc.sh" workspace.list '{}' | python3 -m json.tool

# 列出全部会话（含标题）
bash "$SKILL/scripts/dsh_rpc.sh" session.list '{}' | python3 -m json.tool

# 读某会话正文（maxMessages 控制页大小）
bash "$SKILL/scripts/dsh_rpc.sh" session.history '{"sessionId":"session-xxx","maxMessages":2}'

# 改名
bash "$SKILL/scripts/dsh_rpc.sh" session.rename '{"sessionId":"session-xxx","title":"资料研究｜青少年AI教育蓝皮书"}'

# 归档（当前暂不使用：DSH 无归档查看入口、无 unarchive RPC）
# bash "$SKILL/scripts/dsh_rpc.sh" workspace.archiveSession '{"sessionId":"session-xxx"}'
```

### session_digest.py（读正文的高效摘要工具）

```bash
# 一次性为多条会话生成分级摘要（含接口错误、用户提问、写文件、末尾事件）
python3 "$SKILL/scripts/session_digest.py" session-xxx session-yyy session-zzz
```

输出里 `[!! 接口错误 ok:false]` 即日志损坏等异常，按上文“已知失败模式（corrupt session log）”处理。

脚本缺失或 `$DSH_WEB_URL` 不可达时的等价原生调用（信封必须完全一致）：

```bash
curl -s -m 30 -X POST "$DSH_WEB_URL/api/session.rename" \
  -H 'content-type: application/json' \
  -d '{"type":"client-request","rpcId":"rpc-demo-1","method":"session.rename","payload":{"sessionId":"session-xxx","title":"类别｜主题"}}'
```

rpcId 只用于请求-响应配对，可自造（`uuidgen` 或任意唯一字符串），但必须与响应一致用于核对。
