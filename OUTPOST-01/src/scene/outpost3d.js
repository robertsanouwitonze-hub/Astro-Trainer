
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

let scene;
let camera;
let renderer;
let rover;
let solarPanels;
let ground;
let animationStarted = false;

let currentPlanet = "moon";

const clock = new THREE.Clock();

function createMaterial(color, metalness = 0) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness,
    roughness: 0.65
  });
}

function createBox(width, height, depth, material, x, y, z) {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material
  );

  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

function createWorld() {
  scene = new THREE.Scene();

  scene.background = new THREE.Color("#080e19");
  scene.fog = new THREE.Fog("#080e19", 25, 90);

  camera = new THREE.PerspectiveCamera(
    50,
    1,
    0.1,
    150
  );

  camera.position.set(11, 9, 14);
  camera.lookAt(0, 1, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;

  // Lighting
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

  scene.add(sunlight);

  // Planet terrain
  const terrainGeometry = new THREE.PlaneGeometry(
    100,
    100,
    90,
    90
  );

  const vertices = terrainGeometry.attributes.position;

  for (let i = 0; i < vertices.count; i++) {
    const x = vertices.getX(i);
    const y = vertices.getY(i);

    const height =
      Math.sin(x * 0.3) * 0.35 +
      Math.cos(y * 0.4) * 0.3 +
      Math.sin((x + y) * 0.2) * 0.2;

    vertices.setZ(i, height);
  }

  terrainGeometry.computeVertexNormals();

  ground = new THREE.Mesh(
    terrainGeometry,
    createMaterial("#77716a")
  );

  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.3;
  ground.receiveShadow = true;

  scene.add(ground);

  // Habitat
  const habitat = new THREE.Group();

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(2, 2.2, 1.5, 32),
    createMaterial("#b7c5d4", 0.6)
  );

  base.position.y = 0.75;
  base.castShadow = true;
  habitat.add(base);

  const dome = new THREE.Mesh(
    new THREE.SphereGeometry(
      1.8,
      32,
      20,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    ),
    new THREE.MeshPhysicalMaterial({
      color: "#70c9ed",
      metalness: 0.2,
      roughness: 0.2,
      transparent: true,
      opacity: 0.8,
      transmission: 0.15
    })
  );

  dome.position.y = 1.5;
  habitat.add(dome);

  const entrance = createBox(
    0.65,
    1,
    0.12,
    createMaterial("#263f58", 0.5),
    0,
    0.5,
    2.05
  );

  habitat.add(entrance);

  scene.add(habitat);

  // Solar panels
  solarPanels = new THREE.Group();

  const panelMaterial = createMaterial("#14538d", 0.7);
  const frameMaterial = createMaterial("#b9c8d5", 0.8);

  [-4, 4].forEach(x => {
    const support = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.3, 12),
      frameMaterial
    );

    support.position.set(x, 0.35, 0);
    solarPanels.add(support);

    const panel = createBox(
      2.7,
      0.12,
      1.8,
      panelMaterial,
      x,
      1.1,
      0
    );

    solarPanels.add(panel);

    // Solar panel grid
    for (let i = -1; i <= 1; i++) {
      const line = createBox(
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

  // Communication antenna
  const antenna = new THREE.Group();

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.09, 4, 12),
    frameMaterial
  );

  pole.position.y = 2;
  antenna.add(pole);

  const dish = new THREE.Mesh(
    new THREE.SphereGeometry(
      0.7,
      24,
      12,
      0,
      Math.PI * 2,
      0,
      Math.PI / 2
    ),
    createMaterial("#d6e4f1", 0.8)
  );

  dish.position.y = 4;
  antenna.add(dish);

  antenna.position.set(5, 0, -4);

  scene.add(antenna);

  // Rover
  rover = new THREE.Group();

  const roverBody = createBox(
    1.5,
    0.55,
    1.2,
    createMaterial("#e2a34c", 0.5),
    0,
    0.9,
    0
  );

  rover.add(roverBody);

  const wheelMaterial = createMaterial("#252b34", 0.2);

  [-0.8, 0.8].forEach(x => {
    [-0.55, 0.55].forEach(z => {
      const wheel = new THREE.Mesh(
        new THREE.CylinderGeometry(
          0.35,
          0.35,
          0.18,
          16
        ),
        wheelMaterial
      );

      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, 0.45, z);

      rover.add(wheel);
    });
  });

  scene.add(rover);

  // Stars
  const starGeometry = new THREE.BufferGeometry();

  const starPositions = [];

  for (let i = 0; i < 1200; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 180,
      Math.random() * 70 + 10,
      (Math.random() - 0.5) * 180
    );
  }

  starGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(starPositions, 3)
  );

  const stars = new THREE.Points(
    starGeometry,
    new THREE.PointsMaterial({
      color: "#ffffff",
      size: 0.13
    })
  );

  scene.add(stars);

  updatePlanet(currentPlanet);
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

  // Rover travels around the habitat
  const distance = 6;

  rover.position.x = Math.cos(elapsed * 0.22) * distance;
  rover.position.z = Math.sin(elapsed * 0.22) * distance;

  rover.rotation.y = -elapsed * 0.22;

  // Solar panels gently adjust their orientation
  solarPanels.rotation.y = Math.sin(elapsed * 0.15) * 0.12;

  // Smooth camera movement
  camera.position.x = 11 + Math.sin(elapsed * 0.08) * 1.2;
  camera.lookAt(0, 1, 0);

  renderer.render(scene, camera);
}

export function mountOutpostScene(container, planet = "moon") {
  if (!renderer) {
    createWorld();
  }

  if (renderer.domElement.parentElement !== container) {
    container.appendChild(renderer.domElement);
  }

  updatePlanet(planet);

  function resize() {
    const width = container.clientWidth;
    const height = container.clientHeight;

    if (!width || !height) return;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
  }

  resize();

  if (!animationStarted) {
    animationStarted = true;
    animate();
  }

  return { updatePlanet };
}
