
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

let scene;
let camera;
let renderer;
let rover;
let roverWheels = [];
let solarPanels;
let ground;
let animationStarted = false;
let activeContainer = null;

let currentPlanet = "moon";
let cameraAngle = 0.8;
let cameraHeight = 9;
let cameraDistance = 16;

const keys = {};
const clock = new THREE.Clock();

const roverSpeed = 5;
const cameraTarget = new THREE.Vector3(0, 1, 0);

function material(color, metalness = 0, roughness = 0.65) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness
  });
}

function box(width, height, depth, mat, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    mat
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createTerrain() {
  const geometry = new THREE.PlaneGeometry(120, 120, 100, 100);
  const positions = geometry.attributes.position;

  for (let i = 0; i < positions.count; i++) {
    const x = positions.getX(i);
    const y = positions.getY(i);

    const height =
      Math.sin(x * 0.22) * 0.35 +
      Math.cos(y * 0.25) * 0.3 +
      Math.sin((x + y) * 0.12) * 0.5;

    positions.setZ(i, height);
  }

  geometry.computeVertexNormals();

  ground = new THREE.Mesh(
    geometry,
    material("#77716a")
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.2;
  ground.receiveShadow = true;

  scene.add(ground);
}

function createHabitat() {
  const habitat = new THREE.Group();

  // Main habitat body
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.3, 1.5, 32),
    material("#b7c6d5", 0.65)
  );

  body.position.y = 0.75;
  body.castShadow = true;
  habitat.add(body);

  // Glass dome
  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(
      1.8, 32, 24, 0, Math.PI * 2, 0, Math.PI / 2
    ),
    new THREE.MeshPhysicalMaterial({
      color: "#70c9ed",
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.75,
      transmission: 0.2
    })
  );

  dome.position.y = 1.5;
  habitat.add(dome);

  // Entrance
  const door = box(
    0.65,
    1,
    0.12,
    material("#263f58", 0.5),
    0,
    0.5,
    2.05
  );

  habitat.add(door);

  // Windows
  [-1, 1].forEach(x => {
    const window = box(
      0.5,
      0.35,
      0.1,
      material("#53c9f5", 0.7, 0.2),
      x,
      0.8,
      2.02
    );

    habitat.add(window);
  });

  // Landing supports
  [-1.5, 1.5].forEach(x => {
    [-1.2, 1.2].forEach(z => {
      const support = box(
        0.18,
        0.5,
        0.18,
        material("#65788b"),
        x,
        -0.1,
        z
      );

      habitat.add(support);
    });
  });

  scene.add(habitat);
}

function createSolarPanels() {
  solarPanels = new THREE.Group();

  const panelMaterial = material("#14538d", 0.7, 0.3);
  const frameMaterial = material("#b9c8d5", 0.8);

  [-4, 4].forEach(x => {
    const support = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.3, 12),
      frameMaterial
    );

    support.position.set(x, 0.35, 0);
    solarPanels.add(support);

    const panel = box(
      2.7,
      0.12,
      1.8,
      panelMaterial,
      x,
      1.1,
      0
    );

    solarPanels.add(panel);

    for (let i = -1; i <= 1; i++) {
      const line = box(
        0.035,
        0.02,
        1.75,
        frameMaterial,
        x + i * 0.65,
        1.17,
        0
      );

      solarPanels.add(line);
    }
  });

  scene.add(solarPanels);
}

function createAntenna() {
  const antenna = new THREE.Group();

  const frame = material("#c9d7e5", 0.8);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.09, 4, 12),
    frame
  );

  pole.position.y = 2;
  antenna.add(pole);

  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.7, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2
    ),
    material("#d6e4f1", 0.8)
  );

  dish.position.y = 4;
  antenna.add(dish);

  antenna.position.set(5, 0, -4);

  scene.add(antenna);
}

function createRover() {
  rover = new THREE.Group();
  roverWheels = [];

  const body = box(
    1.5,
    0.55,
    1.2,
    material("#e2a34c", 0.5),
    0,
    0.9,
    0
  );

  rover.add(body);

  const cabin = box(
    0.8,
    0.35,
    0.85,
    material("#9dc6d8", 0.5, 0.3),
    0,
    1.32,
    0
  );

  rover.add(cabin);

  const wheelMaterial = material("#252b34", 0.2);

  [-0.8, 0.8].forEach(x => {
    [-0.55, 0.55].forEach(z => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.18, 20),
        wheelMaterial
      );

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.45, z);

      rover.add(wheel);
      roverWheels.push(wheel);
    });
  });

  // Rover antenna
  const antenna = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.7, 8),
    material("#ffffff", 0.6)
  );

  antenna.position.set(0, 1.85, 0);
  rover.add(antenna);

  rover.position.set(6, 0, 5);

  scene.add(rover);
}

function createStars() {
  const geometry = new THREE.BufferGeometry();
  const positions = [];

  for (let i = 0; i < 1500; i++) {
    positions.push(
      (Math.random() - 0.5) * 180,
      Math.random() * 70 + 10,
      (Math.random() - 0.5) * 180
    );
  }

  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );

  const stars = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: "#ffffff",
      size: 0.13
    })
  );

  scene.add(stars);
}

