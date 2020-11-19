let lagRange = [500, 1000]
let serverTick = 1;
class Server {
    constructor() {
        this.keys = []
        this.states = [{
            player: {
                x: 50,
                y: 50
            }
        }]
        this.input = new Input()
        this.inputs = []
        this.minTick = 0;
        this.tick = 0;
        this.updated = true;
    }
    receive({
        input,
        tick
    }) {
        this.inputs[tick] = input.copy()
        this.tick = tick;
        this.updated = true;
        this.minTick = Math.min(this.minTick, this.tick)
    }
    update() {

        if (!this.updated) return;
        this.updated = false;
        let haveInput = true;
        for (let i = this.minTick + 1; i < this.tick; i++) {
            if (this.inputs[i] === undefined) {
                break;
                haveInput = false;
            }
            this.states[i] = simulate(this.states[i - 1], this.inputs[i]);
        }
        if (this.inputs[this.tick] === undefined) {
            haveInput = false;
        }
        if (!haveInput) return;
        if (this.states[this.tick - 1] === undefined || this.inputs[this.tick] === undefined) return;
        this.states[this.tick] = simulate(this.states[this.tick - 1], this.inputs[this.tick])
        clientReceive(this.states[this.tick].player)
        this.minTick = this.tick;
    }

    lagUpdate() {
        let time = getLag();
        setTimeout(() => {
            this.update()
        }, time);
    }

    start() {
        this.interval = setInterval(this.lagUpdate.bind(this), 1000 / serverTick)
    }
    reset() {
        clearInterval(this.interval)
        this.interval = setInterval(this.lagUpdate.bind(this), 1000 / serverTick)
    }
}
const server = new Server();
server.start()

function getLag() {
    let diff = lagRange[1] - lagRange[0];
    return lagRange[0] + Math.floor(Math.random() * diff);
}


function clientReceive(serverPos) {
    pos = serverPos;
}