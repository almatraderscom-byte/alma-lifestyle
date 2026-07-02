'use client';

/**
 * ObsidianFX — faithful React port of the standalone demo's rich runtime effects
 * (scripts/apechain-demo.template.html):
 *   • WebGL hero scene (three.js): floating faceted "orb" crystal, wireframe halo,
 *     violet+gold bloom sprites, drifting particle field, mouse-reactive concentric
 *     shader rings, orbiting coloured lights, per-product theme recolour, camera drift.
 *   • Cursor comet trail (violet→gold canvas).
 *   • Magnetic buttons + 3D tilt cards + scrubbed hero/spotlight parallax (GSAP).
 *   • Lenis smooth scroll + scroll-reveal for headings/cards.
 *
 * The heavy libs are vendored under /public/vendor and injected once on the client.
 * Everything is defensive: if a lib or WebGL is unavailable the page still works.
 */

import { useEffect } from 'react';

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    THREE?: any;
    gsap?: any;
    ScrollTrigger?: any;
    Lenis?: any;
    almaTheme?: (hex: string) => void;
    __obFxLoaded?: boolean;
    __obLenis?: any;
    __almaRippleRGB?: { r: number; g: number; b: number };
  }
}

const VENDOR = [
  '/vendor/three.min.js',
  '/vendor/gsap.min.js',
  '/vendor/ScrollTrigger.min.js',
  '/vendor/lenis.min.js',
];

