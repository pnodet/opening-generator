import {createRouter} from './context';
import {z} from 'zod';
import { playersMovesParams } from '@/utils/lichess';

export const lichessApiRouter = createRouter()
	.query('playersMoves', {
		input: z.object({
			fen: z.string(),
		}),
		async resolve({input}) {
			const queryParams = new URLSearchParams({fen: input?.fen});
			const response = await fetch(`https://explorer.lichess.ovh/lichess?${queryParams}${playersMovesParams}`);
			const data = await response.json();
			return data;
		},
	})
