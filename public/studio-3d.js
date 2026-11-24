let THREE;
let OrbitControls;
let RoomEnvironment;
try {
  THREE = await import('three');
  ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
  ({ RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js'));
} catch (error) {
  console.error('Could not load Three.js modules:', error);
}

const byId = id => document.getElementById(id);

function makeWoodTexture(base = '#76543e') {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 165; i++) {
    const y = (i * 3.17) % 512;
    const shade = i % 3 === 0 ? 'rgba(35,18,9,0.075)' : 'rgba(255,226,180,0.045)';
    ctx.strokeStyle = shade;
    ctx.lineWidth = i % 7 === 0 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.bezierCurveTo(130, y + Math.sin(i) * 4, 370, y - Math.cos(i) * 5, 512, y + Math.sin(i * 0.4) * 3);
    ctx.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function makeSoftShadowTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(128, 128, 12, 128, 128, 126);
  gradient.addColorStop(0, 'rgba(34,20,12,0.34)');
  gradient.addColorStop(0.46, 'rgba(34,20,12,0.15)');
  gradient.addColorStop(1, 'rgba(34,20,12,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(canvas);
}

function makeRenderer(host, xr = false) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.xr.enabled = xr;
  renderer.domElement.className = 'absolute inset-0 w-full h-full';
  renderer.domElement.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;z-index:0;';
  host.appendChild(renderer.domElement);
  let cameraToResize = null;
  const resize = () => {
    const rect = host.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    renderer.setSize(rect.width, rect.height, false);
    if (cameraToResize) {
      cameraToResize.aspect = rect.width / rect.height;
      cameraToResize.updateProjectionMatrix();
    }
  };
  renderer.bindCamera = camera => { cameraToResize = camera; resize(); };
  new ResizeObserver(resize).observe(host);
  resize();
  return renderer;
}

function createCandleModel() {
  const host = byId('c3dViewport');
  if (!host) return null;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f2ece4');
  scene.fog = new THREE.Fog('#f2ece4', 8, 18);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
  camera.position.set(0, 2.15, 7.2);
  const renderer = makeRenderer(host);
  renderer.bindCamera(camera);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studioEnvironment = new RoomEnvironment();
  scene.environment = pmrem.fromScene(studioEnvironment, 0.04).texture;
  studioEnvironment.dispose();
  pmrem.dispose();
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.35, 0);
  controls.enablePan = false;
  controls.enableRotate = false;
  controls.enableZoom = false;
  controls.enableDamping = true;
  controls.minDistance = 4.2;
  controls.maxDistance = 10;
  controls.minPolarAngle = 0.65;
  controls.maxPolarAngle = 2.25;
  scene.add(new THREE.HemisphereLight('#fff8e9', '#65503f', 2.1));
  const key = new THREE.DirectionalLight('#fff3d8', 3.2);
  key.position.set(-3, 6, 5);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 12;
  key.shadow.bias = -0.0002;
  scene.add(key);
  const rimLight = new THREE.PointLight('#f5c769', 15, 8);
  rimLight.position.set(0, 1.9, 0.2);
  scene.add(rimLight);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(2.3, 64), new THREE.MeshStandardMaterial({ color: '#b99d7c', roughness: 0.72 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.015;
  floor.receiveShadow = true;
  scene.add(floor);
  const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.45, 0.22, 64), new THREE.MeshStandardMaterial({ map: makeWoodTexture(), color: '#b19172', roughness: 0.48, metalness: 0.02 }));
  pedestal.position.y = 0.12;
  pedestal.castShadow = true;
  pedestal.receiveShadow = true;
  scene.add(pedestal);
  const contactShadow = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), new THREE.MeshBasicMaterial({ map: makeSoftShadowTexture(), transparent: true, depthWrite: false }));
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = 0.24;
  contactShadow.scale.set(0.78, 0.92, 1);
  scene.add(contactShadow);

  const product = new THREE.Group();
  scene.add(product);
  const pieces = {};
  const glassMat = new THREE.MeshPhysicalMaterial({ color: '#efe5d5', roughness: 0.075, metalness: 0, transparent: true, opacity: 0.28, transmission: 0.82, thickness: 0.24, ior: 1.46, clearcoat: 1, clearcoatRoughness: 0.08, side: THREE.DoubleSide });
  const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.72, 1.62, 72, 1, true), glassMat);
  jar.position.y = 1.03;
  jar.castShadow = true;
  jar.receiveShadow = true;
  pieces.jar = jar;
  product.add(jar);
  const rimMat = new THREE.MeshPhysicalMaterial({ color: '#fff8ec', roughness: 0.06, metalness: 0, transparent: true, opacity: 0.38, transmission: 0.72, thickness: 0.16, clearcoat: 1 });
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.035, 12, 80), rimMat);
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 1.84;
  pieces.rim = rim;
  product.add(rim);
  const foot = new THREE.Mesh(new THREE.TorusGeometry(0.73, 0.035, 12, 80), rimMat);
  foot.rotation.x = Math.PI / 2;
  foot.position.y = 0.25;
  product.add(foot);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 0.12, 72), new THREE.MeshPhysicalMaterial({ color: '#d9c9b1', roughness: 0.16, transparent: true, opacity: 0.6, transmission: 0.5, thickness: 0.16, clearcoat: 1 }));
  base.position.y = 0.28;
  product.add(base);

  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.69, 0.69, 0.1, 72), new THREE.MeshStandardMaterial({ color: '#fffaf0', roughness: 0.29 }));
  wax.position.y = 1.78;
  wax.castShadow = true;
  wax.receiveShadow = true;
  pieces.wax = wax;
  product.add(wax);
  const pool = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.012, 64), new THREE.MeshStandardMaterial({ color: '#f3e7d1', roughness: 0.15, metalness: 0.02 }));
  pool.position.y = 1.84;
  pieces.pool = pool;
  product.add(pool);
  const oil = new THREE.Mesh(new THREE.TorusGeometry(0.52, 0.018, 12, 64), new THREE.MeshPhysicalMaterial({ color: '#f2c36b', roughness: 0.13, metalness: 0.02, transparent: true, opacity: 0.85, clearcoat: 1 }));
  oil.rotation.x = Math.PI / 2;
  oil.position.y = 1.84;
  pieces.oil = oil;
  product.add(oil);
  const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.022, 0.19, 10), new THREE.MeshStandardMaterial({ color: '#3e271c', roughness: 0.95 }));
  wick.position.set(0, 1.95, 0);
  pieces.wick = wick;
  product.add(wick);
  const flameShape = new THREE.Shape();
  flameShape.moveTo(0, 0);
  flameShape.bezierCurveTo(0.17, 0.13, 0.21, 0.34, 0.12, 0.53);
  flameShape.bezierCurveTo(0.08, 0.66, 0.02, 0.8, 0, 0.92);
  flameShape.bezierCurveTo(-0.12, 0.73, -0.31, 0.54, -0.27, 0.34);
  flameShape.bezierCurveTo(-0.24, 0.17, -0.12, 0.06, 0, 0);
  const flame = new THREE.Mesh(new THREE.ShapeGeometry(flameShape, 24), new THREE.MeshBasicMaterial({ color: '#f5a52e', side: THREE.DoubleSide, transparent: true, opacity: 0.96, depthWrite: false }));
  flame.position.set(0, 2.04, 0.018);
  pieces.flame = flame;
  product.add(flame);
  const flameCore = new THREE.Mesh(new THREE.ShapeGeometry(flameShape, 24), new THREE.MeshBasicMaterial({ color: '#fff6d5', side: THREE.DoubleSide, transparent: true, opacity: 0.9, depthWrite: false }));
  flameCore.scale.set(0.38, 0.55, 1);
  flameCore.position.set(0, 2.05, 0.024);
  product.add(flameCore);
  const flameLight = new THREE.PointLight('#ffb33f', 8, 2.8);
  flameLight.position.copy(flame.position);
  product.add(flameLight);

  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = 512;
  labelCanvas.height = 256;
  const ctx = labelCanvas.getContext('2d');
  const labelTexture = new THREE.CanvasTexture(labelCanvas);
  labelTexture.colorSpace = THREE.SRGBColorSpace;
  const label = new THREE.Mesh(new THREE.CylinderGeometry(0.786, 0.786, 0.52, 96, 1, true, -0.66, 1.32), new THREE.MeshPhysicalMaterial({ map: labelTexture, roughness: 0.78, clearcoat: 0.08, transparent: true, alphaTest: 0.08, side: THREE.DoubleSide }));
  label.position.set(0, 1.07, 0);
  product.add(label);
  pieces.labelCanvas = labelCanvas;
  pieces.labelContext = ctx;
  pieces.labelTexture = labelTexture;
  pieces.label = label;

  function refreshLabel(collection, scent, size) {
    ctx.clearRect(0, 0, 512, 256);
    ctx.fillStyle = '#f8f3e9';
    ctx.beginPath();
    ctx.roundRect(14, 14, 484, 228, 28);
    ctx.fill();
    let seed = 27;
    for (let i = 0; i < 220; i++) {
      seed = (seed * 16807) % 2147483647;
      const x = 20 + (seed % 470);
      seed = (seed * 16807) % 2147483647;
      const y = 20 + (seed % 216);
      ctx.fillStyle = i % 2 ? 'rgba(94,69,45,0.025)' : 'rgba(255,255,255,0.13)';
      ctx.fillRect(x, y, 1 + (i % 2), 1);
    }
    ctx.strokeStyle = '#b89972';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.textAlign = 'center';
    ctx.fillStyle = '#5c3d2e';
    ctx.font = 'bold 58px Georgia';
    ctx.fillText('AN', 256, 96);
    ctx.fillStyle = '#3e5641';
    ctx.font = 'bold 32px Arial';
    ctx.fillText(collection, 256, 150);
    ctx.fillStyle = '#6b584c';
    ctx.font = '24px Arial';
    ctx.fillText(`${scent} · ${size}`, 256, 194, 450);
    labelTexture.needsUpdate = true;
  }

  let exploded = false;
  let currentHeight = 1.62;
  function setProduct({ collection, scent, size, finish, zoom, rotation }) {
    const colors = { cream: '#efe5d5', wood: '#80563f', herbal: '#526e55' };
    glassMat.color.set(colors[finish] || colors.cream);
    currentHeight = size === '90g' ? 1.18 : size === 'set' ? 1.56 : 1.62;
    jar.scale.y = currentHeight / 1.62;
    jar.position.y = 0.22 + currentHeight / 2;
    rim.position.y = 0.22 + currentHeight - 0.005;
    wax.position.y = 0.22 + currentHeight - 0.085;
    pool.position.y = wax.position.y + 0.057;
    oil.position.y = pool.position.y + 0.006;
    wick.position.y = pool.position.y + 0.085;
    flame.position.y = wick.position.y + 0.09;
    flameCore.position.y = flame.position.y + 0.015;
    flameLight.position.y = flame.position.y + 0.23;
    label.position.y = 0.22 + currentHeight * 0.53;
    product.scale.setScalar(zoom || 1);
    product.rotation.y = THREE.MathUtils.degToRad(rotation || 0);
    const scentLabel = (scent || 'Thắp lên bình yên').replace(/&/g, ' & ');
    refreshLabel(collection || 'CALM', scentLabel, size || '180g');
    setExploded(exploded);
  }
  function setExploded(on) {
    exploded = Boolean(on);
    const gap = exploded ? 0.48 : 0;
    const top = 0.22 + currentHeight;
    pieces.jar.position.y = 0.22 + currentHeight / 2 - gap * 0.25;
    pieces.label.position.y = 0.22 + currentHeight * 0.53 - gap * 0.25;
    pieces.wax.position.y = top - 0.085 + gap * 0.55;
    pieces.pool.position.y = pieces.wax.position.y + 0.057;
    pieces.oil.position.y = pieces.pool.position.y + 0.006;
    pieces.wick.position.y = pieces.oil.position.y + 0.085 + gap * 0.7;
    pieces.flame.position.y = pieces.wick.position.y + 0.09 + gap * 0.35;
    flameCore.position.y = pieces.flame.position.y + 0.015;
    flameLight.position.y = pieces.flame.position.y + 0.23;
    pieces.rim.position.y = top - gap * 0.25;
  }

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    controls.update();
    const t = clock.getElapsedTime();
    flame.scale.x = 0.72 + Math.sin(t * 7) * 0.05;
    flame.scale.z = 0.72 + Math.cos(t * 8) * 0.04;
    flameLight.intensity = 7.5 + Math.sin(t * 9) * 1.2;
    renderer.render(scene, camera);
  });
  host.querySelector('#c3dSceneTransform')?.classList.add('hidden');
  const shadow = host.querySelector('.absolute.bottom-14');
  shadow?.classList.add('hidden');
  return { setProduct, setExploded, controls, product };
}

