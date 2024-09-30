const canvasEl = document.getElementById('visualizer'); // canvas 
const context = canvasEl.getContext('2d'); 
canvasEl.width = window.innerWidth; // full width
canvasEl.height = window.innerHeight * 0.7; 

const audioEl = document.getElementById('audio'); 
let audioCtx, freqAnalyser, mediaSource, byteData, len; // some vars

// controls for bars
const widthControl = document.getElementById('bar-width');
const heightControl = document.getElementById('bar-height');
const colorControl = document.getElementById('bar-color');
const speedControl = document.getElementById('speed');

audioEl.addEventListener('play', () => { // when audio plays
    if (!audioCtx) { // if not initialized
        setupAudioContext(); 
    }
});

function setupAudioContext() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)(); // create audio context
    freqAnalyser = audioCtx.createAnalyser(); // analyser for freq stuff
    mediaSource = audioCtx.createMediaElementSource(audioEl); // media element source
    mediaSource.connect(freqAnalyser); // connect to analyser
    freqAnalyser.connect(audioCtx.destination); // connect to destination
    freqAnalyser.fftSize = 256; // fft size, idk
    len = freqAnalyser.frequencyBinCount; // length of data array
    byteData = new Uint8Array(len); // new array for byte data

    animate(); 
}
function animate() {
    requestAnimationFrame(animate); // call this function again
    freqAnalyser.getByteFrequencyData(byteData); // get data for frequencies

    context.clearRect(0, 0, canvasEl.width, canvasEl.height); // clear the canvas

    const barWidth = parseInt(widthControl.value); // get bar width
    const barHeightFactor = parseInt(heightControl.value); // get height multiplier
    const hue = parseInt(colorControl.value); // get color hue
    const animationSpeed = parseInt(speedControl.value); // get speed

    let x = 0; // start at x = 0

    for (let i = 0; i < len; i++) { // loop through data
        const barHeight = byteData[i] * barHeightFactor / 256; // calculate height

        const fillColor = `hsl(${hue + i * animationSpeed}, 100%, 50%)`; // color stuff
        context.fillStyle = fillColor; // set fill color
        context.fillRect(x, canvasEl.height - barHeight, barWidth, barHeight); // draw the bar

        x += barWidth + 1; 
    }
}

window.onload = function() {
    alert("Welcome to the Interactive Audio Visualizer! \nClick play to start listening to music.\nAdjust the sliders to change the width, height hue, and speed of the bars");
};