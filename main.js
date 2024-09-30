// Audio setup
const audio = new Audio('tunes/mm.mp3'); 
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
const source = audioContext.createMediaElementSource(audio);
source.connect(analyser);
analyser.connect(audioContext.destination);
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
audio.play();



// generate random sphere for the user
function addRandomSphere() {
  const randomGeometry = new THREE.SphereGeometry(0.5, 16, 16);
  const randomMaterial = new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff });
  const randomSphere = new THREE.Mesh(randomGeometry, randomMaterial);

  // Generate random position
  randomSphere.position.set(
      Math.random() * 10 - 5, 
      Math.random() * 10 - 5,  
      Math.random() * 10 - 5   
  );

  // tag variable
  randomSphere.isUserAdded = true; 
  scene.add(randomSphere);
}

// gui control bass
const gui = new dat.GUI();
const controls = {
    recColor: 0xd1ff,
    sphereColor: 0xFFD966,
    size: 5,
    yourColor: 0xFFD966,

    addSphere: function(){
      addRandomSphere();
    }
};

// change color of rectangles
gui.addColor(controls, 'recColor').name('Rec Color').onChange((value) => {

    scene.children.forEach((child) => {
      if (child.material && child.name === "rec") {
          child.material.color.set(value); 
      }

    });
});

// change color of circles
gui.addColor(controls, 'sphereColor').name('Sphere Color').onChange((value) => {

  scene.children.forEach((child) => {
    if (child.material && child.name === "circ") {
        child.material.color.set(value); 
    }

  });
});

// change size of user-generated
gui.add(controls, 'size', 1, 10).name('Change Yr Shape').onChange((value) => {
  scene.children.forEach((child) => {
    if (child instanceof THREE.Mesh && child.isUserAdded) {  // if mesh?
        child.scale.set(value, value, value);  
    }
  });
});

gui.addColor(controls, 'yourColor').name('Change Yr Color').onChange((value) => {

  scene.children.forEach((child) => {
    if (child.material && child.isUserAdded) {  // if mesh?
      child.material.color.set(value); 
    }

  });
});


gui.add(controls, 'addSphere').name('Add Random Sphere');


// Three.js setup
import * as THREE from 'three';
const scene = new THREE.Scene(); 
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 ); 
const renderer = new THREE.WebGLRenderer(); 
renderer.setSize( window.innerWidth, window.innerHeight ); 
document.body.appendChild( renderer.domElement );



// bpm
const bpm = 150; 

function beatsCount(bpm) {
  // 60 seconds / bpm
  return 60000 / bpm; 
}

const beatInterval = beatsCount(bpm); 

// Function to add a random shape at each beat
function addShapeAtBeat() {
  const shapeType = Math.floor(Math.random() * 2);
  let shape;

  if (shapeType === 0) {
      // Add a sphere
      const sphereGeometry = new THREE.SphereGeometry(0.5, 16, 16);
      const sphereMaterial = new THREE.MeshBasicMaterial({ color: controls.sphereColor  });
      shape = new THREE.Mesh(sphereGeometry, sphereMaterial);
      shape.name = "circ";

  } else {
      const recGeo = new THREE.BoxGeometry(1, 1, 1); 
      const recMat = new THREE.MeshBasicMaterial({ color: controls.recColor }); // blue
      shape = new THREE.Mesh(recGeo, recMat);
      shape.name = "rec";

  }

  shape.position.set(
      Math.random() * 12 - 5, 
      Math.random() * 12 - 5, 
      Math.random() * 12 - 5  
  );


  scene.add(shape);
}

// add shapes per bpm
setInterval(addShapeAtBeat, beatInterval);

// Camera setup
camera.position.set( 0, 5, 10 ); 
camera.lookAt( 0, 0, 0 );  // Look at the cubes



function animate() {
  requestAnimationFrame(animate);
  analyser.getByteFrequencyData(dataArray);
  const avgFrequency = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;



  const scaleValue = avgFrequency / 500; 

  // change size of user-made tokens
  scene.children.forEach((child) => {
    if (child instanceof THREE.Mesh && !child.isUserAdded) {  
        child.scale.set(scaleValue, scaleValue, scaleValue);  // Scale based on avgFrequency
    }
  });


  renderer.render(scene, camera);
}


animate();

// make sure window is sized right
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  renderer.setSize(window.innerWidth, window.innerHeight);
});

