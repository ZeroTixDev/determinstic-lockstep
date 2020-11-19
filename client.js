const canvas = document.createElement("canvas")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d")
document.body.appendChild(canvas)
let pos = {
    x: 50,
    y: 50
}
let currentInput = new Input()
let interpolation = true;
let information = true;
let states = [{
    player: {
        x: 50,
        y: 50
    }
}]
let inputs = [];
let lookServer = true;
let tick = 0;
window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})
ctx.textAlign = "center"
const animate = (now) => {
    tick++;
    inputs[tick] = currentInput.copy()
    send({
        input: currentInput.copy(),
        tick
    })
    states[tick] = simulate(states[tick - 1], inputs[tick])
    ctx.fillStyle = "rgba(255,255,255,1)";
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.font = "25px 'Nunito', Helvetica, Arial"
    ctx.fillStyle = "rgb(30,30,30)"
    ctx.beginPath()
    ctx.arc(states[tick].player.x, states[tick].player.y, 25, 0, Math.PI * 2);
    ctx.fill()
    ctx.fillText("Client", states[tick].player.x, states[tick].player.y - 35)
    if (lookServer) {
        ctx.fillStyle = "rgb(190,20,20)"
        ctx.beginPath()
        ctx.arc(pos.x, pos.y, 25, 0, Math.PI * 2);
        ctx.fill()
        ctx.fillText("Server", pos.x, pos.y - 35)
    }
    ctx.fillStyle = "black"
    ctx.fillText("Tick rate: " + serverTick, canvas.width / 2, 30)
    ctx.font = "15px 'Nunito', Helvetica, Arial"
    ctx.fillText("z and x to change tick rate (500-1000 ms of artifical lag)", canvas.width / 2 + 300, 30)
    requestAnimationFrame(animate)
}
window.addEventListener("keydown", (event) => {
    if (event.repeat) return;
    const keyCode = event.keyCode;
    if (keyCode === 87 || keyCode === 38) {
        currentInput.up = true;
    } else if (keyCode === 83 || keyCode === 40) {
        currentInput.down = true;
    } else if (keyCode === 65 || keyCode === 37) {
        currentInput.left = true;
    } else if (keyCode === 68 || keyCode === 39) {
        currentInput.right = true;
    }
})
window.addEventListener("keyup", (event) => {
    if (event.repeat) return;
    const keyCode = event.keyCode;
    if (keyCode === 87 || keyCode === 38) {
        currentInput.up = false;
    } else if (keyCode === 83 || keyCode === 40) {
        currentInput.down = false;
    } else if (keyCode === 65 || keyCode === 37) {
        currentInput.left = false;
    } else if (keyCode === 68 || keyCode === 39) {
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
    server.receive(object);
}