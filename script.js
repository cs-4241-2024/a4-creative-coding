import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js";

const settings = {
  barWidth: 2,
  amplitude: 1,
  speed: 1,
  red: 255,
  green: 255,
  blue: 255,
};

let audioElement;
let isPlaying = false;
let isPaused = false;
let animationFrameId;
let audioCtx, analyser;

const pane = new Pane({
  container: document.querySelector(".controls")
});

pane.addBlade({
  view: "slider",
  label: "Bar Width",
  min: 2,
  max: 50,
  value: settings.barWidth,
}).on("change", (ev) => {
  settings.barWidth = ev.value;
});

pane.addBlade({
  view: "slider",
  label: "Amplitude",
  min: 1,
  max: 5,
  value: settings.amplitude,
}).on("change", (ev) => {
  settings.amplitude = ev.value;
});

pane.addBlade({
  view: "slider",
  label: "Visualizer Speed",
  min: 0.5,
  max: 2,
  value: settings.speed,
}).on("change", (ev) => {
  settings.speed = ev.value;
});

pane.addBlade({
  view: "slider",
  label: "Red",
  min: 0,
  max: 255,
  value: settings.red,
}).on("change", (ev) => {
  settings.red = ev.value;
  updateColor();
});

pane.addBlade({
  view: "slider",
  label: "Green",
  min: 0,
  max: 255,
  value: settings.green,
}).on("change", (ev) => {
  settings.green = ev.value;
  updateColor();
});

pane.addBlade({
  view: "slider",
  label: "Blue",
  min: 0,
  max: 255,
  value: settings.blue,
}).on("change", (ev) => {
  settings.blue = ev.value;
  updateColor();
});

function updateColor() {
  settings.color = `rgb(${settings.red},${settings.green},${settings.blue})`;
}

const startVisualization = function () {
  const canvas = document.getElementById("visualizerCanvas");
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    const source = audioCtx.createMediaElementSource(audioElement);
    source.connect(audioCtx.destination);
    source.connect(analyser);
  }

  const frequencyData = new Uint8Array(analyser.frequencyBinCount);

  const draw = function () {
    if (!isPlaying) return;
    animationFrameId = window.requestAnimationFrame(draw);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = settings.color;
    analyser.getByteFrequencyData(frequencyData);

    for (let i = 0; i < analyser.frequencyBinCount; i++) {
      const barHeight = (frequencyData[i] * settings.amplitude) / 2;
      ctx.fillRect(
        i * settings.barWidth,
        canvas.height - barHeight,
        settings.barWidth - 1,
        barHeight
      );
    }
  };
  draw();
};

document.getElementById("startBtn").addEventListener("click", () => {
  const audioFile = document.getElementById("audioFile").files[0];
  if (audioFile) {
    audioElement = new Audio(URL.createObjectURL(audioFile));
    audioElement.play();
    isPlaying = true;
    isPaused = false;
    startVisualization();
  } else {
    alert("Please upload an MP3 file to start visualization.");
  }
});

document.getElementById("pauseBtn").addEventListener("click", () => {
  if (isPlaying) {
    audioElement.pause();
    isPlaying = false;
    isPaused = true;
  }
});

document.getElementById("playBtn").addEventListener("click", () => {
  if (isPaused) {
    audioElement.play();
    isPlaying = true;
    startVisualization();
  }
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  const link = document.createElement("a");
  link.href = 'https://cdn.glitch.global/a059e0d7-4385-4f92-8298-e568dda5f65d/jocofullinterview41.mp3?v=1727710892368';  // Replace with actual path to the default audio file
  link.download = 'default-audio.mp3';
  link.click();
});
