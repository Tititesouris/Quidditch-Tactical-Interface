const COLORS = {
    "HIGHLIGHT": "#a723ff",
    "FOCUS": "#ff7700",
    "OUTLINE": "#101010",
    "PITCH": "#0b6623",
    "CHALK": "#ededed",
    10000: "#202020",
    20000: "#efefef",
    1000: "#1c36cc",
    2000: "#c41116",
    100: "#121212",
    200: "#cecece",
    300: "#50c910",
    400: "#ffed00",
};

let zoom = 10;
let line = DIMENSIONS["LINE"] * zoom;
let total_length = DIMENSIONS["TOTAL_LENGTH"] * zoom;
let total_width = DIMENSIONS["TOTAL_WIDTH"] * zoom;
let length = DIMENSIONS["LENGTH"] * zoom;
let width = DIMENSIONS["WIDTH"] * zoom;
let middle = [POSITION["MIDDLE"][0] * zoom, POSITION["MIDDLE"][1] * zoom];
ctx.canvas.width  = total_length;
ctx.canvas.height = total_width;

let drawPitch = function() {
    ctx.fillStyle = COLORS["PITCH"];
    ctx.fillRect(0, 0, total_length, total_width);
    ctx.strokeStyle = COLORS["CHALK"];

    // Thick lines
    ctx.lineWidth = line;

    // Middle line
    ctx.beginPath();
    ctx.moveTo(middle[0], middle[1] - 0.5 * width);
    ctx.lineTo(middle[0], middle[1] + 0.5 * width);
    ctx.stroke();

    // Thin lines
    ctx.lineWidth = 0.5 * line;

    // Penalty area separation
    ctx.beginPath();
    ctx.setLineDash([0.5 * zoom, 0.5 * zoom]);
    ctx.moveTo(middle[0], total_width - 5.5 * zoom);
    ctx.lineTo(middle[0], total_width);;
    ctx.stroke();
    ctx.setLineDash([]);

    for (let side of [-1, 1]) {
        // Thick lines
        ctx.lineWidth = line;

        // Vertical outer lines
        ctx.beginPath();
        ctx.moveTo(middle[0] + side * 0.5 * length, middle[1] - 0.5 * width);
        ctx.lineTo(middle[0] + side * 0.5 * length, middle[1] + 0.5 * width);
        ctx.stroke();
        // Horizontal outer lines
        ctx.beginPath();
        ctx.moveTo(middle[0] - 0.5 * length, middle[1] + side * 0.5 * width);
        ctx.lineTo(middle[0] + 0.5 * length, middle[1] + side * 0.5 * width);
        ctx.stroke();

        // Keeper zone lines
        ctx.beginPath();
        ctx.setLineDash([zoom, zoom]);
        ctx.moveTo(middle[0] + side * 11 * zoom, middle[1] - 0.5 * width);
        ctx.lineTo(middle[0] + side * 11 * zoom, middle[1] + 0.5 * width);
        ctx.stroke();
        ctx.setLineDash([]);

        // Thin lines
        ctx.lineWidth = 0.5 * line;

        // Penalty areas
        ctx.beginPath();
        ctx.moveTo(middle[0] + side * 5.5 * zoom, total_width - 5.5 * zoom);
        ctx.lineTo(middle[0] + side * 5.5 * zoom, total_width);
        ctx.lineTo(middle[0], total_width);
        ctx.stroke();

        // Substitution areas and team benches
        ctx.beginPath();
        ctx.moveTo(middle[0] + side * 11 * zoom, total_width - 5.5 * zoom);
        ctx.lineTo(middle[0] + side * 11 * zoom, total_width);
        ctx.lineTo(middle[0] + side * 30 * zoom, total_width);
        ctx.lineTo(middle[0] + side * 30 * zoom, total_width - 5.5 * zoom);
        ctx.stroke();
        ctx.beginPath();
        ctx.setLineDash([0.5 * zoom, 0.25 * zoom]);
        ctx.moveTo(middle[0] + side * 11 * zoom, total_width - 2.75 * zoom);
        ctx.lineTo(middle[0] + side * 30 * zoom, total_width - 2.75 * zoom);
        ctx.stroke();
        ctx.setLineDash([]);

        // Hoops
        for (let hoop = 0; hoop < 3; hoop++) {
            ctx.beginPath();
            ctx.arc(middle[0] + side * 16.5 * zoom, middle[1] + (hoop - 1) * 2.34 * zoom, 0.55 * zoom, 0, 2 * Math.PI);
            ctx.stroke();
        }
    }

};

