<script lang="ts">
	import Bar from '$lib/components/Bar.svelte';
	import Level from '$lib/components/Level.svelte';
	import { sounds } from '$lib/sounds';
	import { splitCents } from '$lib/utils';
	import { stopImmediatePropagation } from 'svelte/legacy';

	//

	let balance = $state(200);
	let bets = $state([10, 20, 30, 40, 50, 60, 100, 150, 200]);
	let bet = $state(bets[0]);
	let betIndex = $derived(bets.indexOf(bet));
	let won = $state(0);
	let cooldownBet = $state(false);
	let startButton: HTMLButtonElement;

	let levels: LevelType[] = $state([
		0,
		15,
		30,
		60,
		120,
		240,
		'PLAYOUT',
		400,
		800,
		1200,
		2000,
		3200,
		5200,
		8400,
		14000
	]);
	let levelCurrent: LevelType = $state(0);
	let levelCurrentIndex = $derived(levels.indexOf(levelCurrent));
	let levelNext: LevelType = $state(-1);
	let levelPrev: LevelType = $state(-1);

	const levelStyles: Record<LevelType, { width: number; height: number; fontSize: number }> =
		$state({
			'-1': { width: 95, height: 50, fontSize: 25 },
			0: { width: 100, height: 55, fontSize: 25 },
			15: { width: 110, height: 55, fontSize: 25 },
			30: { width: 120, height: 55, fontSize: 25 },
			60: { width: 125, height: 55, fontSize: 25 },
			120: { width: 135, height: 55, fontSize: 27 },
			240: { width: 145, height: 55, fontSize: 27 },
			PLAYOUT: { width: 160, height: 55, fontSize: 20 },
			400: { width: 170, height: 55, fontSize: 30 },
			800: { width: 180, height: 60, fontSize: 35 },
			1200: { width: 190, height: 60, fontSize: 35 },
			2000: { width: 200, height: 60, fontSize: 35 },
			3200: { width: 210, height: 60, fontSize: 35 },
			5200: { width: 220, height: 63, fontSize: 37 },
			8400: { width: 230, height: 65, fontSize: 40 },
			14000: { width: 240, height: 70, fontSize: 45 }
		});

	let gameState = $state<'idle' | 'running' | 'paused'>('idle');

	let prevnext: 0 | 1 = $state(0);

	let animate = $state(false);
	let animateIndex = $state(-1);
	let animateIndexes: number[] = $state([]);
	let animateIterationsLeft = $state(4);

	let loopSpeed = $state(100);

	/* This will be used for initial bet on start */
	const levelsByBet: Record<number, { next: LevelType; prev: LevelType }> = {
		10: { next: 15, prev: 0 },
		20: { next: 30, prev: 15 },
		30: { next: 60, prev: 0 },
		40: { next: 60, prev: 30 },
		50: { next: 60, prev: 30 },
		60: { next: 120, prev: 0 },
		100: { next: 120, prev: 60 },
		150: { next: 240, prev: 120 },
		200: { next: 240, prev: 120 }
	};

	const levelsByLevel: Record<number, { next: LevelType; prev: LevelType }> = {
		0: { next: 0, prev: 0 },
		15: { next: 30, prev: 0 },
		30: { next: 60, prev: 0 },
		60: { next: 120, prev: 0 },
		120: { next: 240, prev: 0 },
		240: { next: 'PLAYOUT', prev: 0 }, //playout
		400: { next: 800, prev: 0 },
		800: { next: 1200, prev: 400 },
		1200: { next: 2000, prev: 400 },
		2000: { next: 3200, prev: 800 },
		3200: { next: 5200, prev: 1200 },
		5200: { next: 8400, prev: 2000 },
		8400: { next: 14000, prev: 3200 },
		14000: { next: 0, prev: 0 }
	};

	const speedByLevel: Record<number, number> = {
		0: 150,
		15: 300,
		30: 300,
		60: 300,
		120: 300,
		240: 300,
		400: 500,
		800: 500,
		1200: 500,
		2000: 500,
		3200: 500,
		5200: 500,
		8400: 500,
		14000: 500
	};

	// use crypto to create a function that returns a random boolean true / false but 50/50 chance
	const getRandomBoolean = () => {
		return crypto.getRandomValues(new Uint8Array(1))[0] > 127;
	};

	const updateBalance = (amount: number) => {
		balance += amount;
	};

	const collect = () => {
		gameState = 'idle';
		levelCurrent = 0;
		levelNext = 0;
		levelPrev = 0;

		sounds.soundtrack.stop();
		sounds.gameOver.play();
		sounds.coins.play();
		updateBalance(won);

		won = 0;
	};

	const start = () => {
		if (gameState === 'running') {
			collect();
			return;
		}

		if (gameState !== 'idle') {
			stop();
			return;
		}

		if (balance < bet) {
			return;
		}

		gameState = 'running';

		updateBalance(-bet);

		sounds.soundtrack.play();

		const { next, prev } = getLevelsByBet();

		levelNext = next;
		levelPrev = prev;

		if (levels.indexOf(bet as LevelType)) {
			levelCurrent = levelCurrent = bet as LevelType;
		}

		won = bet;

		loop();

		startButton.blur();
	};

	const stop = () => {
		gameState = 'idle';
		levelCurrent = 0;
		levelNext = 0;
		levelPrev = 0;
		won = 0;

		sounds.soundtrack.stop();
		sounds.gameOver.play();
	};

	const doBet = async () => {
		if (cooldownBet) return;
		cooldownBet = true;

		const isWin = getRandomBoolean();

		levelCurrent = isWin ? levelNext : levelPrev;

		if (isWin) {
			sounds.rise.play();
		} else if (levelCurrentIndex > 1) {
			sounds.fall.play();
		}

		updateLevel();
		check();

		setTimeout(() => {
			cooldownBet = false;
		}, 300);
	};

	const check = () => {
		// Check for playout
		if (levelCurrent === 'PLAYOUT') return playout();
		// Check if on 0
		if (levelCurrentIndex === 0) return stop();
		// Update won amount
		won = levelCurrent as number;
	};

	const increaseBet = () => {
		let maxPossibleBet = bets.filter((bet) => bet <= balance).pop();

		// Reset to min bet if at max
		if (
			betIndex === bets.length - 1 ||
			(betIndex < bets.length - 1 && bets[betIndex + 1] > (maxPossibleBet || 0))
		) {
			bet = bets[0];
			sounds.bet.play();
			return;
		}

		bet = bets[betIndex + 1];
		sounds.bet.play();
	};

	const maximizeBet = () => {
		let maxPossibleBet = bets.filter((bet) => bet <= balance).pop();

		bet = maxPossibleBet || bets[0];

		sounds.maxBet.play();
	};

	const updateLevel = () => {
		const { next, prev } = getLevelsByLevel();

		levelNext = next as LevelType;
		levelPrev = prev as LevelType;
	};

	const loop = async () => {
		while (gameState === 'running') {
			console.log('tick');

			prevnext = prevnext === 0 ? 1 : 0;

			playsounds();

			if (animate) {
				doAnimation();
			}

			check();

			await new Promise((r) => setTimeout(r, loopSpeed));
		}
	};

	const playsounds = () => {
		if (levelCurrentIndex < 1 || animate) return;

		if (levelCurrentIndex > 7) {
			prevnext === 0 ? sounds.bigDown.play() : sounds.bigUp.play();
		} else {
			prevnext === 0 ? sounds.smallDown.play() : sounds.smallUp.play();
		}
	};

	const highlight = (level: number | 'PLAYOUT') => {
		return gameState === 'running' && (prevnext === 0 ? levelNext === level : levelPrev === level);
	};

	const getLevelsByBet = () => levelsByBet[bet];

	const getLevelsByLevel = () => {
		if (levelCurrent === 'PLAYOUT') return { next: 0, prev: 0 };

		return levelsByLevel[levelCurrent as number];
	};

	const playout = () => {
		if (animate) return;

		animateIterationsLeft = 4;
		animateIndexes = [];
		animateIndex = 6;
		animate = true;

		sounds.playout.play();
	};

	const doAnimation = () => {
		animateIndexes.push(animateIndex + 1);
		animateIndex += 1;
		loopSpeed = 50;

		if (animateIndex > 14) {
			animateIndex = 6;
			animateIndexes = [];
			animateIterationsLeft -= 1;
		}
		// PLAYOUT END
		if (animateIterationsLeft === 0) {
			animate = false;
			animateIndex = -1;
			animateIndexes = [];

			levelCurrent = 400;
			updateLevel();
		}
	};

	const getScroll = () => {
		let scroll = 150;
		let perStep = 0;

		if (levels.indexOf(levelCurrent) > 6) {
			perStep = 5;
		}

		if (levelCurrent === 'PLAYOUT') {
			scroll -= 300;
		}

		if (levels.indexOf(levelCurrent) > 8) {
			scroll -= 200;
		}

		return scroll + -(levels.indexOf(levelCurrent) * perStep);
	};

	const split = () => {
		if (gameState !== 'running') return;

		let next = levels[levels.indexOf(levelCurrent) - 1];

		if (next === 'PLAYOUT') next = 240;

		let win = (levelCurrent as number) - next;

		levelCurrent = next;

		sounds.split.play();

		updateBalance(win);
		updateLevel();
		check();
	};

	$effect(() => {
		loopSpeed = speedByLevel[levelCurrent as number] || 100;
	});

	const handleKeyDown = (event: KeyboardEvent) => {
		if (gameState === 'running' && !animate) {
			if (event.key === ' ') {
				doBet();
			}
		}
	};
