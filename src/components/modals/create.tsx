import React from 'react';
import GenericModal from './base';
import {Dialog} from '@headlessui/react';

type CreateModalProps = {
	isOpen: boolean;
	hide: () => void;
	handleClick: (side: 'white' | 'black') => void;
};

export const CreateModal = ({isOpen, hide, handleClick}: CreateModalProps) => {
	return (
		<GenericModal isOpen={isOpen} hide={hide} title={'Welcome'}>
			<Dialog.Description>Pick your color</Dialog.Description>
			<button
				type='button'
				className='bg-white font-sans font-bold uppercase text-black px-2 py-0.5 rounded-md'
				onClick={() => handleClick('white')}
			>
				White
			</button>
			<button
				type='button'
				className='bg-black font-sans font-bold uppercase text-white px-2 py-0.5 rounded-md'
				onClick={() => handleClick('black')}
			>
				Black
			</button>
		</GenericModal>
	);
};
