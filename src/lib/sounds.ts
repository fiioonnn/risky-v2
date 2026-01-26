import { Howl } from 'howler';

export const sounds = {
	bet: new Howl({ src: ['/sounds/changeBet.mp3'] }),
	maxBet: new Howl({ src: ['/sounds/maxBet.mp3'] }),
	soundtrack: new Howl({ src: ['/sounds/soundtrack.mp3'], loop: true, volume: 0.5 }),
	playout: new Howl({ src: ['/sounds/playout.mp3'] }),
	split: new Howl({ src: ['/sounds/split.mp3'] }),
	coins: new Howl({ src: ['/sounds/coins.mp3'] }),
	smallUp: new Howl({ src: ['/sounds/smallUp.mp3'], volume: 0.6 }),
	smallDown: new Howl({ src: ['/sounds/smallDown.mp3'], volume: 0.6 }),
	bigUp: new Howl({ src: ['/sounds/bigUp.mp3'], volume: 0.6 }),
	bigDown: new Howl({ src: ['/sounds/bigDown.mp3'], volume: 0.6 }),
	fall: new Howl({ src: ['/sounds/fall.mp3'], volume: 0.8 }),
	rise: new Howl({ src: ['/sounds/rise.mp3'], volume: 0.8 }),
	gameOver: new Howl({ src: ['/sounds/gameOver.mp3'], volume: 0.5 }),
	jackpot: new Howl({ src: ['/sounds/jackpot.mp3'], volume: 3 })
};
