#!/usr/bin/env python3
"""session_digest.py — 一次性提取多个会话的“分级必需”摘要。

背景：整理会话时，会话正文可能是数万条事件的大日志；反复拉取并打印整条
事件流会被输出截断、且来回重跑，是整理任务最耗时的部分。本脚本对每个会话
只拉一次 session.history（hasMore 时按 beforeSeq 翻页、按 seq 去重），只打印
分级真正需要的信息，不打印正文。

用法：
  python3 session_digest.py <sessionId> [<sessionId> ...]

每个会话输出：
  - 接口错误（result.ok=false，例如 corrupt session log）→ 立即标注并给处理建议
  - 用户真实提问（source.kind==="user" 的 user/message，截断）
  - 写文件动作（write/edit 的 file_path，去重）→ 判断“成果是否已外置”
  - 归档/改名动作（workspace.archiveSession / session.rename）
  - 末尾 5 条 user/assistant/title 事件 → 判断“是否完整收尾 / 被中断”
  - 事件总数 → 识别超大会话，只读摘要

依赖同目录的 dsh_rpc.sh（唯一安全入口，走宿主本地 RPC，绝不直改存储文件）。
"""

import json
import os
import subprocess
import sys

RPC_SH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dsh_rpc.sh")


def rpc(method, payload):
    if not os.path.exists(RPC_SH):
        return {"_fatal": f"找不到 {RPC_SH}"}
    out = subprocess.run(
        ["bash", RPC_SH, method, json.dumps(payload, ensure_ascii=False)],
        capture_output=True,
        text=True,
    )
    try:
        return json.loads(out.stdout)
    except Exception:
        return {"_raw": out.stdout, "_err": out.stderr}


def history_events(sid):
    """返回 (events, error)。error 非空表示接口 ok:false（如日志损坏）。"""
    events = []
    before_seq = None
    for _ in range(50):  # 防御性翻页上限
        payload = {"sessionId": sid, "maxMessages": 200}
        if before_seq is not None:
            payload["beforeSeq"] = before_seq
        r = rpc("session.history", payload)
        res = r.get("result", {})
        if res.get("ok") is False:
            return None, res.get("error", {})
        if "_fatal" in r or "_raw" in r:
            return None, r
        v = res.get("value", {})
        evs = v.get("events", []) or []
        known = {e.get("event", {}).get("seq") for e in events}
        for e in evs:
            if e.get("event", {}).get("seq") not in known:
                events.append(e)
        if not v.get("hasMore"):
            break
        seqs = [
            e.get("event", {}).get("seq")
            for e in evs
            if e.get("event", {}).get("seq") is not None
        ]
        if not seqs:
            break
        before_seq = min(seqs)
    return events, None


def text_of(blocks):
    if not blocks:
        return ""
    return "".join(
        c.get("text", "")
        for c in blocks
        if isinstance(c, dict) and c.get("type") == "text"
    )


def digest(sid):
    events, err = history_events(sid)
    print("=" * 70)
    print("SESSION:", sid)
    if err is not None:
        msg = str(err.get("message", err))[:400]
        print(f"  [!! 接口错误 ok:false] {msg}")
        print("  -> 处理：正文不可读，直接归 B 级；session.rename 会因 resume 失败，别重试改名。")
        return
    print("  事件总数:", len(events))

    print("  --- 用户真实提问 ---")
    for e in events:
        ev = e.get("event", {})
        if ev.get("type") == "user/message":
            d = ev.get("data", {})
            if d.get("source", {}).get("kind") == "user":
                print(f"    * {text_of(d.get('content', []))[:300]}")

    written = []
    for e in events:
        ev = e.get("event", {})
        if ev.get("type") != "tool/call":
            continue
        d = ev.get("data", {})
        name = d.get("name")
        if name in ("write", "edit"):
            fp = d.get("input", {}).get("file_path")
            if fp and fp not in written:
                written.append(fp)
        elif name in ("workspace.archiveSession", "session.rename"):
            print(f"    [动作] {name}: {json.dumps(d.get('input', {}), ensure_ascii=False)[:200]}")

    if written:
        print("  --- 写文件（成果可能已外置，需回读验证）---")
        for fp in written:
            print(f"    - {fp}")

    tail = []
    for e in events:
        ev = e.get("event", {})
        t = ev.get("type")
        if t == "assistant/message":
            d = ev.get("data", {})
            m = d.get("message", {}) or {}
            tail.append(f"[助手] {text_of(m.get('content', []))[:180]}")
        elif t == "user/message":
            d = ev.get("data", {})
            if d.get("source", {}).get("kind") == "user":
                tail.append(f"[用户] {text_of(d.get('content', []))[:180]}")
        elif t == "session/title":
            d = ev.get("data", {})
            tail.append(f"[标题] {d.get('title')} kind={d.get('source', {}).get('kind')}")
    print("  --- 末尾 5 条（判断是否收尾/被中断）---")
    for line in tail[-5:]:
        print("   ", line)


def main(argv):
    if not argv:
        print("用法: python3 session_digest.py <sessionId> [<sessionId> ...]", file=sys.stderr)
        sys.exit(2)
    for sid in argv:
        digest(sid)


if __name__ == "__main__":
    main(sys.argv[1:])
