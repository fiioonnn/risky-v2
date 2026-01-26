<script lang="ts">
	import { splitCents } from '$lib/utils';

	let { children, bet, balance, won } = $props();
</script>

<div
	class="w-full bg-linear-to-b from-[#C26C00] via-[#FFAF4A] to-[#843B00] fixed bottom-0 left-0 z-20 flex items-end p-2 px-40 shadow-lg gap-5"
>
	{@render Frame('BANK', balance)}
	<div class="ml-auto"></div>
	{@render Frame('ERFOLG', won)}
	{@render Frame('LEVEL', bet, true)}

	{@render children()}
</div>

{#snippet Frame(title: string, value: number, isLevel?: boolean)}
	{@const displayParts = splitCents(value)}
	<div>
		<p class="text-xs font-bold text-center">{title}</p>
		<div
			class={[
				'px-1 w-40 bg-black font-bold text-[#d1c305] text-3xl border-3 border-[#b46300] flex items-baseline justify-end  ',
				{
					'w-20!': isLevel
				}
			]}
		>
			{#if displayParts.length === 2}
				<span>{displayParts[0]}</span>
				<span class="text-[80%]">{displayParts[1]}</span>
			{:else}
				<span>{displayParts[0]}</span>
			{/if}
		</div>
	</div>
{/snippet}
