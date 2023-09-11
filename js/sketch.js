function preload() {
    rzSvg = loadImage("images/TO_014_typetoken_type-01.png");
}

function setup() {
    cnv = createCanvas(windowWidth, windowHeight);
    if (windowWidth > 1100) {
        initCanvasAndAudio();

    } else {
        deviceErrorMessage();
    }
}

function draw() {
    if (!loadingAnimation) {
        if (player.loaded) {
            drawBackground();
            drawLoopRect();
            drawGrainRect();
            drawCrushRects();
            drawDelayRect();
            drawReverbRect();
            drawGainRect();
            drawPanRect();
            drawLooperRect();
            if (player.state === "started") {
                if (state === 0) {
                    changePitchAndRate();
                } else if (state === 1) {
                    changeFiltFreqAndQ();
                } else if (state === 2) {
                    changeDelayTimeAndFback();
                }
            }
        }
    } else {
        drawLoadingAnimation();
    }
}

function getPressedPoint() {
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
    mainGain.gain.rampTo(0, 1);
    player.stop("+1")
        // If mouse dragged left to right, play forwards
    if (loopStart < loopEnd) {
        player.loopStart = loopStart;
        player.loopEnd = loopEnd;
        player.reverse = false;
        if (player.state === "started") {
            player.sync().start("+1.01", loopStart);
            mainGain.gain.rampTo(1, 1, "+1.01");
        }
    } else { // otherwise, play backwards
        player.loopStart = loopEnd;
        player.loopEnd = loopStart;
        player.reverse = true;
        if (player.state === "started") {
            player.sync().start("+1.01", loopEnd);
            mainGain.gain.rampTo(1, 1, "+1.01");
        }
    }
}

function keyPressed() {
    switch (key) {
        case "a":
            loopTime = 0.25;
            looperControl(key);
            break;
        case "s":
            loopTime = 0.5;
            looperControl(key);
            break;
        case "d":
            loopTime = 1;
            looperControl(key);
            break;
        case "f":
            loopTime = 2;
            looperControl(key);
            break;
        case "g":
            loopTime = 3;
            looperControl(key);
            break;
        case "h":
            loopTime = 4;
            looperControl(key);
            break;
        case "j":
            loopTime = 8;
            looperControl(key);
            break;
        case "k":
            loopTime = 16;
            looperControl(key);
            break;
        case "l":
            loopTime = 32;
            looperControl(key);
            break;
        case "1":
            state = 0;
            break;
        case "2":
            state = 1;
            break;
        case "3":
            state = 2;
            break;
        case "4":
            state = 3;
            break;
        case " ":
            startStopPlayer();
            break;
        case "ArrowRight":
            changeBuffer('next');
            break;
        case "ArrowLeft":
            changeBuffer('previous');
            break;
        case "Shift":
            lockOctaves();
            break;
    }
}

