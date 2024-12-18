class Ball {
    constructor(posX, posY, velocityX, velocityY, acceleration, interval) {
        this.pos_x = posX;
        this.pos_y = posY;
        this.velocity_x = velocityX;
        this.velocity_y = velocityY;
        this.acceleration = acceleration;
        this.interval = interval;
        
        // this.object = document.createElement("div");
        // this.object.style.left = this.pos_x + "px";
        // this.object.style.bottom = this.pos_y - 10 + "px";
        // this.object.setAttribute("class", "object");
        // document.body.insertBefore(this.object, document.getElementById("object-indicator"));

        OBJECTS.push(this); 
    }

    move() {
        if (this.pos_y <= 10 || this.pos_x >= document.documentElement.clientWidth + 10 || this.pos_x <= -10) {
            // this.object.remove();
            clearInterval(this.interval);
            let indexInArray = OBJECTS.indexOf(this);
            OBJECTS.splice(indexInArray, 1);
        } else {
            this.pos_x += this.velocity_x / SLOWMO_FACTOR; // 10
            this.pos_y += this.velocity_y / SLOWMO_FACTOR; // 100
            // this.object.style.left = this.pos_x + "px";
            // this.object.style.bottom = this.pos_y - 10 + "px";
            this.velocity_y += this.acceleration / SLOWMO_FACTOR;
        }
        // this.object.style.left = this.pos_x + "px";
        // this.object.style.bottom = this.pos_y - 10 + "px";
        // CTX.beginPath();
        // CTX.moveTo(0, 0);
        // CTX.arc(this.pos_x, document.documentElement.clientHeight - this.pos_y, 10, 0, 2*Math.PI);
        // CTX.fill();
    }
}

// You may change these
let CANNON_POS_Y = Number(50);
let CANNON_ANGLE = 45;
let OBJECT_SPEED = 5;

// DON'T CHANGE THESE
let OBJECT_POS_X = Math.cos(CANNON_ANGLE / 57.296) * 40 + 40;
let OBJECT_POS_Y = Math.sin(CANNON_ANGLE / 57.296) * 40 + CANNON_POS_Y + 60;
let OBJECT_VELOCITY_X = Math.cos(CANNON_ANGLE / 57.296) * OBJECT_SPEED;
let OBJECT_VELOCITY_Y = Math.sin(CANNON_ANGLE / 57.296) * OBJECT_SPEED;
let ACCELERATION = -9.8 / 250;
// > 1 means slower
let SLOWMO_FACTOR = 2;

let MOUSE_X = 0;
let MOUSE_Y = 0;

let CANNON = document.getElementById("cannon");

// let MAYHEM_INTERVAL = null;
let MAYHEM_WORKER = null;
let MAYHEM_ITERATION = 1;

let TRACER_CANVAS = document.getElementById("tracer-canvas");
let OBJECTS_CANVAS = document.getElementById("objects-canvas");
let TRACER_CTX = TRACER_CANVAS.getContext("2d");
let OBJECTS_CTX = OBJECTS_CANVAS.getContext("2d");

let OBJECTS = [];

let MOVE_UP_INTERVAL = null;
let MOVE_DOWN_INTERVAL = null;
let ROTATE_LEFT_INTERVAL = null;
let ROTATE_RIGHT_INTERVAL = null;

function track_mouse(event) {
    MOUSE_X = event.clientX;
    MOUSE_Y = event.clientY;
}

function fire() {
    let ball = new Ball(OBJECT_POS_X, OBJECT_POS_Y, OBJECT_VELOCITY_X, OBJECT_VELOCITY_Y, ACCELERATION, setInterval(function() {ball.move.call(ball)}, 1));
}

