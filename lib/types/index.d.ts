/** Register the packaged organize-workspace-sessions skill with DeepSeek Harness. */
import type { Context } from '@deepseek-ai/cordis';
import type { SkillRegistration } from '@deepseek-ai/dsh-skill';
export declare const name = "organize-workspace-sessions";
export declare const inject: string[];
type ParsedSkill = Pick<SkillRegistration, 'name' | 'description' | 'content'>;
/** Parse the deliberately small, dependency-free frontmatter used by this package. */
export declare function parseSkill(markdown: string): ParsedSkill;
export declare function apply(ctx: Context): void;
export {};
