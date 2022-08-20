import Board from '@/components/board';
import {CreateModal} from '@/components/modals';
import WithoutSsr from '@/components/without-ssr';
import useModal from '@/hooks/use-modal';
import {orientationµ} from '@/utils/atoms';
import {getColor, getMovable} from '@/utils/play';
import * as ChessJS from 'chess.js';
import type {ChessInstance, Square, ShortMove} from 'chess.js';
import type {Config} from 'chessground/config';
import {useAtom} from 'jotai';
import {useCallback, useRef, useState} from 'react';
import {mastersMovesParams, playersMovesParams} from '@/utils/lichess';
import {Tree, TreeNode} from '@/controllers/tree';
import {EvaluationResponse, MoveItem, MovesResponse} from '@/types/lichess-api';
import {TreeViewer} from '@/components/tree';
import {Key} from 'chessground/types';
import {brushes} from '@/utils/brushes';

const Chess = typeof ChessJS === 'function' ? ChessJS : ChessJS.Chess;

const getPlayerMoves = async (fen: string): Promise<MovesResponse> => {
	const queryParams = new URLSearchParams({fen});
	const url = `https://explorer.lichess.ovh/lichess?${queryParams}${playersMovesParams}`;
	return fetch(url).then(res => res.json());
};

const getMasterMoves = async (fen: string): Promise<MovesResponse> => {
	const queryParams = new URLSearchParams({fen});
	const url = `https://explorer.lichess.ovh/masters?${queryParams}${mastersMovesParams}`;
	return fetch(url).then(res => res.json());
};

const getCloudEvaluation = async (fen: string): Promise<EvaluationResponse> => {
	const queryParams = new URLSearchParams({fen});
	const url = `https://lichess.org/api/cloud-eval?${queryParams}`;
	return fetch(url).then(res => res.json());
};

/* eslint-disable-next-line no-promise-executor-return */
const sleep = async (ms: number) => new Promise(r => setTimeout(r, ms));

