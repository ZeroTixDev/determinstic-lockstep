const vel = 5;
const SIMULATION_STEP_TIME = 120;
const knock = 100;
const radius = 25;
const accel = 400;
const friction = 0.9;

// window.simulate_per_frame = 60;
// window.buffer = 10;
window.decay = 1;
window.lagRange = [25, 300]
window.serverTick = 30;

window.ids = ['mine', 'other']

// window.emptyInput = function() {
// 	const object = { players: {} };
// 	for (const id of window.ids) {
// 		object.players[id] = new Input()
// 	}
// }

window.getLag = function () {
	let diff = lagRange[1] - lagRange[0];
	return lagRange[0] + Math.floor(Math.random() * diff);
}

function simulate(state, inputs) {
	let newState = copy(state);
	if (!newState.players) {
		console.log('state .players NOT defined');
		return newState;
	}
	for (const id of Object.keys(newState.players)) {
		const player = newState.players[id];
		let input = inputs.players[id];
		const delta = (1 / SIMULATION_STEP_TIME);
		if (player.yv === undefined) { player.yv = 0 }
		if (player.xv === undefined) { player.xv = 0 }
		if (input !== undefined) {
			player.lastInput = input.copy();
		} else if (input === undefined) {
			if (player.lastInput !== undefined) {
				// console.log(player.lastInput);
				input = player.lastInput;
			}
		}
		if (input !== undefined) {
			if (input.up) {
				player.yv -= accel * delta;
			}
			if (input.down) {
				player.yv += accel * delta;
			}
			if (input.left) {
				player.xv -= accel * delta;
			}
			if (input.right) {
				player.xv += accel * delta;
			}
		}
		player.xv *= Math.pow(friction, delta * 5);
		player.yv *= Math.pow(friction, delta * 5);
		player.x += player.xv * delta;
		player.y += player.yv * delta;
	}
	// collision
	for (const i of Object.keys(newState.players)) {
		const player1 = newState.players[i];
		for (const j of Object.keys(newState.players)) {
			if (i === j) continue;
			const player2 = newState.players[j];
			const distX = player1.x - player2.x;
			const distY = player1.y - player2.y;
			if (distX * distX + distY * distY < (radius * 2) * (radius * 2)) {
				const magnitude = Math.sqrt(distX * distX + distY * distY) || 1;
				const xv = distX / magnitude;
				const yv = distY / magnitude;
				player1.xv += xv * knock;
				player1.yv += yv * knock;
				player2.xv += -xv * knock;
				player2.yv += -yv * knock;
				player1.x = player2.x + (radius + 0.05 + radius) * xv;
           		player1.y = player2.y + (radius + 0.05 + radius) * yv;
			}
		}
	}
	return newState;
}

function copy(obj) {
	const object = Object.create(null);
	for (const key of Object.keys(obj)) {
		object[key] = typeof obj[key] === 'object' ? copy(obj[key]) : obj[key];
	}
	return object;
}

class Input {
	constructor({
		up = false,
		down = false,
		left = false,
		right = false
	} = {}) {
		this.up = up;
		this.down = down;
		this.left = left;
		this.right = right;
	}
	same(input) {
		return input.up === this.up && input.down === this.down && input.left === this.left && input.right === this.right
	}
	decay() {
		return new Input({
			up: this.up * decay,
			down: this.down * decay,
			left: this.left * decay,
			right: this.right * decay,
		})
	}
	copy() {
		return new Input({
			up: this.up,
			down: this.down,
			left: this.left,
			right: this.right
		})
	}
}
