/* ============================================================
   3D laptop (WebGL / Three.js) for case pages with a video.
   Modelled on the 13" MacBook Air (M4): uniform 1.1 cm slab,
   rounded corners, black bezel with notch, full black keyboard,
   large trackpad, MagSafe + 2× USB-C on the left. Units: cm.
   Loaded on demand by app.js; the CSS laptop is the fallback.
   ============================================================ */
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.min.js';

const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (t) => Math.min(1, Math.max(0, t));

/* Aluminium finishes (MacBook Air M4 colours) */
const FINISHES = {
  silver:    { color: 0xd9dadd, roughness: 0.30 },
  starlight: { color: 0xe4ddcb, roughness: 0.30 },
  skyblue:   { color: 0xc5d2df, roughness: 0.30 },
  midnight:  { color: 0x2b303a, roughness: 0.26 },
  spacegrey: { color: 0x8a8c91, roughness: 0.30 },
};

/* ---------- shape helpers ---------- */
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
/* Display shape: rounded top corners, square bottom corners (like macOS) */
function displayShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2, y = -h / 2;
  s.moveTo(x, y);
  s.lineTo(x + w, y);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y);
  return s;
}
/* Slab with rounded corners and soft bevelled edges: shape in XY, extruded along +Z (total thickness = depth). */
function slab(w, h, depth, radius, bevel) {
  return new THREE.ExtrudeGeometry(roundedRect(w - bevel * 2, h - bevel * 2, radius), {
    depth: depth - bevel * 2,
    bevelEnabled: true,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 5,
    curveSegments: 16,
  });
}
/* Flat shape with normalised UVs (so a texture fills it exactly) */
function shapeGeometryUV(shape) {
  const g = new THREE.ShapeGeometry(shape, 14);
  g.computeBoundingBox();
  const bb = g.boundingBox, uv = g.attributes.uv, pos = g.attributes.position;
  const w = bb.max.x - bb.min.x, h = bb.max.y - bb.min.y;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (pos.getX(i) - bb.min.x) / w, (pos.getY(i) - bb.min.y) / h);
  uv.needsUpdate = true;
  return g;
}

/* ---------- environment for reflections (grey studio with soft light panels) ---------- */
function makeEnvironment(renderer) {
  const scene = new THREE.Scene();
  const box = new THREE.BoxGeometry(1, 1, 1);
  const room = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ side: THREE.BackSide, color: 0x5a5c63, roughness: 1, metalness: 0 }));
  room.scale.setScalar(90);
  scene.add(room);
  const panel = (x, y, z, sx, sy, sz, intensity) => {
    const m = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: new THREE.Color().setScalar(intensity) }));
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    scene.add(m);
  };
  panel(0, 40, 0, 40, 0.6, 34, 9);       // ceiling softbox
  panel(-40, 14, 6, 0.6, 18, 30, 6.5);   // left
  panel(40, 14, 6, 0.6, 18, 30, 5);      // right
  panel(0, 14, -40, 34, 18, 0.6, 4);     // back
  panel(0, 9, 40, 34, 12, 0.6, 3);       // front (viewer side)
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(scene, 0.04).texture;
  pmrem.dispose();
  box.dispose();
  return env;
}

