import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { apply, parseSkill } from '../lib/index.js'

test('parses the packaged Skill and keeps the six-stage workflow', async () => {
  const markdown = await readFile(new URL('../skills/project-organizer/SKILL.md', import.meta.url), 'utf8')
  const skill = parseSkill(markdown)

  assert.equal(skill.name, 'project-organizer')
  assert.match(skill.description, /project workspace/i)
  for (const stage of ['Inspect', 'Understand', 'Distill', 'Structure', 'Archive', 'Handoff']) {
    assert.match(skill.content, new RegExp(`### \\d+\\. ${stage}`))
  }
  assert.match(skill.content, /one `PROJECT\.md`/)
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
