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
let grainSize = 0.1;
let overlap = 0.1;
let bits = 8;
let delayAmount = 0;
let reverbAmount = 0;
let chebyOrder = 1;
let bitWet = 0;
let gainVal = 0.7;
let panVal = 0;
let panVelocity = 0;
let gainVelocity = 0;
let octaveLock = false;
const delayTimes = ["64n", "32n", "16n", "8n", "4n", "2n", "1n"];
let state = 0;
let r = 0;
let initRect = false;
let rzSvg;
let path;
let pathLength;
let pathCounter = 0;
let loadingAnimation = true;
let firstLoop = true;

// Instantiate Tone.GrainPlayer object
const player = new Tone.GrainPlayer(buffers[bufferIndex]);
const fft = new Tone.FFT({
    size: 16
})

const delay = new Tone.PingPongDelay({
    delayTime: "16n",
    feedback: 0,
    wet: delayAmount
})

const cheby = new Tone.Chebyshev({
    oversample: "none",
    order: 1
});

const filter = new Tone.Filter({
    frequency: 10000,
    Q: 2,
    type: "lowpass"
})

const crusher = new Tone.BitCrusher({
    bits: 8,
    wet: 0
});

const reverb = new Tone.Reverb({
    decay: 6,
    preDelay: 0.25,
    wet: 0
});

const gain = new Tone.Gain(gainVal);
const panner = new Tone.Panner(panVal);

function preload() {
    rzSvg = loadImage("images/TO_014_typetoken_type-01.png");
}

function setup() {

    if (windowWidth > 1100) {
        // Create canvas and attch mouse events with callbacks
        cnv = createCanvas(windowWidth, windowHeight);
        cnv.style('display', 'block');
        cnv.mousePressed(getPressedPoint);
        cnv.mouseReleased(getReleasePoint);
        cnv.mouseWheel(trackPad);
        cnv.parent('canvas-holder');
        frameRate(60);
        // Init settings for player
        player.loop = true;
        player.playbackRate = 1;
        player.overlap = overlap;
        player.grainSize = grainSize;
        reverb.toDestination();
        reverb.connect(fft);
        player.chain(gain, crusher, cheby, delay, filter, panner, reverb);
        player.loopStart = 0;
        player.loopEnd = buffers[bufferIndex].duration;
        pressedPoint = 0;
        releasePoint = 1;
    } else {
        cnv = createCanvas(windowWidth, windowHeight);
        noLoop();
        fill('#000')
        textSize(20);
        text("This app is designed to run on devices with", 10, height / 2);
        text("display widths of at least 1100 pixels", 10, height / 2 + 20);
    }
}