let drawPlayer = function(player) {
    if (player.highlighted || player.focused) {
        ctx.beginPath();
        ctx.fillStyle = player.highlighted ? COLORS["HIGHLIGHT"] : COLORS["FOCUS"];
        ctx.arc(player.x * zoom, player.y * zoom, zoom, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.beginPath();
    ctx.fillStyle = COLORS[player.role];
    ctx.arc(player.x * zoom, player.y * zoom, 0.75 * zoom, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = COLORS[player.team];
    ctx.arc(player.x * zoom, player.y * zoom, 0.5 * zoom, 0, 2 * Math.PI);
    ctx.fill();
};

let drawBall = function(ball) {
    if (ball.highlighted) {
        ctx.beginPath();
        ctx.fillStyle = COLORS["HIGHLIGHT"];
        ctx.arc(ball.x * zoom, ball.y * zoom, 0.65 * zoom, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.beginPath();
    ctx.fillStyle = COLORS["OUTLINE"];
    ctx.arc(ball.x * zoom, ball.y * zoom, 0.5 * zoom, 0, 2 * Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.fillStyle = COLORS[ball.type];
    ctx.arc(ball.x * zoom, ball.y * zoom, 0.35 * zoom, 0, 2 * Math.PI);
    ctx.fill();
};

let drawInterface = function() {
    // Buttons background
    ctx.fillStyle = COLORS["CHALK"];
    ctx.fillRect(interface.stepBtn.x * zoom, interface.stepBtn.y * zoom, interface.stepBtn.w * zoom, interface.stepBtn.h * zoom);
    ctx.fillRect(interface.saveFrameBtn.x * zoom, interface.saveFrameBtn.y * zoom, interface.saveFrameBtn.w * zoom, interface.saveFrameBtn.h * zoom);
    ctx.fillRect(interface.removeFrameBtn.x * zoom, interface.removeFrameBtn.y * zoom, interface.removeFrameBtn.w * zoom, interface.removeFrameBtn.h * zoom);

    // Buttons foreground
    ctx.fillStyle = COLORS["OUTLINE"];
    ctx.strokeStyle = COLORS["OUTLINE"];
    // Step button
    ctx.beginPath();
    ctx.moveTo((interface.stepBtn.x + interface.padding) * zoom, (interface.stepBtn.y + interface.padding) * zoom);
    ctx.lineTo((interface.stepBtn.x + interface.padding) * zoom, (interface.stepBtn.y + interface.stepBtn.h - interface.padding) * zoom);
    ctx.lineTo((interface.stepBtn.x + interface.stepBtn.w - interface.padding) * zoom, (interface.stepBtn.y + 0.5 * interface.stepBtn.h) * zoom);
    ctx.fill();
    // Save Frame button
    ctx.beginPath();
    ctx.lineWidth = 0.15 * interface.saveFrameBtn.h * zoom;
    ctx.moveTo((interface.saveFrameBtn.x + interface.padding) * zoom, (interface.saveFrameBtn.y + 0.5 * interface.saveFrameBtn.h) * zoom);
    ctx.lineTo((interface.saveFrameBtn.x + interface.saveFrameBtn.w - interface.padding) * zoom, (interface.saveFrameBtn.y + 0.5 * interface.saveFrameBtn.h) * zoom);
    ctx.moveTo((interface.saveFrameBtn.x + 0.5 * interface.saveFrameBtn.w) * zoom, (interface.saveFrameBtn.y + interface.padding) * zoom);
    ctx.lineTo((interface.saveFrameBtn.x + 0.5 * interface.saveFrameBtn.w) * zoom, (interface.saveFrameBtn.y + interface.saveFrameBtn.h - interface.padding) * zoom);
    ctx.stroke();
    // Remove Frame button
    ctx.beginPath();
    ctx.lineWidth = 0.15 * interface.removeFrameBtn.h * zoom;
    ctx.moveTo((interface.removeFrameBtn.x + interface.padding) * zoom, (interface.removeFrameBtn.y + 0.5 * interface.removeFrameBtn.h) * zoom);
    ctx.lineTo((interface.removeFrameBtn.x + interface.removeFrameBtn.w - interface.padding) * zoom, (interface.removeFrameBtn.y + 0.5 * interface.removeFrameBtn.h) * zoom);
    ctx.stroke();

    // Frames
    ctx.strokeStyle = COLORS["CHALK"];
    for (let i = 0; i < interface.frames.length; i++) {
        ctx.fillStyle = COLORS["CHALK"];
        ctx.beginPath();
        let x = interface.framesDisplay.x + 0.5 * interface.frameBtn.w + i * interface.frameBtn.w;
        let y = interface.framesDisplay.y + 0.5 * interface.frameBtn.h;
        ctx.arc(x * zoom, y * zoom, 0.3 * interface.frameBtn.w * zoom, 0, 2 * Math.PI);
        ctx.fill();

        if (i < interface.frames.length - 1) {
            ctx.beginPath();
            ctx.lineWidth = 0.15 * interface.frameBtn.w * zoom;
            ctx.moveTo(x * zoom, y * zoom);
            ctx.lineTo((x + interface.frameBtn.w) * zoom, y * zoom);
            ctx.stroke();
        }

        if (interface.activeFrame === i) {
            ctx.fillStyle = COLORS["OUTLINE"];
            ctx.beginPath();
            ctx.arc(x * zoom, y * zoom, 0.15 * interface.frameBtn.w * zoom, 0, 2 * Math.PI);
            ctx.fill();
        }
    }
};

let lastDraw = new Date().getTime();

let lerpPosition = function(xA, yA, xB, yB, t) {
    return [xA * t + xB * (1 - t), yA * t + yB * (1 - t)];
};

let mod = function(n, m) {
    return ((n % m) + m) % m;
};

let draw = function() {
    let currentTime = new Date().getTime();
    let deltaTime = currentTime - lastDraw;
    lastDraw = currentTime;

    zoom = Math.min(window.innerHeight / 44, window.innerWidth / 66);
    line = DIMENSIONS["LINE"] * zoom;
    total_length = DIMENSIONS["TOTAL_LENGTH"] * zoom;
    total_width = DIMENSIONS["TOTAL_WIDTH"] * zoom;
    length = DIMENSIONS["LENGTH"] * zoom;
    width = DIMENSIONS["WIDTH"] * zoom;
    middle = [POSITION["MIDDLE"][0] * zoom, POSITION["MIDDLE"][1] * zoom];
    ctx.canvas.width  = total_length;
    ctx.canvas.height = total_width;

    drawPitch();
    drawInterface();

    for (let i = 0; i < interface.frames[interface.activeFrame].players.length; i++) {
        let activePlayerState = interface.frames[interface.activeFrame].players[i];
        let drawnPlayer = activePlayerState.clone(false);
        if (activePlayerState === highlighted) {
            drawnPlayer.highlighted = true;
        }
        if (activePlayerState === focused) {
            drawnPlayer.focused = true;
        }
        if (interface.animationEnd >= currentTime) {
            previousPlayerState = interface.frames[mod(interface.activeFrame - 1, interface.frames.length)].players[i];
            let t = 1 - ((interface.animationEnd - currentTime) / interface.animationLength);
            let [x, y] = lerpPosition(activePlayerState.x, activePlayerState.y, previousPlayerState.x, previousPlayerState.y, t);
            drawnPlayer.x = x;
            drawnPlayer.y = y;
        }
        drawPlayer(drawnPlayer);
    }

    for (let i = 0; i < interface.frames[interface.activeFrame].balls.length; i++) {
        let activeBallState = interface.frames[interface.activeFrame].balls[i];
        let drawnBall = activeBallState.clone(false);
        if (activeBallState === highlighted) {
            drawnBall.highlighted = true;
        }
        if (interface.animationEnd >= currentTime) {
            previousBallState = interface.frames[mod(interface.activeFrame - 1, interface.frames.length)].balls[i];
            let t = 1 - ((interface.animationEnd - currentTime) / interface.animationLength);
            let [x, y] = lerpPosition(activeBallState.x, activeBallState.y, previousBallState.x, previousBallState.y, t);
            drawnBall.x = x;
            drawnBall.y = y;
        }
        drawBall(drawnBall);
    }
};

setInterval(draw, 50);