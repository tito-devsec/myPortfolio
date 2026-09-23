/* ============================================================
   3D laptop (WebGL / Three.js) for case pages with a video.
   Loaded on demand by app.js; falls back to the CSS laptop if
   this module or WebGL is unavailable.
   ============================================================ */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/* Rounded rectangle shape centred on the origin (XY plane). */
function roundedRect(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/* Slab with rounded corners and softly bevelled edges: shape in XY, extruded along +Z. */
function slab(w, h, depth, radius, bevel) {
  return new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, radius), {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 4,
    curveSegments: 14,
  });
}

/* Studio-like environment for reflections (a grey room with soft light panels). */
function makeEnvironment(renderer) {
  const scene = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const room = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ side: THREE.BackSide, color: 0x5c5e66, roughness: 1, metalness: 0 }));
  room.scale.setScalar(80);
  scene.add(room);
  const panel = (x, y, z, sx, sy, sz, intensity) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensity) }));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    scene.add(m);
  };
  panel(0, 36, 0, 34, 0.6, 30, 9);      // ceiling softbox
  panel(-36, 12, 4, 0.6, 16, 26, 6);    // left
  panel(36, 12, 4, 0.6, 16, 26, 5);     // right
  panel(0, 12, -36, 30, 16, 0.6, 4);    // back
  panel(0, 8, 36, 30, 10, 0.6, 3);      // front (viewer side)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.04).texture;
  pmrem.dispose();
  box.dispose();
  return env;
}

/* Builds the laptop. Returns { group, lid } — lid.rotation.x opens the screen. */
function buildLaptop(screenMaterial) {
  const group = new THREE.Group();
  const W = 30, D = 20, H = 1.3;

  const alu = new THREE.MeshStandardMaterial({ color: 0xc9cace, metalness: 0.88, roughness: 0.28 });
  const aluDark = new THREE.MeshStandardMaterial({ color: 0xa6a7ab, metalness: 0.85, roughness: 0.34 });
  const plastic = new THREE.MeshStandardMaterial({ color: 0x1c1d21, metalness: 0.1, roughness: 0.65 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x2a2b30, metalness: 0.05, roughness: 0.5 });
  const grille = new THREE.MeshStandardMaterial({ color: 0x86878b, metalness: 0.6, roughness: 0.9 });
  const glossBlack = new THREE.MeshPhysicalMaterial({ color: 0x05060a, metalness: 0, roughness: 0.16, clearcoat: 1, clearcoatRoughness: 0.1 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, clearcoat: 1, transparent: true, opacity: 0.09, depthWrite: false });

  // Base (shape in XY → rotate so it lies flat; extrusion becomes thickness along +Y)
  const base = new THREE.Mesh(slab(W, D, H, 1.7, 0.14), alu);
  base.rotation.x = -Math.PI / 2;
  base.position.y = 0.14;
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  // Keyboard well
  const well = new THREE.Mesh(new THREE.BoxGeometry(26.6, 0.12, 10.9), plastic);
  well.position.set(0, H + 0.02, -2.6);
  group.add(well);

  // Keys (6 rows × 14 columns, front row has a spacebar)
  const keyGeo = new THREE.BoxGeometry(1.5, 0.22, 1.5);
  const cols = 14, rows = 6, dx = 1.85, dz = 1.75;
  const x0 = -((cols - 1) * dx) / 2, z0 = -2.6 - ((rows - 1) * dz) / 2;
  const positions = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (r === rows - 1 && c >= 4 && c <= 9) continue; // spacebar area
      positions.push([x0 + c * dx, z0 + r * dz]);
    }
  }
  const keys = new THREE.InstancedMesh(keyGeo, keyMat, positions.length);
  const m4 = new THREE.Matrix4();
  positions.forEach(([x, z], i) => { m4.makeTranslation(x, H + 0.2, z); keys.setMatrixAt(i, m4); });
  keys.instanceMatrix.needsUpdate = true;
  keys.castShadow = true;
  group.add(keys);
  const space = new THREE.Mesh(new THREE.BoxGeometry(6 * dx - 0.35, 0.22, 1.5), keyMat);
  space.position.set(x0 + 6.5 * dx, H + 0.2, z0 + (rows - 1) * dz);
  group.add(space);

  // Trackpad and speaker grilles
  const pad = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.06, 6.6), aluDark);
  pad.position.set(0, H + 0.02, 6.3);
  group.add(pad);
  [-13.6, 13.6].forEach((x) => {
    const g = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.04, 10.9), grille);
    g.position.set(x, H + 0.02, -2.6);
    group.add(g);
  });

  // Feet
  const footGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.25, 18);
  [[-12.5, -8], [12.5, -8], [-12.5, 8], [12.5, 8]].forEach(([x, z]) => {
    const f = new THREE.Mesh(footGeo, plastic);
    f.position.set(x, -0.125, z);
    group.add(f);
  });

  // Hinge
  const hingeY = H + 0.55, hingeZ = -D / 2 + 0.9;
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 25.5, 28), plastic);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, hingeY, hingeZ);
  hinge.castShadow = true;
  group.add(hinge);

  // Lid: pivots at the hinge; extends toward +Z when closed, screen on its underside
  const lid = new THREE.Group();
  lid.position.set(0, hingeY, hingeZ);
  const lidLen = 19.4, lidThick = 0.4;
  const lidGeo = slab(W, lidLen, lidThick, 1.7, 0.1);
  lidGeo.translate(0, lidLen / 2 + 0.2, 0);          // from the hinge outward
  const shell = new THREE.Mesh(lidGeo, alu);
  shell.rotation.x = Math.PI / 2;                     // shape Y → +Z, thickness → −Y
  shell.castShadow = true;
  lid.add(shell);

  // The shell's underside sits at y = -(lidThick - bevel); the display layers hang just below it.
  const under = -(lidThick - 0.1);
  const faceDown = (mesh, y, z) => { mesh.rotation.x = Math.PI / 2; mesh.position.set(0, y, z); return mesh; };
  const bezel = faceDown(new THREE.Mesh(new THREE.PlaneGeometry(28.9, 18.4), glossBlack), under - 0.01, 0.2 + lidLen / 2);
  lid.add(bezel);
  const screen = faceDown(new THREE.Mesh(new THREE.PlaneGeometry(27.4, 17.1), screenMaterial), under - 0.02, 0.2 + 1.25 + 17.1 / 2);
  lid.add(screen);
  const cover = faceDown(new THREE.Mesh(new THREE.PlaneGeometry(28.9, 18.4), glass), under - 0.03, 0.2 + lidLen / 2);
  lid.add(cover);
  group.add(lid);

  return { group, lid };
}