/* ---------- the laptop ---------- */
function buildLaptop(screenMaterial, finishName) {
  const finish = FINISHES[finishName] || FINISHES.silver;
  const group = new THREE.Group();

  // Dimensions (cm), 13" MacBook Air
  const W = 30.4, D = 21.5;
  const HB = 0.72;          // base thickness
  const HL = 0.42;          // lid thickness
  const R = 0.9;            // plan corner radius
  const BEV = 0.2;          // edge softness
  const KEY_LIFT = 0.06;    // key cap height above the deck

  const alu = new THREE.MeshStandardMaterial({ color: finish.color, metalness: 0.9, roughness: finish.roughness });
  const aluPad = new THREE.MeshStandardMaterial({ color: finish.color, metalness: 0.9, roughness: finish.roughness + 0.08 });
  const black = new THREE.MeshStandardMaterial({ color: 0x0e0f12, metalness: 0.15, roughness: 0.55 });
  const keyMat = new THREE.MeshStandardMaterial({ color: 0x17181c, metalness: 0.05, roughness: 0.5 });
  const rubber = new THREE.MeshStandardMaterial({ color: 0x24262a, metalness: 0, roughness: 0.95 });
  const glossBlack = new THREE.MeshPhysicalMaterial({ color: 0x05060a, metalness: 0, roughness: 0.14, clearcoat: 1, clearcoatRoughness: 0.08 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.03, clearcoat: 1, transparent: true, opacity: 0.08, depthWrite: false });

  /* Base: uniform slab, no wedge */
  const base = new THREE.Mesh(slab(W, D, HB, R, BEV), alu);
  base.rotation.x = -Math.PI / 2;   // lay flat; extrusion becomes thickness along +Y
  base.position.y = BEV;            // bottom at y = 0
  base.castShadow = true;
  base.receiveShadow = true;
  group.add(base);

  /* Keyboard well (black recess) */
  const wellW = 27.9, wellD = 11.0, wellZ = -3.4;
  const well = new THREE.Mesh(new THREE.BoxGeometry(wellW, 0.02, wellD), black);
  well.position.set(0, HB + 0.004, wellZ);
  group.add(well);

  /* Keys — full Mac layout in key units (pitch 1.89 cm) */
  const P = 1.89, GAP = 0.26;
  const rowsSpec = [
    { h: 0.55, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },                  // esc, F1–F12, Touch ID
    { h: 1, keys: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5] },                     // numbers, delete
    { h: 1, keys: [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] },                     // tab … backslash
    { h: 1, keys: [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.75] },                    // caps … return
    { h: 1, keys: [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25] },                       // shift … shift
    { h: 1, keys: [1, 1, 1, 1.25, 5, 1.25, 1, 'arrows'] },                            // fn ctrl opt cmd space cmd opt arrows
  ];
  const totalUnits = 14.5;
  const kbBack = wellZ - wellD / 2 + 0.28;   // back edge of the key field
  const geoCache = new Map();
  const capGeo = (wCm, dCm) => {
    const k = `${wCm.toFixed(2)}x${dCm.toFixed(2)}`;
    if (!geoCache.has(k)) {
      const g = slab(wCm, dCm, KEY_LIFT + 0.04, 0.16, 0.03);   // cap top ends 0.07 above the deck
      g.rotateX(-Math.PI / 2);
      geoCache.set(k, g);
    }
    return geoCache.get(k);
  };
  const addKey = (xc, zc, wCm, dCm) => {
    const m = new THREE.Mesh(capGeo(wCm, dCm), keyMat);
    m.position.set(xc, HB, zc); // cap straddles the deck surface; the part below is hidden
    m.castShadow = true;
    group.add(m);
  };
  let zCursor = kbBack;
  rowsSpec.forEach((row) => {
    const rowD = row.h * P;
    const zc = zCursor + rowD / 2;
    let u = 0;
    row.keys.forEach((k) => {
      if (k === 'arrows') {
        // inverted T: left, [up over down], right — each half height
        const half = P / 2 - GAP / 2;
        const xs = [u + 0.5, u + 1.5, u + 2.5].map((uu) => -totalUnits * P / 2 + uu * P);
        addKey(xs[0], zc + P / 4, P - GAP, half);
        addKey(xs[1], zc - P / 4, P - GAP, half);
        addKey(xs[1], zc + P / 4, P - GAP, half);
        addKey(xs[2], zc + P / 4, P - GAP, half);
        u += 3;
        return;
      }
      const xc = -totalUnits * P / 2 + (u + k / 2) * P;
      addKey(xc, zc, k * P - GAP, rowD - GAP);
      u += k;
    });
    zCursor += rowD;
  });

  /* Trackpad: flush, subtly different sheen, thin dark outline */
  const padW = 13.0, padD = 7.6, padZ = wellZ + wellD / 2 + 0.7 + padD / 2;
  const padLine = new THREE.Mesh(new THREE.BoxGeometry(padW + 0.08, 0.02, padD + 0.08), black);
  padLine.position.set(0, HB + 0.006, padZ);
  group.add(padLine);
  const pad = new THREE.Mesh(new THREE.BoxGeometry(padW, 0.03, padD), aluPad);
  pad.position.set(0, HB + 0.012, padZ);
  group.add(pad);

  /* Ports: MagSafe + 2× USB-C on the left, headphone on the right */
  const portY = HB / 2;
  const mag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.32, 1.0), black);
  mag.position.set(-W / 2 + 0.02, portY, -6.2);
  group.add(mag);
  [-4.4, -3.0].forEach((z) => {
    const usb = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.28, 0.86), black);
    usb.position.set(-W / 2 + 0.02, portY, z);
    group.add(usb);
  });
  const jack = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.08, 20), black);
  jack.rotation.z = Math.PI / 2;
  jack.position.set(W / 2 - 0.02, portY, -6.2);
  group.add(jack);

  /* Feet */
  const footGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.12, 20);
  [[-12.6, -8.6], [12.6, -8.6], [-12.6, 8.6], [12.6, 8.6]].forEach(([x, z]) => {
    const f = new THREE.Mesh(footGeo, rubber);
    f.position.set(x, -0.06, z);
    group.add(f);
  });

  /* Hinge barrel (mostly hidden under the lid's rear edge) */
  const hingeY = HB + (HL - 0.12) + 0.08;   // lid underside clears the key caps when closed
  const hingeZ = -D / 2 + 0.55;
  const hinge = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, W - 4.2, 32), black);
  hinge.rotation.z = Math.PI / 2;
  hinge.position.set(0, hingeY, hingeZ);
  hinge.castShadow = true;
  group.add(hinge);

  /* Lid: pivots at the hinge; extends toward +Z when closed; display on its underside */
  const lid = new THREE.Group();
  lid.position.set(0, hingeY, hingeZ);
  const lidLen = D - 0.2, lidStart = 0.15;
  const lidBevel = 0.12;
  const shellGeo = slab(W, lidLen, HL, R, lidBevel);
  shellGeo.translate(0, lidLen / 2 + lidStart, 0);
  const shell = new THREE.Mesh(shellGeo, alu);
  shell.rotation.x = Math.PI / 2;          // shape Y → +Z, thickness → −Y
  shell.castShadow = true;
  lid.add(shell);

  const under = -(HL - lidBevel);          // lid underside (local y)
  const faceDown = (mesh, y, z) => { mesh.rotation.x = Math.PI / 2; mesh.position.set(0, y, z); return mesh; };

  // Black bezel (rounded), display, notch, glass
  const dispW = 29.3, dispH = 18.3;         // 13.6" 16:10 panel
  const dispZ = 2.1 + dispH / 2;            // chin toward the hinge, thin top bezel
  const bezel = faceDown(new THREE.Mesh(shapeGeometryUV(roundedRect(W - 0.5, lidLen - 0.5, 0.7)), glossBlack), under - 0.008, lidStart + lidLen / 2);
  lid.add(bezel);
  const screen = faceDown(new THREE.Mesh(shapeGeometryUV(displayShape(dispW, dispH, 0.55)), screenMaterial), under - 0.016, dispZ);
  lid.add(screen);
  const notch = faceDown(new THREE.Mesh(shapeGeometryUV(roundedRect(3.1, 0.95, 0.3)), glossBlack), under - 0.024, dispZ + dispH / 2 - 0.95 / 2 + 0.01);
  lid.add(notch);
  const cover = faceDown(new THREE.Mesh(shapeGeometryUV(roundedRect(W - 0.5, lidLen - 0.5, 0.7)), glass), under - 0.032, lidStart + lidLen / 2);
  lid.add(cover);
  group.add(lid);

  return { group, lid, lidTop: hingeY + lidLen };
}

