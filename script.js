// Dimensions in meters
const DIMENSIONS = {
    "LINE": 0.1,
    "TOTAL_LENGTH": 66,
    "TOTAL_WIDTH": 44,
    "WIDTH": 33,
    "LENGTH": 60,
};

// Positions in meters with origin in top-left corner
const POSITION = {
    "MIDDLE": [0.5 * DIMENSIONS["TOTAL_LENGTH"], 0.5 * DIMENSIONS["TOTAL_WIDTH"]]
}


const Type = {
    BLUDGER: 10000,
    QUAFFLE: 20000
}

const Team = {
    LEFT: 1000,
    RIGHT: 2000,
    NONE: 3000
};

const Role = {
    BEATER: 100, // 2
    CHASER: 200, // 3
    KEEPER: 300, // 1
    SEEKER: 400, // 1
    SNITCH: 500
};

let canvas = document.getElementById("pitch");
let ctx = canvas.getContext("2d");

let indexInArray = function (object, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === object) {
            return i;
        }
    }
    return -1;
};

let isOnPitch = function (player) {
    return POSITION["MIDDLE"][0] - 0.5 * DIMENSIONS["LENGTH"] <= player.x && player.x <= POSITION["MIDDLE"][0] + 0.5 * DIMENSIONS["LENGTH"] && POSITION["MIDDLE"][1] - 0.5 * DIMENSIONS["WIDTH"] <= player.y && player.y <= POSITION["MIDDLE"][1] + 0.5 * DIMENSIONS["WIDTH"];
};

let Interface = function () {
    this.frames = [];
    this.feed = "";
    this.activeFrame = -1;
    this.animationEnd = 0;
    this.animationLength = 1500;
    this.margin = 0.25;
    this.padding = 0.25;
    this.uiHeight = 2
    this.stepBtn = {x: this.margin, y: this.margin, w: 2, h: this.uiHeight};
    this.frameBtn = {w: 1.5, h: this.uiHeight};
    this.framesDisplay = {x: this.stepBtn.x + this.stepBtn.w + this.margin, y: this.margin, w: 0, h: this.frameBtn.h};
    this.saveFrameBtn = {
        x: this.framesDisplay.x + this.framesDisplay.w + this.margin,
        y: this.margin,
        w: this.stepBtn.w,
        h: this.uiHeight
    };
    this.removeFrameBtn = {
        x: this.saveFrameBtn.x + this.saveFrameBtn.w + this.margin,
        y: this.margin,
        w: this.stepBtn.w,
        h: this.uiHeight
    };
    this.shortcutsDisplay = {x: this.margin, y: this.uiHeight + this.margin, w: 2.5 * this.stepBtn.w, h: this.uiHeight};
    this.feedDisplay = {y: this.uiHeight + 2 * this.margin, h: 0.5 * this.uiHeight};

    this.nextFrame = function () {
        this.activeFrame = (this.activeFrame + 1) % this.frames.length;
        this.animationEnd = new Date().getTime() + this.animationLength;
    };
    this.goToFrame = function (frame) {
        this.activeFrame = frame;
        this.animationEnd = 0;
    };
    this.saveFrame = function () {
        attachedBalls = [];
        clonedBalls = [];
        newPlayers = [];
        for (let i = 0; i < this.frames[this.activeFrame].players.length; i++) {
            let cloned = this.frames[this.activeFrame].players[i].clone();
            if (cloned.attached !== undefined && cloned.attached !== null) {
                attachedBalls.push(this.frames[this.activeFrame].players[i].attached);
                clonedBalls.push(cloned.attached);
            }
            newPlayers.push(cloned);
        }
        newBalls = [];
        for (let i = 0; i < this.frames[this.activeFrame].balls.length; i++) {
            let indexBall = indexInArray(this.frames[this.activeFrame].balls[i], attachedBalls);
            if (indexBall === -1) {
                newBalls[i] = this.frames[this.activeFrame].balls[i].clone(false);
            } else {
                newBalls[i] = clonedBalls[indexBall];
            }
        }
        this.addFrame(newPlayers, newBalls);
    };
    this.addFrame = function (players, balls) {
        this.frames.splice(this.activeFrame + 1, 0, {players: players, balls: balls});
        this.activeFrame++;
        this.framesDisplay.w += this.frameBtn.w;
        this.saveFrameBtn.x = this.framesDisplay.x + this.framesDisplay.w + this.margin;
        this.removeFrameBtn.x = this.saveFrameBtn.x + this.saveFrameBtn.w + this.margin;
    };
    this.removeFrame = function () {
        if (this.frames.length > 1) {
            this.frames.splice(this.activeFrame, 1);
            if (this.activeFrame >= this.frames.length) {
                this.activeFrame--;
            }
            this.framesDisplay.w -= this.frameBtn.w;
            this.saveFrameBtn.x = this.framesDisplay.x + this.framesDisplay.w + this.margin;
            this.removeFrameBtn.x = this.saveFrameBtn.x + this.saveFrameBtn.w + this.margin;
        }
    };
};

