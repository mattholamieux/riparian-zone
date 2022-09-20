// Define Global Variables
let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
const bgColors = [100, 150, 250];
let bgIndex = 0;
const buffers = [buffer1, buffer2, buffer3, buffer4, buffer5, buffer6]; // Defined in buffers.js
let bufferIndex = 0;
let loopStart, loopEnd, pressedPoint, releasePoint;
let isPlaying = false;
let grainSize = 0.1;
let overlap = 0.1;

// Instantiate Tone.GrainPlayer object
const player = new Tone.GrainPlayer(buffers[bufferIndex]);

// A touch of reverb for extra vibes
const reverb = new Tone.Reverb({
    decay: 3,
    preDelay: 0.25,
    wet: 0.2,
});


function setup() {
    // Create canvas and attch mouse events with callbacks
    cnv = createCanvas(400, 400);
    cnv.mousePressed(getPressedPoint);
    cnv.mouseReleased(getReleasePoint);
    cnv.mouseWheel(trackPad);

    // Init settings for player
    player.loop = true;
    player.playbackRate = 1;
    player.overlap = overlap;
    player.grainSize = grainSize;
    reverb.toDestination();
    player.chain(reverb);
}

function draw() {
    // Draw background and instructions
    background(mouseX / 2, mouseY / 2, bgColors[bgIndex]);
    noStroke();
    let f = 100;
    textSize(18);
    textLeading(20);
    textFont("serif");
    for (i = 0; i < instructions.length; i++) {
        fill(f);
        text(instructions[i], 20, 20 * [i] + 20);
        f += 15;
    }

    // Draw rect to indicate loop start and end
    rectMode(CORNER);
    fill(40, 54, 100, 30);
    rect(x1, 0, x2 - x1, height);

    // Draw rect to represent grain size
    let grainSizeDisplay = map(grainSize, 0.01, 2, 5, 300);
    rectMode(CENTER);
    fill(255, 204, 0, 50);
    rect(width / 2, height / 2, grainSizeDisplay, grainSizeDisplay);

    // Affect player's tune and rate with mouseX and mouseY
    if (mouseX < width) {
        player.detune = (mouseX / 100) * 1200 - 2400;
    }
    if (mouseY < height) {
        player.playbackRate = mouseY / 200 + 0.05;
    }
}

function getPressedPoint() {
    // Capture mouse pressed x and y
    pressedPoint = mouseX / 400;
    x1 = mouseX;
    y1 = mouseY;
}

function getReleasePoint() {
    // Capture mouse released x and y
    releasePoint = mouseX / 400;
    x2 = mouseX;
    y2 = mouseY;
    // Calculate loop start and end points
    calculateLoop();
}

function calculateLoop() {
    // Calculate loop start and end points in relation to current buffer's duration
    loopStart = pressedPoint * buffers[bufferIndex].duration;
    loopEnd = releasePoint * buffers[bufferIndex].duration;

    // If mouse dragged left to right, play forwards
    if (loopStart < loopEnd) {
        player.loopStart = loopStart;
        player.loopEnd = loopEnd;
        player.reverse = false;
        player.start(1, loopStart);
    } else { // otherwise, play backwards
        player.loopStart = loopEnd;
        player.loopEnd = loopStart;
        player.reverse = true;
        player.start(1, loopStart);
    }
    isPlaying = true;
}

function keyPressed() {
    // start and stop the player with the space bar
    if (key === " ") {
        if (!isPlaying) {
            player.start(1, loopStart);
            isPlaying = true;
        } else {
            player.stop();
            isPlaying = false;
        }
    }

    // cycle through buffers and backgrounds with right or left arrow
    if (key === "ArrowRight") {
        bufferIndex = (bufferIndex + 1) % buffers.length;
        player.buffer = buffers[bufferIndex];
        calculateLoop();
        bgIndex = (bgIndex + 1) % bgColors.length;
    }
    if (key === "ArrowLeft") {
        if (bufferIndex > 0) {
            bufferIndex = (bufferIndex - 1) % buffers.length;
            player.buffer = buffers[bufferIndex];
            calculateLoop();
            bgIndex = (bgIndex + 1) % bgColors.length;
        } else {
            bufferIndex = buffers.length - 1;
            player.buffer = buffers[bufferIndex];
            calculateLoop();
            bgIndex = bgColors.length - 1;
        }
    }
}

function trackPad(event) {
    // if mousewheel or trackpad scrolls down, reduce the grain size
    if (event.wheelDeltaY > 10) {
        if (grainSize > 0.02) {
            grainSize -= 0.01;
        }
        // if mousewheel or trackpad scrolls up, increase the grain size
    } else if (event.wheelDeltaY < -10) {
        if (grainSize < 2) {
            grainSize += 0.01;
        }
    }
    player.grainSize = grainSize;
}