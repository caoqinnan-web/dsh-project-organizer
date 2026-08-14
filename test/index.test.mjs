import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { apply, parseSkill } from '../lib/index.js'

test('parses the packaged Skill and keeps the conversation-renaming workflow', async () => {
  const markdown = await readFile(new URL('../skills/project-organizer/SKILL.md', import.meta.url), 'utf8')
  const skill = parseSkill(markdown)

  assert.equal(skill.name, 'project-organizer')
  assert.match(skill.description, /conversation/i)
  assert.match(skill.description, /rename/i)
  for (const stage of ['Scope', 'Inventory', 'Read', 'Classify', 'Rename', 'Verify']) {
    assert.match(skill.content, new RegExp(`### \\d+\\. ${stage}`))
  }
  assert.match(skill.content, /Category｜Topic/)
  assert.match(skill.content, /Compatibility gate/)
  assert.match(skill.content, /DeepSeek Harness Agent could not complete/)
  assert.match(skill.content, /Do not create project summaries/)
  assert.match(skill.content, /Do not archive, delete, move, merge/)
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
      name: 'project-organizer',
      source: 'bundled',
      provider: 'dsh-project-organizer',
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