let Player = function (x, y, team, role, onBroom = true) {
    this.x = x;
    this.y = y;
    this.team = team;
    this.role = role;
    this.onBroom = onBroom;
};
Player.prototype.clone = function (withAttached = true) {
    let player = new Player(this.x, this.y, this.team, this.role, this.onBroom);
    if (withAttached && this.attached !== undefined && this.attached !== null) {
        player.attached = this.attached.clone(false);
        player.attached.holder = player;
    }
    return player;
};
Player.prototype.identity = function () {
    return (this.team === 1000 ? "Blue" : "Red") + " " + (this.role === 100 ? "Beater" : (this.role === 200 ? "Chaser" : (this.role === 300 ? "Keeper" : "Seeker")));
};

let Ball = function (x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
};
Ball.prototype.clone = function (withHolder = true) {
    let ball = new Ball(this.x, this.y, this.type);
    if (withHolder && this.holder !== undefined && this.holder !== null) {
        ball.holder = this.holder.clone(false);
        ball.holder.attached = ball;
    }
    return ball;
}
Ball.prototype.identity = function () {
    return this.type === Type.BLUDGER ? "Bludger" : "Quaffle";
};

let defaultBalls = [];
for (let iBall = -1; iBall < 2; iBall++) {
    let type = iBall % 2 ? Type.BLUDGER : Type.QUAFFLE;
    defaultBalls.push(new Ball(POSITION["MIDDLE"][0] + iBall * 11, POSITION["MIDDLE"][1], type));
}
defaultBalls.push(new Ball(POSITION["MIDDLE"][0], POSITION["MIDDLE"][1] + 8.25, Type.BLUDGER));

let defaultPlayers = [];

for (let side of [-1, 1]) {
    let team = side === -1 ? Team.LEFT : Team.RIGHT;
    for (let iPlayer = 0; iPlayer < 7; iPlayer++) {
        let role = iPlayer < 2 ? Role.BEATER : (
            iPlayer < 5 ? Role.CHASER : (
                iPlayer < 6 ? Role.KEEPER :
                    Role.SEEKER
            )
        );
        let x = POSITION["MIDDLE"][0] + side * (13 + 2.5 * iPlayer);
        let y = DIMENSIONS["TOTAL_WIDTH"] - 4.25;
        defaultPlayers.push(new Player(x, y, team, role));
    }
}

