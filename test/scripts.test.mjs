import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const skillDir = new URL('../skills/organize-workspace-sessions/', import.meta.url)

test('ships the RPC helper and keeps it on the host RPC path only', async () => {
  const rpc = await readFile(new URL('scripts/dsh_rpc.sh', skillDir), 'utf8')
  assert.match(rpc, /\$DSH_WEB_URL/)
  assert.match(rpc, /api\/\$method/)
  assert.match(rpc, /session\.rename/)
  // The only sanctioned write path is the host's local RPC — never its storage files.
  assert.match(rpc, /\.dsh\/storages/)
})

test('ships the one-pass content digest', async () => {
  const digest = await readFile(new URL('scripts/session_digest.py', skillDir), 'utf8')
  assert.match(digest, /session\.history/)
  assert.match(digest, /source\.kind/)
  assert.match(digest, /result\.ok/)
})

test('Skill keeps the rename-only, no-archive safety contract', async () => {
  const skill = await readFile(new URL('SKILL.md', skillDir), 'utf8')
  assert.match(skill, /绝不永久删除/)
  assert.match(skill, /绝不直接改写/)
  assert.match(skill, /不执行归档/)
  assert.match(skill, /类别｜主题/)
})