function trackPad(event) {
    if (state === 0) {
        changeGrains(event);
    } else if (state === 1) {
        changeBits(event)
    } else if (state === 2) {
        changeDelayAndReverb(event);
    } else if (state === 3) {
        changeGainAndPan(event);
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
    const myButton = document.querySelector('button');
    myButton.onclick = function(event) {
        event.target.blur();
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

function drawBackground() {
    background("#bccf7530");
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
    let instructionChunk = secondaryInstructions[state];
    for (let i = 0; i < instructionChunk.length; i++) {
        text(instructionChunk[i], width - 20, 20 * [i] + 30);
    }
}

function initCanvasAndAudio() {
    cnv.style('display', 'block');
    cnv.mousePressed(getPressedPoint);
    cnv.mouseReleased(getReleasePoint);
    cnv.mouseWheel(trackPad);
    cnv.parent('canvas-holder');
    frameRate(60);
    // Init settings for player and FX
    player.loop = true;
    player.playbackRate = 1;
    player.overlap = overlap;
    player.grainSize = grainSize;
    looperGain.toDestination();
    reverb.toDestination();
    player.chain(mainGain, crusher, filterNode, panner, delay, reverb);
    looperPreGain.chain(looper, looperGain);
    reverb.connect(looperPreGain);
    player.loopStart = 0;
    player.loopEnd = buffers[bufferIndex].duration;
}

function deviceErrorMessage() {
    noLoop();
    fill('#000');
    textSize(40);
    text("Oops", 10, height / 2 - 40);
    textSize(20);
    text("This app is designed to run on devices with", 10, height / 2);
    text("display widths of at least 1100 pixels", 10, height / 2 + 20);
}

function drawLoopRect() {
    rectMode(CORNER);
    fill(73, 87, 76, 20);
    rect(x1, 0, x2 - x1, height);
}

function drawGrainRect() {
    grainSizeDisplay = map(grainSize, 0.01, 2, (width / 80), (height / 1.5));
    overlapDisplay = map(overlap, 0.01, 2, (width / 80), (height / 1.5));
    rectMode(CENTER);
    stroke("#305431")
    noFill();
    if (initRect) {
        rect(width / 2, height / 2, overlapDisplay, grainSizeDisplay);
    }
}

function drawCrushRects() {
    crushBlocks = floor(bits);
    crushBlockWidth = width / crushBlocks;
    crushBlockHeight = height / crushBlocks;
    noFill();
    stroke(48, 84, 49, (bitWet * 150));
    strokeWeight(4);
    for (let i = 1; i < crushBlocks; i++) {
        for (let j = 1; j < crushBlocks; j++) {
            rect(j * crushBlockWidth, i * crushBlockHeight, height / 10, height / 10);
        }
    }
}

function drawDelayRect() {
    noStroke();
    delayDisplay = map(delayAmount, 0, 1, 0, height * 2);
    rectMode(CENTER);
    fill(73, 87, 76, 10);
    rect(width / 2, height, width, delayDisplay);
}

function drawReverbRect() {
    reverbDisplay = map(reverbAmount, 0, 1, 0, width * 2);
    rectMode(CENTER);
    fill("#3054313a")
    rect(0, height / 2, reverbDisplay, height);
}

function drawGainRect() {
    gainDisplay = map(gainVal, 0, 1, height, 0);
    fill(48, 84, 49, gainVelocity);
    rect(10, gainDisplay, 10, 10);
    gainVelocity = 0;
}

function drawPanRect() {
    panDisplay = map(panVal, -1, 1, 0, width);
    fill(48, 84, 49, panVelocity);
    rect(panDisplay, height - 10, 10, 10);
    panVelocity = 0;
}

function drawLooperRect() {
    if (looperState === 1) {
        fill("#FF000030");
    } else if (looperState === 2) {
        fill("#305431")
    } else {
        fill("#bccf7530")
    }
    noStroke();
    rect(20, height - 20, 10, 10);
}

function changePitchAndRate() {
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
}

function changeFiltFreqAndQ() {
    if (mouseX < width && mouseX > 0) {
        if (mouseX < width / 2) {
            if (filterNode.type === "highpass") {
                filterNode.type = "lowpass"
            }
            filterNode.frequency.value = (mouseX / width) * 8000;
        } else {
            if (filterNode.type === "lowpass") {
                filterNode.type = "highpass"
            }
            filterNode.frequency.value = -4000 + ((mouseX / width) * 8000);
        }
    }
    if (mouseY < height && mouseY > 0) {
        filterNode.Q.value = 20 - ((mouseY / height) * 20);

    }
}

function changeDelayTimeAndFback() {
    if (mouseX < width && mouseX > 0) {
        let delayTime = (mouseX / width) * 2;
        delay.delayTime.rampTo(delayTime, 0.5);
    }
    if (mouseY < height && mouseY > 0) {
        delay.feedback.value = 1 - mouseY / height;
    }
}

function startStopPlayer() {
    if (player.state === "stopped") {
        initializeTone();
        player.sync().start("+0.5", loopStart);
        mainGain.gain.rampTo(1, 1, "+0.5");
        cnv.style('filter', 'grayscale(0%)');
    } else {
        mainGain.gain.rampTo(0, 1);
        player.stop("+1");
        cnv.style('filter', 'grayscale(50%)');
    }
}

function changeBuffer(direction) {
    if (direction === "next") {
        bufferIndex = (bufferIndex + 1) % buffers.length;
        player.buffer = buffers[bufferIndex];
        calculateLoop();
    } else if (direction === 'previous') {
        if (bufferIndex > 0) {
            bufferIndex = (bufferIndex - 1) % buffers.length;
            player.buffer = buffers[bufferIndex];
            calculateLoop();
        } else {
            bufferIndex = buffers.length - 1;
            player.buffer = buffers[bufferIndex];
            calculateLoop();
        }
    }
}

function lockOctaves() {
    octaveLock = !octaveLock;
    if (octaveLock) {
        secondaryInstructions[0][0] = "mouse x : octave"
    } else {
        secondaryInstructions[0][0] = "mouse x : pitch"
    }
}

function looperControl(key) {
    if (!feedbackLoop) {
        looperState = 1;
        looper.delayTime.value = loopTime;
        looperPreGain.gain.rampTo(1, 0.1);
        looper.feedback.rampTo(1, 0.1);
        feedbackLoop = true;
        setTimeout(function() {
            looperState = 2;
            looperGain.gain.rampTo(1, 0.1);
            looperPreGain.gain.rampTo(0, 0.1);
            cnv.style('filter', 'grayscale(50%)');
            mainGain.gain.rampTo(0, 1);
            player.stop("+1");
        }, (loopTime * 1000));
    } else {
        if (key === prevKey) {
            looperState = 1;
            looper.delayTime.value = loopTime;
            looperPreGain.gain.rampTo(1, 0.1);
            looper.feedback.rampTo(1, 0.1);
            feedbackLoop = true;
            setTimeout(function() {
                looperState = 2;
                looperGain.gain.rampTo(1, 0.1);
                looperPreGain.gain.rampTo(0, 0.1);
                cnv.style('filter', 'grayscale(50%)');
                mainGain.gain.rampTo(0, 1);
                player.stop("+1");
            }, (loopTime * 1000));
        } else {
            looperState = 0;
            feedbackLoop = false;;
            looper.feedback.rampTo(0, 1);
            looperGain.gain.rampTo(0, 1);
        }
    }
    prevKey = key;
}

function changeGrains(event) {
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
}

function changeBits(event) {
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
}

function changeDelayAndReverb(event) {
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

function changeGainAndPan(event) {
    if (event.wheelDeltaY > 10) {
        gainVelocity = 200;
        if (gainVal > 0.01) {
            gainVal -= 0.01;
        }
    } else if (event.wheelDeltaY < -10) {
        gainVelocity = 200;
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
    mainGain.gain.value = gainVal;
    panner.pan.value = panVal;
}

function drawLoadingAnimation() {
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