</script>

<svelte:window onkeydown={handleKeyDown} />

<Bar {balance} {bet} {won}>
	<button
		class="size-14.5 flex flex-col border-2 border-white relative cursor-pointer active:scale-95"
		onclick={gameState === 'idle' ? increaseBet : doBet}
	>
		<p class="text-[10px] bg-red-600 text-white flex-1 grid place-content-center">Risiko 1:1</p>
		<p class="bg-[#ddd] text-[8px] flex-1 grid place-content-center">Level</p>
		<div
			class="absolute top-1/2 left-1/2 -translate-1/2 px-1 rounded-sm bg-yellow-500 border text-[7px]"
		>
			Leiter
		</div>
	</button>
	<button
		class="size-14.5 flex flex-col border-2 border-white relative cursor-pointer active:scale-95"
		onclick={maximizeBet}
	>
		<p class="text-[10px] bg-black text-white flex-1 grid place-content-center">Risiko 1:1</p>
		<p class="bg-white text-[8px] flex-1 grid place-content-center">Level</p>
		<div
			class="absolute top-1/2 left-1/2 -translate-1/2 px-1 rounded-sm bg-yellow-500 border text-[7px]"
		>
			Karten
		</div>
	</button>
	<button
		bind:this={startButton}
		class={[
			'size-14.5 grid place-content-center bg-linear-to-b from-[#009900] to-[#005500] cursor-pointer active:scale-95 border-2 border-green-500',

			{ 'flash-border': gameState === 'idle' }
		]}
		onclick={start}
	>
		<p class="text-xs font-bold">START</p>
	</button>
