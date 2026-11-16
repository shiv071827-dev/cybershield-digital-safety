import * as THREE from "three";
import { InputManager } from "./input.js";
import { CameraController } from "./camera.js";
import { Player } from "./player.js";
import { World } from "./world.js";
import { GraphicsSettings } from "./graphics.js";
import { UI } from "./ui.js";
import { AssetCache } from "./assets.js";
import { SaveManager } from "./save.js";
import { Mission } from "./mission.js";
import { Dialogue } from "./dialogue.js";
import { Character } from "./character.js";

const STEP = 1 / 60;
const MAX_SUBSTEPS = 3;
const HERO_SELECTOR = "#shield-scene";

let container = null;
let renderer = null;
let scene = null;
let camera = null;
let clock = null;
let input = null;
let cameraCtrl = null;
let player = null;
let world = null;
let graphics = null;
let ui = null;
let onResize = null;
let running = false;
let frame = null;
let accumulator = 0;
let wasRunningBeforePortrait = false;
let prevPlayerPos = new THREE.Vector3();
let currPlayerPos = new THREE.Vector3();
let interpPos = new THREE.Vector3();
let assetCache = null;
let save = null;
let mission = null;
let dialogue = null;
let character = null;

function suspendHero() {
  const el = document.querySelector(HERO_SELECTOR);
  if (el) el.style.display = "none";
}

function restoreHero() {
  const el = document.querySelector(HERO_SELECTOR);
  if (el) el.style.display = "";
}

function disposeScene() {
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
  }
  if (renderer) renderer.dispose();
}

function mount() {
  container = document.createElement("div");
  container.className = "phase1-container is-active";
  document.body.appendChild(container);

  const canvas = document.createElement("canvas");
  canvas.className = "phase1-canvas";
  container.appendChild(canvas);

  renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: "low-power",
    stencil: false,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.shadowMap.enabled = false;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 2, 6);

  clock = new THREE.Clock();

  input = new InputManager();
  input.connect(canvas);

  player = new Player();
  player.scene = scene;
  scene.add(player.mesh);

  world = new World();
  scene.add(world.group);

  cameraCtrl = new CameraController(camera, player, canvas, input);
  cameraCtrl.connect();

  graphics = new GraphicsSettings(renderer);
  graphics.apply("low");

  // Phase 2A modules
  assetCache = new AssetCache();
  save = new SaveManager();
  save.load();
  mission = new Mission();
  dialogue = new Dialogue(container);
  character = new Character(assetCache);
  character.load("/models/character/character.glb").then((mesh) => {
    if (!running) return;
    if (mesh) {
      player.setVisual(mesh);
    }
  });

  mission.onStateChange = (state) => {
    switch (state) {
      case MISSION_STATES.IDLE:
        dialogue.hide();
        break;
      case MISSION_STATES.APPROACH:
        dialogue.showInteractPrompt();
        break;
      case MISSION_STATES.INTERACT:
        dialogue.hide();
        dialogue.show("shopkeeperGreeting", (decision) => {
          if (decision === "examine") mission.examineRefund();
        });
        break;
      case MISSION_STATES.EXAMINE:
        dialogue.hide();
        dialogue.show("examineRefund", () => mission.openDecision());
        break;
      case MISSION_STATES.DECIDE:
        dialogue.hide();
        dialogue.show("refundExplanation", (decision) => {
          const safe = mission.complete(decision === "safe");
          if (safe !== null) {
            save.setBadge(safe ? "First Signal" : null);
            save.setMissionProgress(safe ? "complete" : "idle");
          }
        });
        break;
      case MISSION_STATES.COMPLETE:
        dialogue.hide();
        dialogue.show(
          save.missionProgress === "complete" ? "safeFeedback" : "unsafeFeedback",
          () => {
            dialogue.hide();
            mission.reset();
          }
        );
        break;
    }
  };

  const hemi = new THREE.HemisphereLight(0xe5eaff, 0x333956, 1);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 10, 5);
  dir.castShadow = true;
  scene.add(dir);

  onResize = () => {
    const { width, height } = container.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  window.addEventListener("resize", onResize);
  onResize();

  ui = new UI(
    () => resume(),
    () => exit(),
    (level) => graphics.apply(level),
    () => togglePause()
  );

  const langSelect = document.querySelector("#language-select");
  if (langSelect) {
    ui.lang = ui._readLang();
    ui._applyLang();
  }

  suspendHero();
  running = true;
  accumulator = 0;
  wasRunningBeforePortrait = false;
  clock.getDelta();
  frame = requestAnimationFrame(loop);

  window.addEventListener("keydown", _onGlobalKeyDown);
  window.addEventListener("visibilitychange", _onVisibilityChange);
  window.addEventListener("pagehide", _onPageHide);
}

