import {createRouter} from './context';
import superjson from 'superjson';

import {lichessApiRouter} from './lichess';

export const appRouter = createRouter()
	.transformer(superjson)
	.merge('lichess.', lichessApiRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