/* STARTING LINEUP
for (let side of [-1, 1]) {
    let team = side === -1 ? Team.LEFT : Team.RIGHT;
    defaultPlayers.push(new Player(POSITION["MIDDLE"][0] + side, POSITION["MIDDLE"][1] + 8.25, team, Role.KEEPER));
    defaultPlayers.push(new Player(POSITION["MIDDLE"][0] + side, POSITION["MIDDLE"][1] + 16.5, team, Role.BEATER));
    defaultPlayers.push(new Player(POSITION["MIDDLE"][0] + side * 5.5, POSITION["MIDDLE"][1] + 16.5, team, Role.CHASER));
    defaultPlayers.push(new Player(POSITION["MIDDLE"][0] - side * 8, POSITION["MIDDLE"][1] + 16.5, team, Role.CHASER));
    defaultPlayers.push(new Player(POSITION["MIDDLE"][0] + side * 11, POSITION["MIDDLE"][1] + 16.5, team, Role.BEATER));
    defaultPlayers.push(new Player(POSITION["MIDDLE"][0] + side * 16.5, POSITION["MIDDLE"][1] + 16.5, team, Role.CHASER));
    defaultPlayers.push(new Player(POSITION["MIDDLE"][0] + side, DIMENSIONS["TOTAL_WIDTH"] - 3, team, Role.SEEKER));
}
defaultPlayers.push(new Player(POSITION["MIDDLE"][0], DIMENSIONS["TOTAL_WIDTH"], Team.NONE, Role.SNITCH));
*/

let interface = new Interface();
interface.addFrame(defaultPlayers, defaultBalls);

let drawnPixels = [];

let mouseDown = false;
let clicked = null;
let selected = null;
let dragged = null;
let highlighted = null;
let focused = null;
let shortcuts = {};

let isInRect = function (x, y, rect) {
    return rect.x <= x && x <= rect.x + rect.w && rect.y <= y && y <= rect.y + rect.h;
};

let getClosestAnimate = function (x, y) {
    let closest = null;
    let minDistance = 1.5;
    let animates = interface.frames[interface.activeFrame].balls.concat(interface.frames[interface.activeFrame].players);
    for (let i = 0; i < animates.length; i++) {
        let animate = animates[i];
        if (animate !== dragged) {
            let distance = Math.hypot(animate.x - x, animate.y - y);
            if (distance <= minDistance) {
                closest = animate;
                minDistance = distance;
            }
        }
    }
    return closest;
};

let getMeterCoordinates = function (e) {
    let rect = canvas.getBoundingClientRect();
    let x = parseInt(e.clientX - rect.left) / zoom;
    let y = parseInt(e.clientY - rect.top) / zoom;
    x = Math.min(Math.max(x, 0), DIMENSIONS["TOTAL_LENGTH"]);
    y = Math.min(Math.max(y, 0), DIMENSIONS["TOTAL_WIDTH"]);
    return [x, y];
};

let animateMoveTo = function (animate, x, y) {
    animate.x = x;
    animate.y = y;
    if (animate.attached !== undefined && animate.attached !== null) {
        animate.attached.x = animate.x;
        animate.attached.y = animate.y + 0.75;
    }
};

let animateCatch = function (animate, caught) {
    let hadBall = animateDrop(animate);
    animate.attached = caught;
    caught.holder = animate;
    animateMoveTo(animate, animate.x, animate.y);
    return hadBall;
};

let animateDrop = function (animate) {
    if (animate.attached !== undefined && animate.attached !== null) {
        animate.attached.holder = null;
        animateMoveTo(animate.attached, animate.x, animate.y - 1.3);
        animate.attached = null;
        return true;
    }
    return false;
};

let animateDie = function (animate) {
    animate.onBroom = false;
    if (animateDrop(animate)) {
        return true;
    }
    return false;
};

let updateSelection = function (x, y) {
    let closest = getClosestAnimate(x, y);
    if (dragged === null) {
        highlighted = closest;
        focused = null;
    } else {
        animateMoveTo(dragged, x, y);
        highlighted = null;
        focused = dragged instanceof Ball && closest instanceof Player ? closest : null;
    }
};

