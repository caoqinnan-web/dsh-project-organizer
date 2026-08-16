import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { apply, parseSkill } from '../lib/index.js'

test('parses the packaged Skill and keeps the workspace-session workflow', async () => {
  const markdown = await readFile(new URL('../skills/organize-workspace-sessions/SKILL.md', import.meta.url), 'utf8')
  const skill = parseSkill(markdown)

  assert.equal(skill.name, 'organize-workspace-sessions')
  assert.match(skill.description, /整理会话|organize/i)
  assert.match(skill.description, /改名|rename/i)
  for (const stage of ['锁定当前工作区', '建立可见清单', '阅读真实内容', '按删除安全性分级', '归档：暂不执行', '重命名所有可见会话', '回读验收']) {
    assert.match(skill.content, new RegExp(`### \\d+\\. ${stage}`))
  }
  assert.match(skill.content, /类别｜主题/)
  assert.match(skill.content, /session\.rename/)
  assert.match(skill.content, /workspace\.list/)
  assert.match(skill.content, /不执行归档/)
})

test('registers the Skill with the DSH runtime service', () => {
  const registrations = []
  apply({ skills: { register: skill => registrations.push(skill) } })

  assert.equal(registrations.length, 1)
  assert.deepEqual(
    {
      name: registrations[0].name,
      source: registrations[0].source,
      provider: registrations[0].provider,
      resourceKind: registrations[0].resourceBase.kind,
    },
    {
      name: 'organize-workspace-sessions',
      source: 'bundled',
      provider: 'organize-workspace-sessions',
      resourceKind: 'directory',
    },
  )
})

test('rejects malformed Skill metadata', () => {
  assert.throws(() => parseSkill('# no frontmatter'), /must contain YAML frontmatter/)
  assert.throws(
    () => parseSkill('---\nname: another-skill\ndescription: wrong\n---\nbody'),
    /requires the expected name/,
  )
})
