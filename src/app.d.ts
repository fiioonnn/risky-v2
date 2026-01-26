// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	type LevelType =
		| -1
		| 0
		| 15
		| 30
		| 60
		| 120
		| 240
		| 'PLAYOUT'
		| 400
		| 800
		| 1200
		| 2000
		| 3200
		| 5200
		| 8400
		| 14000;
}

export {};
