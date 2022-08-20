import React, {useEffect, useRef, useState, memo, useMemo} from 'react';
import {Chessground} from 'chessground';
import type {Config} from 'chessground/config';
import type {Api} from 'chessground/api';
import type {ShortMove} from 'chess.js';
import type {Color} from 'chessground/types';
import {useAtom} from 'jotai';
import {themeµ, getStorage, type Board, type Pieces} from '@/utils/atoms';
import Promotion from './modals/promotion';

type BoardProps = {
	isOpen: boolean;
	hide: () => void;
	onPromote: (piece: ShortMove['promotion']) => void | Promise<void>;
	color: Color;
	config?: Partial<Config>;
};

export const ChessBoard = ({isOpen, hide, onPromote, color, config = {}}: BoardProps) => {
	const [api, setApi] = useState<Api | undefined>();
	const ref = useRef<HTMLDivElement>(null);

	const [board, setBoard] = useAtom(themeµ.board);
	const [pieces, setPieces] = useAtom(themeµ.pieces);

	useEffect(() => {
		setBoard(() => getStorage<Board>('cp-board') ?? 'green');
		setPieces(() => getStorage<Pieces>('cp-pieces') ?? 'neo');
	}, [setBoard, setPieces]);

	useEffect(() => {
		if (ref?.current && !api) {
			const chessgroundApi = Chessground(ref.current, config);
			setApi(chessgroundApi);
		} else if (ref?.current && api) {
			api.set(config);
		}
		/* eslint-disable-next-line react-hooks/exhaustive-deps */
	}, [ref]);

	useEffect(() => {
		api?.set(config);
	}, [api, config]);

	const themeStyle = useMemo(
		() => `chessground ${board} ${pieces}`,
		[board, pieces],
	);

	return (
		<>
			<Promotion
				isOpen={isOpen}
				hide={hide}
				color={color}
				onPromote={onPromote}
			/>

			<div className='w-full'>
				<div className='next-chessground'>
					<div className={themeStyle}>
						<div ref={ref} className='table w-full h-full' />
					</div>
				</div>
			</div>
		</>
	);
};

export default memo(ChessBoard);
