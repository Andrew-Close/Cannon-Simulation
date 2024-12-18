let viewportWidth = 0;
let viewportHeight = 0;

function calculateBall(data) {
    let muzzle_x = Math.cos(data[1] / 57.296) + 40;
    let muzzle_y = Math.sin(data[1] / 57.296) + Number(data[0]) + 55;
    let y_difference = (data[5] - data[4]) - muzzle_y;
    let x_difference = data[3] - muzzle_x;
    let newCannonAngle = Math.atan(y_difference / x_difference) * (180 / Math.PI);
    if (x_difference < 0) {
        newCannonAngle = -newCannonAngle;
        newCannonAngle = 90 + (90 - newCannonAngle);
    }
    let newObjectSpeed = Math.random() * 3 + 4;
    postMessage([newCannonAngle, newObjectSpeed]);
}

self.addEventListener("message", ({data}) => {
    setTimeout(function() {calculateBall(data)}, 20);
});