function loadScript(src: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[data-ob-fx="${src}"]`)) {
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.dataset.obFx = src;
    s.onload = () => resolve();
    s.onerror = () => resolve(); // fail soft — page still works without the lib
    document.head.appendChild(s);
  });
}

async function loadVendor(): Promise<void> {
  for (const src of VENDOR) {
    // three must be present before the scene; load sequentially to preserve order.
    // eslint-disable-next-line no-await-in-loop
    await loadScript(src);
  }
}

/* ============================ WEBGL HERO SCENE ============================ */
function initWebGL(): () => void {
  const THREE = window.THREE;
  const canvas = document.getElementById('webgl') as HTMLCanvasElement | null;
  if (!THREE || !canvas) return () => {};
  const host = canvas.parentElement as HTMLElement;
  if (!host) return () => {};

  // Fall back to the viewport if the host hasn't been laid out yet at init time —
  // otherwise a 0-width measurement makes the renderer draw into an empty buffer
  // and the orb is invisible forever (a ResizeObserver below also self-corrects).
  let W = host.clientWidth || window.innerWidth;
  let H = host.clientHeight || window.innerHeight;
  const DPR = Math.min(window.devicePixelRatio || 1, 1.8);

  // OPAQUE canvas — deliberately NOT alpha:true. With a transparent canvas the
  // browser compositor must blend the scene's additive output (rings, glow
  // sprites, particles all write rgb > alpha) against the DOM behind it.
  // That's an invalid premultiplied colour: Mac/Metal quietly dims it, but
  // Windows Chromium (ANGLE/D3D11) composites it as clipped, blazing,
  // hard-edged bands — the "cut/flash" ring glitch on slide changes. Opaque
  // rendering keeps ALL accumulation inside the GPU framebuffer (identical on
  // every platform); the hero base gradient is drawn in-scene below.
  let renderer: any;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch {
    return () => {};
  }
  renderer.setPixelRatio(DPR);
  renderer.setSize(W, H, false);
  renderer.setClearColor(0x0a0817, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0916, 0.085);

  // In-scene copy of the .hero CSS base gradient (the CSS layer is hidden
  // behind the now-opaque canvas; it remains as the no-WebGL fallback).
  {
    const bg = document.createElement('canvas');
    bg.width = 1024;
    bg.height = 640;
    const bgx = bg.getContext('2d')!;
    const grd = bgx.createRadialGradient(1024 * 0.7, 640 * 0.16, 0, 1024 * 0.7, 640 * 0.16, 1024 * 1.1);
    grd.addColorStop(0, '#201941');
    grd.addColorStop(0.38, '#130f26');
    grd.addColorStop(0.7, '#0a0817');
    grd.addColorStop(1, '#06050c');
    bgx.fillStyle = grd;
    bgx.fillRect(0, 0, 1024, 640);
    // No colour-space tag: the renderer outputs linear/passthrough in this
    // vendored build, so an untagged texture reproduces the CSS hex colours
    // exactly (tagging it sRGB would decode-darken the gradient).
    const bgTex = new THREE.CanvasTexture(bg);
    scene.background = bgTex;
  }
  const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 100);
  camera.position.set(0, 0, 9);

  function radialTexture(inner: string, outer: string) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const g = c.getContext('2d')!;
    const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grd.addColorStop(0, inner);
    grd.addColorStop(0.35, outer);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
    const t = new THREE.CanvasTexture(c);
    t.needsUpdate = true;
    return t;
  }
  const dotTex = radialTexture('rgba(255,255,255,1)', 'rgba(198,178,255,0.55)');
  // Brighter, hotter core so the additive halo reads as luminous energy, not a dim smudge.
  const glowTex = radialTexture('rgba(210,190,255,0.95)', 'rgba(120,95,255,0.4)');

  const VIOLET = 0x7c5cff;
  const GOLD = 0xd8a94e;

  // Sit the orb high in the upper-right so the enlarged coverflow card doesn't
  // cover it — the crystal must clearly poke out above the card and read as a
  // rotating object, not a static glow smudge hidden behind the hero image.
  const group = new THREE.Group();
  const ORB_Y = 2.5;
  group.position.set(4.0, ORB_Y, 0.2);
  scene.add(group);

  // Slightly larger jewel so it reads as a bold, glowing centrepiece.
  const crystalGeo = new THREE.IcosahedronGeometry(2.25, 1);
  const basePos = crystalGeo.attributes.position.array.slice(0);
  // Prefer MeshPhysicalMaterial (clearcoat + sheen) for a wetter, glassier jewel;
  // fall back to MeshStandardMaterial where it's unavailable so the scene never breaks.
  const PhysMat = THREE.MeshPhysicalMaterial || THREE.MeshStandardMaterial;
  const crystalMat = new PhysMat({
    color: 0x8f7cff,
    metalness: 0.65,
    roughness: 0.12,
    flatShading: true,
    emissive: 0x5a3cff,
    emissiveIntensity: 2.2,
    ...(THREE.MeshPhysicalMaterial
      ? { clearcoat: 1, clearcoatRoughness: 0.15, reflectivity: 1, sheen: 0.6, sheenColor: new THREE.Color(0xbfa8ff) }
      : {}),
  });
  const crystal = new THREE.Mesh(crystalGeo, crystalMat);
  group.add(crystal);

  const wireGeo = new THREE.IcosahedronGeometry(2.5, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    color: VIOLET,
    wireframe: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const wire = new THREE.Mesh(wireGeo, wireMat);
  group.add(wire);

  const glowMat = new THREE.SpriteMaterial({ map: glowTex, color: 0x9f84ff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = new THREE.Sprite(glowMat);
  // Larger, brighter saturated halo radiating around the crystal — the additive
  // core stays hot but the falloff keeps the rotating facets visible in front.
  glow.scale.set(11, 11, 1);
  glow.position.set(0, 0, -1.2);
  group.add(glow);
  const goldGlowMat = new THREE.SpriteMaterial({ map: glowTex, color: GOLD, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false });
  const goldGlow = new THREE.Sprite(goldGlowMat);
  goldGlow.scale.set(6.5, 6.5, 1);
  goldGlow.position.set(1.4, -1.2, -0.5);
  group.add(goldGlow);

  scene.add(new THREE.AmbientLight(0x2a2740, 1.1));
  // Punchier coloured lights so the orb's coloured energy is unmistakable and syncs
  // vividly with the active theme.
  const keyLight = new THREE.PointLight(VIOLET, 110, 34);
  keyLight.position.set(4, 3, 5);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight(GOLD, 60, 34);
  rimLight.position.set(-4, -2, 3);
  scene.add(rimLight);
  const fillLight = new THREE.DirectionalLight(0xbfc8ff, 0.65);
  fillLight.position.set(-2, 4, 4);
  scene.add(fillLight);

  const COUNT = window.innerWidth < 760 ? 420 : 900;
  const pGeo = new THREE.BufferGeometry();
  const pPos = new Float32Array(COUNT * 3);
  const pSpeed = new Float32Array(COUNT);
  for (let i = 0; i < COUNT; i++) {
    pPos[i * 3] = (Math.random() - 0.5) * 22;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 14;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 2;
    pSpeed[i] = Math.random() * 0.5 + 0.2;
  }
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const pMat = new THREE.PointsMaterial({ size: 0.1, map: dotTex, color: 0xdccaff, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  const ringUniforms = {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uColorA: { value: new THREE.Color(0x8f74ff) },
    uColorB: { value: new THREE.Color(0xd8a94e) },
  };
  const ringMat = new THREE.ShaderMaterial({
    uniforms: ringUniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader:
      'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader:
      'uniform float uTime; uniform vec2 uMouse; uniform vec3 uColorA; uniform vec3 uColorB; varying vec2 vUv;' +
      'void main(){' +
      '  vec2 c = vec2(0.5) + uMouse*0.05;' +
      '  float d = distance(vUv, c);' +
      '  float wave = abs(sin(d*58.0 - uTime*1.7));' +
      '  float line = smoothstep(0.72, 1.0, wave);' +
      '  float fade = smoothstep(0.85, 0.04, d);' +
      '  float pulse = 0.7 + 0.3*sin(uTime*0.9 - d*10.0);' +
      '  vec3 col = mix(uColorA, uColorB, smoothstep(0.2,0.62,d));' +
      '  float glow = smoothstep(0.9,0.0,d)*0.28;' +
      // Clamp to [0,1]: the canvas backbuffer is premultiplied-alpha, so any
      // fragment where rgb > a is an INVALID premultiplied colour. Mac/Metal
      // tolerates it; Windows/ANGLE-D3D11 composites it as undefined hyper-
      // bright output — the oversaturated "fat ring" flash on slide change.
      '  float i = clamp(line*fade*pulse*1.5 + glow, 0.0, 1.0);' +
      '  gl_FragColor = vec4(col*i, i);' +
      '}',
  });
  const ringPlane = new THREE.Mesh(new THREE.PlaneGeometry(46, 30), ringMat);
  ringPlane.position.set(0, 0, -6);
  scene.add(ringPlane);

  const themeRing = new THREE.Color(0x8f74ff);
  const themeKey = new THREE.Color(VIOLET);
  const themeFog = new THREE.Color(0x0a0916);
  const themeEmissive = new THREE.Color(0x5a3cff);
  const themeWire = new THREE.Color(VIOLET);
  const themeGlow = new THREE.Color(0x9f84ff);
  // Shared, saturated theme tint for the 2D ripple field (read by initRipple via
  // window.__almaRippleRGB). Seeded to the default violet so it's coloured immediately.
  window.__almaRippleRGB = { r: 158, g: 182, b: 214 };
  window.almaTheme = function (hex: string) {
    try {
      const c = new THREE.Color(hex);
      const hsl: any = {};
      c.getHSL(hsl);
      // Keep the incoming hue SATURATED — floor saturation high so nothing washes out.
      const S = Math.max(0.85, hsl.s);
      const ring = new THREE.Color();
      ring.setHSL(hsl.h, Math.min(1, S), Math.max(0.62, hsl.l + 0.22));
      const key = new THREE.Color();
      key.setHSL(hsl.h, Math.min(1, S), Math.max(0.55, hsl.l + 0.12));
      const emissive = new THREE.Color();
      emissive.setHSL(hsl.h, Math.min(1, S), Math.max(0.5, hsl.l));
      const wireC = new THREE.Color();
      wireC.setHSL(hsl.h, Math.min(1, S), Math.max(0.6, hsl.l + 0.2));
      const glowC = new THREE.Color();
      glowC.setHSL(hsl.h, Math.min(1, S), Math.max(0.65, hsl.l + 0.25));
      const fog = new THREE.Color();
      fog.setHSL(hsl.h, Math.min(0.6, hsl.s), 0.05);
      themeRing.copy(ring);
      themeKey.copy(key);
      themeFog.copy(fog);
      themeEmissive.copy(emissive);
      themeWire.copy(wireC);
      themeGlow.copy(glowC);
      // Vivid, bright tint for the ripple contour lines.
      const rip = new THREE.Color();
      rip.setHSL(hsl.h, Math.min(1, S), Math.max(0.62, hsl.l + 0.22));
      window.__almaRippleRGB = {
        r: Math.round(rip.r * 255),
        g: Math.round(rip.g * 255),
        b: Math.round(rip.b * 255),
      };
    } catch {
      /* ignore */
    }
  };

  let tX = 0;
  let tY = 0;
  let cX = 0;
  let cY = 0;
  let scrollY = 0;
  const onPointer = (e: PointerEvent) => {
    tX = e.clientX / window.innerWidth - 0.5;
    tY = e.clientY / window.innerHeight - 0.5;
  };
  const onOrient = (e: DeviceOrientationEvent) => {
    if (e.gamma != null) {
      tX = Math.max(-0.5, Math.min(0.5, e.gamma / 45));
      tY = Math.max(-0.5, Math.min(0.5, ((e.beta || 0) - 45) / 45));
    }
  };
  const onScroll = () => {
    scrollY = window.scrollY || window.pageYOffset || 0;
  };
  window.addEventListener('pointermove', onPointer, { passive: true });
  window.addEventListener('deviceorientation', onOrient, true);
  window.addEventListener('scroll', onScroll, { passive: true });

  const resize = () => {
    W = host.clientWidth || window.innerWidth;
    H = host.clientHeight || window.innerHeight;
    if (!W || !H) return;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H, false);
  };
  window.addEventListener('resize', resize);
  // Self-correct if the hero is measured before layout settles (fonts/images),
  // so the orb always ends up drawn at the real hero size.
  let ro: ResizeObserver | null = null;
  if ('ResizeObserver' in window) {
    ro = new ResizeObserver(() => resize());
    ro.observe(host);
  }

  let running = true;
  let hidden = false;
  let io: IntersectionObserver | null = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((en) => { running = en[0].isIntersecting; }, { threshold: 0 });
    io.observe(host);
  }
  const onVis = () => { hidden = document.hidden; };
  document.addEventListener('visibilitychange', onVis);

  const clock = new THREE.Clock();
  const crystalPosAttr = crystalGeo.attributes.position;
  let rafId = 0;
  let disposed = false;
  function frame() {
    if (disposed) return;
    rafId = requestAnimationFrame(frame);
    if (!running || hidden) return;
    const t = clock.getElapsedTime();

    cX += (tX - cX) * 0.05;
    cY += (tY - cY) * 0.05;
    camera.position.x = cX * 2.4;
    camera.position.y = -cY * 1.6 - scrollY * 0.0016;
    camera.lookAt(0.8, 0.35, 0);

    group.position.y = ORB_Y + Math.sin(t * 0.7) * 0.22;
    // Spin fast enough to be unmistakably rotating: ~0.6 rad/s (~35°/s) does a
    // full turn in ~10s. On a near-spherical icosahedron a slow spin reads as
    // static, so the shifting facets need real angular speed to be perceived.
    group.rotation.y = t * 0.6 + cX * 0.4;
    group.rotation.x = Math.sin(t * 0.5) * 0.22 - cY * 0.3;
    wire.rotation.y = -t * 0.42;
    wire.rotation.z = t * 0.22;
    const amp = 0.05;
    for (let k = 0; k < basePos.length; k += 3) {
      const f = 1 + Math.sin(t * 1.1 + basePos[k] * 1.3 + basePos[k + 1] * 0.9) * amp;
      crystalPosAttr.array[k] = basePos[k] * f;
      crystalPosAttr.array[k + 1] = basePos[k + 1] * f;
      crystalPosAttr.array[k + 2] = basePos[k + 2] * f;
    }
    crystalPosAttr.needsUpdate = true;
    crystalGeo.computeVertexNormals();

    keyLight.position.set(Math.cos(t * 0.6) * 5 + 4.0, Math.sin(t * 0.5) * 3 + ORB_Y, Math.cos(t * 0.4) * 4 + 3);
    rimLight.position.set(Math.cos(t * 0.4 + 2) * 5 + 4.0, Math.sin(t * 0.7 + 1) * 3 + ORB_Y, Math.sin(t * 0.5) * 4 + 2);
    // Brighter, more present halo pulse.
    glow.material.opacity = 0.92 + Math.sin(t * 1.4) * 0.08;

    const arr = pGeo.attributes.position.array;
    for (let j = 0; j < COUNT; j++) {
      arr[j * 3 + 1] += pSpeed[j] * 0.006;
      arr[j * 3] += Math.sin(t * 0.3 + j) * 0.0009;
      if (arr[j * 3 + 1] > 7) arr[j * 3 + 1] = -7;
    }
    pGeo.attributes.position.needsUpdate = true;
    points.rotation.y = cX * 0.15;

    ringUniforms.uTime.value = t;
    ringUniforms.uMouse.value.set(cX, -cY);
    ringUniforms.uColorA.value.lerp(themeRing, 0.04);
    keyLight.color.lerp(themeKey, 0.04);
    rimLight.color.lerp(themeRing, 0.03);
    scene.fog.color.lerp(themeFog, 0.04);
    // Propagate the vivid theme colour through the orb itself so switching slides
    // visibly recolours the crystal, its wireframe halo and the bloom sprite.
    crystalMat.emissive.lerp(themeEmissive, 0.04);
    wireMat.color.lerp(themeWire, 0.04);
    glowMat.color.lerp(themeGlow, 0.04);

    renderer.render(scene, camera);
  }
  rafId = requestAnimationFrame(frame);

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('deviceorientation', onOrient, true);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', resize);
    document.removeEventListener('visibilitychange', onVis);
    if (io) io.disconnect();
    if (ro) ro.disconnect();
    try { renderer.dispose(); } catch { /* ignore */ }
    if (window.almaTheme) delete window.almaTheme;
  };
}

/* ============================ CURSOR COMET TRAIL ============================ */
function initCursorTrail(): () => void {
  const fine = window.matchMedia && window.matchMedia('(pointer:fine)').matches;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  const cv = document.getElementById('ob-cursor-trail') as HTMLCanvasElement | null;
  if (!cv || !fine || reduce) {
    if (cv) cv.style.display = 'none';
    return () => {};
  }
  const ctx = cv.getContext('2d')!;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  let W = 0;
  let H = 0;
  const size = () => {
    W = window.innerWidth;
    H = window.innerHeight;
    cv.width = W * DPR;
    cv.height = H * DPR;
    cv.style.width = `${W}px`;
    cv.style.height = `${H}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  size();
  window.addEventListener('resize', size);

  const pts: Array<{ x: number; y: number }> = [];
  let mx = -100;
  let my = -100;
  let hasMoved = false;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    mx = e.clientX;
    my = e.clientY;
    hasMoved = true;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let running = true;
  const onVis = () => { running = !document.hidden; };
  document.addEventListener('visibilitychange', onVis);

  let rafId = 0;
  let disposed = false;
  function loop() {
    if (disposed) return;
    rafId = requestAnimationFrame(loop);
    if (!running) return;
    ctx.clearRect(0, 0, W, H);
    if (hasMoved) pts.push({ x: mx, y: my });
    if (pts.length > 26) pts.shift();
    if (pts.length < 2) return;
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const t = i / pts.length;
      const w = Math.max(0.4, t * 7);
      const g = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y);
      g.addColorStop(0, `rgba(124,92,255,${t * 0.5})`);
      g.addColorStop(1, `rgba(236,192,116,${t * 0.65})`);
      ctx.strokeStyle = g;
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(p0.x, p0.y);
      ctx.lineTo(p1.x, p1.y);
      ctx.stroke();
    }
    const head = pts[pts.length - 1];
    const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 14);
    hg.addColorStop(0, 'rgba(255,255,255,.9)');
    hg.addColorStop(0.4, 'rgba(154,125,255,.5)');
    hg.addColorStop(1, 'rgba(154,125,255,0)');
    ctx.fillStyle = hg;
    ctx.beginPath();
    ctx.arc(head.x, head.y, 14, 0, Math.PI * 2);
    ctx.fill();
    if (!hasMoved && pts.length) pts.shift();
    hasMoved = false;
  }
  rafId = requestAnimationFrame(loop);

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', size);
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('visibilitychange', onVis);
  };
}

