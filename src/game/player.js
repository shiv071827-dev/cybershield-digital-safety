import * as THREE from "three";

export class Player {
  constructor() {
    const geometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x00d2ff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.position = new THREE.Vector3(0, 1.2, 0);
    this.prevPosition = new THREE.Vector3(0, 1.2, 0);
    this.currPosition = new THREE.Vector3(0, 1.2, 0);
    this.mesh.position.copy(this.position);
    this.speed = 5;
    this.mesh.rotation.y = 0;

    this.scene = null;
    this.visualMesh = null;
  }

  setVisual(mesh) {
    this.visualMesh = mesh;
    if (this.scene) {
      this.scene.add(mesh);
    }
    this.mesh.visible = false;
  }

  update(dt, move, cameraYaw) {
    this.prevPosition.copy(this.currPosition);
    const rad = (cameraYaw * Math.PI) / 180;
    const forwardX = Math.sin(rad);
    const forwardZ = -Math.cos(rad);
    const rightX = Math.cos(rad);
    const rightZ = Math.sin(rad);
    const dx = forwardX * move.y + rightX * move.x;
    const dz = forwardZ * move.y + rightZ * move.x;
    this.currPosition.x += dx * this.speed * dt;
    this.currPosition.z += dz * this.speed * dt;
    this.currPosition.y = 1.2;
    this.position.copy(this.currPosition);
    this.mesh.position.copy(this.currPosition);
    if (Math.abs(move.x) > 0.01 || Math.abs(move.y) > 0.01) {
      this.mesh.rotation.y = -Math.atan2(dx, dz);
    }
    if (this.visualMesh) {
      this.visualMesh.rotation.y = this.mesh.rotation.y;
    }
  }
}