</Bar>

<div class="grid grid-cols-2 overflow-y-scroll h-screen">
	<div class="text-white">
		{gameState}
		{levelCurrent}
		{levelNext}
		{levelPrev}
	</div>
	<div class="relative py-30">
		<button
			class={[
				'absolute left-15 bottom-50 cursor-pointer',
				{
					'pointer-events-none saturate-0':
						gameState !== 'running' || animate || levelCurrent === 15 || levelCurrentIndex < 1
				}
			]}
			onclick={split}
		>
			<Level value="Teilen" height={50} width={100} fontSize={20} active={true} />
		</button>
		<div
			class="flex flex-col-reverse items-center gap-1 absolute left-1/2 -translate-x-1/2 transition-all"
			style:bottom={`${getScroll()}px`}
		>
			{#each levels as level, i}
				<Level
					value={level}
					height={levelStyles[level].height}
					width={levelStyles[level].width}
					fontSize={levelStyles[level].fontSize}
					active={levelCurrent === level}
					highlight={highlight(level)}
					animate={animateIndexes.includes(i)}
				/>
			{/each}
		</div>
	</div>
</div>

<!--
create an animation that hides and shows the border
-->

<style>
	.flash-border {
		animation: flash-border 0.5s infinite;
	}

	@keyframes flash-border {
		0% {
			border-color: oklch(72.3% 0.219 149.579);
		}
		50% {
			border-color: transparent;
		}
		100% {
			border-color: oklch(72.3% 0.219 149.579);
		}
	}
</style>
