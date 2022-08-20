import {type ChessInstance, SQUARES} from 'chess.js';
import type {Config} from 'chessground/config';

export const getColor = (string_: 'w' | 'b') =>
	string_ === 'w' ? 'white' : 'black';

export const getMovable = (
	chess: ChessInstance,
): Partial<Config['movable']> => {
	const dests = new Map();
	for (const square of SQUARES) {
		const ms = chess.moves({square, verbose: true});
		if (ms.length > 0)
			dests.set(
				square,
				ms.map(m => m.to),
			);
	}

	return {
		free: false,
		dests,
		showDests: true,
		color: 'both',
	};
};
