import * as THREE from "three";

export class World {
  constructor() {
    this.group = new THREE.Group();
    this.colliders = [];
    this._build();
  }

  _build() {
    const groundGeo = new THREE.PlaneGeometry(60, 60);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0x1e2a30 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.group.add(ground);

    const blockMat = new THREE.MeshStandardMaterial({ color: 0x4a6a72 });
    const positions = [
      [6, 0, 6], [-6, 0, -6], [6, 0, -6], [-6, 0, 6],
      [0, 0, 10], [0, 0, -10], [10, 0, 0], [-10, 0, 0],
    ];
    positions.forEach((p) => {
      const geo = new THREE.BoxGeometry(2, 2, 2);
      const mesh = new THREE.Mesh(geo, blockMat);
      mesh.position.set(p[0], 1, p[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      this.group.add(mesh);
      this.colliders.push(mesh);
    });
  }
}
