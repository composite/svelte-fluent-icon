import { icons } from '@iconify-json/fluent';
import { getIconData, iconToSVG, iconToHTML, replaceIDs } from '@iconify/utils';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT_DIR = path.resolve(process.cwd(), 'src', 'lib', 'icon');

function parseIconName(iconName: string) {
	// e.g., 'file-add-20-filled' => base: 'file-add', size: '20', style: 'filled'
	const parts = iconName.split('-');
	if (parts.length < 3) return null;
	const style = parts.pop() as string;
	const size = parts.pop() as string;
	const base = parts.join('-');
	return { base, size, style };
}

function toPascalCase(name: string) {
	return name
		.split(/[-_\s]+/)
		.filter(Boolean)
		.map((p) => p.charAt(0).toUpperCase() + p.slice(1))
		.join('');
}

async function ensureDir(dir: string) {
	await mkdir(dir, { recursive: true });
}

// function getRandomSample<T>(array: T[], size: number) {
// 	const n = array.length;
// 	size = Math.min(size, n);
//
// 	const result = [...array];
//
// 	// Fisher-Yates에서 필요한 부분만 셔플
// 	for (let i = n - 1; i >= n - size; i--) {
// 		const j = Math.floor(Math.random() * (i + 1));
// 		[result[i], result[j]] = [result[j], result[i]];
// 	}
//
// 	return result.slice(n - size);
// }

async function main() {
	console.log('Exporting', Object.keys(icons.icons).length, 'icons...');

	// Track generated components for building index files
	const bySizeStyle = new Map<string, Map<string, string[]>>(); // size -> style -> [Component]

	for (const iconName of Object.keys(icons.icons)) {
		const parsed = parseIconName(iconName);
		if (!parsed) {
			console.warn(`Icon name "${iconName}" does not match expected pattern. skipped.`);
			continue;
		}
		const { base, size, style } = parsed;

		const iconData = getIconData(icons, iconName);
		if (!iconData) {
			console.warn(`Icon "${iconName}" is missing. skipped.`);
			continue;
		}
		const renderData = iconToSVG(iconData, { height: 'auto' });
		const svg = iconToHTML(
			'{@render pre?.()}' + replaceIDs(renderData.body) + '{@render children?.()}',
			renderData.attributes
		);

		const componentName = toPascalCase(base);
		const dir = path.join(ROOT_DIR, size, style);
		await ensureDir(dir);
		const filePath = path.join(dir, `${componentName}.svelte`);

		const content = `<script lang="ts">
import type { IconProps } from '$lib/types/icon.js';

let { pre, children, ...rest }: IconProps = $props();
</script>

${svg}
`;
		await writeFile(filePath, content, 'utf8');

		if (!bySizeStyle.has(size)) bySizeStyle.set(size, new Map());
		if (!bySizeStyle.get(size)!.has(style)) bySizeStyle.get(size)!.set(style, []);
		bySizeStyle.get(size)!.get(style)!.push(componentName);
	}

	// Create index files
	for (const [size, stylesMap] of bySizeStyle) {
		// style-level index.ts
		for (const [style, components] of stylesMap) {
			const styleDir = path.join(ROOT_DIR, size, style);
			const indexPath = path.join(styleDir, 'index.ts');
			components.sort();
			const exports =
				components
					.map(
						(name) =>
							`export { default as ${name}${toPascalCase(`${size}-${style}`)} } from './${name}.svelte';\nexport { default as ${name}${toPascalCase(`${size}-${style}`)}Icon } from './${name}.svelte';`
					)
					.join('\n') + '\n';
			await writeFile(indexPath, exports, 'utf8');
		}

		// size-level index.ts re-exporting from each style
		const sizeDir = path.join(ROOT_DIR, size);
		const sizeIndexPath = path.join(sizeDir, 'index.ts');
		const styleExports =
			Array.from(stylesMap.keys())
				.sort()
				.map((s) => `export * from './${s}/index.js';`)
				.join('\n') + '\n';
		await writeFile(sizeIndexPath, styleExports, 'utf8');
	}

	const sizeExports =
		`export * from '../types/icon.js';` +
		'\n' +
		Array.from(bySizeStyle.keys())
			.sort()
			.map((s) => `export * from './${s}/index.js';`)
			.join('\n') +
		'\n';
	await writeFile(path.join(ROOT_DIR, 'index.ts'), sizeExports, 'utf8');

	console.log('Generation complete.');
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