function draw() {
    if (!loadingAnimation) {
        if (player.loaded) {
            background("#bccf7530")
            imageMode(CENTER);
            image(rzSvg, width / 2, height / 2);

            noStroke();
            fill("#305431")
            textSize(20);
            textLeading(5);
            textFont("serif");
            textAlign(LEFT);
            for (i = 0; i < mainInstructions.length; i++) {
                text(mainInstructions[i], 20, 20 * [i] + 30);
            }
            textAlign(RIGHT);
            for (i = state * 4; i < (state * 4) + 4; i++) {
                text(secondaryInstructions[i], width - 20, 20 * [i] + 30);
            }

            // Draw rect to indicate loop start and end
            rectMode(CORNER);
            fill(73, 87, 76, 20);
            rect(x1, 0, x2 - x1, height);

            // Draw rect to represent grain size
            let grainSizeDisplay = map(grainSize, 0.01, 2, (width / 80), (height / 1.5));
            let overlapDisplay = map(overlap, 0.01, 2, (width / 80), (height / 1.5));
            rectMode(CENTER);
            stroke("#305431")
            noFill();
            if (initRect) {
                rect(width / 2, height / 2, overlapDisplay, grainSizeDisplay);
            }

            // Draw rect to represent bit and cheby size
            let crushBlocks = floor(bits);
            let crushBlockWidth = width / crushBlocks;
            let crushBlockHeight = height / crushBlocks;
            noFill();
            stroke(48, 84, 49, (bitWet * 150));
            strokeWeight(4);
            for (let i = 1; i < crushBlocks; i++) {
                for (let j = 1; j < crushBlocks; j++) {
                    rect(j * crushBlockWidth, i * crushBlockHeight, height / 10, height / 10);
                }
            }

            // Draw rect to represent delay amt
            noStroke();
            let delayDisplay = map(delayAmount, 0, 1, 0, height * 2);
            rectMode(CENTER);
            fill(73, 87, 76, 10);
            rect(width / 2, height, width, delayDisplay);

            // Draw rect to represent reverb amt
            let reverbDisplay = map(reverbAmount, 0, 1, 0, width * 2);
            rectMode(CENTER);
            fill("#3054313a")
            rect(0, height / 2, reverbDisplay, height);

            // draw rect to represent gain amt
            let gainDisplay = map(gainVal, 0, 1, height, 0);
            fill(48, 84, 49, gainVelocity);
            rect(10, gainDisplay, 10, 10);
            gainVelocity = 0;

            // draw rect to represent pan amt
            let panDisplay = map(panVal, -1, 1, 0, width);
            fill(48, 84, 49, panVelocity);
            rect(panDisplay, height - 10, 10, 10);
            panVelocity = 0;

            // Affect player's tune and rate with mouseX and mouseY
            if (player.state === "started") {
                if (state === 0) {
                    if (mouseX < width && mouseX > 0) {
                        let detune = (mouseX / (width / 4)) * 1200 - 2400;
                        if (detune > 1600) {
                            octave = 2400;
                        } else if (detune > 800) {
                            octave = 1200;
                        } else if (detune > -800) {
                            octave = 0;
                        } else if (detune > -1600) {
                            octave = -1200;
                        } else {
                            octave = -2400;
                        }

                        if (octaveLock) {
                            player.detune = octave;
                        } else {
                            player.detune = detune;
                        }
                    }
                    if (mouseY < height && mouseY > 0) {
                        player.playbackRate = mouseY / (height / 2) + 0.05;
                    }
                } else if (state === 1) {
                    if (mouseX < width && mouseX > 0) {
                        if (mouseX < width / 2) {
                            if (filter.type === "highpass") {
                                filter.type = "lowpass"
                            }
                            filter.frequency.value = (mouseX / width) * 8000;
                        } else {
                            if (filter.type === "lowpass") {
                                filter.type = "highpass"
                            }
                            filter.frequency.value = -4000 + ((mouseX / width) * 8000);
                        }
                    }
                    if (mouseY < height && mouseY > 0) {
                        filter.Q.value = 20 - ((mouseY / height) * 20);

                    }
                } else if (state === 2) {
                    if (mouseX < width && mouseX > 0) {
                        let delayTime = (mouseX / width) * 4;
                        delay.delayTime.rampTo(delayTime, 0.5);
                        console.log(delay.delayTime.value)
                    }
                    if (mouseY < height && mouseY > 0) {
                        delay.feedback.value = 1 - mouseY / height;
                    }
                }
            }
        }
    } else {
        if (firstLoop) {
            cnv.style('height', '100%');
            firstLoop = false;
        }
        let scaler = 4;
        stroke("#305431")
        strokeWeight(8);
        let originPoint = path.getPointAtLength(0)
        push();
        let thisPoint = path.getPointAtLength(pathCounter)
        if (pathCounter < pathLength) {
            push();
            translate(width / 2, height / 2);
            point((thisPoint.x - originPoint.x + 20) * scaler, (thisPoint.y - originPoint.y + 10) * scaler);
            pop();
            pathCounter += 2;
        } else {
            background("#bccf7510");
            setTimeout(function() {
                loadingAnimation = false;
                showButt();
                frameRate(20);
            }, 2000);
        }
    }
}

function getPressedPoint() {
    // Capture mouse pressed x and y
    player.playbackRate = 1;
    pressedPoint = mouseX / width;
    x1 = mouseX;
    y1 = mouseY;
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
    gain.gain.rampTo(0, 1);
    player.stop("+1")
        // If mouse dragged left to right, play forwards
    if (loopStart < loopEnd) {
        player.loopStart = loopStart;
        player.loopEnd = loopEnd;
        player.reverse = false;
        if (player.state === "started") {
            player.sync().start("+1.01", loopStart);
            gain.gain.rampTo(1, 1, "+1.01");
        }
    } else { // otherwise, play backwards
        player.loopStart = loopEnd;
        player.loopEnd = loopStart;
        player.reverse = true;
        if (player.state === "started") {
            player.sync().start("+1.01", loopEnd);
            gain.gain.rampTo(1, 1, "+1.01");
        }
    }
}

