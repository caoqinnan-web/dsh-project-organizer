/** Register the packaged organize-workspace-sessions skill with DeepSeek Harness. */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import type { SkillRegistration } from '@deepseek-ai/dsh-skill'

const SKILL_URL = new URL('../skills/organize-workspace-sessions/SKILL.md', import.meta.url)
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/

export const name = 'organize-workspace-sessions'
export const inject = ['skills']

type ParsedSkill = Pick<SkillRegistration, 'name' | 'description' | 'content'>

/** Parse the deliberately small, dependency-free frontmatter used by this package. */
export function parseSkill(markdown: string): ParsedSkill {
  const match = FRONTMATTER.exec(markdown)
  if (!match) throw new Error('organize-workspace-sessions: SKILL.md must contain YAML frontmatter')
  const frontmatter = match[1]
  const content = match[2]
  if (frontmatter === undefined || content === undefined) {
    throw new Error('organize-workspace-sessions: SKILL.md is incomplete')
  }

  const metadata = Object.fromEntries(
    frontmatter.split(/\r?\n/)
      .map(line => line.match(/^([a-z-]+):\s*(.+)$/))
      .filter((entry): entry is RegExpMatchArray => entry !== null)
      .map(entry => [entry[1]!, entry[2]!.trim()]),
  )

  if (metadata.name !== 'organize-workspace-sessions' || !metadata.description) {
    throw new Error('organize-workspace-sessions: SKILL.md requires the expected name and a description')
  }

  return {
    name: metadata.name,
    description: metadata.description,
    content: content.trim(),
  }
}

export function apply(ctx: Context): void {
  const skill = parseSkill(readFileSync(SKILL_URL, 'utf8'))
  ctx.skills.register({
    ...skill,
    source: 'bundled',
    provider: 'organize-workspace-sessions',
    resourceBase: {
      kind: 'directory',
      path: fileURLToPath(new URL('../skills/organize-workspace-sessions/', import.meta.url)),
    },
  })
}
