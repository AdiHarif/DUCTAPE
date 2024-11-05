
function partial_verify(board, x, y) {
	let base_x = Math.floor(x / 3) * 3;
	let base_y = Math.floor(y / 3) * 3;
	let i = 0;
	while (i < 9) {
		if (i != y && board[x][i] == board[x][y]) {
			return false;
		}
		if (i != x && board[i][y] == board[x][y]) {
			return false;
		}
		let pos_x = base_x + Math.floor(i / 3);
		let pos_y = base_y + (i % 3);
		if ((pos_x != x || pos_y != y) && board[pos_x][pos_y] == board[x][y]) {
			return false;
		}
		i = i + 1;
	}
	return true;
}

function solve(board, x, y) {
	let z = x * 9 + y + 1;
	if (z == 82) {
		return true;
	}
	if (board[x][y] != 0) {
		return solve(board, Math.floor(z / 9), z % 9);
	}
	let i = 1;
	while (i <= 9) {
		board[x][y] = i;
		if (partial_verify(board, x, y)) {
			if (solve(board, Math.floor(z / 9), z % 9)) {
				return true;
			}
		}
		i = i + 1;
	}
	board[x][y] = 0;
	return false;
}

function verify(board) {
	let i = 0;
	while (i < 9) {
		let row_check = new Array(10);
		let col_check = new Array(10);
		let j = 0;
		while (j < 9) {
			if (board[i][j] == 0) {
				return false;
			}
			if (row_check[board[i][j]]) {
				return false;
			}
			row_check[board[i][j]] = 1;

			if (col_check[board[j][i]]) {
				return false;
			}
			col_check[board[j][i]] = 1;
			j = j + 1;
		}
		i = i + 1;
	}

	let i2 = 0;
	while (i2 < 9) {
		let j2 = 0;
		while (j2 < 9) {
			let check = new Array(10);
			let k = 0;
			while (k < 9) {
				let x = i2 + Math.floor(k / 3);
				let y = j2 + (k % 3);
				if (check[board[x][y]]) {
					return false;
				}
				check[board[x][y]] = 1;
				k = k + 1;
			}
			j2 = j2 + 3;
		}
		i2 = i2 + 3;
	}
	return true;
}


function _main() {
	let board = [
		[0, 6, 0, 0, 0, 0, 9, 0, 2],
		[0, 0, 0, 9, 2, 0, 0, 0, 0],
		[0, 8, 0, 0, 4, 0, 0, 1, 0],
		[0, 0, 0, 1, 0, 0, 0, 0, 3],
		[0, 0, 0, 0, 0, 0, 2, 9, 1],
		[0, 0, 0, 0, 0, 0, 4, 6, 0],
		[2, 0, 4, 3, 0, 8, 0, 0, 0],
		[3, 0, 0, 0, 0, 4, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0, 0, 5]
	]

	solve(board, 0, 0);
	if (verify(board)) {
		console.log("Verification passed");
		return;
	}
	console.log("Verification failed");
	// console.log(board);
}

for (let i = 0; i < 100; i = i + 1) {
	_main();
}
