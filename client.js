(() => {
	const canvas = document.createElement("canvas")
	canvas.width = window.innerWidth / 2;
	canvas.height = window.innerHeight;
	const ctx = canvas.getContext("2d")
	document.body.appendChild(canvas)
	window.pos1 = {
		x: 50,
		y: 50
	}
	let otherServer = {
		x: 50,
		y: 50,
	}
	let currentInput = new Input()
	let inputTickSent = {};
	let interpolation = true;
	let information = true;
	window.selfId = 'mine';
	window.mine = {};
	let polledInputs = [];
	const poll = () => [...polledInputs]
	mine.receive = function({ inputs }) {
		inputs.forEach((data) => {
			if (data.id !== selfId) {
				polledInputs.push(data);
			}
		})
	}
	
	let states = [{
		players: {
			'mine': {
				x: 50,
				y: 50
			},
			'other': {
				x: 100, y: 200,
			}
		}
	}];
	const renderState = {
		players: {
			'mine': {
				x: 50,
				y: 50
			},
			'other': {
				x: 100, y: 200,
			}
		}
	}
	let inputs = [{
		players: {
			'mine': new Input(),
			'other': new Input(),
		}
	}];
	let lastInput = new Input();
	let lookServer = true;
	let tick = 0;
	window.addEventListener("resize", () => {
		canvas.width = window.innerWidth / 2;
		canvas.height = window.innerHeight;
	})


	ctx.textAlign = "center"
	let lastTime = 0;
	const start = window.performance.now();
	const animate = (now) => {
		update();
		render();
		requestAnimationFrame(animate)
	}

	function render() {
		ctx.fillStyle = "rgba(100, 100, 100, 1)";
		ctx.fillRect(0, 0, canvas.width, canvas.height)


		ctx.textAlign = 'center';

		ctx.fillStyle = 'rgb(0, 150, 0)';

		// if (window.server !== undefined) {

		// 	for (const id of Object.keys(states[tick].players)) {
		// 		const player = states[tick].players[id];
		// 		ctx.beginPath()
		// 		ctx.arc(player?.x, player?.y, 25, 0, Math.PI * 2);
		// 		ctx.fill()
		// 		// ctx.fillText(id === selfId ? 'Server_Client': 'Server_Other', player?.x, player?.y - 35)
		// 	}
		// }

		ctx.font = "25px 'Nunito', Helvetica, Arial"
		ctx.fillStyle = "rgb(30,30,30)"
		ctx.beginPath()
		ctx.arc(renderState.players[selfId]?.x, renderState.players[selfId]?.y, 25, 0, Math.PI * 2);
		ctx.fill()
		ctx.fillText("Client", renderState.players[selfId]?.x, renderState.players[selfId]?.y - 35)
		ctx.fillStyle = "rgb(190,20,20)"

		for (const id of Object.keys(renderState.players)) {
			const player = renderState.players[id];
			if (id === selfId) continue;
			ctx.beginPath()
			ctx.arc(player?.x, player?.y, 25, 0, Math.PI * 2);
			ctx.fill()
			ctx.fillText("Other", player?.x, player?.y - 35)
		}


		// ctx.beginPath()
		// ctx.arc(otherServer.x, otherServer.y, 25, 0, Math.PI * 2);
		// ctx.fill()
		// ctx.fillText("Other", otherServer.x, otherServer.y - 35)
		ctx.fillStyle = "rgb(20,180,20)"
		ctx.beginPath()
		// ctx.arc(pos1?.x, pos1?.y, 25, 0, Math.PI * 2);
		ctx.fill()
		// ctx.fillText("Server", pos1?.x, (pos1?.y  ?? -500) - 35)
		ctx.fillStyle = "black"
		ctx.fillText("Tick rate: " + serverTick, canvas.width / 2, 30)
		ctx.fillText("Lag: " + lagRange[1], canvas.width / 2, 60)
		ctx.fillText("Jitter: " + (lagRange[1] - lagRange[0]), canvas.width / 2, 90)
	}

	function update() {
		const input = currentInput.copy();

		if (!input.copy().same(lastInput.copy())) {
			send({
					input: input.copy(),
					tick,
					id: selfId,
			});
			inputs[tick].players[selfId] = input.copy()
		}

		lastInput = input.copy()

		poll().forEach((data) => {
			if (inputs[data.tick] === undefined) {
				inputs[data.tick] = { players: { } };
			}
			if (inputs[data.tick].players[data.id] === undefined || !(inputs[data.tick].players[data.id].copy().same(data.input))) {
				// console.log('difference', data.input, inputs[data.tick].players[data.id]);
				inputs[data.tick].players[data.id] = data.input.copy();
				tick = Math.min(tick, data.tick);
			}
		});
		polledInputs = [];

		const expectedTick = Math.ceil((performance.now() - start) * (SIMULATION_STEP_TIME / 1000));
		while (tick < expectedTick) {
			states[tick + 1] = simulate(states[tick], inputs[tick])
			if (inputs[tick + 1] === undefined) {
				inputs[tick + 1] = { players: { } };
			}
			tick++;
		}

		const delta = (window.performance.now() - lastTime) / 1000;

		lastTime = window.performance.now();
		const lerpTime = Math.min(delta * (SIMULATION_STEP_TIME / 2), 1);

		// update render
		for (const id of Object.keys(renderState.players)) {
			const player = renderState.players[id];
			const realPlayer = copy(states[tick].players[id]);
			player.x = lerp(player.x, realPlayer.x, lerpTime);
			player.y = lerp(player.y, realPlayer.y, lerpTime);
		}
	}
	function lerp(start, end, time) {
	return start * (1 - time) + end * time;
	}
	window.addEventListener("keydown", (event) => {
		if (event.repeat) return;
		const keyCode = event.keyCode;
		if (keyCode === 87 ) {
			currentInput.up = true;
		} else if (keyCode === 83 ) {
			currentInput.down = true;
		} else if (keyCode === 65) {
			currentInput.left = true;
		} else if (keyCode === 68 ) {
			currentInput.right = true;
		}
	})
	window.addEventListener("keyup", (event) => {
		if (event.repeat) return;
		const keyCode = event.keyCode;
		if (keyCode === 87 ) {
			currentInput.up = false;
		} else if (keyCode === 83) {
			currentInput.down = false;
		} else if (keyCode === 65) {
			currentInput.left = false;
		} else if (keyCode === 68) {
			currentInput.right = false;
		}
		if (keyCode === 90) {
			serverTick *= 1.5
			serverTick = Math.round(serverTick)
			server.reset()
		}
		if (keyCode === 88) {
			serverTick /= 1.5
			serverTick = Math.round(serverTick)
			server.reset()
		}
	})
	requestAnimationFrame(animate)

	function send(object) {
		let time = getLag();
		setTimeout(() => {
			window.server?.receive(object);
		}, time / 2);
	} 
})();