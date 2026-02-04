import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const canvas = document.getElementById("hero-3d");
if (!canvas) {
  return;
}

const tabs = Array.from(document.querySelectorAll(".stage-tab"));
const caption = document.getElementById("stage-caption-text");
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
camera.position.set(0, 0.2, 4.2);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const root = new THREE.Group();
scene.add(root);

const palette = {
  cardio: { core: 0xff8fa3, glow: 0x35121a, ring: 0xf2e5c7, wire: 0xffd6e0 },
  neuro: { core: 0x9db4ff, glow: 0x121a35, ring: 0x8fd3ff, wire: 0xcbd6ff },
  informatics: { core: 0x7fd6a7, glow: 0x0b2b1a, ring: 0x8fd3ff, wire: 0xc6f6e2 },
};

const captions = {
  cardio: "3D‑Szene: Herz‑Arterie, Puls‑Ring und Datenfluss‑Layer.",
  neuro: "3D‑Szene: Neuronales Netz, synaptische Knoten und Signalpfade.",
  informatics: "3D‑Szene: Datenknoten, Pipeline‑Ring und System‑Layer.",
};

function createGlowTexture() {
  const size = 256;
  const canvas2d = document.createElement("canvas");
  canvas2d.width = size;
  canvas2d.height = size;
  const ctx = canvas2d.getContext("2d");
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 10, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, "rgba(255,255,255,0.9)");
  gradient.addColorStop(0.4, "rgba(255,255,255,0.35)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  const texture = new THREE.CanvasTexture(canvas2d);
  texture.needsUpdate = true;
  return texture;
}

function createScanTexture() {
  const size = 256;
  const canvas2d = document.createElement("canvas");
  canvas2d.width = size;
  canvas2d.height = size;
  const ctx = canvas2d.getContext("2d");
  ctx.clearRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  for (let y = 0; y < size; y += 12) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas2d);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 1);
  return texture;
}

function createHeartShape() {
  const x = 0, y = 0;
  const shape = new THREE.Shape();
  shape.moveTo(x, y + 0.5);
  shape.bezierCurveTo(x, y + 0.5, x - 0.6, y + 0.2, x - 0.6, y - 0.2);
  shape.bezierCurveTo(x - 0.6, y - 0.9, x + 0.2, y - 1.1, x, y - 1.5);
  shape.bezierCurveTo(x - 0.2, y - 1.1, x + 0.6, y - 0.9, x + 0.6, y - 0.2);
  shape.bezierCurveTo(x + 0.6, y + 0.2, x, y + 0.5, x, y + 0.5);
  return shape;
}

function createArteryPath() {
  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.2, 0.2, 0.3),
    new THREE.Vector3(-0.4, 0.6, -0.2),
    new THREE.Vector3(0.2, 0.1, -0.4),
    new THREE.Vector3(0.9, -0.4, 0.2),
    new THREE.Vector3(1.2, -0.7, 0.4),
  ]);
}

function createNeuroCluster(color) {
  const group = new THREE.Group();
  const nodeGeometry = new THREE.SphereGeometry(0.08, 20, 20);
  const nodeMaterial = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.25 });
  const nodes = [];
  for (let i = 0; i < 12; i += 1) {
    const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
    node.position.set(
      (Math.random() - 0.5) * 2.2,
      (Math.random() - 0.5) * 1.6,
      (Math.random() - 0.5) * 1.2
    );
    nodes.push(node);
    group.add(node);
  }
  const lineMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.45 });
  for (let i = 0; i < nodes.length; i += 1) {
    const target = nodes[(i + 3) % nodes.length];
    const geometry = new THREE.BufferGeometry().setFromPoints([nodes[i].position, target.position]);
    group.add(new THREE.Line(geometry, lineMaterial));
  }
  return group;
}

function createDataGrid(color) {
  const grid = new THREE.GridHelper(4, 10, color, color);
  grid.material.opacity = 0.18;
  grid.material.transparent = true;
  grid.rotation.x = Math.PI / 2.2;
  grid.position.y = -1.1;
  return grid;
}

function createScanPlane(color) {
  const texture = createScanTexture();
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    color,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
  });
  const plane = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), material);
  plane.rotation.x = Math.PI / 2.2;
  plane.position.y = -1.05;
  plane.userData.scanTexture = texture;
  return plane;
}

