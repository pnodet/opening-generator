import SparkMD5 from 'spark-md5';

export type MoveItem = {
	uci: string;
	san: string;
};

export class TreeNode {
	public id: string;
	public fen: string;
	public uci: string;
	public san: string;
	public moveNumber: number;
	public parentId?: string;
	protected parent: Tree;
	public nodes: {
		[move: string]: TreeNode;
	};

	constructor({
		fen,
		move,
		moveNumber,
		tree,
		parentId,
	}: {
		moveNumber: number;
		fen: string;
		move: MoveItem;
		tree: Tree;
		parentId?: string;
	}) {
		if (parentId) this.parentId = parentId;
		this.id = this.generateId(move.san, fen, moveNumber, tree.id);
		this.parent = tree;
		this.fen = fen;
		this.uci = move.uci;
		this.san = move.san;
		this.moveNumber = moveNumber;
		this.nodes = {};
		tree.saveNode(this);
	}

	private generateId(
		move: string,
		fen: string,
		moveNumber: number,
		treeId: string,
	) {
		if (fen) {
			const tmp_fen = fen.split(' ');
			tmp_fen[4] = 'x';
			fen = tmp_fen.join(' ');
		}

		const hash = SparkMD5.hash(`${treeId}:${moveNumber}:${move}:${fen}`);
		const slice = (start: number, end: number) => hash.slice(start, end);
		return `${slice(0, 8)}-${slice(8, 12)}-${slice(12, 16)}-${slice(
			16,
			20,
		)}-${slice(20, 32)}`;
	}

	public addChild(child: TreeNode) {
		this.nodes[child.san] = child;
		this.parent.saveNode(child);
	}
}

export class Tree {
	public id: string;
	public name: string;
	public side: 'white' | 'black';
	public nodes: Map<string, TreeNode>;
	constructor(name: string, side: 'white' | 'black' = 'white') {
		this.id = this.generateId();
		this.name = name;
		this.side = side;
		this.nodes = new Map();
	}

	private generateId() {
		return 'id_' + new Date().getTime();
	}

	public saveNode(node: TreeNode) {
		this.nodes.set(node.id, node);
	}

	public getNode(id: string) {
		return this.nodes.get(id);
	}

	public getNodeByMove(move: string, moveNumber: number = 0) {
		for (const [_, node] of this.nodes) {
			if (node.san === move && node.moveNumber === moveNumber) return node;
		}
	}

	public getRoot() {
		const res = [];
		for (const [_, node] of this.nodes) if (!node.parentId) res.push(node);
		return res;
	}

	public findNode(moves: string[]) {
		if (!moves[0] || !moves[1]) return;
		const root = this.getNodeByMove(moves[0]);
		let node = root?.nodes[moves[1]];
		moves.shift();
		for (const move of moves) node = node?.nodes[move];
		return node;
	}
}
