const COLORS = {
    "SELECT": "#3d7dff",
    "HIGHLIGHT": "#c251ff",
    "FOCUS": "#ff7700",
    "OUTLINE": "#101010",
    "PITCH": "#0b6623",
    "CHALK": "#ededed",
    "FREEDRAWING": "#d866e3",
    [Type.BLUDGER]: "#202020",
    [Type.QUAFFLE]: "#efefef",
    [Team.LEFT]: "#1c36cc",
    [Team.RIGHT]: "#c41116",
    [Team.NONE]: "#ffd400",
    [Role.BEATER]: "#202020",
    [Role.CHASER]: "#cecece",
    [Role.KEEPER]: "#50c910",
    [Role.SEEKER]: "#ffed00",
    [Role.SNITCH]: "#ffd400"
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
    ctx.lineTo(middle[0], total_width);
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
    // Interaction
    if (player.selected || player.highlighted || player.focused) {
        ctx.beginPath();
        ctx.fillStyle = player.focused ? COLORS["FOCUS"] : (player.selected ? COLORS["SELECT"] : COLORS["HIGHLIGHT"]);
        ctx.arc(player.x * zoom, player.y * zoom, zoom, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Outer line
    ctx.beginPath();
    ctx.fillStyle = COLORS["OUTLINE"];
    ctx.arc(player.x * zoom, player.y * zoom, 0.8 * zoom, 0, 2 * Math.PI);
    ctx.fill();

    // Role
    ctx.beginPath();
    ctx.fillStyle = COLORS[player.role];
    ctx.arc(player.x * zoom, player.y * zoom, 0.7 * zoom, 0, 2 * Math.PI);
    ctx.fill();

    // Team
    ctx.beginPath();
    ctx.fillStyle = COLORS[player.team];
    ctx.arc(player.x * zoom, player.y * zoom, 0.5 * zoom, 0, 2 * Math.PI);
    ctx.fill();

    // Bar
    if (player.onBroom) {
        ctx.fillStyle = COLORS[player.role];
        ctx.fillRect((player.x - 0.55) * zoom, (player.y - 0.3) * zoom, 1.1 * zoom, 0.25 * zoom);
    }

    // Identity indicator
    if (isOnPitch(player)) {
        if (drawPlayer.identity[player.team][player.role] === undefined) {
            drawPlayer.identity[player.team][player.role] = 0;
        }
        else {
            drawPlayer.identity[player.team][player.role]++;
        }
        ctx.fillStyle = COLORS[player.team];
        if (drawPlayer.identity[player.team][player.role] % 2 === 1) {
            ctx.beginPath();
            ctx.arc(player.x * zoom, (player.y + 0.5) * zoom, 0.15 * zoom, 0, 2 * Math.PI);
            ctx.fill();
        }
        if (drawPlayer.identity[player.team][player.role] > 1) {
            for (let side of [-1, 1]) {
                ctx.beginPath();
                ctx.arc((player.x + side * 0.3) * zoom, (player.y + 0.4) * zoom, 0.15 * zoom, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
};

let drawBall = function(ball) {
    // Interaction
    if (ball.selected || ball.highlighted || ball.focused) {
        ctx.beginPath();
        ctx.fillStyle = ball.focused ? COLORS["FOCUS"] : (ball.selected ? COLORS["SELECT"] : COLORS["HIGHLIGHT"]);
        ctx.arc(ball.x * zoom, ball.y * zoom, 0.65 * zoom, 0, 2 * Math.PI);
        ctx.fill();
    }

    // Outer line
    ctx.beginPath();
    ctx.fillStyle = COLORS["OUTLINE"];
    ctx.arc(ball.x * zoom, ball.y * zoom, 0.5 * zoom, 0, 2 * Math.PI);
    ctx.fill();

    // Type
    ctx.beginPath();
    ctx.fillStyle = COLORS[ball.type];
    ctx.arc(ball.x * zoom, ball.y * zoom, 0.35 * zoom, 0, 2 * Math.PI);
    ctx.fill();
};

let drawInterface = function() {
    // Buttons background
    ctx.fillStyle = COLORS["CHALK"];
    ctx.fillRect(userInterface.stepBtn.x * zoom, userInterface.stepBtn.y * zoom, userInterface.stepBtn.w * zoom, userInterface.stepBtn.h * zoom);
    ctx.fillRect(userInterface.saveFrameBtn.x * zoom, userInterface.saveFrameBtn.y * zoom, userInterface.saveFrameBtn.w * zoom, userInterface.saveFrameBtn.h * zoom);
    ctx.fillRect(userInterface.removeFrameBtn.x * zoom, userInterface.removeFrameBtn.y * zoom, userInterface.removeFrameBtn.w * zoom, userInterface.removeFrameBtn.h * zoom);

    // Buttons foreground
    ctx.fillStyle = COLORS["OUTLINE"];
    ctx.strokeStyle = COLORS["OUTLINE"];
    // Step button
    ctx.beginPath();
    ctx.moveTo((userInterface.stepBtn.x + userInterface.padding) * zoom, (userInterface.stepBtn.y + userInterface.padding) * zoom);
    ctx.lineTo((userInterface.stepBtn.x + userInterface.padding) * zoom, (userInterface.stepBtn.y + userInterface.stepBtn.h - userInterface.padding) * zoom);
    ctx.lineTo((userInterface.stepBtn.x + userInterface.stepBtn.w - userInterface.padding) * zoom, (userInterface.stepBtn.y + 0.5 * userInterface.stepBtn.h) * zoom);
    ctx.fill();
    // Save Frame button
    ctx.beginPath();
    ctx.lineWidth = 0.15 * userInterface.saveFrameBtn.h * zoom;
    ctx.moveTo((userInterface.saveFrameBtn.x + userInterface.padding) * zoom, (userInterface.saveFrameBtn.y + 0.5 * userInterface.saveFrameBtn.h) * zoom);
    ctx.lineTo((userInterface.saveFrameBtn.x + userInterface.saveFrameBtn.w - userInterface.padding) * zoom, (userInterface.saveFrameBtn.y + 0.5 * userInterface.saveFrameBtn.h) * zoom);
    ctx.moveTo((userInterface.saveFrameBtn.x + 0.5 * userInterface.saveFrameBtn.w) * zoom, (userInterface.saveFrameBtn.y + userInterface.padding) * zoom);
    ctx.lineTo((userInterface.saveFrameBtn.x + 0.5 * userInterface.saveFrameBtn.w) * zoom, (userInterface.saveFrameBtn.y + userInterface.saveFrameBtn.h - userInterface.padding) * zoom);
    ctx.stroke();
    // Remove Frame button
    ctx.beginPath();
    ctx.lineWidth = 0.15 * userInterface.removeFrameBtn.h * zoom;
    ctx.moveTo((userInterface.removeFrameBtn.x + userInterface.padding) * zoom, (userInterface.removeFrameBtn.y + 0.5 * userInterface.removeFrameBtn.h) * zoom);
    ctx.lineTo((userInterface.removeFrameBtn.x + userInterface.removeFrameBtn.w - userInterface.padding) * zoom, (userInterface.removeFrameBtn.y + 0.5 * userInterface.removeFrameBtn.h) * zoom);
    ctx.stroke();

    // Frames
    ctx.strokeStyle = COLORS["CHALK"];
    for (let i = 0; i < userInterface.frames.length; i++) {
        ctx.fillStyle = COLORS["CHALK"];
        ctx.beginPath();
        let x = userInterface.framesDisplay.x + 0.5 * userInterface.frameBtn.w + i * userInterface.frameBtn.w;
        let y = userInterface.framesDisplay.y + 0.5 * userInterface.frameBtn.h;
        ctx.arc(x * zoom, y * zoom, 0.3 * userInterface.frameBtn.w * zoom, 0, 2 * Math.PI);
        ctx.fill();

        if (i < userInterface.frames.length - 1) {
            ctx.beginPath();
            ctx.lineWidth = 0.15 * userInterface.frameBtn.w * zoom;
            ctx.moveTo(x * zoom, y * zoom);
            ctx.lineTo((x + userInterface.frameBtn.w) * zoom, y * zoom);
            ctx.stroke();
        }

        if (userInterface.activeFrame === i) {
            ctx.fillStyle = COLORS["OUTLINE"];
            ctx.beginPath();
            ctx.arc(x * zoom, y * zoom, 0.15 * userInterface.frameBtn.w * zoom, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    // Shortcuts
    let i = 0;
    for (let shortcut of [{key: "M", txt: "ove"}, {key: "T", txt: "hrow"}, {key: "P", txt: "ass"}, {key: "B", txt: "eat"}, {key: "D", txt: "ie"}, {key: "L", txt: "ive"}]) {
        ctx.fillStyle = shortcuts[shortcut.key.toLowerCase()] ? COLORS["FOCUS"] : COLORS["OUTLINE"];
        ctx.font = "bold " + userInterface.shortcutsDisplay.h * zoom + "px Arial";
        let calculatedWidth = ctx.measureText(shortcut.key).width;
        ctx.fillText(shortcut.key, (userInterface.shortcutsDisplay.x + i * userInterface.shortcutsDisplay.w) * zoom, (userInterface.shortcutsDisplay.y + userInterface.shortcutsDisplay.h) * zoom);
        ctx.fillStyle = COLORS["OUTLINE"];
        ctx.font = 0.6 * userInterface.shortcutsDisplay.h * zoom + "px Arial";
        ctx.fillText(shortcut.txt, (userInterface.shortcutsDisplay.x + i * userInterface.shortcutsDisplay.w) * zoom + calculatedWidth, (userInterface.shortcutsDisplay.y + userInterface.shortcutsDisplay.h) * zoom);
        i++;
    }

    // Feed
    ctx.font = userInterface.feedDisplay.h * zoom + "px Arial";
    ctx.fillText(userInterface.feed, total_length - ctx.measureText(userInterface.feed).width - zoom, (userInterface.feedDisplay.y + userInterface.feedDisplay.h) * zoom);

    // Free Drawing
    ctx.fillStyle = COLORS["FREEDRAWING"];
    for (let pixel of drawnPixels) {
        ctx.fillRect(pixel[0], pixel[1], 1, 1);
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

    drawPlayer.identity = {[Team.LEFT]: {}, [Team.RIGHT]: {}, [Team.NONE]: {}};
    for (let i = 0; i < userInterface.frames[userInterface.activeFrame].players.length; i++) {
        let activePlayerState = userInterface.frames[userInterface.activeFrame].players[i];
        let drawnPlayer = activePlayerState.clone(false);
        if (activePlayerState === selected) {
            drawnPlayer.selected = true;
        }
        if (activePlayerState === highlighted) {
            drawnPlayer.highlighted = true;
        }
        if (activePlayerState === focused) {
            drawnPlayer.focused = true;
        }
        if (userInterface.animationEnd >= currentTime) {
            previousPlayerState = userInterface.frames[mod(userInterface.activeFrame - 1, userInterface.frames.length)].players[i];
            if (previousPlayerState !== undefined) {
                let t = 1 - ((userInterface.animationEnd - currentTime) / userInterface.animationLength);
                let [x, y] = lerpPosition(activePlayerState.x, activePlayerState.y, previousPlayerState.x, previousPlayerState.y, t);
                drawnPlayer.x = x;
                drawnPlayer.y = y;
            }
        }
        drawPlayer(drawnPlayer);
    }

    for (let i = 0; i < userInterface.frames[userInterface.activeFrame].balls.length; i++) {
        let activeBallState = userInterface.frames[userInterface.activeFrame].balls[i];
        let drawnBall = activeBallState.clone(false);
        if (activeBallState === selected || (activeBallState.holder !== undefined && activeBallState.holder !== null && activeBallState.holder === selected)) {
            drawnBall.selected = true;
        }
        if (activeBallState === highlighted) {
            drawnBall.highlighted = true;
        }
        if (userInterface.animationEnd >= currentTime) {
            previousBallState = userInterface.frames[mod(userInterface.activeFrame - 1, userInterface.frames.length)].balls[i];
            if (previousBallState !== undefined) {
                let t = 1 - ((userInterface.animationEnd - currentTime) / userInterface.animationLength);
                let [x, y] = lerpPosition(activeBallState.x, activeBallState.y, previousBallState.x, previousBallState.y, t);
                drawnBall.x = x;
                drawnBall.y = y;
            }
        }
        drawBall(drawnBall);
    }
};

setInterval(draw, 50);