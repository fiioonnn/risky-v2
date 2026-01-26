export const splitCents = (input: number | 'PLAYOUT'): string[] => {
	if (input === 'PLAYOUT') return ['AUSSPIELUNG'];
	if (input < 100) return [String(input)];

	const euros = Math.floor(input / 100);
	const cents = String(input % 100).padStart(2, '0');
	return [String(euros), cents];
};
