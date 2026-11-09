import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

function shieldShape(scale = 1) {
  const shape = new THREE.Shape();
  shape.moveTo(0, 1.62 * scale);
  shape.lineTo(1.16 * scale, 1.2 * scale);
  shape.lineTo(1.08 * scale, 0.12 * scale);
  shape.bezierCurveTo(1.03 * scale, -0.69 * scale, 0.52 * scale, -1.31 * scale, 0, -1.62 * scale);
  shape.bezierCurveTo(-0.52 * scale, -1.31 * scale, -1.03 * scale, -0.69 * scale, -1.08 * scale, 0.12 * scale);
  shape.lineTo(-1.16 * scale, 1.2 * scale);
  shape.closePath();
  return shape;
}

function makeShieldLayer(scale, depth, material) {
  const geometry = new THREE.ExtrudeGeometry(shieldShape(scale), {
    depth,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.065 * scale,
    bevelThickness: 0.045 * scale,
    curveSegments: 12,
  });
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

function createEdgeMaterial() {
  return new THREE.ShaderMaterial({
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    uniforms: { glowColor: { value: new THREE.Color(0x73b9b6) } },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vViewPosition = -viewPosition.xyz;
        gl_Position = projectionMatrix * viewPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 glowColor;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      void main() {
        float fresnel = pow(1.0 - max(dot(normalize(vNormal), normalize(vViewPosition)), 0.0), 2.1);
        gl_FragColor = vec4(glowColor, fresnel * 0.86);
      }
    `,
  });
}

function makeShield() {
  const group = new THREE.Group();
  const back = makeShieldLayer(1.06, 0.25, new THREE.MeshPhysicalMaterial({
    color: 0x738b8f, emissive: 0x1c3538, emissiveIntensity: 0.06,
    metalness: 0.78, roughness: 0.24, clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide,
  }));
  back.position.z = -0.16;
  group.add(back);

  const face = makeShieldLayer(0.94, 0.09, new THREE.MeshPhysicalMaterial({
    color: 0x8eaaa8, emissive: 0x294a49, emissiveIntensity: 0.08,
    metalness: 0.28, roughness: 0.2, transparent: true, opacity: 0.72,
    transmission: 0.08, thickness: 0.32, ior: 1.36,
    clearcoat: 1, clearcoatRoughness: 0.12, side: THREE.DoubleSide, depthWrite: false,
  }));
  face.position.z = 0.08;
  group.add(face);

  const innerPlate = makeShieldLayer(0.79, 0.035, new THREE.MeshPhysicalMaterial({
    color: 0x719b98, emissive: 0x173d3a, emissiveIntensity: 0.07,
    metalness: 0.32, roughness: 0.28, transparent: true, opacity: 0.72,
    side: THREE.DoubleSide, depthWrite: false,
  }));
  innerPlate.position.z = 0.19;
  group.add(innerPlate);

  const edge = makeShieldLayer(1.095, 0.1, createEdgeMaterial());
  edge.position.z = -0.015;
  group.add(edge);

  const perimeterMaterial = new THREE.LineBasicMaterial({ color: 0x74b9bd, transparent: true, opacity: 0.88 });
  const perimeter = new THREE.LineLoop(
    new THREE.BufferGeometry().setFromPoints(shieldShape(1.015).getPoints(92).map((point) => new THREE.Vector3(point.x, point.y, 0.225))),
    perimeterMaterial,
  );
  group.add(perimeter);

  const innerCircuitMaterials = [
    new THREE.LineBasicMaterial({ color: 0x72b8b8, transparent: true, opacity: 0.62 }),
    new THREE.LineBasicMaterial({ color: 0x91aab3, transparent: true, opacity: 0.58 }),
  ];
  [0.74, -0.74].forEach((direction) => {
    const points = [
      new THREE.Vector3(direction * 0.45, -0.91, 0.25),
      new THREE.Vector3(direction * 0.45, -0.55, 0.25),
      new THREE.Vector3(direction * 0.13, -0.26, 0.25),
      new THREE.Vector3(direction * 0.13, 0.42, 0.25),
    ];
    group.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      innerCircuitMaterials[direction > 0 ? 0 : 1],
    ));
  });

  const check = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.42, 0.05, 0.31),
      new THREE.Vector3(-0.1, -0.26, 0.37),
      new THREE.Vector3(0.47, 0.42, 0.31),
    ]), 28, 0.047, 8, false),
    new THREE.MeshBasicMaterial({ color: 0x367f79 }),
  );
  group.add(check);

  const lightCore = new THREE.Mesh(
    new THREE.SphereGeometry(0.25, 18, 14),
    new THREE.MeshBasicMaterial({ color: 0x77c5c1, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  lightCore.position.set(0, -0.04, -0.06);
  lightCore.scale.set(2.5, 3, 0.6);
  group.add(lightCore);

  const pulse = new THREE.Mesh(
    new THREE.TorusGeometry(0.4, 0.025, 6, 80),
    new THREE.MeshBasicMaterial({ color: 0x68b8ac, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  pulse.position.z = 0.34;
  group.add(pulse);

  return { group, perimeterMaterial, edgeMaterial: edge.material, innerCircuitMaterials, pulse };
}

function createEnvironment() {
  const environment = new THREE.Group();
  const gridPositions = [];
  for (let x = -4.8; x <= 4.8; x += 0.48) {
    gridPositions.push(x, -3.2, -1.7, x, 3.2, -1.7);
  }
  for (let y = -3.2; y <= 3.2; y += 0.48) {
    gridPositions.push(-4.8, y, -1.7, 4.8, y, -1.7);
  }
  const gridGeometry = new THREE.BufferGeometry();
  gridGeometry.setAttribute("position", new THREE.Float32BufferAttribute(gridPositions, 3));
  environment.add(new THREE.LineSegments(
    gridGeometry,
    new THREE.LineBasicMaterial({ color: 0x3e83bb, transparent: true, opacity: 0.12, depthWrite: false }),
  ));

  const circuitColors = [0x79bdba, 0x89aeb8, 0x9caec0, 0x7bc7c4];
  const circuits = [
    [[-4.3, 1.75, -0.5], [-3.1, 1.75, -0.5], [-2.72, 1.37, -0.5], [-1.9, 1.37, -0.5]],
    [[4.3, 1.58, -0.45], [3.22, 1.58, -0.45], [2.85, 1.2, -0.45], [2, 1.2, -0.45]],
    [[-4.4, -1.9, -0.6], [-3.48, -1.9, -0.6], [-3.1, -1.52, -0.6], [-2.2, -1.52, -0.6]],
    [[4.45, -1.7, -0.58], [3.56, -1.7, -0.58], [3.18, -1.32, -0.58], [2.22, -1.32, -0.58]],
  ];
  circuits.forEach((path, index) => {
    const circuitMaterial = new THREE.LineBasicMaterial({ color: circuitColors[index], transparent: true, opacity: 0.42 });
    const points = path.map(([x, y, z]) => new THREE.Vector3(x, y, z));
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(points),
      circuitMaterial,
    );
    environment.add(line);
    points.forEach((point) => {
      const node = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.045, 0.045),
        new THREE.MeshBasicMaterial({ color: circuitColors[index], transparent: true, opacity: 0.8 }),
      );
      node.position.copy(point);
      environment.add(node);
    });
  });

  const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x68aaa3, transparent: true, opacity: 0.18, depthWrite: false });
  const orbit = new THREE.Mesh(new THREE.TorusGeometry(2.05, 0.008, 6, 128), orbitMaterial);
  orbit.position.z = -0.65;
  orbit.scale.set(1.16, 0.84, 1);
  environment.add(orbit);
  const orbitInner = new THREE.Mesh(
    new THREE.TorusGeometry(1.76, 0.006, 6, 128),
    new THREE.MeshBasicMaterial({ color: 0x98a7b3, transparent: true, opacity: 0.13, depthWrite: false }),
  );
  orbitInner.position.z = -0.8;
  orbitInner.scale.set(1.04, 0.91, 1);
  environment.add(orbitInner);

  return { group: environment, orbit, orbitInner };
}

function createThreats(compact) {
  const threatGroup = new THREE.Group();
  const palettes = [0x8bbcff, 0xb096ff, 0x76d1e8, 0xa8a3ff];
  const geometry = new THREE.OctahedronGeometry(compact ? 0.11 : 0.14, 0);
  const coreGeometry = new THREE.OctahedronGeometry(compact ? 0.055 : 0.07, 0);
  const ringGeometry = new THREE.TorusGeometry(compact ? 0.18 : 0.22, 0.006, 5, 24);
  const starts = [
    new THREE.Vector3(-3.7, 1.85, 0.05),
    new THREE.Vector3(3.8, 1.3, 0.1),
    new THREE.Vector3(-3.75, -1.8, 0.14),
    new THREE.Vector3(3.7, -1.55, 0.02),
  ];
  const ends = [
    new THREE.Vector3(-1.04, 0.33, 0.28),
    new THREE.Vector3(1.01, 0.45, 0.3),
    new THREE.Vector3(-0.82, -0.85, 0.32),
    new THREE.Vector3(0.8, -0.88, 0.3),
  ];
  const threats = starts.map((start, index) => {
    const color = palettes[index];
    const threatMaterial = new THREE.MeshPhysicalMaterial({
      color, emissive: color, emissiveIntensity: 0.32,
      metalness: 0.5, roughness: 0.22, wireframe: true,
    });
    const coreMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.72 });
    const ringMaterial = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.5 });
    const routeMaterial = new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.31 });
    const end = ends[index];
    const curve = new THREE.CatmullRomCurve3([
      start,
      new THREE.Vector3(start.x * 0.72, start.y * 0.84, start.z),
      new THREE.Vector3(end.x * 1.58, end.y * 1.45, end.z),
      end,
    ]);
    threatGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(curve.getPoints(26)),
      routeMaterial,
    ));
    const signal = new THREE.Group();
    signal.add(new THREE.Mesh(geometry, threatMaterial));
    signal.add(new THREE.Mesh(coreGeometry, coreMaterial));
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = index % 2 ? 0.62 : -0.52;
    signal.add(ring);
    threatGroup.add(signal);
    return { signal, curve, offset: index * 0.24, ring, index };
  });
  return { group: threatGroup, threats };
}

function createParticles(count) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const color = new THREE.Color();
  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 6.1;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 6.1;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 2.7;
    color.setHSL((0.48 + Math.random() * 0.48) % 1, 0.48, 0.68);
    colors.set([color.r, color.g, color.b], i * 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return geometry;
}

export function initShieldScene(container, onReady) {
  if (!container || !("WebGLRenderingContext" in window)) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: window.innerWidth > 700,
      powerPreference: "low-power",
      stencil: false,
    });
  } catch (error) {
    console.warn("WebGL is unavailable; the CSS shield illustration remains visible.", error);
    return;
  }

  const scene = new THREE.Scene();
  const roomEnvironment = new RoomEnvironment();
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const environmentMap = pmremGenerator.fromScene(roomEnvironment, 0.04).texture;
  roomEnvironment.dispose();
  pmremGenerator.dispose();
  scene.environment = environmentMap;
  scene.environmentIntensity = 0.62;
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 40);
  camera.position.set(0, 0, 8);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.05 : 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.setAttribute("aria-hidden", "true");
  container.appendChild(renderer.domElement);

  scene.add(new THREE.HemisphereLight(0xe5eaff, 0x333956, 2.5));
  const keyLight = new THREE.PointLight(0xd8ffff, 18, 13);
  keyLight.position.set(-2.5, 2.8, 3.3);
  scene.add(keyLight);
  const fillLight = new THREE.PointLight(0x8bcfc4, 8, 12);
  fillLight.position.set(2.6, -1.8, 2.2);
  scene.add(fillLight);
  const rimLight = new THREE.PointLight(0xc2dfe0, 9, 10);
  rimLight.position.set(0.2, 2.3, -2.6);
  scene.add(rimLight);
  const faceLight = new THREE.PointLight(0xe8ecff, 30, 8);
  faceLight.position.set(1.2, 0.2, 4);
  scene.add(faceLight);

  const environment = createEnvironment();
  environment.group.scale.setScalar(window.innerWidth < 700 ? 1.1 : 1.48);
  scene.add(environment.group);
  const shieldData = makeShield();
  shieldData.group.scale.setScalar(window.innerWidth < 700 ? 0.82 : 1.2);
  shieldData.group.position.set(window.innerWidth < 700 ? 0.08 : 0.18, -0.08, 0.12);
  scene.add(shieldData.group);
  const compact = window.innerWidth < 700;
  const threatData = createThreats(compact);
  threatData.group.scale.setScalar(compact ? 0.9 : 1.28);
  threatData.group.position.x = compact ? 0.22 : 0.65;
  scene.add(threatData.group);
  const particles = new THREE.Points(
    createParticles(compact ? 36 : 76),
    new THREE.PointsMaterial({
      vertexColors: true,
      size: compact ? 0.019 : 0.023,
      transparent: true,
      opacity: 0.53,
      sizeAttenuation: true,
      depthWrite: false,
    }),
  );
  scene.add(particles);

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let pointerX = 0;
  let pointerY = 0;
  let currentPointerX = 0;
  let currentPointerY = 0;
  let frame = 0;
  let running = false;
  let isVisible = false;
  let disposed = false;
  let currentTime = 0;
  let scrollProgress = 0;
  let interactionUntil = 0;
  let pulseStartedAt = -1;
  const clock = new THREE.Clock();
  const cyanTone = new THREE.Color(0x6bb8b1);
  const violetTone = new THREE.Color(0x8fa9ba);
  const magentaTone = new THREE.Color(0x9bbfae);
  const edgeTone = new THREE.Color();
  const circuitTone = new THREE.Color();

  function resize() {
    if (disposed) return;
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    const isCompact = window.innerWidth < 700;
    camera.aspect = width / height;
    camera.position.z = isCompact ? 8.6 : 8.2;
    shieldData.group.scale.setScalar(isCompact ? 0.82 : 1.2);
    shieldData.group.position.x = isCompact ? 0.08 : 0.18;
    threatData.group.scale.setScalar(isCompact ? 0.9 : 1.28);
    threatData.group.position.x = isCompact ? 0.22 : 0.65;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.05 : 1.35));
    renderer.setSize(width, height, false);
    particles.geometry.setDrawRange(0, isCompact ? 36 : 76);
    if (reducedMotion.matches) renderStatic();
  }

  function updateScene(time, animateThreats) {
    const baseCameraZ = window.innerWidth < 700 ? 8.6 : 8.2;
    camera.position.x = scrollProgress * 0.2;
    camera.position.z = baseCameraZ - scrollProgress * 0.4;
    currentPointerX += ((animateThreats ? pointerX : 0) - currentPointerX) * 0.12;
    currentPointerY += ((animateThreats ? pointerY : 0) - currentPointerY) * 0.12;
    shieldData.group.rotation.y = currentPointerX;
    shieldData.group.rotation.x = -currentPointerY;
    shieldData.group.position.y = -0.08;
    environment.orbit.rotation.z = 0;
    environment.orbitInner.rotation.z = 0;
    particles.rotation.set(0, 0, 0);

    let impact = 0;
    const threatPulseActive = pulseStartedAt >= 0 && time - pulseStartedAt < 0.9;
    threatData.threats.forEach(({ signal, curve, offset, ring, index }) => {
      const progress = threatPulseActive ? Math.min(0.94, 0.08 + (time - pulseStartedAt) * 0.72 + offset * 0.12) : 0.68 + index * 0.025;
      signal.position.copy(curve.getPointAt(progress));
      signal.rotation.x = progress * 1.8;
      signal.rotation.y = progress * 2.4 + index;
      ring.scale.setScalar(0.86);
      if (progress > 0.89) impact = Math.max(impact, (progress - 0.89) / 0.11);
    });
    shieldData.perimeterMaterial.opacity = 0.78 + impact * 0.2;
    const spectralBlend = 0.28;
    edgeTone.copy(cyanTone).lerp(violetTone, spectralBlend);
    circuitTone.copy(violetTone).lerp(magentaTone, spectralBlend);
    shieldData.edgeMaterial.uniforms.glowColor.value.copy(edgeTone);
    shieldData.perimeterMaterial.color.set(0x74b9bd);
    shieldData.innerCircuitMaterials[0].color.copy(edgeTone);
    shieldData.innerCircuitMaterials[1].color.copy(circuitTone);
    const pulseProgress = pulseStartedAt < 0 ? 1 : THREE.MathUtils.clamp((time - pulseStartedAt) / 0.9, 0, 1);
    shieldData.pulse.scale.setScalar(1 + pulseProgress * 1.8);
    shieldData.pulse.material.opacity = pulseStartedAt < 0 ? 0 : (1 - pulseProgress) * 0.48;
  }

  function renderStatic() {
    if (disposed) return;
    updateScene(currentTime, false);
    renderer.render(scene, camera);
  }

  function stop() {
    running = false;
    cancelAnimationFrame(frame);
  }

  function animate() {
    if (disposed || !running || !isVisible || document.hidden || reducedMotion.matches) {
      stop();
      return;
    }
    if (performance.now() >= interactionUntil + 350) {
      currentTime = clock.getElapsedTime();
      updateScene(currentTime, false);
      renderer.render(scene, camera);
      stop();
      return;
    }
    frame = requestAnimationFrame(animate);
    currentTime = clock.getElapsedTime();
    updateScene(currentTime, performance.now() < interactionUntil);
    renderer.render(scene, camera);
  }

  function startInteraction(withPulse = false) {
    if (disposed || !isVisible || document.hidden || reducedMotion.matches) return;
    interactionUntil = performance.now() + 700;
    if (withPulse) pulseStartedAt = clock.getElapsedTime();
    if (running) return;
    running = true;
    animate();
  }

  function handlePointer(event) {
    const bounds = container.getBoundingClientRect();
    pointerX = ((event.clientX - bounds.left) / bounds.width - 0.5) * 0.12;
    pointerY = ((event.clientY - bounds.top) / bounds.height - 0.5) * 0.08;
    startInteraction();
  }

  function handlePointerDown(event) {
    if (event.target.closest("a, button, details, summary")) return;
    startInteraction(true);
  }

  function handleAccessibleInteraction() {
    startInteraction(true);
  }

  function handleScroll() {
    const hero = container.closest(".hero");
    if (!hero) return;
    const travel = Math.max(hero.offsetHeight * 0.8, 1);
    scrollProgress = THREE.MathUtils.clamp((window.scrollY - hero.offsetTop) / travel, 0, 1);
    if (!running && isVisible) renderStatic();
  }

  function handleVisibility() {
    stop();
    if (!document.hidden && isVisible) renderStatic();
  }

  function handleMotionPreference() {
    if (reducedMotion.matches) {
      stop();
      renderStatic();
    } else renderStatic();
  }

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  const visibilityObserver = new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
    if (isVisible && reducedMotion.matches) renderStatic();
    else {
      stop();
      if (isVisible) renderStatic();
    }
  });
  visibilityObserver.observe(container);
  const interactionSurface = container.closest(".hero-visual") || container;
  const interactionButton = interactionSurface.querySelector(".shield-interaction");
  interactionSurface.addEventListener("pointermove", handlePointer, { passive: true });
  interactionSurface.addEventListener("pointerdown", handlePointerDown);
  interactionButton?.addEventListener("click", handleAccessibleInteraction);
  window.addEventListener("scroll", handleScroll, { passive: true });
  document.addEventListener("visibilitychange", handleVisibility);
  reducedMotion.addEventListener("change", handleMotionPreference);

  resize();
  handleScroll();
  updateScene(0, false);
  onReady();
  renderStatic();

  window.addEventListener("pagehide", () => {
    disposed = true;
    stop();
    resizeObserver.disconnect();
    visibilityObserver.disconnect();
    interactionSurface.removeEventListener("pointermove", handlePointer);
    interactionSurface.removeEventListener("pointerdown", handlePointerDown);
    interactionButton?.removeEventListener("click", handleAccessibleInteraction);
    window.removeEventListener("scroll", handleScroll);
    document.removeEventListener("visibilitychange", handleVisibility);
    reducedMotion.removeEventListener("change", handleMotionPreference);
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    environmentMap.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }, { once: true });
}
