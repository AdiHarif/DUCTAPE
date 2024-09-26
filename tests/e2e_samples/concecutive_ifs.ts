
function foo() {
    let i = 1;
	if (i < 2) {
		let j = 3;
		if (j < 4) {
			j = j + 5;
		}
	}

	if (i < 6) {
		let j = 7;
		if (j < 8) {
			j = j + 9;
		}
	}
}

foo();
