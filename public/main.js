var scene, camera, renderer;
var planeGeometry, planeMaterial, planeMesh;
var skierModel;
var trees = [];
var additionalTrees = [];
var moveLeft = false,
  moveRight = false;
const boundary = 2.5;
let gameOver = false;
const numTrees = 5;
let secondSetSpawned = false;
let startTime = 0;
let elapsedTime = 0;
let timerInterval;

setup();
loadGLBModel();
addKeyListeners();

function setup() {
  createScene();
  createCamera();
  createRenderer();
  addRendererToHTML();
  getPlane();
  addLights();
  createSky();
  loadTreeModels();
}

function createScene() {
  scene = new THREE.Scene();
}

function createCamera() {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );
  camera.position.set(0, 1.5, -2);
  camera.lookAt(0, 1, 0);
}

function createRenderer() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x87ceeb);
}

function addRendererToHTML() {
  document.getElementById("webgl").appendChild(renderer.domElement);
}

function getPlane() {
  planeGeometry = new THREE.PlaneGeometry(5, 14);
  planeMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    side: THREE.DoubleSide,
  });
  planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
  planeMesh.rotation.x = Math.PI / 2;
  scene.add(planeMesh);
}

function addLights() {
  var directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(0, 1.5, -2);
  directionalLight.target.position.set(0, 0.5, 0);
  scene.add(directionalLight);

  var ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
  scene.add(ambientLight);
}

function createSky() {}

function getRandomXPosition() {
  return Math.random() * (boundary * 2) - boundary;
}

function loadGLBModel() {
  var loader = new THREE.GLTFLoader();

  loader.load(
    "https://cdn.glitch.global/d29aac78-8a01-43f2-92b6-033cebbb75b8/skiier.glb?v=1727369998438",
    function (gltf) {
      skierModel = gltf.scene;

      skierModel.position.set(0, 0.2, -1);
      skierModel.scale.set(0.15, 0.15, 0.15);

      skierModel.traverse(function (node) {
        if (node.isMesh) {
          node.castShadow = false;
          node.receiveShadow = false;
          node.material.needsUpdate = true;
        }
      });

      scene.add(skierModel);

      camera.position.set(0, 1.5, -2);
      camera.lookAt(0, 0, 0);
    },
    undefined,
    function (error) {
      console.error("An error occurred while loading the model", error);
    }
  );
}

function loadTreeModels() {
  var loader = new THREE.GLTFLoader();

  for (let i = 0; i < numTrees; i++) {
    loader.load(
      "https://cdn.glitch.global/d29aac78-8a01-43f2-92b6-033cebbb75b8/CartoonTree.glb?v=1727371285918",
      function (gltf) {
        let treeModel = gltf.scene;

        treeModel.position.set(getRandomXPosition(), 0.2, 6);
        treeModel.scale.set(0.1, 0.1, 0.1);

        treeModel.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = false;
            node.receiveShadow = false;
            node.material.needsUpdate = true;
          }
        });

        scene.add(treeModel);
        trees.push(treeModel);
      },
      undefined,
      function (error) {
        console.error("An error occurred while loading the tree model", error);
      }
    );
  }
}

function loadAdditionalTreeModels() {
  var loader = new THREE.GLTFLoader();

  for (let i = 0; i < numTrees; i++) {
    loader.load(
      "https://cdn.glitch.global/d29aac78-8a01-43f2-92b6-033cebbb75b8/CartoonTree.glb?v=1727371285918",
      function (gltf) {
        let treeModel = gltf.scene;

        treeModel.position.set(getRandomXPosition(), 0.2, 6);
        treeModel.scale.set(0.1, 0.1, 0.1);

        treeModel.traverse(function (node) {
          if (node.isMesh) {
            node.castShadow = false;
            node.receiveShadow = false;
            node.material.needsUpdate = true;
          }
        });

        scene.add(treeModel);
        additionalTrees.push(treeModel);
      },
      undefined,
      function (error) {
        console.error("An error occurred while loading the tree model", error);
      }
    );
  }
}

function addKeyListeners() {
  document.addEventListener("keydown", function (event) {
    if (event.code === "ArrowLeft") {
      moveLeft = true;
    }
    if (event.code === "ArrowRight") {
      moveRight = true;
    }
  });

  document.addEventListener("keyup", function (event) {
    if (event.code === "ArrowLeft") {
      moveLeft = false;
    }
    if (event.code === "ArrowRight") {
      moveRight = false;
    }
  });
}

