// Define Global Variables
let cnv;
let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
const bgColors = [100, 150, 250];
let bgIndex = 0;
const buffers = [buffer1, buffer2, buffer3, buffer4, buffer5, buffer6, buffer7, buffer8]; // Defined in buffers.js
let bufferIndex = 0;
let loopStart, loopEnd, pressedPoint, releasePoint;
let isPlaying = false;
let grainSize = 0.1;
let overlap = 0.1;
let angleRotate = 0;
let t = 0;

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
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
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
    player.loopStart = 0;
    player.loopEnd = buffers[bufferIndex].duration;
    pressedPoint = 0;
    releasePoint = 1;
}

function draw() {

    if (player.loaded) {

        // Draw background
        if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
            background(mouseX / 2, mouseY / 2, bgColors[bgIndex], 5);
        }
        // Draw instructions
        noStroke();
        let f = 80;
        textSize(20);
        textLeading(5);
        textFont("serif");
        for (i = 0; i < instructions.length; i++) {
            fill(f);
            text(instructions[i], 10, 20 * [i] + 20);
            f += 10;
        }

        // Draw rect to indicate loop start and end
        rectMode(CORNER);
        fill(40, 54, 100, 30, 50);
        rect(x1, 0, x2 - x1, height);

        // Draw rect to represent grain size
        let grainSizeDisplay = map(grainSize, 0.01, 2, (width / 80), (height / 1.5));
        let overlapDisplay = map(overlap, 0.01, 2, (width / 80), (height / 1.5));
        rectMode(CENTER);
        fill(155, 0, 0, 5);
        rect(width / 2, height / 2, overlapDisplay, grainSizeDisplay);

        push();
        textSize(30);
        translate(width / 2, height / 2);
        rotate(radians(angleRotate));
        fill(50);
        // fill(0, 204, 255, 50);
        // stroke(255, 204, 0, 50)
        strokeWeight(1);
        text("Type/Token: Riparian Zone", 0, 0);
        pop();
        angleRotate += 0.25;

        // Affect player's tune and rate with mouseX and mouseY
        if (mouseX < width && mouseX > 0) {
            player.detune = (mouseX / (width / 4)) * 1200 - 2400;
        }
        if (mouseY < height && mouseY > 0) {
            player.playbackRate = mouseY / (height / 2) + 0.05;
        }
    }

    // else {
    //  Loading Animation Here

    // }


}

function getPressedPoint() {
    // Capture mouse pressed x and y
    pressedPoint = mouseX / width;
    x1 = mouseX;
    y1 = mouseY;
    player.stop();
}

function getReleasePoint() {
    // Capture mouse released x and y
    releasePoint = mouseX / width;
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
        let bloopStart = loopEnd - 0.1
        player.sync().start("+0.5", loopStart);
    } else { // otherwise, play backwards
        player.loopStart = loopEnd;
        player.loopEnd = loopStart;
        player.reverse = true;
        player.sync().start("+0.5", loopEnd);
    }
    isPlaying = true;
}

function keyPressed() {
    // start and stop the player with the space bar
    if (key === " ") {
        if (!isPlaying) {
            initializeTone();
            player.sync().start("+0.5", loopStart);
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
    } else if (event.wheelDeltaX > 10) {
        if (overlap < 2) {
            overlap += 0.01;
        }
    } else if (event.wheelDeltaX < -10) {
        if (overlap > 0.01) {
            overlap -= 0.01;
        }
    }
    player.grainSize = grainSize;
    player.overlap = overlap;


}

async function initializeTone() {
    await Tone.start();
    Tone.Transport.start();
    console.log("audio context started");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}