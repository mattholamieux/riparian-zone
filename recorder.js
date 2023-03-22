function audioRecorder() {
    // const $audio = document.querySelector('#myAudio');
    $($audio).hide();
    const actx = Tone.context;
    recDest = actx.createMediaStreamDestination();
    recorder = new MediaRecorder(recDest.stream, {
        mimeType: "audio/webm; codecs=opus"
    });
    let chunks = [];

    const buffer = new Tone.ToneAudioBuffer();


    recorder.onstart = evt => {
        chunks = [];
    };
    recorder.ondataavailable = evt => {
        chunks.push(evt.data);
    };
    recorder.onstop = evt => {
        let blob = new Blob(chunks, {
            type: 'audio/webm; codecs=opus'
        });
        let blobURL = URL.createObjectURL(blob);
        console.log(blobURL);
        buffer.load(blobURL).then(() => {
            console.log(buffer._buffer);
            convert(buffer._buffer);
        });
        // $audio.src = URL.createObjectURL(blob);
        $($audio).show();
    };

}

function convert(buffer) {
    const encoder = new WavAudioEncoder(44100, 2);
    encoder.encode(buffer)
    const blob = encoder.finish();
    console.log(blob)
}