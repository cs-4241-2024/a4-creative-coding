import { Pane } from "https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js";

import {
  // Vector,
  vAdd,
  vCreate,
  vMultiplyScalar,
  vNormalize,
  vRotateByAngle,
} from "./vector.js";

// Setup TweakPane
const pane = new Pane({ title: "Settings" });

// World Options, must be set before start
const numAgents = 20000;
const canvasScale = 2;

// Settings that can be changed
const Params = {
  agentVelocity: 1,
  senseDistance: 10,
  senseAngle: 1.2,
  decayFactor: 20,
  turnSpeed: 0.7,
};

pane.addBinding(Params, "agentVelocity", { min: 0.1, max: 5, step: 0.1 });
pane.addBinding(Params, "senseDistance", { min: 1, max: 50, step: 1 });
pane.addBinding(Params, "senseAngle", { min: 0.1, max: 3.2, step: 0.1 });
pane.addBinding(Params, "decayFactor", { min: 1, max: 100, step: 1 });
pane.addBinding(Params, "turnSpeed", { min: 0.1, max: 3.2, step: 0.1 });
const openButton = pane.addButton({
  title: "Open Instructions",
});

// Instructions open option
openButton.on("click", () => {
  document.getElementById("instructions").style.display = "flex";
});

// Instructions close option
document.getElementById("close").onclick = () => {
  document.getElementById("instructions").style.display = "none";
};

// Initialize canvas and rendering context
const canvas = document.getElementById("canvas");
canvas.height = document.body.clientHeight / canvasScale;
canvas.width = document.body.clientWidth / canvasScale;

const ctx = canvas.getContext("2d", { willReadFrequently: true });

// Fill screen with black
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Initialize agents inside a circle with random position facing towards the center
// type Agent = {
//   position: Vector;
//   velocity: Vector;
// };

const agentList = [];

for (let i = 0; i < numAgents; i++) {
  const p = vCreate(Math.random() * 200, Math.random() * 2 * Math.PI);
  const center = {
    x: canvas.width / 2,
    y: canvas.height / 2,
  };
  agentList.push({
    position: vAdd(p, center),
    direction: vMultiplyScalar(vNormalize(p), -1),
  });
}

// Get index in a 1D array from a 2D vector
const getIndex = (location) => {
  if (
    location.x < 0 ||
    location.x > canvas.width - 1 ||
    location.y < 0 ||
    location.y > canvas.height - 1
  )
    return -1;
  else
    return (
      Math.round(location.y) * 4 * canvas.width + Math.round(location.x) * 4 + 3
    );
};

const updateAgent = (agent, imgData) => {
  // Sense
  const temp = vMultiplyScalar(agent.direction, Params.senseDistance);

  const turnStrength = Math.random();

  // Get index of data to sense
  let leftSenseIndex = getIndex(
    vAdd(vRotateByAngle(temp, -Params.senseAngle), agent.position)
  );
  let forewardSenseIndex = getIndex(vAdd(temp, agent.position));
  let rightSenseIndex = getIndex(
    vAdd(vRotateByAngle(temp, Params.senseAngle), agent.position)
  );

  // Get value, if index is out of bounds avoid it
  const penalty = 256;
  const leftVal = leftSenseIndex == -1 ? penalty : imgData[leftSenseIndex];
  const forewardVal =
    forewardSenseIndex == -1 ? penalty : imgData[forewardSenseIndex];
  const rightVal = rightSenseIndex == -1 ? penalty : imgData[rightSenseIndex];

  // Rotate
  if (forewardVal <= leftVal && forewardVal <= rightVal) {
  } else if (forewardVal > leftVal && forewardVal > rightVal) {
    agent.direction = vRotateByAngle(
      agent.direction,
      (turnStrength - 0.5) * 2 * Params.turnSpeed
    );
  } else if (leftVal < rightVal) {
    agent.direction = vRotateByAngle(
      agent.direction,
      -Params.turnSpeed * turnStrength
    );
  } else {
    agent.direction = vRotateByAngle(
      agent.direction,
      Params.turnSpeed * turnStrength
    );
  }

  // Move
  agent.position = vAdd(
    agent.position,
    vMultiplyScalar(agent.direction, Params.agentVelocity)
  );
  // Ensure agent stays in bounds, wrap around borders
  if (agent.position.x < 0) {
    agent.position.x += canvas.width;
  }
  if (agent.position.x >= canvas.width - 1) {
    agent.position.x -= canvas.width;
  }
  if (agent.position.y < 0) {
    agent.position.y += canvas.height;
  }
  if (agent.position.y >= canvas.height) {
    agent.position.y -= canvas.height;
  }

  return agent;
};

let prevTime = 1;

const rollingAvg = [];
for (let i = 0; i < 20; i++) {
  rollingAvg.push(0);
}

const animationLoop = (currentTime) => {
  requestAnimationFrame(animationLoop);

  // Print framerate
  const deltaTime = Math.min(1, (currentTime - prevTime) / 1000);
  prevTime = currentTime;
  const curFrameRate = Math.round(100 / deltaTime) / 100;
  rollingAvg.shift();
  rollingAvg.push(curFrameRate);

  let sum = 0;
  for (let num of rollingAvg) {
    sum += num;
  }
  console.log("Framerate: " + Math.round((sum * 100) / 20) / 100);

  const curState = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // Update all agents
  for (let agent of agentList) {
    agent = updateAgent(agent, curState.data);
  }

  // Decay
  const nextState = ctx.createImageData(curState);
  for (let x = 0; x < canvas.width; x++) {
    for (let y = 0; y < canvas.height; y++) {
      nextState.data[y * 4 * canvas.width + x * 4 + 3] =
        curState.data[getIndex({ x: x, y: y })] + Params.decayFactor;
    }
  }

  // TODO: Diffuse

  for (let agent of agentList) {
    // Deposit
    nextState.data[
      Math.round(agent.position.y) * 4 * canvas.width +
        Math.round(agent.position.x) * 4 +
        3
    ] = 0;
  }

  // Render
  ctx.putImageData(nextState, 0, 0);
};

// Start animation loop
requestAnimationFrame(animationLoop);
