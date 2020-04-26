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
   RIGHT: 2000
};

const Role = {
   BEATER: 100, // 2
   CHASER: 200, // 3
   KEEPER: 300, // 1
   SEEKER: 400 // 1
};

let canvas = document.getElementById("pitch");
let ctx = canvas.getContext("2d");

let indexInArray = function(object, array) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === object) {
            return i;
        }
    }
    return -1;
};

let Interface = function() {
    this.frames = [];
    this.activeFrame = -1;
    this.animationEnd = 0;
    this.animationLength = 500;
    this.margin = 0.25;
    this.padding = 0.25;
    this.uiHeight = 2
    this.stepBtn = {x: this.margin, y: this.margin, w: 2, h: this.uiHeight};
    this.frameBtn = {w: 1.5, h: this.uiHeight};
    this.framesDisplay = {x: this.stepBtn.x + this.stepBtn.w + this.margin, y: this.margin, w: 0, h: this.frameBtn.h};
    this.saveFrameBtn = {x: this.framesDisplay.x + this.framesDisplay.w + this.margin, y: this.margin, w: this.stepBtn.w, h: this.uiHeight};
    this.removeFrameBtn = {x: this.saveFrameBtn.x + this.saveFrameBtn.w + this.margin, y: this.margin, w: this.stepBtn.w, h: this.uiHeight};

    this.nextFrame = function() {
        this.activeFrame = (this.activeFrame + 1) % this.frames.length;
        this.animationEnd = new Date().getTime() + this.animationLength;
    };
    this.goToFrame = function(frame) {
        this.activeFrame = frame;
        this.animationEnd = 0;
    };
    this.saveFrame = function() {
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
            }
            else {
                newBalls[i] = clonedBalls[indexBall];
            }
        }
        this.addFrame(newPlayers, newBalls);
    };
    this.addFrame = function(players, balls) {
        this.frames.splice(this.activeFrame + 1, 0, {players: players, balls: balls});
        this.activeFrame++;
        this.framesDisplay.w += this.frameBtn.w;
        this.saveFrameBtn.x = this.framesDisplay.x + this.framesDisplay.w + this.margin;
        this.removeFrameBtn.x = this.saveFrameBtn.x + this.saveFrameBtn.w + this.margin;
    };
    this.removeFrame = function() {
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

let Player = function (x, y, team, role) {
    this.x = x;
    this.y = y;
    this.team = team;
    this.role = role;
};
Player.prototype.clone = function(withAttached = true) {
    let player = new Player(this.x, this.y, this.team, this.role);
    if (withAttached && this.attached !== undefined && this.attached !== null) {
        player.attached = this.attached.clone(false);
        player.attached.holder = player;
    }
    return player;
};

let Ball = function (x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
};
Ball.prototype.clone = function(withHolder = true) {
    let ball = new Ball(this.x, this.y, this.type);
    if (withHolder && this.holder !== undefined && this.holder !== null) {
        ball.holder = this.holder.clone(false);
        ball.holder.attached = ball;
    }
    return ball;
}

let defaultBalls = [];
for (let iBall = 0; iBall < 4; iBall++) {
    let type = iBall == 0 ? Type.QUAFFLE : Type.BLUDGER;
    let position = iBall < 2 ? 2.75 : 8.25;
    position = iBall % 2 ? position : -position;
    defaultBalls.push(new Ball(POSITION["MIDDLE"][0], POSITION["MIDDLE"][1] + position, type));
}

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

let interface = new Interface();
interface.addFrame(defaultPlayers, defaultBalls);


selected = null;
highlighted = null;
focused = null;

let isInRect = function(x, y, rect) {
    return rect.x <= x && x <= rect.x + rect.w && rect.y <= y && y <= rect.y + rect.h;
};

let getClosestAnimate = function(x, y) {
    let closest = null;
    let minDistance = 1.5;
    let animates = interface.frames[interface.activeFrame].balls.concat(interface.frames[interface.activeFrame].players);
    for (let i = 0; i < animates.length; i++) {
        let animate = animates[i];
        if (animate !== selected) {
            let distance = Math.hypot(animate.x - x, animate.y - y);
            if (distance <= minDistance) {
                closest = animate;
                minDistance = distance;
            }
        }
    }
    return closest;
};

let getMeterCoordinates = function(e) {
    let rect = canvas.getBoundingClientRect();
    let x = parseInt(e.clientX - rect.left) / zoom;
    let y = parseInt(e.clientY - rect.top) / zoom;
    x = Math.min(Math.max(x, 0), DIMENSIONS["TOTAL_LENGTH"]);
    y = Math.min(Math.max(y, 0), DIMENSIONS["TOTAL_WIDTH"]);
    return [x, y];
};

let updateSelection = function(x, y) {
    let closest = getClosestAnimate(x, y);
    if (selected === null) {
        highlighted = closest;
        focused = null;
    } else {
        selected.x = x;
        selected.y = y;
        if (selected.attached !== undefined && selected.attached !== null) {
            selected.attached.x = selected.x;
            selected.attached.y = selected.y + 0.75;
        }
        highlighted = null;
        focused = selected instanceof Ball && closest instanceof Player ? closest : null;
    }
};

let selectEvent = function(e) {
    let [x, y] = getMeterCoordinates(e);
    selected = getClosestAnimate(x, y);
    if (selected !== null && selected.holder !== undefined && selected.holder !== null) {
        selected.holder.attached = null;
    }
    updateSelection(x, y);
    e.preventDefault();
    return false;
}

let moveEvent = function(e) {
    let [x, y] = getMeterCoordinates(e);
    updateSelection(x, y);
    e.preventDefault();
    return false;
}

let releaseEvent = function(e) {
    let [x, y] = getMeterCoordinates(e);
    if (selected !== null && focused !== null) {
        focused.attached = selected;
        selected.holder = focused;
        selected.x = focused.x;
        selected.y = focused.y + 0.75;
    }
    selected = null;
    updateSelection(x, y);
    e.preventDefault();
    return false;
}

let actionEvent = function(e) {
    e.preventDefault();
    return false;
};

let clickEvent = function(e) {
    let [x, y] = getMeterCoordinates(e);
    let closest = getClosestAnimate(x, y);
    if (closest === null) {
        if (isInRect(x, y, interface.stepBtn)) {
            interface.nextFrame();
        }
        else if (isInRect(x, y, interface.saveFrameBtn)) {
            interface.saveFrame();
        }
        else if (isInRect(x, y, interface.removeFrameBtn)) {
            interface.removeFrame();
        }
        else if (isInRect(x, y, interface.framesDisplay)) {
            let frame = parseInt((x - interface.framesDisplay.x) / interface.frameBtn.w);
            interface.goToFrame(frame);
        }
    }
    e.preventDefault();
    return false;
};


canvas.addEventListener("mousedown", selectEvent, false);
canvas.addEventListener("mousemove", moveEvent, false);
canvas.addEventListener("mouseup", releaseEvent, false);
canvas.addEventListener("click", clickEvent, false);
canvas.addEventListener("contextmenu", actionEvent, false);