let selectEvent = function (e) {
    mouseDown = true;
    let [x, y] = getMeterCoordinates(e);
    clicked = getClosestAnimate(x, y);

    if (shortcuts["d"] && clicked !== null && clicked instanceof Player) {
        let lostBall = clicked.attached;
        let hadBall = animateDie(clicked);
        interface.feed = clicked.identity() + " goes off broom";
        if (hadBall) {
            interface.feed += ", " + lostBall.identity() + " dropped";
        }
        clicked = null;
    } else if (shortcuts["l"] && clicked !== null && clicked instanceof Player) {
        clicked.onBroom = true;
        interface.feed = clicked.identity() + " goes back on broom";
        clicked = null;
    } else if (selected !== null) {
        if (shortcuts["m"]) {
            animateMoveTo(selected, x, y);
            interface.feed = selected.identity() + " moves to (" + Math.round(x) + ", " + Math.round(y) + ")";
        } else if (shortcuts["t"]) {
            let held = selected.attached;
            if (animateDrop(selected)) {
                animateMoveTo(held, x, y);
                interface.feed = selected.identity() + " throws " + held.identity() + " to (" + Math.round(x) + ", " + Math.round(y) + ")";
                selected = held;
            }
        } else if (shortcuts["p"]) {
            if (clicked !== null && clicked instanceof Player) {
                let passed = selected.attached;
                if (animateDrop(selected)) {
                    let droppedBall = clicked.attached;
                    let hadBall = animateCatch(clicked, passed);
                    interface.feed = selected.identity() + " passes " + passed.identity() + " to " + clicked.identity();
                    if (hadBall) {
                        interface.feed += ", " + droppedBall.identity() + " dropped";
                    }
                }
            }
        } else if (shortcuts["b"]) {
            if (clicked !== null) {
                if (clicked instanceof Player) {
                    let thrown = selected.attached;
                    if (animateDrop(selected)) {
                        let lostBall = clicked.attached;
                        let hadBall = animateDie(clicked);
                        let side = Math.sign(selected.x - clicked.x);
                        animateMoveTo(thrown, clicked.x + side * 0.4, clicked.y - 0.25);
                        interface.feed = selected.identity() + " beats " + clicked.identity() + " with " + thrown.identity();
                        if (hadBall) {
                            interface.feed += ", " + lostBall.identity() + " dropped";
                        }
                    }
                }
            }
        }
    }
    updateSelection(x, y);
    return false;
}

let releaseEvent = function (e) {
    mouseDown = false;
    let [x, y] = getMeterCoordinates(e);
    let closest = getClosestAnimate(x, y);
    if (closest === clicked) {
        selected = selected === clicked ? null : clicked;
        if (selected instanceof Ball && selected.holder !== undefined && selected.holder !== null) {
            selected = selected.holder;
        }
        clicked = null;
    }

    // Attach on release
    if (dragged !== null && focused !== null) {
        animateCatch(focused, dragged);
        if (dragged === selected) {
            selected = focused;
        }
    }

    dragged = null;
    updateSelection(x, y);
    return false;
}

let moveEvent = function (e) {
    let [x, y] = getMeterCoordinates(e);
    if (mouseDown) {
        dragged = clicked;
        if (dragged !== null && dragged.holder !== undefined && dragged.holder !== null) {
            dragged.holder.attached = null;
        } else if (shortcuts["f"]) {
            let rect = canvas.getBoundingClientRect();
            let x = parseInt(e.clientX - rect.left);
            let y = parseInt(e.clientY - rect.top);
            if (!drawnPixels.includes([x, y])) {
                drawnPixels.push([x, y]);
            }
        }
    }
    updateSelection(x, y);
    return false;
}