function createShowroom() {
  const host = byId('vrPanoramaViewport');
  if (!host) return null;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#b3a89b');
  const camera = new THREE.PerspectiveCamera(72, 1, 0.1, 80);
  camera.position.set(0, 1.65, 5.1);
  const renderer = makeRenderer(host, true);
  renderer.bindCamera(camera);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const roomEnvironment = new RoomEnvironment();
  scene.environment = pmrem.fromScene(roomEnvironment, 0.04).texture;
  roomEnvironment.dispose();
  pmrem.dispose();
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1.55, 0);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.minDistance = 0.05;
  controls.maxDistance = 5.2;
  controls.minPolarAngle = 0.18;
  controls.maxPolarAngle = Math.PI - 0.18;
  controls.autoRotate = false;

  scene.add(new THREE.HemisphereLight('#fff4df', '#615243', 2.3));
  const key = new THREE.DirectionalLight('#fff0d5', 3.1);
  key.position.set(-3, 6, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -8;
  key.shadow.camera.right = 8;
  key.shadow.camera.top = 8;
  key.shadow.camera.bottom = -8;
  key.shadow.bias = -0.0003;
  scene.add(key);
  const glow = new THREE.PointLight('#f3b957', 14, 10);
  glow.position.set(0, 2.3, 0.2);
  scene.add(glow);

  const room = new THREE.Group();
  scene.add(room);
  const mats = {
    wall: new THREE.MeshStandardMaterial({ color: '#e5ddd1', roughness: 0.86, side: THREE.DoubleSide }),
    floor: new THREE.MeshStandardMaterial({ map: makeWoodTexture('#785c44'), color: '#c5a17b', roughness: 0.68 }),
    wood: new THREE.MeshStandardMaterial({ map: makeWoodTexture('#593a27'), color: '#c09a70', roughness: 0.43 }),
    trim: new THREE.MeshStandardMaterial({ color: '#b9986b', roughness: 0.48 }),
    accent: new THREE.MeshStandardMaterial({ color: '#536b55', roughness: 0.8 })
  };
  function box(w, h, d, material, x, y, z, parent = room) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  box(12, 0.18, 12, mats.floor, 0, -0.1, 0);
  box(12, 6, 0.18, mats.wall, 0, 2.9, -5.8);
  box(0.18, 6, 12, mats.wall, -6, 2.9, 0);
  box(0.18, 6, 12, mats.wall, 6, 2.9, 0);
  box(12, 0.16, 12, new THREE.MeshStandardMaterial({ color: '#eee7dc', roughness: 0.92 }), 0, 5.92, 0);
  const rug = new THREE.Mesh(new THREE.BoxGeometry(4.35, 0.035, 3.15), new THREE.MeshStandardMaterial({ color: '#b7a28a', roughness: 0.98 }));
  rug.position.set(0, 0.012, 0.15);
  rug.receiveShadow = true;
  room.add(rug);
  // Window frame and a softly lit exterior panel.
  box(2.55, 2.55, 0.09, mats.trim, -4.5, 3.0, -5.66);
  box(2.28, 2.28, 0.1, new THREE.MeshStandardMaterial({ color: '#b9c9c3', emissive: '#40554d', emissiveIntensity: 0.25 }), -4.5, 3.0, -5.58);
  box(0.05, 2.3, 0.08, mats.trim, -4.5, 3.0, -5.48);
  box(2.4, 0.05, 0.08, mats.trim, -4.5, 3.0, -5.48);
  // Picture frames and wall shelf.
  box(2.3, 0.12, 0.38, mats.wood, 1.6, 2.8, -5.15);
  for (const [x, y, w, h] of [[-1.45, 3.6, 1.0, 1.15], [3.8, 3.35, 1.05, 1.5]]) {
    box(w, h, 0.08, mats.trim, x, y, -5.55);
    box(w - 0.14, h - 0.14, 0.04, new THREE.MeshStandardMaterial({ color: '#c5d0c7', roughness: 0.85 }), x, y, -5.48);
  }
  // Reading table and legs.
  box(3.8, 0.18, 1.8, mats.wood, 0, 0.92, -0.15);
  for (const x of [-1.65, 1.65]) for (const z of [-0.82, 0.52]) box(0.14, 0.9, 0.14, mats.wood, x, 0.45, z);
  // A small stack of books and a ceramic mug.
  box(0.95, 0.1, 0.62, new THREE.MeshStandardMaterial({ color: '#64745d' }), -1.25, 1.08, -0.12);
  box(0.82, 0.1, 0.58, new THREE.MeshStandardMaterial({ color: '#e8d8be' }), -1.18, 1.18, -0.12);
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.16, 0.32, 32), new THREE.MeshStandardMaterial({ color: '#f4eee4', roughness: 0.24 }));
  mug.position.set(1.28, 1.22, -0.1);
  room.add(mug);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.035, 12, 24), mug.material);
  handle.position.set(1.46, 1.23, -0.1);
  room.add(handle);
  // Floor plant in a terracotta planter.
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.25, 0.62, 32), new THREE.MeshStandardMaterial({ color: '#9d6a4a', roughness: 0.8 }));
  pot.position.set(4.25, 0.32, -3.2);
  room.add(pot);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), mats.accent);
    leaf.scale.set(0.5, 2.4, 0.45);
    const a = i * Math.PI * 2 / 7;
    leaf.position.set(4.25 + Math.cos(a) * 0.23, 1.0 + (i % 3) * 0.16, -3.2 + Math.sin(a) * 0.18);
    leaf.rotation.z = Math.cos(a) * 0.42;
    room.add(leaf);
  }
  // Warm floor lamp.
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.06, 2.2, 16), mats.wood);
  lampStem.position.set(4.4, 1.1, 1.5);
  room.add(lampStem);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.7, 0.5, 32, 1, true), new THREE.MeshStandardMaterial({ color: '#ddbd89', side: THREE.DoubleSide, roughness: 0.75 }));
  shade.position.set(4.4, 2.35, 1.5);
  room.add(shade);
  const lamp = new THREE.PointLight('#ffc879', 18, 7);
  lamp.position.set(4.4, 2.0, 1.5);
  room.add(lamp);

  const jarMeshes = [];
  const hotspotMeshes = [];
  const jarColors = ['#ece1d1', '#4f654f', '#8b5538'];
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 1.18;
    const mat = new THREE.MeshPhysicalMaterial({ color: jarColors[i], roughness: 0.18, transparent: true, opacity: 0.68, transmission: 0.08 });
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.23, 0.55, 36, 1, true), mat);
    jar.position.set(x, 1.29, 0.1);
    jar.castShadow = true;
    room.add(jar);
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.035, 36), new THREE.MeshStandardMaterial({ color: '#f7eedf', roughness: 0.42 }));
    wax.position.set(x, 1.57, 0.1);
    wax.castShadow = true;
    room.add(wax);
    const jarRim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.014, 8, 36), new THREE.MeshPhysicalMaterial({ color: '#fff5e6', roughness: 0.08, transparent: true, opacity: 0.48, transmission: 0.55, clearcoat: 1 }));
    jarRim.rotation.x = Math.PI / 2;
    jarRim.position.set(x, 1.565, 0.1);
    room.add(jarRim);
    const smallFlame = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.2, 16), new THREE.MeshBasicMaterial({ color: '#ffc45c' }));
    smallFlame.position.set(x, 1.69, 0.1);
    room.add(smallFlame);
    if (i !== 1) {
      const candleGlow = new THREE.PointLight('#ffbd55', 1.8, 1.4);
      candleGlow.position.set(x, 1.76, 0.12);
      room.add(candleGlow);
    }
    const labelCanvas = document.createElement('canvas');
    labelCanvas.width = 128;
    labelCanvas.height = 80;
    const c = labelCanvas.getContext('2d');
    c.fillStyle = '#faf7f2'; c.fillRect(0, 0, 128, 80);
    c.fillStyle = '#5c3d2e'; c.font = 'bold 22px Georgia'; c.textAlign = 'center'; c.fillText('AN', 64, 34);
    c.fillStyle = '#3e5641'; c.font = 'bold 12px Arial'; c.fillText(['CALM', 'FOCUS', 'COZY'][i], 64, 57);
    const texture = new THREE.CanvasTexture(labelCanvas); texture.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(0.33, 0.21), new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }));
    face.position.set(x, 1.31, 0.258);
    room.add(face);
    const marker = new THREE.Mesh(new THREE.SphereGeometry(0.115, 20, 16), new THREE.MeshStandardMaterial({ color: '#f5bd4d', emissive: '#935814', emissiveIntensity: 0.8 }));
    marker.position.set(x, 1.98, 0.1);
    room.add(marker);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 8, 28), new THREE.MeshBasicMaterial({ color: '#fff2d4' }));
    ring.position.copy(marker.position);
    room.add(ring);
    jarMeshes.push(jar);
    hotspotMeshes.push(marker, ring);
  }

  const workDetails = new THREE.Group();
  room.add(workDetails);
  const laptopMat = new THREE.MeshStandardMaterial({ color: '#343b3b', metalness: 0.28, roughness: 0.35 });
  const laptopBase = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.055, 0.62), laptopMat);
  laptopBase.position.set(0.72, 1.08, -0.42);
  workDetails.add(laptopBase);
  const laptopScreen = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.62, 0.055), laptopMat);
  laptopScreen.position.set(0.72, 1.39, -0.69);
  laptopScreen.rotation.x = -0.12;
  workDetails.add(laptopScreen);
  const screenGlow = new THREE.Mesh(new THREE.PlaneGeometry(0.78, 0.48), new THREE.MeshBasicMaterial({ color: '#9dbbb0' }));
  screenGlow.position.set(0.72, 1.4, -0.657);
  screenGlow.rotation.x = -0.12;
  workDetails.add(screenGlow);
  workDetails.visible = false;

  const eveningDetails = new THREE.Group();
  room.add(eveningDetails);
  const linen = new THREE.MeshStandardMaterial({ color: '#b28e80', roughness: 0.95 });
  box(3.3, 0.38, 2.2, mats.wood, 0, 0.42, -3.2, eveningDetails);
  box(3.1, 0.24, 2.0, linen, 0, 0.72, -3.2, eveningDetails);
  box(3.35, 1.45, 0.16, mats.wood, 0, 1.08, -4.35, eveningDetails);
  for (const x of [-0.85, 0.85]) box(0.92, 0.25, 0.68, new THREE.MeshStandardMaterial({ color: '#efe2d2', roughness: 0.95 }), x, 0.96, -3.75, eveningDetails);
  eveningDetails.visible = false;

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let downPoint = null;
  renderer.domElement.addEventListener('pointerdown', event => { downPoint = { x: event.clientX, y: event.clientY }; });
  renderer.domElement.addEventListener('pointerup', event => {
    if (!downPoint || Math.hypot(event.clientX - downPoint.x, event.clientY - downPoint.y) > 7) return;
    const rect = renderer.domElement.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(hotspotMeshes, false);
    if (hits.length) window.selectVRHotspotByIndex?.(Math.floor(hotspotMeshes.indexOf(hits[0].object) / 2));
    downPoint = null;
  });

  const roomTints = {
    reading: ['#e5ddd1', '#997b5f', '#f2ece4'],
    workspace: ['#d9e0dd', '#806a54', '#eaf0ed'],
    evening: ['#60483b', '#594131', '#251b17']
  };
  function setRoom(keyName) {
    const tint = roomTints[keyName] || roomTints.reading;
    mats.wall.color.set(tint[0]);
    mats.floor.color.set(tint[1]);
    scene.background.set(tint[2]);
    scene.fog.color.set(tint[2]);
    key.intensity = keyName === 'evening' ? 1.35 : 3.1;
    glow.intensity = keyName === 'evening' ? 22 : 14;
    workDetails.visible = keyName === 'workspace';
    eveningDetails.visible = keyName === 'evening';
    controls.autoRotate = false;
    controls.target.set(0, 1.55, 0);
    controls.update();
  }
  function setLook(x, y) {
    controls.autoRotate = false;
    const azimuth = THREE.MathUtils.clamp(x, -1, 1) * 1.35;
    const polar = Math.PI / 2 - THREE.MathUtils.clamp(y, -0.75, 0.75) * 0.55;
    const radius = Math.max(3.2, camera.position.distanceTo(controls.target));
    camera.position.set(Math.sin(azimuth) * radius, controls.target.y + Math.cos(polar) * radius, Math.cos(azimuth) * radius);
    controls.update();
  }
  renderer.setAnimationLoop(() => {
    controls.update();
    renderer.render(scene, camera);
  });
  byId('vrPanoramaLayer')?.classList.add('hidden');

  async function enterVR() {
    const button = byId('enterVRButton');
    try {
      const session = await navigator.xr.requestSession('immersive-vr', { optionalFeatures: ['local-floor', 'bounded-floor'] });
      await renderer.xr.setSession(session);
      button.textContent = '🥽 Thoát chế độ VR';
      session.addEventListener('end', () => { button.textContent = '🥽 Vào chế độ VR'; });
    } catch (error) {
      byId('vrSupportStatus').textContent = error?.message || 'Không thể mở phiên VR trên thiết bị này.';
    }
  }
  return { setRoom, setLook, enterVR, controls, renderer };
}

