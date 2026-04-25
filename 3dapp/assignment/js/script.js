let scene, camera, renderer, clock, mixer, actions = [], mode, isWireframe = false;
let loadedModel;
const assetPath = './assets/models/';
const loader = new THREE.GLTFLoader();


init();

function init(){

  clock = new THREE.Clock();

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x00aaff);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(-5, 25, 20);
  
  const ambient = new THREE.AmbientLight(0xffffff, 2.5);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 3);
  directional.position.set(5, 10, 7);
  scene.add(directional);

  const fillLight = new THREE.DirectionalLight(0xffffff, 1.5);
  fillLight.position.set(-5, 5, -5);
  scene.add(fillLight);

  const canvas = document.getElementById('threeContainer');
  renderer = new THREE.WebGLRenderer({ canvas: canvas });
  renderer.setPixelRatio(window.devicePixelRatio);
  resize();


  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.target.set(1, 2, 0);
  controls.update();

  setupButtons();

  loadModel('can.glb');

  window.addEventListener('resize', resize, false);

  animate();
}

function setupButtons() {
  const btn = document.getElementById('btn');
  if (btn) {
    btn.addEventListener('click', function () {
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
      isWireframe = !isWireframe;
      toggleWireframe(isWireframe);
    });
  }

  const rotateBtn = document.getElementById('rotate');
  if (rotateBtn) {
    rotateBtn.addEventListener('click', function() {
      if (loadedModel) {
        const axis = new THREE.Vector3(0, 1, 0);
        const angle = Math.PI / 8;
        loadedModel.rotateOnAxis(axis, angle);
      } else {
        console.warn('Model not loaded');
      }
    });
  }

  const canBtn = document.getElementById('loadCan');
  if (canBtn) {
    canBtn.addEventListener('click', () => loadModel('can.glb'));
  }

  const cubeBtn = document.getElementById('loadCube');
  if (cubeBtn) {
    cubeBtn.addEventListener('click', () => loadModel('rubiks.glb'));
  }
}

function animate(){
  requestAnimationFrame(animate);

  if (mixer) {
    mixer.update(clock.getDelta());
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

function loadModel(modelFile) {
  
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

  
}
