# svelte-fluent-icon

v0.0.1

[![NPM Version](https://img.shields.io/npm/v/svelte-fluent-icon
)](https://www.npmjs.com/package/svelte-fluent-icon)

A tiny Svelte 5 component library that exposes Microsoft Fluent System Icons as Svelte components. Icons are sourced from `@iconify-json/fluent` and compiled into tree-shakeable modules.

- Framework: Svelte 5 (peer dependency)
- Package name: `svelte-fluent-icon`
- Generated from: `@iconify-json/fluent` using a small generator script (`generate-icon.ts`)

## Install

```bash
# with pnpm
pnpm add svelte-fluent-icon

# with npm
yarn add svelte-fluent-icon

# with yarn
npm i svelte-fluent-icon
```

## Usage

There are two ways to import icons:

1) Import by size and style (recommended for clear intent and smaller bundles)

```svelte
<script>
  // 20px, filled variant
  import { AccessTimeIcon } from 'svelte-fluent-icon/icon/20/filled';
</script>

<AccessTimeIcon width={20} height={20} aria-label="Access time" />
```

2) Import from the package root using a suffixed name

```svelte
<script>
  // Name is suffixed with size+style
  import { AccessTime20FilledIcon } from 'svelte-fluent-icon';
</script>

<AccessTime20FilledIcon class="text-gray-700" aria-hidden />
```

Notes
- Components accept standard SVG attributes (width, height, class, style, role, aria-*).
- Svelte 5 render hooks are available: a `pre` render function and the default children render function are supported internally by the generator, allowing advanced composition if needed.

## Available sizes and styles

Icons are generated in these sizes and styles (matching Fluent icons availability):

- Sizes: 10, 12, 16, 20, 24, 28, 32, 48
- Styles: regular, filled, light (light only for some sizes)

Import paths follow:
- `svelte-fluent-icon/icon/<size>/<style>` for per-folder named exports (e.g. `AccessTimeIcon`)
- Root exports expose suffixed names (e.g. `AccessTime20FilledIcon`)

## How it works (generation)

The generator (`generate-icon.ts`) reads Fluent icon metadata and creates Svelte components under `src/lib/icon/<size>/<style>`. For each icon it:
- Renders SVG via `@iconify/utils` (`iconToSVG`, `iconToHTML`, `replaceIDs`)
- Emits `<Name>.svelte` with Svelte 5 render hooks (`pre`, `children`) and forwards all remaining SVG props
- Writes `index.ts` files so you can import either by folder or via the package root

You can regenerate icons locally with:

```bash
pnpm run generate
```

This will clean previously generated folders and build fresh components.

## Scripts

These are the most relevant commands from package.json:
- `pnpm run generate` — regenerate icons from `@iconify-json/fluent`
- `pnpm run prepack` — clean, generate, sync, and package the library
- `pnpm run build` — app build then prepack the library
- `pnpm run check` — typecheck via svelte-check

## TypeScript

Type definitions for the library are emitted to `dist`. The package `exports` map exposes both Svelte and types for root and per-folder entry points.

## License

MIT — see the LICENSE file.

## Acknowledgements

- Icons: `@iconify-json/fluent`
- Utilities: `@iconify/utils`
- Packaging: SvelteKit + `@sveltejs/package`
