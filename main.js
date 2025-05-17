const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('webgl') });
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 5);
scene.add(light);

// Physics world
const world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.82, 0) });

// Ground
const groundBody = new CANNON.Body({
  type: CANNON.Body.STATIC,
  shape: new CANNON.Plane()
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);

const groundGeo = new THREE.PlaneGeometry(100, 100);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x222222 });
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Spider-Man Sphere
const radius = 1;
const spideyBody = new CANNON.Body({
  mass: 5,
  shape: new CANNON.Sphere(radius),
  position: new CANNON.Vec3(0, 10, 0)
});
world.addBody(spideyBody);

const spideyMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const spideyMesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 32), spideyMat);
scene.add(spideyMesh);

// Web anchor and line visual
let webConstraint = null;
let webLine = null;

function updateWebLine(anchorPos) {
  if (webLine) scene.remove(webLine);
  const points = [
    spideyMesh.position.clone(),
    new THREE.Vector3(anchorPos.x, anchorPos.y, anchorPos.z)
  ];
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color: 0x00ffff });
  webLine = new THREE.Line(geometry, material);
  scene.add(webLine);
}

window.addEventListener('click', () => {
  const anchor = new CANNON.Vec3(0, 15, 0);
  if (webConstraint) world.removeConstraint(webConstraint);

  const anchorBody = new CANNON.Body({ mass: 0 });
  anchorBody.position.copy(anchor);
  world.addBody(anchorBody);

  webConstraint = new CANNON.DistanceConstraint(spideyBody, anchorBody, 10);
  world.addConstraint(webConstraint);

  updateWebLine(anchor);
});

// Animate
const clock = new THREE.Clock();
function animate() {
  const delta = clock.getDelta();
  world.step(1 / 60, delta, 3);

  spideyMesh.position.copy(spideyBody.position);
  spideyMesh.quaternion.copy(spideyBody.quaternion);

  if (webConstraint) {
    updateWebLine(webConstraint.bodyB.position);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();