function buildCardio() {
  const group = new THREE.Group();
  group.userData = { pulse: 0, heart: null, ring: null, scan: null, glow: null };
  const heartShape = createHeartShape();
  const heartGeometry = new THREE.ExtrudeGeometry(heartShape, { depth: 0.4, bevelEnabled: true, bevelSize: 0.08, bevelThickness: 0.08 });
  const heart = new THREE.Mesh(
    heartGeometry,
    new THREE.MeshStandardMaterial({ color: palette.cardio.core, emissive: palette.cardio.glow, roughness: 0.35, metalness: 0.3 })
  );
  heart.scale.set(0.6, 0.6, 0.6);
  heart.rotation.x = Math.PI * 0.1;
  group.userData.heart = heart;
  group.add(heart);

  const arteryGeometry = new THREE.TubeGeometry(createArteryPath(), 80, 0.08, 10, false);
  const arteryMaterial = new THREE.MeshStandardMaterial({ color: palette.cardio.ring, emissive: 0x2b1b16, roughness: 0.4, metalness: 0.5 });
  const artery = new THREE.Mesh(arteryGeometry, arteryMaterial);
  group.add(artery);

  const pulseRing = new THREE.TorusGeometry(1.6, 0.06, 16, 120);
  const ring = new THREE.Mesh(pulseRing, new THREE.MeshStandardMaterial({ color: palette.cardio.ring, roughness: 0.3, metalness: 0.4 }));
  ring.rotation.x = Math.PI / 2.6;
  group.userData.ring = ring;
  group.add(ring);

  const grid = createDataGrid(0xffc6d6);
  group.add(grid);
  const scan = createScanPlane(0xffd6e0);
  group.userData.scan = scan;
  group.add(scan);

  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: palette.cardio.core,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.scale.set(2.6, 2.6, 1);
  glow.position.set(0, 0.2, 0.2);
  group.userData.glow = glow;
  group.add(glow);
  return group;
}

function buildNeuro() {
  const group = new THREE.Group();
  group.userData = { scan: null, glow: null };
  const coreGeometry = new THREE.OctahedronGeometry(0.8, 2);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: palette.neuro.core,
    emissive: palette.neuro.glow,
    roughness: 0.4,
    metalness: 0.45,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  const halo = new THREE.TorusGeometry(1.4, 0.08, 18, 90);
  const haloMesh = new THREE.Mesh(halo, new THREE.MeshStandardMaterial({ color: palette.neuro.ring, roughness: 0.35, metalness: 0.6 }));
  haloMesh.rotation.x = Math.PI / 2.1;
  group.add(haloMesh);

  group.add(createNeuroCluster(palette.neuro.wire));
  const grid = createDataGrid(0x8fd3ff);
  group.add(grid);
  const scan = createScanPlane(0x9db4ff);
  group.userData.scan = scan;
  group.add(scan);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: palette.neuro.core,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.scale.set(2.4, 2.4, 1);
  glow.position.set(0.2, 0.1, 0.1);
  group.userData.glow = glow;
  group.add(glow);
  return group;
}

function buildInformatics() {
  const group = new THREE.Group();
  group.userData = { scan: null, glow: null };
  const coreGeometry = new THREE.DodecahedronGeometry(0.95, 0);
  const coreMaterial = new THREE.MeshStandardMaterial({
    color: palette.informatics.core,
    emissive: palette.informatics.glow,
    roughness: 0.3,
    metalness: 0.5,
  });
  const core = new THREE.Mesh(coreGeometry, coreMaterial);
  group.add(core);

  const wireGeometry = new THREE.IcosahedronGeometry(1.55, 0);
  const wire = new THREE.Mesh(
    wireGeometry,
    new THREE.MeshBasicMaterial({
      color: palette.informatics.wire,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    })
  );
  group.add(wire);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(1.6, 0.08, 16, 120),
    new THREE.MeshStandardMaterial({ color: palette.informatics.ring, roughness: 0.35, metalness: 0.55 })
  );
  ring.rotation.x = Math.PI / 2.5;
  group.add(ring);

  const grid = createDataGrid(0x7fd6a7);
  group.add(grid);
  const scan = createScanPlane(0x7fd6a7);
  group.userData.scan = scan;
  group.add(scan);
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: createGlowTexture(),
      color: palette.informatics.core,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  glow.scale.set(2.2, 2.2, 1);
  glow.position.set(-0.1, 0.15, 0.1);
  group.userData.glow = glow;
  group.add(glow);
  return group;
}

const scenes = {
  cardio: buildCardio(),
  neuro: buildNeuro(),
  informatics: buildInformatics(),
};

Object.values(scenes).forEach((group) => {
  group.visible = false;
  root.add(group);
});

let activeScene = "cardio";
scenes[activeScene].visible = true;
if (caption) caption.textContent = captions[activeScene];

function setGroupOpacity(group, value) {
  group.traverse((child) => {
    if (child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((mat) => {
          mat.transparent = true;
          mat.opacity = value;
        });
      } else {
        child.material.transparent = true;
        child.material.opacity = value;
      }
    }
  });
}