const Home = () => {
	const chess = useRef<ChessInstance>(new Chess());
	const [config, setConfig] = useState<Partial<Config>>({
		animation: {enabled: true, duration: 50},
		turnColor: getColor(chess.current.turn()),
		lastMove: [],
		highlight: {
			lastMove: true,
			check: true,
		},
		premovable: {enabled: false},
		movable: getMovable(chess.current),
		coordinates: true,
	});

	const [orientation, setOrientation] = useAtom(orientationµ.color);
	const [pendingMove, setPendingMove] = useState<Square[]>([]);
	const [moveNumber, setMoveNumber] = useState(0);
	const [tree, setTree] = useState<Tree>();
	const [drawable, setDrawable] = useState<Config['drawable']>({
		enabled: true,
		eraseOnClick: false,
		shapes: [],
		autoShapes: [],
		brushes,
	});

	const {isOpen: isOpenCreate, hide: hideCreate} = useModal(true);
	const {
		isOpen: isOpenPromotion,
		show: showPromotion,
		hide: hidePromotion,
	} = useModal();

	const updateBoard = useCallback(
		(from: Square, to: Square, chess: ChessJS.ChessInstance) => {
			setConfig(config => ({
				...config,
				fen: chess.fen(),
				check: chess.in_check(),
				movable: getMovable(chess),
				turnColor: getColor(chess.turn()),
				lastMove: [from, to],
			}));
		},
		[],
	);

	/**
	 * Function making the computer play the next move.
	 */
	const computerMove = useCallback(
		async (move_: MoveItem) => {
			if (!chess) return;
			const move = chess.current.move(move_.san);
			if (!move) return;
			await sleep(250);
			updateBoard(move.from, move.to, chess.current);

			const autoShapes: any[] = [];

			const mastersMoves = await getMasterMoves(chess.current.fen());
			mastersMoves?.moves.forEach(move => {
				autoShapes.push({
					brush: 'orange',
					orig: move.uci.slice(0, 2),
					mouseSq: move.uci.slice(2, 4),
					dest: move.uci.slice(2, 4),
				});
			});

			const evaluation = await getCloudEvaluation(chess.current.fen());
			const stockfishMove = evaluation?.pvs
				? evaluation?.pvs[0]?.moves.split(' ')[0]
				: undefined;

			if (stockfishMove) {
				autoShapes.push({
					brush: 'nextMove',
					orig: stockfishMove.slice(0, 2) as Key,
					mouseSq: stockfishMove.slice(2, 4) as Key,
					dest: stockfishMove.slice(2, 4) as Key,
				});
			}

			setDrawable(drawable => ({
				...drawable,
				autoShapes,
			}));
		},
		[chess, updateBoard],
	);

	const checkIsPromotion = useCallback(
		(from: Square, to: Square, moves: ChessJS.Move[]): boolean => {
			for (const move of moves)
				if (move.from === from && move.to === to && move.flags.includes('p'))
					return true;

			return false;
		},
		[],
	);

	const handleNewMove = async (move: ChessJS.Move, moveNumber: number) => {
		if (!chess || !tree) return;
		const fen = chess.current.fen();
		const history = chess.current.history();
		history.pop();

		const gParent = history.length !== 0 ? tree.findNode(history) : undefined;
		const parent = new TreeNode({
			fen,
			moveNumber,
			tree,
			move: {
				san: move.san,
				uci: `${move.from}${move.to}`,
			},
			parentId: gParent?.id,
		});

		const {moves} = await getPlayerMoves(fen);
		moves.forEach(move => {
			const node = new TreeNode({
				fen,
				moveNumber,
				move,
				tree,
				parentId: parent.id,
			});
			parent.addChild(node);
		});

		tree.saveNode(parent);
		setTree(() => tree);
		computerMove(moves[0]!);
	};

	/**
	 * Function called when the user plays.
	 */
	const handleUserMove = useCallback(
		async (from: Square, to: Square) => {
			const moves = chess.current.moves({verbose: true});

			const isPromotion = checkIsPromotion(from, to, moves);
			if (isPromotion) {
				setPendingMove([from, to]);
				showPromotion();
				return;
			}

			const move = chess.current.move({from, to});
			if (move === null) return;
			updateBoard(from, to, chess.current);
			setMoveNumber(moveNumber => moveNumber + 1);
			await handleNewMove(move, moveNumber + 1);
		},
		[checkIsPromotion, chess, showPromotion, moveNumber, handleNewMove],
	);

	/**
	 * Handle promotions via chessground.
	 */
	const handlePromotion = useCallback(
		async (piece: ShortMove['promotion']) => {
			const from = pendingMove[0]!;
			const to = pendingMove[1]!;
			const move = chess.current.move({from, to, promotion: piece});
			if (move === null) return;
			updateBoard(from, to, chess.current);
		},
		[pendingMove, chess],
	);

	const handleClick = (side: 'white' | 'black') => {
		setTree(() => new Tree('hello', side));
		setOrientation(() => side);
		hideCreate();
	};

	return (
		<>
			<CreateModal
				isOpen={isOpenCreate}
				hide={hideCreate}
				handleClick={handleClick}
			/>
			<main className='min-w-screen min-h-screen w-full h-full flex flex-col justify-center items-center'>
				<div className='aspect-square max-w-xl w-full'>
					<WithoutSsr>
						<Board
							isOpen={isOpenPromotion}
							hide={hidePromotion}
							onPromote={handlePromotion}
							color={getColor(chess.current.turn())}
							config={{
								...config,
								orientation,
								drawable: drawable,
								// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
								events: {move: handleUserMove as any},
							}}
						/>
					</WithoutSsr>
				</div>
				<TreeViewer tree={tree} />
			</main>
		</>
	);
};

export default Home;
