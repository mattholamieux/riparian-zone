![TO_014_typetoken_type-02](https://github.com/mattholamieux/riparian-zone/assets/50525591/6402d707-c188-4ba0-83a2-c468671604c6)

This project was built using tone.js & p5.js. It allows users to loop, mangle, & deconstruct tracks from my album [Riparian Zone](https://tracedobjects.bandcamp.com/album/riparian-zone), to create new ambient soundscapes.

It is meant to be explored using a laptop trackpad; it is not mobile-friendly

There are 4 pages of controls, which can be accessed with the number keys 1-4

For best results, use Chrome

<p><em>"music should be like a tree... standing there without wanting to tell you something"</em><br>-bernhard gunter</p>


### General Controls (any page)
- Press the space bar to start or stop the player
- Click, drag, and release to set loop start and end points
  - Click and drag left to right to play forwards; Click and drag right to left to play in reverse
- Left and Right arrows change tracks
- You can upload your own audio files using the link in the collapsible sidebar. Accepts .mp3 and .wav files

### Page One - Granular Playback

At the heart of riparianz.one is a primitive granular playback engine, which allows you to change the audio file's pitch independently of playback rate.

- The mouse's horizontal position affects the player's pitch in cents (1/100th of a semitone) or octaves
- The mouse's vertical position affects the player's playback rate
- Two-finger vertical scroll on the trackpad changes the player's grain size (the size of each chunk of audio that the buffer is chopped into and played back at)
- Two-finger horizontal scroll on the trackpad changes the grain overlap (duration of the cross-fade between successive grains)
- Pressing the shift key will lock pitch changes to octaves (2 octaves up and 2 octaves down from the original rate). Press shift again to return to cents

### Page Two - Bitcrush and Filter

The output of the granular playback engine is passed through a filter and a bitcrusher effect

- The mouse's horizontal position affects the filter frequency. When the mouse is on the left-hand side of the page, the filter is set to lowpass. When the mouse is on the right-hand side of the page, the filter is set to highpass
- The mouse's vertical position affects the filter resonance
- Two-finger vertical scroll on the trackpad changes the amount of bitcrush effect applied
- Two-finger horizontal scroll on the trackpad changes the bit depth (from 16 to 4 bits)

### Page Three - Delay and Reverb

Next in the signal chain are a ping-pong delay and reverb effects

- The mouse's horizontal position affects the delay time (from 0 to 2 seconds)
- The mouse's vertical position affects the delay feedback amount (be careful with higher values)
- Two-finger vertical scroll on the trackpad changes the amount of delay effect applied
- Two-finger horizontal scroll on the trackpad changes the amount of reverb effect applied

### Page Four - Main out and Looper

The final page gives us control over volume and panning of the final output. The signal also passes through a crude looper (just another delay effect with feedback at 100%).

- Two-finger vertical scroll on the trackpad changes the volume 
- Two-finger horizontal scroll on the trackpad changes the panning
- Pressing any letter key on the "home row" of keys (A-L) will record a delay loop.
  - Keys to the left record shorter loops (e.g. A = 0.25 seconds), while keys to the right recorder longer loops (e.g. L = 32 seconds).
  - After the loop is recorded it will begin playing back immediately and the granular playback engine will be stopped. Press the space bar to re-start the granular player.
  - Pressing the same key on the home row will overdub another layer into the loop.
  - Pressing a different key on the home row will stop the loop and clear the delay buffer. 
