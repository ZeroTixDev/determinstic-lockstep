
class Server {
	constructor() {
		this.keys = []
		this.states = [{
			players: {
				'mine': {
					x: 50,
					y: 50
				},
				'other': {
					x: 100, y: 200,
				}
			}
		}]
		this.inputs = [{
			players: {
				'mine': new Input(),
				'other': new Input(),
			}
		}];
		// this.lastInput = { players: { 'mine': { tick: 0, input: new Input() }, 'other': { tick: 0, input: new Input() }}};
		this.startTime = window.performance.now();
		this.minTick = 0;
		this.tick = 0;
		this.updated = true;
		this.polledInputs = [];
	}
	receive({
		input,
		tick,
		id,
	}) {
		this.polledInputs.push({ input, tick, id });
		// console.log('server', tick);
		// this.inputs[tick] = input.copy()
		// this.tick = Math.max(this.tick, tick);
		// this.updated = true;
		// this.minTick = Math.min(this.minTick, tick )
	}
	poll() {
		return [...this.polledInputs]
	}
	update() {

		// if (!this.updated) return;
		// this.updated = false;
		// for (let i = this.minTick + 1; i < this.tick; i++) {
		// 	if (this.inputs[i] === undefined) {
		// 		this.inputs[i] = new Input();
		// 	}
		// 	this.states[i] = simulate(this.states[i - 1], this.inputs[i]);
		// }
		// if (this.inputs[this.tick] === undefined) {
		// 	this.inputs[this.tick] = new Input();
		// }
		// this.states[this.tick] = simulate(this.states[this.tick - 1], this.inputs[this.tick])
		// clientReceive(this.states[this.tick].player, this.inputs[this.tick])
		// this.minTick = this.tick;
		this.poll().forEach((data) => {
			if (this.inputs[data.tick] === undefined) {
				this.inputs[data.tick] = { players: { } };
			}
			this.inputs[data.tick].players[data.id] = data.input;
			console.log(data.input,data.id);
			this.tick = Math.min(this.tick, data.tick);
		});
		const pack = {
			inputs: [...this.poll()]
		}
		setTimeout(() => {
			mine.receive({ inputs: pack.inputs.filter((data) => data.id !== 'mine')});
		}, getLag() / 2);
		setTimeout(() => {
			other.receive({ inputs: pack.inputs.filter((data) => data.id !== 'other')});
		}, getLag() / 2);

		this.polledInputs = [];

		const expectedTick = Math.ceil((window.performance.now() - this.startTime) * (SIMULATION_STEP_TIME / 1000));
		while (this.tick < expectedTick) {
			this.states[this.tick + 1] = simulate(this.states[this.tick], this.inputs[this.tick])
			if (this.inputs[this.tick + 1] === undefined) {
				this.inputs[this.tick + 1] = { players: { } };
			}
			this.tick++;
		}

		clientReceive(this.states[this.tick].players);
	}

	lagUpdate() {
		this.update();
	}

	start() {
		this.interval = setInterval(this.lagUpdate.bind(this), 1000 / serverTick)
	}
	reset() {
		clearInterval(this.interval)
		this.start()
	}
}
window.server = new Server();
server.start()



function clientReceive(pos) {
	// console.log(serverPos);
	window.pos1 = pos[window.selfId];
}
window.copy = function (obj) {
	const object = Object.create(null);
	for (const key of Object.keys(obj)) {
		object[key] = typeof obj[key] === 'object' ? copy(obj[key]) : obj[key];
	}
	return object;
}