function start_mayhem() {
    if (MAYHEM_WORKER == null) {
        document.getElementById("cannon-angle").disabled = true;
        document.getElementById("object-speed").disabled = true;
        document.getElementById("mayhem-button").style.backgroundColor = "#9f9";
        if (document.getElementById("slowmo").value > 2) {
            SLOWMO_FACTOR = 2;
            update();
        }
        document.getElementById("slowmo").max = 2;
        MAYHEM_WORKER = new Worker("mayhem-interval.js");
        MAYHEM_WORKER.postMessage([CANNON_POS_Y, CANNON_ANGLE, OBJECT_SPEED, MOUSE_X, MOUSE_Y, document.documentElement.clientHeight]);
        MAYHEM_WORKER.addEventListener("message", ({data}) => {
            CANNON_ANGLE = data[0];
            OBJECT_SPEED = data[1];
            update();
            fire();
            MAYHEM_WORKER.postMessage([CANNON_POS_Y, CANNON_ANGLE, OBJECT_SPEED, MOUSE_X, MOUSE_Y, document.documentElement.clientHeight]);
        });
    } else {
        MAYHEM_WORKER.terminate();
        MAYHEM_WORKER = null;
        document.getElementById("cannon-angle").disabled = false;
        document.getElementById("object-speed").disabled = false;
        document.getElementById("mayhem-button").style.backgroundColor = "#f99";
        document.getElementById("slowmo").max = 5;
        setDefault({id: "all-default"});
    }
}

function mayhem() {
    let muzzle_x = Math.cos(CANNON_ANGLE / 57.296) + 40;
    let muzzle_y = Math.sin(CANNON_ANGLE / 57.296) + Number(CANNON_POS_Y) + 55;
    let y_difference = (document.documentElement.clientHeight - MOUSE_Y) - muzzle_y;
    let x_difference = MOUSE_X - muzzle_x;
    CANNON_ANGLE = Math.atan(y_difference / x_difference) * (180 / Math.PI);
    if (x_difference < 0) {
        CANNON_ANGLE = -CANNON_ANGLE;
        CANNON_ANGLE = 90 + (90 - CANNON_ANGLE);
    }
    OBJECT_SPEED = Math.random() * 3 + 4;
    update();

    fire();
}

function setup() {
    CANNON.style.bottom = Number(CANNON_POS_Y) + 50 + "px";
    CANNON.style.transform = "rotate(" + -(CANNON_ANGLE) + "deg)";

    document.getElementById("cannon-height").value = CANNON_POS_Y;
    document.getElementById("cannon-angle").value = CANNON_ANGLE;
    document.getElementById("object-speed").value = OBJECT_SPEED;
    document.getElementById("gravity").value = (ACCELERATION * 250) / -9.8;
    document.getElementById("slowmo").value = SLOWMO_FACTOR;

    document.getElementById("height-label").innerHTML = CANNON_POS_Y;
    document.getElementById("angle-label").innerHTML = CANNON_ANGLE;
    document.getElementById("speed-label").innerHTML = OBJECT_SPEED;
    document.getElementById("gravity-label").innerHTML = (ACCELERATION * 250) / -9.8;
    document.getElementById("slowmo-label").innerHTML = SLOWMO_FACTOR;

    document.getElementById("tracer-canvas").width = document.documentElement.clientWidth;
    document.getElementById("tracer-canvas").height = document.documentElement.clientHeight;
    document.getElementById("objects-canvas").width = document.documentElement.clientWidth;
    document.getElementById("objects-canvas").height = document.documentElement.clientHeight;

    TRACER_CTX.strokeStyle = "#f00";
    TRACER_CTX.lineWidth = 3;
    TRACER_CTX.imageSmoothingEnabled = false;

    OBJECTS_CTX.fillStyle = "#f00";
    OBJECTS_CTX.imageSmoothingEnabled = false;
    updateTracer();
    updateObjects();
}

function update() {
    updateVariables();
    updatePositions();
    updateLabels();
    updateTracer();
}

function updateVariables() {
    OBJECT_POS_X = Math.cos(CANNON_ANGLE / 57.296) * 40 + 40;
    OBJECT_POS_Y = Math.sin(CANNON_ANGLE / 57.296) * 40 + CANNON_POS_Y + 65;
    OBJECT_VELOCITY_X = Math.cos(CANNON_ANGLE / 57.296) * OBJECT_SPEED;
    OBJECT_VELOCITY_Y = Math.sin(CANNON_ANGLE / 57.296) * OBJECT_SPEED;
}

