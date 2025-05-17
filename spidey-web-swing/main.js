// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Physics world
const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

// Ground
const groundBody = new CANNON.Body({
  mass: 0,
  shape: new CANNON.Plane()
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Spider-Man Physics Body
const radius = 1;
const spideyBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Sphere(radius),
  position: new CANNON.Vec3(0, 10, 0)
});
world.addBody(spideyBody);

// 🕷️ Spider-Man Model
let spideyMesh;

const loader = new THREE.GLTFLoader();
loader.load('spiderman.glb', (gltf) => {
  spideyMesh = gltf.scene;
  spideyMesh.scale.set(1, 1, 1);
  spideyMesh.position.copy(spideyBody.position);
  scene.add(spideyMesh);
}, undefined, (error) => {
  console.error('Failed to load Spider-Man model:', error);
});

// Web anchor & constraint
let webConstraint = null;
let webLine = null;

function updateWebLine(anchorPos) {
  if (webLine) scene.remove(webLine);
  const points = [
    spideyBody.position.clone(),
    new THREE.Vector3(anchorPos.x, anchorPos.y, anchorPos.z)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
  webLine = new THREE.Line(geometry, material);
  scene.add(webLine);
}

window.addEventListener('click', () => {
  const anchor = new CANNON.Vec3(0, 15, 0);

  if (webConstraint) {
    world.removeConstraint(webConstraint);
  }

  const anchorBody = new CANNON.Body({ mass: 0 });
  anchorBody.position.set(anchor.x, anchor.y, anchor.z);
  world.addBody(anchorBody);

  webConstraint = new CANNON.DistanceConstraint(spideyBody, anchorBody, 10);
  world.addConstraint(webConstraint);

  updateWebLine(anchor);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  world.step(1 / 60);

  // 💥 Update model to match physics
  if (spideyMesh) {
    spideyMesh.position.copy(spideyBody.position);
    spideyMesh.quaternion.copy(spideyBody.quaternion);
  }

  if (webConstraint) {
    updateWebLine(webConstraint.bodyB.position);
  }

  renderer.render(scene, camera);
}
animate();