/* ==================== HERO RIPPLE + PARTICLE FIELD (2D canvas) ==================== */
/* Ambient concentric ripples + drifting particles, gently mouse-reactive. Pure 2D
 * canvas — works even where WebGL is unavailable, so the hero always feels alive. */
function initRipple(): () => void {
  const cv = document.getElementById('ripple') as HTMLCanvasElement | null;
  if (!cv || !cv.getContext) return () => {};
  const host = cv.parentElement as HTMLElement | null;
  if (!host) return () => {};
  const cx = cv.getContext('2d')!;
  let W = 0;
  let H = 0;
  let DPR = 1;
  let parts: Array<{ x: number; y: number; r: number; vx: number; vy: number; a: number }> = [];
  let visible = true;
  let mX = 0.5;
  let mY = 0.5;

  const size = () => {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    W = host.clientWidth;
    H = host.clientHeight;
    cv.width = W * DPR;
    cv.height = H * DPR;
    cv.style.width = `${W}px`;
    cv.style.height = `${H}px`;
    cx.setTransform(DPR, 0, 0, DPR, 0, 0);
  };
  const seed = () => {
    const N = window.innerWidth < 760 ? 34 : 70;
    parts = [];
    for (let i = 0; i < N; i++) {
      parts.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.8 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        a: Math.random() * 0.5 + 0.15,
      });
    }
  };
  const onMove = (e: PointerEvent) => {
    mX = e.clientX / window.innerWidth;
    mY = e.clientY / window.innerHeight;
  };
  window.addEventListener('pointermove', onMove, { passive: true });

  let rafId = 0;
  let disposed = false;
  const TAU = Math.PI * 2;
  const draw = (ts: number) => {
    if (disposed) return;
    rafId = requestAnimationFrame(draw);
    if (!visible) return;
    const t = ts * 0.001;
    cx.clearRect(0, 0, W, H);

    // Topographic contour field — nested wavy iso-lines fanning out from an
    // off-centre origin (a fingerprint / elevation-map look), faithful to the
    // Apechain reference hero. Each contour's radius is perturbed per-angle so
    // the loops read as organic terrain rather than plain concentric circles.
    const ccx = W * (0.6 + (mX - 0.5) * 0.05);
    const ccy = H * (0.34 + (mY - 0.5) * 0.05);
    const maxR = Math.hypot(Math.max(ccx, W - ccx), Math.max(ccy, H - ccy)) + 40;
    // More numerous contour loops => denser, richer energy field.
    const rings = 42;
    const gap = maxR / rings;
    const drift = (t * 9) % gap;
    const STEP = 0.1;
    cx.lineWidth = 1.4;
    // Additive blending makes overlapping luminous lines read as glowing energy.
    cx.globalCompositeOperation = 'lighter';
    // Vivid theme tint (falls back to the cool default before almaTheme runs).
    const rip = window.__almaRippleRGB || { r: 158, g: 182, b: 214 };
    for (let i = 0; i < rings; i++) {
      const baseR = drift + i * gap;
      if (baseR < 8) continue;
      // Higher-contrast lines that stay bright further out for a luminous field.
      const alpha = 0.34 * (1 - baseR / (maxR * 1.18));
      if (alpha <= 0) continue;
      // Calm the innermost rings so the wobble never folds through the origin.
      const amp = Math.min(1, baseR / (gap * 4));
      cx.strokeStyle = `rgba(${rip.r},${rip.g},${rip.b},${alpha})`;
      cx.beginPath();
      for (let a = 0; a <= TAU + STEP; a += STEP) {
        const wob =
          (Math.sin(a * 3 + i * 0.55 + t * 0.25) * 0.42 +
            Math.sin(a * 5 - i * 0.32 - t * 0.18) * 0.22 +
            Math.sin(a * 2 + i * 0.9) * 0.16) *
          gap *
          amp;
        const r = baseR + wob;
        const x = ccx + Math.cos(a) * r;
        const y = ccy + Math.sin(a) * r;
        if (a === 0) cx.moveTo(x, y);
        else cx.lineTo(x, y);
      }
      cx.stroke();
    }

    // Brighter drifting particles, tinted toward the theme, additive glow.
    for (const p of parts) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      cx.beginPath();
      cx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      cx.fillStyle = `rgba(${Math.min(255, rip.r + 40)},${Math.min(255, rip.g + 40)},${Math.min(255, rip.b + 40)},${Math.min(0.9, p.a + 0.15)})`;
      cx.fill();
    }
    cx.globalCompositeOperation = 'source-over';
  };

  size();
  seed();
  rafId = requestAnimationFrame(draw);
  const onResize = () => {
    size();
    seed();
  };
  window.addEventListener('resize', onResize);
  let io: IntersectionObserver | null = null;
  if ('IntersectionObserver' in window) {
    io = new IntersectionObserver((en) => { visible = en[0].isIntersecting; }, { threshold: 0 });
    io.observe(cv);
  }

  return () => {
    disposed = true;
    cancelAnimationFrame(rafId);
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('resize', onResize);
    if (io) io.disconnect();
  };
}