function createLighting() {
  const ambient = new THREE.HemisphereLight(
    0xdceaff,
    0x55443a,
    2
  );

  scene.add(ambient);

  const sunlight = new THREE.DirectionalLight(
    0xffffff,
    3
  );

  sunlight.position.set(-10, 18, 10);
  sunlight.castShadow = true;

  sunlight.shadow.mapSize.set(1024, 1024);

  scene.add(sunlight);
}

function createWorld() {
  scene = new THREE.Scene();

  scene.background = new THREE.Color("#080e19");
  scene.fog = new THREE.Fog("#080e19", 25, 100);

  camera = new THREE.PerspectiveCamera(
    50,
    1,
    0.1,
    200
  );

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
  );

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  renderer.domElement.tabIndex = 0;
  renderer.domElement.setAttribute(
    "aria-label",
    "Interactive three-dimensional outpost. Click to control the rover."
  );

  createLighting();
  createTerrain();
  createHabitat();
  createSolarPanels();
  createAntenna();
  createRover();
  createStars();

  updatePlanet(currentPlanet);

  setupControls();
}

function setupControls() {
  const canvas = renderer.domElement;

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  canvas.addEventListener("pointerdown", event => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;

    canvas.focus();
    canvas.setPointerCapture(event.pointerId);
  });

  canvas.addEventListener("pointermove", event => {
    if (!dragging) return;

    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;

    cameraAngle -= deltaX * 0.005;

    cameraHeight = THREE.MathUtils.clamp(
      cameraHeight + deltaY * 0.035,
      3,
      18
    );

    lastX = event.clientX;
    lastY = event.clientY;
  });

  canvas.addEventListener("pointerup", () => {
    dragging = false;
  });

  canvas.addEventListener("pointercancel", () => {
    dragging = false;
  });

  canvas.addEventListener("wheel", event => {
    event.preventDefault();

    cameraDistance = THREE.MathUtils.clamp(
      cameraDistance + event.deltaY * 0.015,
      7,
      28
    );
  }, { passive: false });

  canvas.addEventListener("keydown", event => {
    const key = event.key.toLowerCase();

    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"].includes(key)) {
      event.preventDefault();
      keys[key] = true;
    }
  });

  canvas.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
  });

  canvas.addEventListener("blur", () => {
    Object.keys(keys).forEach(key => {
      keys[key] = false;
    });
  });
}

function moveRover(delta) {
  const forward =
    keys.w || keys.arrowup ? 1 :
    keys.s || keys.arrowdown ? -1 : 0;

  const sideways =
    keys.d || keys.arrowright ? 1 :
    keys.a || keys.arrowleft ? -1 : 0;

  if (!forward && !sideways) return;

  const direction = new THREE.Vector3(
    sideways,
    0,
    -forward
  );

  direction.applyAxisAngle(
    new THREE.Vector3(0, 1, 0),
    rover.rotation.y
  );

  direction.normalize();

  rover.position.addScaledVector(
    direction,
    roverSpeed * delta
  );

  rover.position.x = THREE.MathUtils.clamp(
    rover.position.x,
    -22,
    22
  );

  rover.position.z = THREE.MathUtils.clamp(
    rover.position.z,
    -22,
    22
  );

  rover.rotation.y = Math.atan2(
    direction.x,
    direction.z
  );

  roverWheels.forEach(wheel => {
    wheel.rotation.x += delta * 5;
  });
}

function updateCamera() {
  const target = rover.position.clone();
  target.y += 1;

  cameraTarget.lerp(target, 0.035);

  camera.position.x =
    cameraTarget.x + Math.sin(cameraAngle) * cameraDistance;

  camera.position.z =
    cameraTarget.z + Math.cos(cameraAngle) * cameraDistance;

  camera.position.y =
    cameraTarget.y + cameraHeight;

  camera.lookAt(cameraTarget);
}

function updatePlanet(planet) {
  currentPlanet = planet;

  if (!scene || !ground) return;

  if (planet === "mars") {
    scene.background.set("#281a24");
    scene.fog.color.set("#281a24");
    ground.material.color.set("#a85e43");
  } else {
    scene.background.set("#080e19");
    scene.fog.color.set("#080e19");
    ground.material.color.set("#77716a");
  }
}

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;

  moveRover(delta);

  // Gentle solar equipment movement
  solarPanels.rotation.y = Math.sin(elapsed * 0.15) * 0.08;

  updateCamera();

  renderer.render(scene, camera);
}

function resizeScene() {
  if (!renderer || !activeContainer) return;

  const width = activeContainer.clientWidth;
  const height = activeContainer.clientHeight;

  if (!width || !height) return;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height, false);
}

export function mountOutpostScene(
  container,
  planet = "moon"
) {
  if (!renderer) {
    createWorld();
  }

  activeContainer = container;

  if (renderer.domElement.parentElement !== container) {
    container.appendChild(renderer.domElement);
  }

  updatePlanet(planet);
  resizeScene();

  if (!animationStarted) {
    animationStarted = true;
    animate();
  }

  return {
    updatePlanet,
    resize: resizeScene
  };
}
