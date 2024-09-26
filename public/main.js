import * as THREE from 'three';

let scene, camera, renderer, cube;
let score = 0;
let timeLeft = 30;
let gameActive = false;
let timer;
let config = {
    cubeColor: 0x00ff00,
    cubeSize: 1,
    cubeSpeed: 0.01,
    backgroundColor: 0x000000
};

const init = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    createCube();

    camera.position.z = 5;

    renderer.domElement.addEventListener('click', onDocumentMouseDown, false);

    document.getElementById('sideArrow').addEventListener('click', () => toggleOverlay('scoresOverlay'));
    document.querySelectorAll('.closeOverlay').forEach(el => el.addEventListener('click', (event) => toggleOverlay(event.target.parentElement.id)));
    document.getElementById('customizeButton').addEventListener('click', () => toggleOverlay('customizeOverlay'));

    document.getElementById('cubeColor').addEventListener('change', updateCubeColor);
    document.getElementById('cubeSize').addEventListener('input', updateCubeSize);
    document.getElementById('cubeSpeed').addEventListener('input', updateCubeSpeed);
    document.getElementById('backgroundColor').addEventListener('change', updateBackgroundColor);
    document.getElementById('saveConfig').addEventListener('click', saveConfiguration);

    getHighScores();
    loadConfiguration();
}

const createCube = () => {
    const geometry = new THREE.BoxGeometry(config.cubeSize, config.cubeSize, config.cubeSize);
    const material = new THREE.MeshBasicMaterial({ color: config.cubeColor });
    cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
}

const onDocumentMouseDown = (e) => {
    if (!gameActive) {
        startGame();
        return;
    }
    e.preventDefault();
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    mouse.x = (e.clientX / renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(e.clientY / renderer.domElement.clientHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        score++;
        updateScore();
        changeCubePosition();
    }
}

const changeCubePosition = () => {
    cube.position.x = Math.random() * 4 - 2;
    cube.position.y = Math.random() * 4 - 2;
}

const updateScore = () => {
    document.getElementById('info').textContent = `Score: ${score} | Time left: ${timeLeft}`;
}

const startGame = () => {
    if (timer) clearInterval(timer); // Clear any previous timers
    score = 0;
    timeLeft = 30;
    gameActive = true;
    updateScore();
    timer = setInterval(() => {
        timeLeft--;
        updateScore();
        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

const endGame = () => {
    gameActive = false;
    const name = prompt('Game over! Enter your name:');
    if (name) {
        saveScore(name, score);
    }
    document.getElementById('info').innerText = 'Game over! Click the cube to start again';
}

const saveScore = async (name, score) => {
    try {
        const response = await fetch('http://localhost:3000/scores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, score })
        });
        const data = await response.json();
        console.log('Saved score:', data);
        getHighScores();
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

const getHighScores = () => {
    fetch('http://localhost:3000/scores')
        .then(response => response.json())
        .then(data => {
            console.log('High scores:', data);
            updateScoresList(data);
        })
        .catch((error) => {
            console.error('Error fetching high scores:', error);
        });
}

const updateScoresList = (scores) => {
    const scoresList = document.getElementById('scoresList');
    scoresList.innerHTML = '';
    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.textContent = `${index + 1}. ${score.name} - ${score.score}`;
        scoresList.appendChild(li);
    });
}

const toggleOverlay = (overlayID) => {
    const overlay = document.getElementById(overlayID);
    overlay.classList.toggle('active');
    if (overlayID === 'scoresOverlay') {
        const arrow = document.getElementById('sideArrow');
        arrow.textContent = overlay.classList.contains('active') ? '◀' : '▶';
    }
}

const updateCubeColor = (e) => {
    config.cubeColor = parseInt(event.target.value.substring(1), 16);
    cube.material.color.setHex(config.cubeColor);
}

const updateCubeSize = (e) => {
    config.cubeSize = parseFloat(event.target.value);
    scene.remove(cube);
    createCube();
}

const updateCubeSpeed = (e) => {
    config.cubeSpeed = parseFloat(e.target.value);
}

const updateBackgroundColor = (e) => {
    config.backgroundColor = parseInt(e.target.value.substring(1), 16);
    renderer.setClearColor(config.backgroundColor);
}

const saveConfiguration = () => {
    fetch('http://localhost:3000/config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ config })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Config saved:', data);
            alert('Configuration saved successfully');
        })
        .catch((error) => {
            console.error('Error saving config:', error);
            alert('Failed to save configuration');
        });
}

const loadConfiguration = () => {
    fetch('http://localhost:3000/config')
        .then(response => response.json())
        .then(data => {
            console.log('Loaded config:', data);
            if (data && data.config) {
                config = data;
                applyConfiguration();
            }
        })
        .catch((error) => {
            console.error('Error fetching config:', error);
        });
}

const applyConfiguration = () => {
    document.getElementById('cubeColor').value = '#' + config.cubeColor.toString(16).padStart(6, '0');
    document.getElementById('cubeSize').value = config.cubeSize;
    document.getElementById('cubeSpeed').value = config.cubeSpeed;
    document.getElementById('backgroundColor').value = '#' + config.backgroundColor.toString(16).padStart(6, '0');

    scene.remove(cube);
    createCube();
    scene.background = new THREE.Color(config.backgroundColor);
}

function animate() {
    requestAnimationFrame(animate);
    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
}
// renderer.setAnimationLoop(animate);

init();
animate();