/**
 * mountLaptop({ container, video, poster, getProgress, finish })
 *  - container: element that receives the <canvas>
 *  - video: <video> element used as the screen texture (already muted/looping)
 *  - poster: image shown on the screen until the video plays
 *  - getProgress: () => 0..1 scroll progress (0 = closed & far, 1 = open & near)
 *  - finish: 'silver' | 'starlight' | 'skyblue' | 'midnight' | 'spacegrey'
 * Returns { setActive(bool), destroy() }
 */
export function mountLaptop({ container, video, poster, getProgress, finish = 'silver' }) {
  const canvas = document.createElement('canvas');
  canvas.className = 'laptop3d';
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  container.appendChild(canvas);

  const scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(26, 16 / 11, 0.5, 400);

  // Key light for the contact shadow; the environment carries the ambience
  const key = new THREE.DirectionalLight(0xffffff, 1.9);
  key.position.set(18, 40, 26);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -34; key.shadow.camera.right = 34;
  key.shadow.camera.top = 34; key.shadow.camera.bottom = -34;
  key.shadow.camera.near = 1; key.shadow.camera.far = 160;
  key.shadow.bias = -0.0005;
  key.shadow.normalBias = 0.02;
  scene.add(key);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x8b8f98, 0.25));

  // Ground that only shows the shadow
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShadowMaterial({ opacity: 0.34 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.12;
  ground.receiveShadow = true;
  scene.add(ground);

  // Screen: poster first, then the live video. Both are cover-fitted to the 16:10 panel.
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false });
  const panelAspect = 29.3 / 18.3;
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

  const { group, lid } = buildLaptop(screenMat, finish);
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

  const resize = () => {
    const w = container.clientWidth || 1, h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  // Choreography: closed and seen from above at a three-quarter angle → opens to ~110°,
  // turns almost to face the viewer, camera glides down to a low product-shot angle.
  let shown = false;
  const render = () => {
    const e = smooth(clamp01(getProgress ? getProgress() : 1));
    pointer.x += (pointer.tx - pointer.x) * 0.06;
    pointer.y += (pointer.ty - pointer.y) * 0.06;
    lid.rotation.x = lerp(-0.04, -1.92, e);                          // 2° → 110°
    group.rotation.y = lerp(-0.7, -0.2, e) + pointer.x * 0.06;       // ends at a gentle 3/4 view
    group.rotation.x = -pointer.y * 0.02;
    camera.position.set(lerp(18, 4, e) + pointer.x * 1.5, lerp(46, 15, e) - pointer.y * 1.5, lerp(84, 60, e));
    camera.lookAt(0, lerp(0.5, 8.5, e), 0);
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
  render();

  const destroy = () => {
    renderer.setAnimationLoop(null);
    ro.disconnect();
    if (fine) { container.removeEventListener('pointermove', onMove); container.removeEventListener('pointerleave', onLeave); }
    if (video) video.removeEventListener('playing', useVideo);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    if (scene.environment) scene.environment.dispose();
    if (posterTex) posterTex.dispose();
    if (videoTex) videoTex.dispose();
    renderer.dispose();
    canvas.remove();
  };

  return { setActive, destroy };
}
