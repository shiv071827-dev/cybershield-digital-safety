import * as THREE from "three";

export class CameraController {
  constructor(camera, player, canvas, input) {
    this.camera = camera;
    this.player = player;
    this.canvas = canvas;
    this.input = input;
    this.yaw = 0;
    this.pitch = -15;
    this.targetYaw = 0;
    this.targetPitch = -15;
    this.distance = 6;
    this.targetDistance = 6;
    this.heightOffset = 1.6;
    this.sensitivity = 0.002;
    this.dragSensitivity = 0.004;
    this.lookRate = 7;
    this.minPitch = -80;
    this.maxPitch = 45;
    this.minDistance = 3;
    this.maxDistance = 10;
    this._pointerLocked = false;
    this._raycaster = new THREE.Raycaster();
    this._dir = new THREE.Vector3();
    this._targetPos = new THREE.Vector3();
  }

  connect() {
    this.canvas.addEventListener("mousedown", this._onMouseDown, { passive: false });
  }

  disconnect() {
    if (this.canvas) {
      this.canvas.removeEventListener("mousedown", this._onMouseDown);
    }
  }

  setPointerLocked(locked) {
    this._pointerLocked = locked;
  }

  _onMouseDown() {
    // drag fallback is driven by InputManager; this is a no-op hook.
  }

  update(dt, colliders) {
    const look = this.input.takeLook();
    const sensitivity = this._pointerLocked ? this.sensitivity : this.dragSensitivity;
    this.targetYaw -= look.x * sensitivity;
    this.targetPitch -= look.y * sensitivity;
    this.targetPitch = Math.max(this.minPitch, Math.min(this.maxPitch, this.targetPitch));

    const lerp = 1 - Math.exp(-this.lookRate * dt);
    this.yaw += (this.targetYaw - this.yaw) * lerp;
    this.pitch += (this.targetPitch - this.pitch) * lerp;
    this.distance += (this.targetDistance - this.distance) * lerp;

    const playerPos = this.player.position;
    const radYaw = (this.yaw * Math.PI) / 180;
    const radPitch = (this.pitch * Math.PI) / 180;
    const cp = Math.cos(radPitch);
    const x = playerPos.x - cp * Math.sin(radYaw) * this.distance;
    const z = playerPos.z + cp * Math.cos(radYaw) * this.distance;
    const y = playerPos.y + this.heightOffset + Math.sin(radPitch) * this.distance;

    this._targetPos.set(x, y, z);
    this._dir.subVectors(this._targetPos, playerPos).normalize();
    this._raycaster.set(playerPos, this._dir, 0, this.distance);
    const hits = this._raycaster.intersectObjects(colliders);
    let pushDistance = this.distance;
    if (hits.length > 0 && hits[0].distance < this.distance) {
      pushDistance = Math.max(hits[0].distance - 0.25, this.minDistance);
    }
    const px = playerPos.x - cp * Math.sin(radYaw) * pushDistance;
    const pz = playerPos.z + cp * Math.cos(radYaw) * pushDistance;
    const py = playerPos.y + this.heightOffset + Math.sin(radPitch) * pushDistance;
    this.camera.position.set(px, py, pz);
    this.camera.lookAt(playerPos.x, playerPos.y + this.heightOffset * 0.4, playerPos.z);
  }
}
