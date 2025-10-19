<script lang="ts">
	import { IconProps } from '$lib/types/icon.js'

	let { pre, children, ...props }: IconProps = $props();
</script>

<svg>{@render pre?.()}{@render children?.()}</svg>
