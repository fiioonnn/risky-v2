<script lang="ts">
	import { splitCents } from '$lib/utils';

	let { height, width, fontSize, value, active, highlight, animate } = $props<{
		height?: number;
		width?: number;
		fontSize?: number;
		value: LevelType | string;
		active?: boolean;
		highlight?: boolean;
		animate?: boolean;
	}>();

	const displayParts = $derived(splitCents(value));
</script>

<div
	class="relative"
	style={`height: ${height ?? 50}px; width: ${width ?? 120}px; font-size: ${fontSize ?? 12}px;`}
>
	<div class="example size-full bg-linear-to-b from-[#C26C00] via-[#FFAF4A] to-[#843B00]"></div>
	<div
		class={[
			'bg-black absolute inset-1.5 inner',
			{ 'bg-[#d1c305]! ': active || highlight || animate }
		]}
	></div>
	<span class="absolute inset-0 font-bold text-[#d1c305] grid place-content-center">
		<div
			class={[
				'flex items-baseline tracking-wide',
				{
					'text-black! ': active || highlight || animate,
					'scale-y-190 scale-x-90': value === 'PLAYOUT'
				}
			]}
		>
			{#if typeof value === 'number'}
				{#if displayParts.length === 2}
					<span>{displayParts[0]}</span>
					<span class="text-[80%]">{displayParts[1]}</span>
				{:else}
					<span>{displayParts[0]}</span>
				{/if}
			{:else}
				<span>{value.replace('PLAYOUT', 'AUSSPIELUNG')}</span>
			{/if}
		</div>
	</span>
</div>

<style>
	.example {
		clip-path: polygon(
			/* top edge */ var(--corner) 0%,
			calc(100% - var(--corner)) 0%,
			/* right edge */ 100% var(--corner),
			100% calc(100% - var(--corner)),
			/* bottom edge */ calc(100% - var(--corner)) 100%,
			var(--corner) 100%,
			/* left edge */ 0% calc(100% - var(--corner)),
			0% var(--corner)
		);

		--corner: 5px;
	}

	.inner {
		border: 2px solid #b46300;
	}
</style>