/**
 * mountLaptop({ container, video, poster, getProgress })
 *  - container: element that receives the <canvas>
 *  - video: <video> element used as the screen texture (already muted/looping)
 *  - poster: image shown on the screen until the video plays
 *  - getProgress: () => 0..1 scroll progress (0 = closed & far, 1 = open & near)
 * Returns { setActive(bool), destroy() }
 */
export function mountLaptop({ container, video, poster, getProgress }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'laptop3d';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(26, 16 / 11, 0.5, 400);

  // Lights: environment carries the ambience; one key light for the shadow
  const key = new THREE.DirectionalLight(0xffffff, 2.0);
  key.position.set(16, 38, 24);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -32; key.shadow.camera.right = 32;
  key.shadow.camera.top = 32; key.shadow.camera.bottom = -32;
  key.shadow.camera.near = 1; key.shadow.camera.far = 140;
  key.shadow.bias = -0.0006;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b8f98, 0.3));

  // Ground that only shows the shadow
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.32 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.25;
  ground.receiveShadow = true;
  scene.add(ground);

  // Screen material: poster first, video once it plays. Cover-fit either onto the 16:10 panel.
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false }); // black until a picture arrives
  const panelAspect = 27.4 / 17.1;
  const coverFit = (tex, w, h) => {
    if (!w || !h) return;
    const r = (w / h) / panelAspect;
    if (r > 1) { tex.repeat.set(1 / r, 1); tex.offset.set((1 - 1 / r) / 2, 0); }
    else { tex.repeat.set(1, r); tex.offset.set(0, (1 - r) / 2); }
    tex.needsUpdate = true;
  };
  let posterTex = null, videoTex = null;
  if (poster) {
    new THREE.TextureLoader().load(poster, (t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      coverFit(t, t.image.width, t.image.height);
      posterTex = t;
      if (!videoTex) { screenMat.map = t; screenMat.color.set(0xffffff); screenMat.needsUpdate = true; }
    });
  }
  const useVideo = () => {
    if (!video || videoTex) return;
    videoTex = new THREE.VideoTexture(video);
    videoTex.colorSpace = THREE.SRGBColorSpace;
    videoTex.minFilter = THREE.LinearFilter;
    videoTex.magFilter = THREE.LinearFilter;
    videoTex.generateMipmaps = false;
    coverFit(videoTex, video.videoWidth, video.videoHeight);
    screenMat.map = videoTex;
    screenMat.color.set(0xffffff);
    screenMat.needsUpdate = true;
  };
  if (video) {
    if (video.readyState >= 2 && !video.paused) useVideo();
    video.addEventListener('playing', useVideo);
    video.addEventListener('loadedmetadata', () => { if (videoTex) coverFit(videoTex, video.videoWidth, video.videoHeight); });
  }

  const { group, lid } = buildLaptop(screenMat);
  scene.add(group);

  // Pointer parallax (desktop only)
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onMove = (e) => {
    const r = container.getBoundingClientRect();
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
  };
  const onLeave = () => { pointer.tx = 0; pointer.ty = 0; };
  if (fine) { container.addEventListener('pointermove', onMove); container.addEventListener('pointerleave', onLeave); }

  // Size to the container
  const resize = () => {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  let shown = false;
  const render = () => {
    const e = smooth(clamp01(getProgress ? getProgress() : 1));
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    lid.rotation.x = lerp(-0.12, -1.87, e);                       // closed → open (~107°)
    group.rotation.y = lerp(-0.55, 0, e) + pointer.x * 0.07;      // turns to face the viewer
    group.rotation.x = -pointer.y * 0.03;
    camera.position.set(lerp(14, 0, e) + pointer.x * 1.2, lerp(40, 21, e) - pointer.y * 1.2, lerp(80, 62, e));
    camera.lookAt(0, lerp(1, 8.5, e), 0);
    renderer.render(scene, camera);
    if (!shown) { shown = true; canvas.classList.add('is-on'); }
  };

  let active = false;
  const setActive = (on) => {
    if (on === active) return;
    active = on;
    renderer.setAnimationLoop(on ? render : null);
    if (on) render();
  };
  render(); // first frame so the fade-in has content

  const destroy = () => {
    renderer.setAnimationLoop(null);
    ro.disconnect();
    if (fine) { container.removeEventListener('pointermove', onMove); container.removeEventListener('pointerleave', onLeave); }
    if (video) video.removeEventListener('playing', useVideo);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) { (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose()); }
    });
    if (scene.environment) scene.environment.dispose();
    if (posterTex) posterTex.dispose();
    if (videoTex) videoTex.dispose();
    renderer.dispose();
    canvas.remove();
  };

  return { setActive, destroy };
}