function updatePositions() {
    CANNON.style.bottom = Number(CANNON_POS_Y) + 50 + "px";
    CANNON.style.transform = "rotate(" + -(CANNON_ANGLE) + "deg)";
}

function updateLabels() {
    if (MAYHEM_WORKER == null) {
        document.getElementById("angle-label").innerHTML = CANNON_ANGLE;
        document.getElementById("speed-label").innerHTML = OBJECT_SPEED;
    }
    document.getElementById("height-label").innerHTML = CANNON_POS_Y;
    document.getElementById("gravity-label").innerHTML = (ACCELERATION * 250) / -9.8;
    document.getElementById("slowmo-label").innerHTML = SLOWMO_FACTOR;
}

function updateTracer() {
    TRACER_CTX.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
    let ctxPosX = OBJECT_POS_X;
    let ctxPosY = document.documentElement.clientHeight - OBJECT_POS_Y - 5;
    let ctxVelocityX = OBJECT_VELOCITY_X;
    let ctxVelocity = OBJECT_VELOCITY_Y * -1;
    let ctxAcceleration = ACCELERATION * -1;
    TRACER_CTX.moveTo(ctxPosX, ctxPosY);
    TRACER_CTX.beginPath();
    TRACER_CTX.lineTo(ctxPosX, ctxPosY);
    while (true) {
        if (ctxPosY > document.documentElement.clientHeight) {
            break;
        }
        if (ctxPosX > document.documentElement.clientWidth) {
            break;
        }
        ctxPosX += ctxVelocityX;
        ctxPosY += ctxVelocity;
        ctxVelocity += ctxAcceleration;
        TRACER_CTX.lineTo(ctxPosX, ctxPosY);
    }
    document.getElementById("target").style.left = ctxPosX - 8 + "px";
    TRACER_CTX.stroke();
}

function updateObjects() {
    OBJECTS_CTX.clearRect(0, 0, document.documentElement.clientWidth, document.documentElement.clientHeight);
    OBJECTS_CTX.moveTo(0, 0);
    for (let i = 0; i < OBJECTS.length; i++) {
        let object = OBJECTS[i];
        if (object.pos_y < document.documentElement.clientHeight + 5 || object.pos_x < document.documentElement.clientWidth + 5) {
            OBJECTS_CTX.beginPath();
            OBJECTS_CTX.arc(object.pos_x, document.documentElement.clientHeight - object.pos_y - 5, 10, 0, 2*Math.PI);
            OBJECTS_CTX.fill();
        }
    }

    requestAnimationFrame(updateObjects);
}

function setDefault(element) {
    if (MAYHEM_WORKER == null) {
        if (element.id == "angle-default") {
            CANNON_ANGLE = 45;
            document.getElementById("cannon-angle").value = 45;
            update();
        } else if (element.id == "speed-default") {
            OBJECT_SPEED = 5;
            document.getElementById("object-speed").value = 5;
            update();
        }                
    }
    if (element.id == "height-default") {
        CANNON_POS_Y = 50;
        document.getElementById("cannon-height").value = 50;
        update();
    } else if (element.id == "gravity-default") {
        ACCELERATION = -9.8 / 250;
        document.getElementById("gravity").value = 1;
        update();
    } else if (element.id == "slowmo-default") {
        SLOWMO_FACTOR = 2;
        document.getElementById("slowmo").value = 2;
        update();
    } else if (element.id == "all-default") {
        if (MAYHEM_WORKER == null) {
            CANNON_ANGLE = 45;
            document.getElementById("cannon-angle").value = 45;
            OBJECT_SPEED = 5;
            document.getElementById("object-speed").value = 5;
        }
        CANNON_POS_Y = 50;
        document.getElementById("cannon-height").value = 50;
        ACCELERATION = -9.8 / 250;
        document.getElementById("gravity").value = 1;
        SLOWMO_FACTOR = 2;
        document.getElementById("slowmo").value = 2;
        update();
    }
}

function toggleDropdown() {
    let dropdown = document.getElementById("dropdown");
    if (dropdown.style.visibility.length == 0) {
        dropdown.style.visibility = "visible";
    } else {
        if (dropdown.style.visibility == "hidden") {
            dropdown.style.visibility = "visible";
        } else {
            dropdown.style.visibility = "hidden";
        }
    }
}

