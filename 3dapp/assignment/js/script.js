let scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false;
let loadedModel;
let isRotating = false;
let rotationSettings = {
  speed: 0.02,
  axis: "y"
};
let ambientLight, directionalLight, fillLight;
let gui;


const assetPath = './assets/models/';
const loader = new THREE.GLTFLoader();
const buttonSound = new Audio('./assets/sounds/buttonclick.mp3');
const buttonModelSound = new Audio('./assets/sounds/buttonclickmodel.mp3');
buttonSound.volume = 0.5;

class ColorGUIHelper {
    constructor(object, prop) {
      this.object = object;
      this.prop = prop;
    }
    get value() {
      return this.object[this.prop].getHexString();
    }

    set value(hexString) {
      this.object[this.prop].set(hexString);
    }
}

function init(){

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-5, 25, 20);
  
  ambientLight = new THREE.AmbientLight(0xffffff, 2.5);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 3);
  directionalLight.position.set(5, 10, 7);
  scene.add(directionalLight);

  fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  gui = new lil.GUI();
  setupLightingGUI();

  const canvas = document.getElementById('threeContainer');
  renderer = new THREE.WebGLRenderer({ canvas: canvas});
  renderer.setPixelRatio(window.devicePixelRatio);
  resize();


  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(1, 2, 0);
  controls.update();

  setupButtons();

  loadModel('can.glb', 'A model of a Coca-Cola can, complete with a tab opening animation.');

  window.addEventListener('resize', resize, false);

  animate();
}

function playButtonSound() {
  buttonSound.currentTime = 0;
  buttonSound.play();
}

function playModelButtonSound() {
  buttonModelSound.currentTime = 0;
  buttonModelSound.play();
}

function setupButtons() {


  const btn = document.getElementById('btn');
  if (btn) {
    btn.addEventListener('click', function () {
      playButtonSound();
      if (actions.length > 0) {
        actions.forEach(action => {
          action.reset();
          action.setLoop(THREE.LoopOnce);
          action.clampWhenFinished = true;
          action.timeScale = 1;
          action.play();
        });
      } else {
        console.warn('No animations found');
      }
    });
  }

  const wireframeBtn = document.getElementById('toggleWireframe');
  if (wireframeBtn) {
    wireframeBtn.addEventListener('click', function () {
      playButtonSound();
      isWireframe = !isWireframe;
      toggleWireframe(isWireframe);
    });
  }

  const rotateBtn = document.getElementById('rotate');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', function() {
      playButtonSound();
      isRotating = !isRotating;
    });
  }

  const canBtn = document.getElementById('loadCan');
  if (canBtn) {
    canBtn.addEventListener('click', function() {
      playModelButtonSound();
      loadModel('can.glb', 'A model of a Coca-Cola can, complete with a tab opening animation.');
    }); 
  }

  const cubeBtn = document.getElementById('loadCube');
  if (cubeBtn) {
    cubeBtn.addEventListener('click', function() {
      playModelButtonSound();
      loadModel('rubiks.glb', 'A model of a Rubiks Cube, whose animation turns the faces of the cube authentically.');
    });
  }

  const chestBtn = document.getElementById('loadChest');
  if (chestBtn) {
    chestBtn.addEventListener('click', function() {
      playModelButtonSound();
      loadModel('chest.glb', 'A model of a Treasure Chest (that is unfortunately empty), which you can open with its animation.');
    });
  }
  
  
}

function animate(){
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(clock.getDelta());
  }

  let axis;

  switch (rotationSettings.axis) {
    case "x":
      axis = new THREE.Vector3(1, 0, 0);
      break;
    case "y":
      axis = new THREE.Vector3(0, 1, 0);
      break;
    case "z":
      axis = new THREE.Vector3(0, 0, 1);
      break;
  }

  if (isRotating && loadedModel) {
    loadedModel.rotateOnAxis(axis, rotationSettings.speed);
  }

  renderer.render(scene, camera);
}

function toggleWireframe(enable) {
  if (!loadedModel) return;

  scene.traverse(function (object) {
    if (object.isMesh) {
      object.material.wireframe = enable;
    }
  });
}

function resize() {
  const canvas = document.getElementById('threeContainer');
  const parent = canvas.parentElement;

  const width = parent.clientWidth;
  const height = canvas.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);

}

function update(){
  requestAnimationFrame(update);

  renderer.render(scene, camera);
}

function loadModel(modelFile, modelName) {
  isRotating = false;
  if (loadedModel) {
    scene.remove(loadedModel);
    loadedModel = null;
  }

  actions = [];

  loader.load(assetPath + modelFile, function(gltf) {
    const model = gltf.scene;
    scene.add(model);

    loadedModel = model;
    
    mixer = new THREE.AnimationMixer(model);

    gltf.animations.forEach(clip => {
      const action = mixer.clipAction(clip);
      actions.push(action);
    });

  }); 

  const title = document.getElementById("modelTitle");
  if (title) {
    title.textContent = modelName;
  }
}

function setupLightingGUI() {
  const ambientFolder = gui.addFolder("Ambient Light");
  ambientFolder.addColor(new ColorGUIHelper(ambientLight, 'color'), 'value').name('Colour');
  ambientFolder.add(ambientLight, 'intensity', 0, 5, 0.1);
  ambientFolder.open();

  const directionalFolder = gui.addFolder("Directional Light");
  directionalFolder.addColor(new ColorGUIHelper(directionalLight, 'color'), 'value').name('Colour');
  directionalFolder.add(directionalLight, 'intensity', 0, 5, 0.1);
  directionalFolder.add(directionalLight.position, 'x', -20, 20, 0.1);
  directionalFolder.add(directionalLight.position, 'y', -20, 20, 0.1);
  directionalFolder.add(directionalLight.position, 'z', -20, 20, 0.1);
  directionalFolder.open();

  const fillFolder = gui.addFolder("Fill Light");
  fillFolder.addColor(new ColorGUIHelper(fillLight, 'color'), 'value').name('Colour');
  fillFolder.add(fillLight, 'intensity', 0, 5, 0.1);
  fillFolder.add(fillLight.position, 'x', -20, 20, 0.1);
  fillFolder.add(fillLight.position, 'y', -20, 20, 0.1);
  fillFolder.add(fillLight.position, 'z', -20, 20, 0.1);

  const rotationFolder = gui.addFolder("Rotation");
  rotationFolder.add(rotationSettings, "speed", 0, 0.15, 0.01).name("Speed");
  rotationFolder.add(rotationSettings, "axis", ["x", "y", "z"]).name("Axis");
  rotationFolder.open();
}

init();