let clickEvent = function (e) {
    let [x, y] = getMeterCoordinates(e);
    let closest = getClosestAnimate(x, y);
    if (closest === null) {
        if (isInRect(x, y, interface.stepBtn)) {
            interface.nextFrame();
        } else if (isInRect(x, y, interface.saveFrameBtn)) {
            interface.saveFrame();
        } else if (isInRect(x, y, interface.removeFrameBtn)) {
            interface.removeFrame();
        } else if (isInRect(x, y, interface.framesDisplay)) {
            let frame = parseInt((x - interface.framesDisplay.x) / interface.frameBtn.w);
            interface.goToFrame(frame);
        }
    }
    document.getElementById("context-menu").style.display = "none";
    return false;
};

let contextMenuOptions = [Role.BEATER, Role.CHASER, Role.KEEPER, Role.SEEKER].concat([Type.BLUDGER, Type.QUAFFLE]);
let contextMenuEvent = function (e) {
    let contextMenu = document.getElementById("context-menu");
    let [x, y] = getMeterCoordinates(e);
    let team = x < POSITION["MIDDLE"][0] ? Team.LEFT : Team.RIGHT;
    contextMenu.innerHTML = "";
    for (let i = 0; i < contextMenuOptions.length; i++) {
        let option = document.createElement("menu");
        if (i < contextMenuOptions.length - 2) {
            option.setAttribute("team", team);
            option.setAttribute("role", contextMenuOptions[i]);
            let roleName = contextMenuOptions[i] === Role.BEATER ? "Beater" : (contextMenuOptions[i] === Role.CHASER ? "Chaser" : (contextMenuOptions[i] === Role.KEEPER ? "Keeper" : "Seeker"));
            let newName = "Add " + (team === Team.LEFT ? "Blue" : "Red") + " " + roleName;
            option.setAttribute("name", newName);
        } else {
            option.setAttribute("type", contextMenuOptions[i]);
            option.setAttribute("name", "Add " + (contextMenuOptions[i] === Type.BLUDGER ? "Bludger" : "Quaffle"));
        }
        contextMenu.appendChild(option);
    }
    contextMenu.style.display = "block";
    contextMenu.style.left = Math.min(e.pageX, window.innerWidth - contextMenu.clientWidth - 20) + "px";
    contextMenu.style.top = Math.min(e.pageY, window.innerHeight - contextMenu.clientHeight) + "px";
    e.preventDefault();
    return false;
};

let contextMenuClickEvent = function (e) {
    let contextMenu = document.getElementById("context-menu");
    let y = e.pageY - parseInt(contextMenu.style.top.replace("px", ""));
    let choice = Math.floor(y / (contextMenu.clientHeight / contextMenu.childElementCount));
    if (choice < contextMenuOptions.length - 2) {
        let team = parseInt(contextMenu.children[choice].getAttribute("team"));
        let role = parseInt(contextMenu.children[choice].getAttribute("role"));
        let side = team === Team.LEFT ? -1 : 1;
        interface.frames[interface.activeFrame].players.push(
            new Player(POSITION["MIDDLE"][0] + side * 20.5, DIMENSIONS["TOTAL_WIDTH"] - 1.5, team, role)
        );
    } else {
        let type = parseInt(contextMenu.children[choice].getAttribute("type"));
        interface.frames[interface.activeFrame].balls.push(
            new Ball(POSITION["MIDDLE"][0], DIMENSIONS["TOTAL_WIDTH"] - 1.5, type)
        );
    }

    contextMenu.style.display = "none";
    e.preventDefault();
    return false;
};

canvas.addEventListener("keydown", function (e) {
    shortcuts[e.key] = true;
    //e.preventDefault();
}, false);
canvas.addEventListener("keyup", function (e) {
    shortcuts[e.key] = false;
    //e.preventDefault();
}, false);
canvas.addEventListener("mousedown", selectEvent, false);
canvas.addEventListener("mouseup", releaseEvent, false);
canvas.addEventListener("mousemove", moveEvent, false);
canvas.addEventListener("click", clickEvent, false);
canvas.addEventListener("contextmenu", contextMenuEvent, false);
document.getElementById("context-menu").addEventListener("click", contextMenuClickEvent, false);
canvas.focus();