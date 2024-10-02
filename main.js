// import our three.js reference
import * as THREE from "https://unpkg.com/three/build/three.module.js";
import { Pane } from "https://unpkg.com/tweakpane";

const uniforms = {
  u_time: { value: 0.0 },
  u_frequency: { value: 0.0 },
  u_cr: { value: 0.4 },
  u_cg: { value: 0.4 },
  u_cb: { value: 0.4 },
};

const clock = new THREE.Clock();

const listener = new THREE.AudioListener();
const sound = new THREE.Audio(listener);

// 32 is the fftSize
const analyser = new THREE.AudioAnalyser(sound, 32);

const app = {
  init() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      1,
      1000
    );

    this.camera.position.z = 15;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    document.body.appendChild(this.renderer.domElement);

    this.createLights();
    this.mesh = this.createMesh();

    // ...the rare and elusive hard binding appears! but why?
    this.render = this.render.bind(this);
    this.render();

    // Setup audio
    this.camera.add(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(
      "https://cdn.glitch.global/0a79717a-f94b-41b2-afe6-83274b188a76/epic-drums-216819.mp3?v=1727862917397",
      function (buffer) {
        sound.setBuffer(buffer);
        sound.setLoop(true);
        sound.setVolume(0.5);
      }
    );

    // create a new tweakpane instance
    const pane = new Pane();
    const tab = pane.addTab({
      pages: [{ title: "Sound" }, { title: "View" }],
    });

    const play = tab.pages[0].addButton({ title: "Play" });
    const pause = tab.pages[0].addButton({ title: "Pause" });

    const vol = tab.pages[0].addBlade({
      view: "slider",
      label: "Volume",
      min: 0,
      max: 1,
      value: 0.5,
    });

    const pitch = tab.pages[0].addBlade({
      view: "slider",
      label: "Pitch",
      max: 1500,
      min: -1500,
      value: 0,
    });

    pitch.on("change", (ev) => {
      sound.setDetune(ev.value);
    });

    vol.on("change", (ev) => {
      sound.setVolume(ev.value);
    });

    play.on("click", () => {
      sound.play();
    });

    pause.on("click", () => {
      sound.pause();
    });

    const redSlide = tab.pages[1].addBlade({
      view: "slider",
      label: "red",
      max: 1.0,
      min: 0.1,
      value: 0.5,
    });

    const greenSlide = tab.pages[1].addBlade({
      view: "slider",
      label: "green",
      max: 1.0,
      min: 0.1,
      value: 0.5,
    });

    const blueSlide = tab.pages[1].addBlade({
      view: "slider",
      label: "blue",
      max: 1.0,
      min: 0.1,
      value: 0.5,
    });

    redSlide.on("change", (ev) => {
      uniforms.u_cr.value = ev.value.toFixed(2);
    });

    greenSlide.on("change", (ev) => {
      uniforms.u_cg.value = ev.value.toFixed(2);
    });

    blueSlide.on("change", (ev) => {
      uniforms.u_cb.value = ev.value.toFixed(2);
    });
  },

  createLights() {
    const pointLight = new THREE.DirectionalLight(0xcccccc, 2);
    this.scene.add(pointLight);
  },

  createMesh() {
    const geo = new THREE.IcosahedronGeometry(4, 30);
    const mat = new THREE.ShaderMaterial({
      wireframe: true,
      uniforms,
      vertexShader: document.getElementById("vertexshader").textContent,
      fragmentShader: document.getElementById("fragmentshader").textContent,
    });
    const mesh = new THREE.Mesh(geo, mat);

    this.scene.add(mesh);
    return mesh;
  },

  render() {
    uniforms.u_frequency.value = analyser.getAverageFrequency();
    uniforms.u_time.value = clock.getElapsedTime();

    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.render);
  },
};

window.onload = () => app.init();
