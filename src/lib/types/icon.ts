import type { Snippet } from 'svelte';
import type { SvelteHTMLElements } from 'svelte/elements';

export type IconProps = SvelteHTMLElements['svg'] & {
	pre?: Snippet;
};
