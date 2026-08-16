#!/usr/bin/env bash
# dsh_rpc.sh — 调用 DeepSeek Harness 宿主的本地 RPC 接口（唯一的会话改名/归档安全入口）。
#
# 用法：
#   dsh_rpc.sh <method> '<json-payload>'           # payload 作为第二个参数
#   echo '<json-payload>' | dsh_rpc.sh <method>    # payload 走 stdin
#
# 例：
#   dsh_rpc.sh workspace.list '{}'
#   dsh_rpc.sh session.list '{}'
#   dsh_rpc.sh session.history '{"sessionId":"session-xxx","maxMessages":2}'
#   dsh_rpc.sh session.rename '{"sessionId":"session-xxx","title":"资料研究｜青少年AI教育蓝皮书"}'
#   dsh_rpc.sh workspace.archiveSession '{"sessionId":"session-xxx"}'
#
# 只通过 $DSH_WEB_URL（默认 http://127.0.0.1:3080）的 POST /api/<method> 调用；
# 绝不动 ~/.dsh/storages/*.json 或会话日志文件。

set -euo pipefail

BASE="${DSH_WEB_URL:-http://127.0.0.1:3080}"

method="${1:?用法: dsh_rpc.sh <method> [payload-json]（或用 stdin 传入 payload）}"
if [ "$#" -ge 2 ]; then
  payload="${2}"
else
  payload="$(cat)"
fi

# 校验 payload 是合法 JSON，避免坏信封
if ! printf '%s' "$payload" | python3 -c 'import sys,json; json.load(sys.stdin)' >/dev/null 2>&1; then
  printf 'dsh_rpc.sh: payload 不是合法 JSON：%s\n' "$payload" >&2
  exit 2
fi

rpcid="$(uuidgen 2>/dev/null || printf 'rpc-%s-%s' "$(date +%s)" "$RANDOM")"

body="$(printf '{"type":"client-request","rpcId":"%s","method":"%s","payload":%s}' \
  "$rpcid" "$method" "$payload")"

curl -s -m 30 -X POST "$BASE/api/$method" \
  -H 'content-type: application/json' \
  -d "$body"
