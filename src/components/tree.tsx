import {TreeNode, Tree} from '@/controllers/tree';
import React from 'react';

type TreeViewerProps = {
	tree?: Tree;
};

const Leaf = ({node}: {node: TreeNode}) => {
	const children = Object.values(node.nodes);
	if (children.length === 0) {
		return (
			<div>
				...
				{node.san}
			</div>
		);
	}

	console.log({node});

	return (
		<div>
			{node.moveNumber}
			{node.san}
			<div>
				{children.map(node => (
					<Leaf key={node.id} node={node} />
				))}
			</div>
		</div>
	);
};

export const TreeViewer = ({tree}: TreeViewerProps) => {
	if (!tree) return null;
	const root = tree.getRoot();
	return (
		<div>
			{root.map(node => (
				<Leaf key={node.id} node={node} />
			))}
		</div>
	);
};
