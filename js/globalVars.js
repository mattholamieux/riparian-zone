// Define Global Variables
let cnv;
let x1 = 0,
    x2 = 0,
    y1 = 0,
    y2 = 0;
const buffers = [buffer1, buffer2, buffer3, buffer4, buffer5, buffer6, buffer7, buffer8]; // Defined in buffers.js
let bufferIndex = 0;
let loopStart, loopEnd;
let pressedPoint = 0;
let releasePoint = 1;
let grainSize = 0.1;
let grainSizeDisplay;
let overlapDisplay;
let crushBlocks;
let crushBlockWidth;
let crushBlockHeight;
let overlap = 0.1;
let bits = 8;
let delayAmount = 0;
let delayDisplay;
let reverbAmount = 0;
let reverbDisplay;
let chebyOrder = 1;
let bitWet = 0;
let gainVal = 0.7;
let panVal = 0;
let panVelocity = 0;
let panDisplay;
let gainVelocity = 0;
let gainDisplay;
let octaveLock = false;
let state = 0;
let initRect = false;
let rzSvg;
let path;
let pathLength;
let pathCounter = 0;
let loadingAnimation = true;
let firstLoop = true;
let looperState = 0;
let feedbackLoop = false;
let loopTime = 4;
let prevKey = "";

// Instantiate Tone.GrainPlayer object
const player = new Tone.GrainPlayer(buffers[bufferIndex]);

const delay = new Tone.PingPongDelay({
    delayTime: 2,
    maxDelay: 4,
    feedback: 0,
    wet: delayAmount
})

const looper = new Tone.FeedbackDelay({
    delayTime: 8,
    maxDelay: 33,
    feedback: 0,
    wet: 1
});

const cheby = new Tone.Chebyshev({
    oversample: "none",
    order: 1
});

const filterNode = new Tone.Filter({
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

const mainGain = new Tone.Gain(gainVal);
const looperGain = new Tone.Gain(0);
const looperPreGain = new Tone.Gain(0);
const panner = new Tone.Panner(panVal);