function keyPressed() {
    // start and stop the player with the space bar
    if (key === " ") {
        if (player.state === "stopped") {
            initializeTone();
            player.sync().start("+0.5", loopStart);
            gain.gain.rampTo(1, 1, "+0.5");
        } else {
            gain.gain.rampTo(0, 1);
            player.stop("+1")
        }
    } else if (key === "ArrowRight") { // cycle through buffers and backgrounds with right or left arrow
        bufferIndex = (bufferIndex + 1) % buffers.length;
        player.buffer = buffers[bufferIndex];
        calculateLoop();
        bgIndex = (bgIndex + 1) % bgColors.length;
    } else if (key === "ArrowLeft") {
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
    } else if (key === "1") {
        state = 0;
    } else if (key === "2") {
        state = 1;
    } else if (key === "3") {
        state = 2;
    } else if (key === "4") {
        state = 3;
    } else if (key === "Tab") {
        octaveLock = !octaveLock;
    }
}

function trackPad(event) {
    if (state === 0) {
        if (event.wheelDeltaY > 10) {
            if (grainSize > 0.02) {
                grainSize -= 0.01;
            }
        } else if (event.wheelDeltaY < -10) {
            if (grainSize < 2) {
                grainSize += 0.01;
            }
        } else if (event.wheelDeltaX < -10) {
            if (overlap > 0.01) {
                overlap -= 0.01;
            }
        } else if (event.wheelDeltaX > 10) {
            if (overlap < 2) {
                overlap += 0.01;
            }
        }
        if (!initRect) {
            initRect = true;
        }
        player.grainSize = grainSize;
        player.overlap = overlap;
    } else if (state === 1) {
        if (event.wheelDeltaY > 10) {
            if (bitWet > 0.01) {
                bitWet -= 0.01;
            }
        } else if (event.wheelDeltaY < -10) {
            if (bitWet < 0.98) {
                bitWet += 0.01;
            }
        } else if (event.wheelDeltaX < -10) {
            if (bits < 7.8) {
                bits += 0.1;
            }
        } else if (event.wheelDeltaX > 10) {
            if (bits > 4.1) {
                bits -= 0.1;
            }
        }
        crusher.bits.value = bits;
        crusher.wet.value = bitWet;
    } else if (state === 2) {
        if (event.wheelDeltaY > 10) {
            if (delayAmount > 0.01) {
                delayAmount -= 0.01;
            }
        } else if (event.wheelDeltaY < -10) {
            if (delayAmount < 0.98) {
                delayAmount += 0.01;
            }
        } else if (event.wheelDeltaX < -10) {
            if (reverbAmount > 0.01) {
                reverbAmount -= 0.01;
            }
        } else if (event.wheelDeltaX > 10) {
            if (reverbAmount < 0.98) {
                reverbAmount += 0.01;
            }
        }
        delay.wet.value = delayAmount;
        reverb.wet.value = reverbAmount;
    } else if (state === 3) {
        if (event.wheelDeltaY > 10) {
            gainVelocity = 100;
            if (gainVal > 0.01) {
                gainVal -= 0.01;
            }
        } else if (event.wheelDeltaY < -10) {
            gainVelocity = 100;
            if (gainVal < 0.98) {
                gainVal += 0.01;
            }
        } else if (event.wheelDeltaX < -10) {
            panVelocity = 100;
            if (panVal > -0.98) {
                panVal -= 0.01;
            }
        } else if (event.wheelDeltaX > 10) {
            panVelocity = 100;
            if (panVal < 0.98) {
                panVal += 0.01;
            }
        }
        gain.gain.value = gainVal;
        panner.pan.value = panVal;
    }
}

async function initializeTone() {
    await Tone.start();
    Tone.Transport.start();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

document.addEventListener("DOMContentLoaded", function(event) {
    const sidebar = document.querySelector('.sidebar');
    document.querySelector('button').onclick = function() {
        sidebar.classList.toggle('sidebar_small');
    }
    path = document.getElementById('path1')
    pathLength = Math.floor(path.getTotalLength());
});

function showButt() {
    const butt = document.getElementById('helpButt');
    butt.style.display = 'block';
}

let audio_file = document.getElementById('audio_file');
audio_file.onchange = function() {
    var file = URL.createObjectURL(this.files[0]);
    let buffer = new Tone.ToneAudioBuffer(file);
    buffers.unshift(buffer);
    player.buffer = buffers[0];
    bufferIndex = 0;
    calculateLoop();
};