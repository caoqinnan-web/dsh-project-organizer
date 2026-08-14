/** Register the packaged Project Organizer skill with DeepSeek Harness. */
import type { Context } from '@deepseek-ai/cordis';
import type { SkillRegistration } from '@deepseek-ai/dsh-skill';
export declare const name = "project-organizer";
export declare const inject: string[];
type ParsedSkill = Pick<SkillRegistration, 'name' | 'description' | 'content'>;
/** Parse the deliberately small, dependency-free frontmatter used by this package. */
export declare function parseSkill(markdown: string): ParsedSkill;
export declare function apply(ctx: Context): void;
export {};
