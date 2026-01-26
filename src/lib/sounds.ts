import { Howl } from 'howler';

export const sounds = {
	bet: new Howl({ src: ['/risky/sounds/changeBet.mp3'] }),
	maxBet: new Howl({ src: ['/risky/sounds/maxBet.mp3'] }),
	soundtrack: new Howl({ src: ['/risky/sounds/soundtrack.mp3'], loop: true, volume: 0.5 }),
	playout: new Howl({ src: ['/risky/sounds/playout.mp3'] }),
	split: new Howl({ src: ['/risky/sounds/split.mp3'] }),
	coins: new Howl({ src: ['/risky/sounds/coins.mp3'] }),
	smallUp: new Howl({ src: ['/risky/sounds/smallUp.mp3'], volume: 0.6 }),
	smallDown: new Howl({ src: ['/risky/sounds/smallDown.mp3'], volume: 0.6 }),
	bigUp: new Howl({ src: ['/risky/sounds/bigUp.mp3'], volume: 0.6 }),
	bigDown: new Howl({ src: ['/risky/sounds/bigDown.mp3'], volume: 0.6 }),
	fall: new Howl({ src: ['/risky/sounds/fall.mp3'], volume: 0.8 }),
	rise: new Howl({ src: ['/risky/sounds/rise.mp3'], volume: 0.8 }),
	gameOver: new Howl({ src: ['/risky/sounds/gameOver.mp3'], volume: 0.5 }),
	jackpot: new Howl({ src: ['/risky/sounds/jackpot.mp3'], volume: 3 })
};