function updateSkierPosition() {
  if (skierModel) {
    if (moveLeft && skierModel.position.x < boundary) {
      skierModel.position.x += 0.05;
    }
    if (moveRight && skierModel.position.x > -boundary) {
      skierModel.position.x -= 0.05;
    }
  }
}

function updateTreesPosition() {
  if (trees.length > 0 && !gameOver) {
    trees.forEach(function (treeModel) {
      treeModel.position.z -= 0.05;

      if (treeModel.position.z < 2 && !secondSetSpawned) {
        secondSetSpawned = true;
        loadAdditionalTreeModels();
      }

      if (treeModel.position.z < -2) {
        treeModel.position.z = 6;
        treeModel.position.x = getRandomXPosition();
      }

      checkCollision(treeModel);
    });
  }
}

function updateAdditionalTreesPosition() {
  if (additionalTrees.length > 0 && !gameOver) {
    additionalTrees.forEach(function (treeModel) {
      treeModel.position.z -= 0.05;

      if (treeModel.position.z < -2) {
        treeModel.position.z = 6;
        treeModel.position.x = getRandomXPosition();
      }

      checkCollision(treeModel);
    });
  }
}

function checkCollision(treeModel) {
  const distanceX = Math.abs(skierModel.position.x - treeModel.position.x);
  const distanceZ = Math.abs(skierModel.position.z - treeModel.position.z);

  if (distanceX < 0.3 && distanceZ < 0.3 && !gameOver) {
    gameOver = true;
    clearInterval(timerInterval);

    let playerName = prompt("Game Over! Enter your name:");

    if (playerName && playerName.trim() !== "") {
      saveHighScore(playerName, elapsedTime);
    }

    showStartScreen(`Game Over! You survived for ${elapsedTime} seconds.`);
  }
}

function startRenderer() {
  function animate() {
    requestAnimationFrame(animate);
    if (gameStarted && !gameOver) {
      updateSkierPosition();
      updateTreesPosition();
      updateAdditionalTreesPosition();
    }
    renderer.render(scene, camera);
  }
  animate();
}

function showStartScreen(message = "") {
  fetchHighScore();
  const startScreen = document.getElementById("startScreen");
  const content = startScreen.querySelector(".content");
  const startButton = document.getElementById("startButton");

  const existingMessage = content.querySelector(".game-message");
  if (existingMessage) {
    existingMessage.remove();
  }

  if (message) {
    const messageElement = document.createElement("p");
    messageElement.textContent = message;
    messageElement.classList.add("game-message");
    content.insertBefore(messageElement, startButton);
  }

  startScreen.style.display = "flex";
  startButton.onclick = startGame;
}

function hideStartScreen() {
  const startScreen = document.getElementById("startScreen");
  startScreen.style.display = "none";
}

function startGame() {
  hideStartScreen();
  gameStarted = true;
  gameOver = false;
  resetGame();

  startTime = Date.now();
  elapsedTime = 0;
  document.getElementById("timer").textContent = "Time: 0s";

  timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
  if (!gameOver) {
    elapsedTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").textContent = `Time: ${elapsedTime}s`;
  }
}

function resetGame() {
  if (skierModel) {
    skierModel.position.set(0, 0.2, -1);
  }

  trees.forEach((tree) => scene.remove(tree));
  additionalTrees.forEach((tree) => scene.remove(tree));

  trees = [];
  additionalTrees = [];

  moveLeft = false;
  moveRight = false;

  loadTreeModels();
  secondSetSpawned = false;

  if (timerInterval) {
    clearInterval(timerInterval);
  }

  camera.position.set(0, 1.5, -2);
  camera.lookAt(0, 0, 0);
}

async function saveHighScore(name, score) {
  if (!name || name.trim() === "") {
    console.error("Invalid name. High score not saved.");
    return;
  }

  const response = await fetch("/save-highscore", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, score }),
  });

  const data = await response.json();
  if (data.success) {
    console.log("High score saved!");
  } else {
    console.error("Error saving high score");
  }
}

async function fetchHighScore() {
  const response = await fetch("/highscore");
  const highScore = await response.json();
  document.getElementById(
    "highScore"
  ).textContent = `High Score: ${highScore.name} - ${highScore.score}s`;
}

showStartScreen();
startRenderer();