let transition = null;

const light1 = new THREE.PointLight(0x8fd3ff, 1.2, 12);
light1.position.set(2.6, 2.4, 3.5);
scene.add(light1);

const light2 = new THREE.PointLight(0xf2e5c7, 1, 10);
light2.position.set(-2.5, -1.5, 3);
scene.add(light2);

const ambient = new THREE.AmbientLight(0xffffff, 0.35);
scene.add(ambient);

let targetX = 0;
let targetY = 0;
let targetCamX = 0;
let targetCamY = 0;

function onPointerMove(event) {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  targetX = (x - 0.5) * 0.6;
  targetY = (y - 0.5) * 0.6;
  targetCamX = (x - 0.5) * 0.35;
  targetCamY = (y - 0.5) * 0.25;
}

canvas.addEventListener("pointermove", onPointerMove);

function resize() {
  const { width, height } = canvas.getBoundingClientRect();
  const safeWidth = Math.max(1, width);
  const safeHeight = Math.max(1, height);
  renderer.setSize(safeWidth, safeHeight, false);
  camera.aspect = safeWidth / safeHeight;
  camera.updateProjectionMatrix();
}

resize();
window.addEventListener("resize", resize);

function setActiveScene(key) {
  if (key === activeScene) return;
  const from = scenes[activeScene];
  const to = scenes[key];
  to.visible = true;
  setGroupOpacity(to, 0);
  transition = { from, to, progress: 0 };
  Object.keys(scenes).forEach((sceneKey) => {
    if (sceneKey !== key && scenes[sceneKey] !== from) {
      scenes[sceneKey].visible = false;
    }
  });
  activeScene = key;
  if (caption) caption.textContent = captions[key];
  tabs.forEach((tab) => {
    const selected = tab.dataset.scene === key;
    tab.classList.toggle("is-active", selected);
    tab.setAttribute("aria-selected", selected ? "true" : "false");
  });
}

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveScene(tab.dataset.scene);
  });
});

function renderOnce() {
  const sceneGroup = scenes[activeScene];
  sceneGroup.rotation.y = 0.6;
  sceneGroup.rotation.x = -0.2;
  renderer.render(scene, camera);
}

let lastTime = 0;
function animate(time) {
  const delta = (time - lastTime) / 1000;
  lastTime = time;

  const sceneGroup = scenes[activeScene];
  camera.position.x += (targetCamX - camera.position.x) * 0.05;
  camera.position.y += (targetCamY - camera.position.y) * 0.05;
  camera.lookAt(0, 0, 0);

  if (transition) {
    transition.progress += delta * 1.4;
    const t = Math.min(transition.progress, 1);
    setGroupOpacity(transition.from, 1 - t);
    setGroupOpacity(transition.to, t);
    if (t >= 1) {
      transition.from.visible = false;
      transition = null;
    }
  }

  if (sceneGroup.userData && sceneGroup.userData.scan) {
    const tex = sceneGroup.userData.scan.userData.scanTexture;
    tex.offset.y = (tex.offset.y + delta * 0.2) % 1;
  }

  if (sceneGroup.userData && sceneGroup.userData.heart) {
    sceneGroup.userData.pulse += delta * 3.2;
    const pulse = Math.sin(sceneGroup.userData.pulse) * 0.06 + 1;
    sceneGroup.userData.heart.scale.set(0.6 * pulse, 0.6 * pulse, 0.6 * pulse);
    if (sceneGroup.userData.ring) {
      const ringPulse = Math.sin(sceneGroup.userData.pulse * 1.4) * 0.08 + 1;
      sceneGroup.userData.ring.scale.set(ringPulse, ringPulse, ringPulse);
    }
  }

  if (sceneGroup.userData && sceneGroup.userData.glow) {
    const glowPulse = Math.sin(time * 0.0016) * 0.12 + 0.9;
    sceneGroup.userData.glow.material.opacity = 0.35 + glowPulse * 0.25;
  }

  sceneGroup.rotation.y += delta * 0.35;
  sceneGroup.rotation.x += delta * 0.15;
  sceneGroup.rotation.y += (targetX - sceneGroup.rotation.y) * 0.02;
  sceneGroup.rotation.x += (targetY - sceneGroup.rotation.x) * 0.02;
  sceneGroup.children.forEach((child, index) => {
    if (child.type === "Mesh" && index % 2 === 0) {
      child.rotation.y -= delta * 0.15;
    }
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

if (prefersReduced) {
  renderOnce();
} else {
  requestAnimationFrame(animate);
}