function _onGlobalKeyDown(event) {
  if (event.key !== "Escape") return;
  if (!container) return;
  if (!running) {
    resume();
  }
}

function _onVisibilityChange() {
  if (document.hidden) {
    pause();
  } else if (running) {
    clock.getDelta();
  }
}

function _onPageHide() {
  exit();
}

function simulate(dt) {
  prevPlayerPos.copy(currPlayerPos);
  player.update(dt, input.move, cameraCtrl.yaw);
  currPlayerPos.copy(player.position);
  cameraCtrl.update(dt, world.colliders);

  const isMoving = Math.abs(input.move.x) > 0.01 || Math.abs(input.move.y) > 0.01;
  character.update(dt, isMoving);

  if (input.takeInteract()) {
    if (mission.state === MISSION_STATES.IDLE) {
      mission.enterShop();
    } else if (mission.state === MISSION_STATES.APPROACH) {
      mission.startInteraction();
    }
  }
}

function render(alpha) {
  const t = Math.min(Math.max(alpha, 0), 1);
  interpPos.lerpVectors(prevPlayerPos, currPlayerPos, t);
  player.mesh.position.copy(interpPos);
  if (character.mesh) character.mesh.position.copy(interpPos);
  renderer.render(scene, camera);
}

function loop() {
  if (!running) {
    frame = null;
    return;
  }
  frame = requestAnimationFrame(loop);
  const dt = Math.min(Math.max(clock.getDelta(), 0), 0.1);
  accumulator += dt;
  let steps = 0;
  while (accumulator >= STEP && steps < MAX_SUBSTEPS) {
    simulate(STEP);
    accumulator -= STEP;
    steps += 1;
  }
  if (accumulator > STEP * MAX_SUBSTEPS) {
    accumulator = STEP * MAX_SUBSTEPS;
  }
  const alpha = Math.min(Math.max(accumulator / STEP, 0), 1);
  render(alpha);

  if (input.takePause()) {
    togglePause();
  }
}

function pause() {
  if (!running) return;
  running = false;
  if (frame) cancelAnimationFrame(frame);
  frame = null;
  if (ui) ui.showPause();
}

function resume() {
  if (!container) return;
  if (ui && ui.portraitActive) return;
  running = true;
  if (ui) ui.hidePause();
  if (ui && ui.portraitActive) ui.hidePortrait();
  clock.getDelta();
  frame = requestAnimationFrame(loop);
  input.requestPointerLock();
}

function togglePause() {
  if (!running) {
    resume();
    return;
  }
  pause();
}

function exit() {
  if (!container) return;
  running = false;
  if (frame) cancelAnimationFrame(frame);
  frame = null;
  unmount();
}

function setPortraitGate(active) {
  if (active) {
    if (!ui.portraitActive) {
      wasRunningBeforePortrait = running;
      if (running) {
        running = false;
        if (frame) cancelAnimationFrame(frame);
        frame = null;
      }
      ui.showPortrait();
    }
  } else {
    if (ui.portraitActive) {
      ui.hidePortrait();
      if (wasRunningBeforePortrait) {
        resume();
      }
    }
  }
}

function unmount() {
  // Phase 2A cleanup (character first: detaches from scene before scene traversal)
  if (character) character.dispose();
  if (dialogue) dialogue.destroy();
  if (save) save.save();
  if (assetCache) assetCache.disposeAll();

  window.removeEventListener("keydown", _onGlobalKeyDown);
  window.removeEventListener("visibilitychange", _onVisibilityChange);
  window.removeEventListener("pagehide", _onPageHide);
  if (onResize) window.removeEventListener("resize", onResize);
  if (input) input.disconnect();
  if (cameraCtrl) cameraCtrl.disconnect();
  if (ui) ui.destroy();
  restoreHero();
  disposeScene();
  if (container && container.parentNode) container.parentNode.removeChild(container);
  container = null;
  renderer = null;
  scene = null;
  camera = null;
  clock = null;
  input = null;
  cameraCtrl = null;
  player = null;
  world = null;
  graphics = null;
  ui = null;
  character = null;
  mission = null;
  dialogue = null;
  assetCache = null;
  save = null;
  onResize = null;
  running = false;
  frame = null;
  accumulator = 0;
}

export { mount, exit, setPortraitGate };