try {
  const candle = createCandleModel();
  const showroom = createShowroom();
  window.setCandleRotation = degrees => { if (candle) candle.product.rotation.y = THREE.MathUtils.degToRad(degrees); };
  window.setCandleZoom = amount => { if (candle) candle.product.scale.setScalar(amount); };
  window.setCandleExploded = enabled => candle?.setExploded(enabled);
  window.updateCandle3D = data => candle?.setProduct(data);
  window.setShowroomRoom = key => showroom?.setRoom(key);
  window.setShowroomLook = (x, y) => showroom?.setLook(x, y);
  window.enterImmersiveVR = () => showroom?.enterVR();
  window.syncCandle3DModel?.();

  const vrButton = byId('enterVRButton');
  if (navigator.xr?.isSessionSupported) {
    navigator.xr.isSessionSupported('immersive-vr').then(supported => {
      vrButton.disabled = !supported;
      vrButton.textContent = supported ? '🥽 Vào chế độ VR' : '🥽 Cần kính VR';
      byId('vrSupportStatus').textContent = supported
        ? 'Kéo để nhìn quanh; nhấn nút để vào VR bằng kính tương thích.'
        : 'Phòng 3D tương tác đã sẵn sàng. Muốn vào VR immersive cần kính và trình duyệt hỗ trợ WebXR.';
    }).catch(() => { vrButton.textContent = '🥽 Cần kính VR'; });
  } else {
    vrButton.disabled = true;
    vrButton.textContent = '🥽 Cần kính VR';
    byId('vrSupportStatus').textContent = 'Phòng 3D tương tác đã sẵn sàng. Trình duyệt này chưa hỗ trợ WebXR immersive.';
  }
} catch (error) {
  console.error('Không khởi tạo được 3D Studio:', error);
  const status = byId('vrSupportStatus');
  if (status) status.textContent = 'Không tải được thư viện WebGL 3D. Hãy kiểm tra kết nối mạng rồi tải lại trang.';
  const button = byId('enterVRButton');
  if (button) { button.disabled = true; button.textContent = '🥽 3D chưa tải'; }
}
