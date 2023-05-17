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
let bits = 16;
let delayAmount = 0;
let reverbAmount = 0;
let chebyOrder = 1;
let bitWet = 0;
const delayTimes = ["64n", "32n", "16n", "8n", "4n", "2n", "1n"];
let angleRotate = 0;
let recorder, recDest;
let state = 0;
let divis;
const $audio = document.querySelector('#myAudio');
audioRecorder();

// Instantiate Tone.GrainPlayer object
const player = new Tone.GrainPlayer(buffers[bufferIndex]);
const fft = new Tone.FFT({
    size: 64
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
    bits: 16,
    wet: 1
});

const reverb = new Tone.Reverb({
    decay: 6,
    preDelay: 0.25,
    wet: 0
});

reverb.connect(recDest);


function setup() {
    // Create canvas and attch mouse events with callbacks
    cnv = createCanvas(windowWidth, windowHeight);
    cnv.style('display', 'block');
    cnv.mousePressed(getPressedPoint);
    cnv.mouseReleased(getReleasePoint);
    cnv.mouseWheel(trackPad);
    cnv.parent('canvas-holder');

    // Init settings for player
    player.loop = true;
    player.playbackRate = 1;
    player.overlap = overlap;
    player.grainSize = grainSize;
    reverb.toDestination();
    reverb.connect(fft);
    player.chain(crusher, cheby, delay, filter, reverb);
    player.loopStart = 0;
    player.loopEnd = buffers[bufferIndex].duration;
    pressedPoint = 0;
    releasePoint = 1;
    divis = width / 40;
}

function draw() {
    if (player.loaded) {
        // Draw background
        if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0) {
            background(40, mouseY / 2, bgColors[bgIndex], 5);
        }
        // Draw instructions
        noStroke();
        let f = 80;
        textSize(20);
        textLeading(5);
        textFont("serif");
        textAlign(LEFT);
        for (i = 0; i < mainInstructions.length; i++) {
            fill(f);
            text(mainInstructions[i], 10, 20 * [i] + 20);
            f += 10;
        }
        textAlign(RIGHT);
        f = 80;
        for (i = state * 4; i < (state * 4) + 4; i++) {
            fill(f);
            text(secondaryInstructions[i], width - 10, 20 * [i] + 20);
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

        // Draw rect to represent bit and cheby size
        let crusherDisplay = map(bits, 16, 4, (width / 80), (height / 1.5));
        let chebyDisplay = map(chebyOrder, 1, 20, (width / 80), (height / 1.5));
        rectMode(CENTER);
        fill(0, 155, 0, 5);
        rect(width / 2, height / 2, chebyDisplay, crusherDisplay);

        // Draw rect to represent delay amt
        let delayDisplay = map(delayAmount, 0, 1, 0, height * 2);
        rectMode(CENTER);
        fill(0, 0, 155, 3);
        rect(width / 2, height, width, delayDisplay);

        // Draw rect to represent delay amt
        let reverbDisplay = map(reverbAmount, 0, 1, 0, width * 2);
        rectMode(CENTER);
        fill(50, 0, 50, 3);
        rect(0, height / 2, reverbDisplay, height);

        // Affect player's tune and rate with mouseX and mouseY
        if (player.state === "started") {
            if (state === 0) {
                if (mouseX < width && mouseX > 0) {
                    player.detune = (mouseX / (width / 4)) * 1200 - 2400;
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
                    // console.log(8000 - ((mouseX / width) * 8000));
                    console.log(filter.type, filter.frequency.value);

                }
                if (mouseY < height && mouseY > 0) {
                    filter.Q.value = 20 - ((mouseY / height) * 20);

                }
            } else if (state === 2) {
                if (mouseX < width && mouseX > 0) {
                    let delayTime = (mouseX / width) * 4;
                    delay.delayTime.rampTo(delayTime, 0.5);
                }
                if (mouseY < height && mouseY > 0) {
                    delay.feedback.value = 1 - mouseY / height;
                }
            } else if (state === 3) {
                if (mouseX < width && mouseX > 0) {

                }
                if (mouseY < height && mouseY > 0) {

                }
            }

            let values = fft.getValue();
            for (i = 1; i < values.length; i++) {
                let mapVals = map(values[i], -100, 0, height, -400);
                stroke(mapVals, mapVals / 2, 100);
                strokeWeight(10);
                // let thisBin = point(i * divis, mapVals);
                rect(i * divis, mapVals, 5, 5);
            }
        }
    }

    // else {
    //  Loading Animation Here

    // })
}

function getPressedPoint() {
    // Capture mouse pressed x and y
    player.stop();
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

    // If mouse dragged left to right, play forwards
    if (loopStart < loopEnd) {
        player.loopStart = loopStart;
        player.loopEnd = loopEnd;
        player.reverse = false;
        player.sync().start("+0.5", loopStart);
    } else { // otherwise, play backwards
        player.loopStart = loopEnd;
        player.loopEnd = loopStart;
        player.reverse = true;
        player.sync().start("+0.5", loopEnd);
    }
    // isPlaying = true;
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

    if (key === "r") {
        recorder.start();
        console.log('start recording')
    }
    if (key === "s") {
        recorder.stop();
        player.stop();
        isPlaying = false;
        console.log('stop recording');
    }
    if (key === "1") {
        state = 0;
    }
    if (key === "2") {
        state = 1;
    }
    if (key === "3") {
        state = 2;
    }
    if (key === "4") {
        state = 3;
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
        player.grainSize = grainSize;
        player.overlap = overlap;
    } else if (state === 1) {
        if (event.wheelDeltaY > 10) {
            if (bits < 15.8) {
                bits += 0.1;
            }
        } else if (event.wheelDeltaY < -10) {
            if (bits > 4.1) {
                bits -= 0.1;
            }
        } else if (event.wheelDeltaX < -10) {
            if (chebyOrder > 1) {
                chebyOrder -= 0.1;
            }
        } else if (event.wheelDeltaX > 10) {
            if (chebyOrder < 20) {
                chebyOrder += 0.1;
            }
        }
        crusher.bits.value = bits;
        cheby.order = round(chebyOrder);
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
    }

}

async function initializeTone() {
    await Tone.start();
    Tone.Transport.start();
    console.log("audio context started");
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
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

const cb = document.getElementById('recBox');
cb.addEventListener('click', (e) => {
    if (cb.checked) {
        recorder.start();
        $($audio).hide();
        console.log('start recording')
    } else {
        recorder.stop();
        player.stop();
        isPlaying = false;
        console.log('stop recording');
    }
})