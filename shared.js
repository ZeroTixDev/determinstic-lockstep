const vel = 5;
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
    copy() {
        return new Input({
            up: this.up,
            down: this.down,
            left: this.left,
            right: this.right
        })
    }
}

function simulate(state, input) {
    let newState = state;
    if (input.up) {
        newState.player.y -= vel;
    }
    if (input.down) {
        newState.player.y += vel;
    }
    if (input.left) {
        newState.player.x -= vel;
    }
    if (input.right) {
        newState.player.x += vel;
    }
    return newState;
}