function keyHandler(event) {
    if (event.key == "f") {
        fire();
    } else if (event.key == "r") {
        setDefault({id: "all-default"});
    } else if (event.key == " ") {
        start_mayhem();
    }
}

function moveCannonUp() {
    CANNON_POS_Y += 20;
    if (CANNON_POS_Y > 600) {
        CANNON_POS_Y = 600;
    }
    document.getElementById("cannon-height").value = CANNON_POS_Y;
    update();
}

function moveCannonDown() {
    CANNON_POS_Y -= 20;
    if (CANNON_POS_Y < 0) {
        CANNON_POS_Y = 0;
    }
    document.getElementById("cannon-height").value = CANNON_POS_Y;
    update();
}

function rotateCannonLeft() {
    CANNON_ANGLE += 5;
    if (CANNON_ANGLE > 90) {
        CANNON_ANGLE = 90;
    }
    document.getElementById("cannon-angle").value = CANNON_ANGLE;
    update();
}

function rotateCannonRight() {
    CANNON_ANGLE -= 5;
    if (CANNON_ANGLE < -45) {
        CANNON_ANGLE = -45;
    }
    document.getElementById("cannon-angle").value = CANNON_ANGLE;
    update();
}

setup();
document.addEventListener("keydown", keyHandler);
document.querySelector("#cannon-height")
    .addEventListener("input", event => {
        CANNON_POS_Y = Number(event.target.value);
        update();
});

document.querySelector("#cannon-angle")
    .addEventListener("input", event => {
        CANNON_ANGLE = event.target.value;
        update();
});

document.querySelector("#object-speed")
    .addEventListener("input", event => {
        OBJECT_SPEED = event.target.value;
        update();
});

document.querySelector("#gravity")
    .addEventListener("input", event => {
        ACCELERATION = (event.target.value * -9.8) / 250;
        update();
});

document.querySelector("#slowmo")
    .addEventListener("input", event => {
        SLOWMO_FACTOR = event.target.value;
        update();
});
document.addEventListener("keydown", event => {
    if (event.key == "w") {
        if (MOVE_UP_INTERVAL == null) {
            moveCannonUp();
            MOVE_UP_INTERVAL = setInterval(moveCannonUp, 50);
        }
    } else if (event.key == "s") {
        if (MOVE_DOWN_INTERVAL == null) {
            moveCannonDown();
            MOVE_DOWN_INTERVAL = setInterval(moveCannonDown, 50);
        }
    } else if (event.key == "a") {
        if (ROTATE_LEFT_INTERVAL == null && MAYHEM_WORKER == null) {
            rotateCannonLeft();
            ROTATE_LEFT_INTERVAL = setInterval(rotateCannonLeft, 50);
        }
    } else if (event.key == "d") {
        if (ROTATE_RIGHT_INTERVAL == null && MAYHEM_WORKER == null) {
            rotateCannonRight();
            ROTATE_RIGHT_INTERVAL = setInterval(rotateCannonRight, 50);
        }
    } else if (/[0-9]/.test(event.key)) {
        if (MAYHEM_WORKER == null) {
            if (event.key == 0) {
                OBJECT_SPEED = 10;
                document.getElementById("object-speed").value = 10;
                update();
            } else {
                OBJECT_SPEED = event.key;
                document.getElementById("object-speed").value = event.key;
                update();
            }
        }
    }
});
document.addEventListener("keyup", event => {
    if (event.key == "w") {
        clearInterval(MOVE_UP_INTERVAL);
        MOVE_UP_INTERVAL = null;
    } else if (event.key == "s") {
        clearTimeout(MOVE_DOWN_INTERVAL);
        MOVE_DOWN_INTERVAL = null;
    } else if (event.key == "a") {
        clearTimeout(ROTATE_LEFT_INTERVAL);
        ROTATE_LEFT_INTERVAL = null;
    } else if (event.key == "d") {
        clearTimeout(ROTATE_RIGHT_INTERVAL);
        ROTATE_RIGHT_INTERVAL = null;
    }
});
