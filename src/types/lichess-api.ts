type GameItem = {
	id: string;
	winner: string;
	white: {
		name: string;
		rating: number;
	};
	black: {
		name: string;
		rating: number;
	};
	year: number;
	month: string;
};

export type MoveItem = {
	uci: string;
	san: string;
	averageRating: number;
	white: number;
	draws: number;
	black: number;
	game: GameItem | null;
};

export type MovesResponse = {
	white: number;
	draws: number;
	black: number;
	moves: MoveItem[];
	topGames: any[];
	recentGames: any[];
	opening?: {
		eco: string;
		name: string;
	};
};

export type EvaluationResponse = {
	fen: string;
	knodes: number;
	depth: number;
	pvs: {
		moves: string;
		cp: number;
	}[];
} | undefined