/* ============================ POLISH (GSAP + Lenis) ============================ */
function initPolish(): () => void {
  const cleanups: Array<() => void> = [];
  const GS = window.gsap;
  const ST = window.ScrollTrigger;
  const LN = window.Lenis;
  if (GS && ST) {
    try { GS.registerPlugin(ST); } catch { /* ignore */ }
  }

  /* smooth scroll — keeps native scroll (day→night sky still reads pageYOffset) */
  let lenis: any = null;
  try {
    if (LN && !window.__obLenis) {
      // Kill the browser's native CSS smooth-scroll while Lenis drives scrolling.
      // Our global <html> carries Tailwind's `scroll-smooth` (scroll-behavior:
      // smooth); left on, it fights Lenis's JS scroll and produces juddery
      // ("kapkapi") + overshooting-to-bottom motion. Lenis's own stylesheet would
      // normally do this via `.lenis-smooth`, but this build doesn't add that
      // class reliably — so force it here and restore on cleanup.
      const htmlEl = document.documentElement;
      const prevScrollBehavior = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = 'auto';
      // Snappier than the demo default: higher lerp = the view catches up to the
      // target faster (less "floaty" lag), and a wheelMultiplier > 1 moves more
      // distance per notch — so scrolling feels FAST, not slow/drifting.
      lenis = new LN({ duration: 0.8, smoothWheel: true, lerp: 0.14, wheelMultiplier: 1.4 });
      window.__obLenis = lenis;
      let lraf = 0;
      const raf = (t: number) => { lenis.raf(t); lraf = requestAnimationFrame(raf); };
      lraf = requestAnimationFrame(raf);
      if (ST) lenis.on('scroll', ST.update);
      cleanups.push(() => {
        cancelAnimationFrame(lraf);
        try { lenis.destroy(); } catch { /* ignore */ }
        window.__obLenis = undefined;
        htmlEl.style.scrollBehavior = prevScrollBehavior;
      });
    }
  } catch { lenis = null; }

  /* scroll reveals via IntersectionObserver */
  const revealEls = Array.from(
    document.querySelectorAll<HTMLElement>('[data-ob-reveal]')
  );
  if ('IntersectionObserver' in window && revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -6% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
    cleanups.push(() => io.disconnect());
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  if (GS) {
    /* magnetic buttons */
    const magHandlers: Array<() => void> = [];
    document.querySelectorAll<HTMLElement>('.ob-btn').forEach((btn) => {
      const mag = (btn.querySelector('.mag') as HTMLElement) || btn;
      const move = (e: PointerEvent) => {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - r.left - r.width / 2;
        const dy = e.clientY - r.top - r.height / 2;
        GS.to(btn, { x: dx * 0.3, y: dy * 0.4, duration: 0.4, ease: 'power3.out' });
        GS.to(mag, { x: dx * 0.15, y: dy * 0.2, duration: 0.4, ease: 'power3.out' });
      };
      const leave = () => {
        GS.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,.5)' });
        GS.to(mag, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,.5)' });
      };
      btn.addEventListener('pointermove', move);
      btn.addEventListener('pointerleave', leave);
      magHandlers.push(() => {
        btn.removeEventListener('pointermove', move);
        btn.removeEventListener('pointerleave', leave);
      });
    });
    cleanups.push(() => magHandlers.forEach((fn) => fn()));

    /* 3D tilt cards */
    const tiltHandlers: Array<() => void> = [];
    const tilt = (el: HTMLElement, max: number, baseY: number) => {
      const move = (e: PointerEvent) => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        GS.to(el, { rotateY: px * max + baseY, rotateX: -py * max, duration: 0.5, ease: 'power2.out', transformPerspective: 1000, transformOrigin: 'center' });
      };
      const leave = () => GS.to(el, { rotateY: baseY, rotateX: 0, duration: 0.7, ease: 'power3.out' });
      el.addEventListener('pointermove', move);
      el.addEventListener('pointerleave', leave);
      tiltHandlers.push(() => {
        el.removeEventListener('pointermove', move);
        el.removeEventListener('pointerleave', leave);
      });
    };
    const sc = document.querySelector<HTMLElement>('.spot-card');
    if (sc) tilt(sc, 12, -16);
    document.querySelectorAll<HTMLElement>('.pcard').forEach((c) => tilt(c, 8, 0));
    cleanups.push(() => tiltHandlers.forEach((fn) => fn()));

    /* scrubbed parallax */
    if (ST) {
      const triggers: any[] = [];
      try {
        triggers.push(GS.to('.spot-ghost', { scrollTrigger: { trigger: '.spotlight', start: 'top 80%', scrub: 1 }, xPercent: -8 }));
      } catch { /* ignore */ }
      try {
        triggers.push(GS.to('.hero-overlay', { scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }, yPercent: -18, opacity: 0.15, ease: 'none' }));
      } catch { /* ignore */ }
      try {
        triggers.push(GS.to('.hero-carousel', { scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }, yPercent: 14, scale: 0.92, ease: 'none' }));
      } catch { /* ignore */ }
      const onLoad = () => { try { ST.refresh(); } catch { /* ignore */ } };
      window.addEventListener('load', onLoad);
      cleanups.push(() => {
        window.removeEventListener('load', onLoad);
        triggers.forEach((tw) => { try { tw?.scrollTrigger?.kill(); tw?.kill?.(); } catch { /* ignore */ } });
      });
    }
  }

  return () => cleanups.forEach((fn) => fn());
}

export function ObsidianFX() {
  useEffect(() => {
    let cleanups: Array<() => void> = [];
    let cancelled = false;
    loadVendor().then(() => {
      if (cancelled) return;
      try { cleanups.push(initWebGL()); } catch { /* ignore */ }
      try { cleanups.push(initRipple()); } catch { /* ignore */ }
      try { cleanups.push(initCursorTrail()); } catch { /* ignore */ }
      try { cleanups.push(initPolish()); } catch { /* ignore */ }
    });
    return () => {
      cancelled = true;
      cleanups.forEach((fn) => { try { fn(); } catch { /* ignore */ } });
      cleanups = [];
    };
  }, []);

  return <canvas id="ob-cursor-trail" className="ob-cursor-trail" aria-hidden />;
}
