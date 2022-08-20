import {atom} from 'jotai';
import {atomWithStorage} from 'jotai/utils';

export const darkModeµ = atomWithStorage<boolean>('cp-dark-mode', true);

export type Board = 'brown' | 'green' | 'ruby' | 'purple' | 'teal';
export type Pieces = 'cburnett' | 'classic' | 'neo' | 'alpha' | 'bases';

const board = atomWithStorage<Board>('cp-board', 'green');
const pieces = atomWithStorage<Pieces>('cp-pieces', 'neo');
export const themeµ = {board, pieces};

const color = atom<'white' | 'black'>('white');
const isReverted = atom<boolean>(false);
export const orientationµ = {color, isReverted};

export const getStorage = <T>(value: string): T =>
	JSON.parse(localStorage.getItem(value) ?? 'null') as T;
