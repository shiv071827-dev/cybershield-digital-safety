import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

export class AssetCache {
  constructor() {
    this.loader = new GLTFLoader();
    this.models = new Map();
    this.textures = new Map();
  }

  loadModel(url) {
    if (this.models.has(url)) {
      return Promise.resolve(this.models.get(url));
    }
    return this.loader.loadAsync(url).then((gltf) => {
      this.models.set(url, gltf);
      return gltf;
    });
  }

  loadTexture(url) {
    if (this.textures.has(url)) {
      return Promise.resolve(this.textures.get(url));
    }
    const loader = new THREE.TextureLoader();
    return loader.loadAsync(url).then((texture) => {
      this.textures.set(url, texture);
      return texture;
    });
  }

  disposeModel(url) {
    const gltf = this.models.get(url);
    if (!gltf) return;
    gltf.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material.dispose());
      }
    });
    this.models.delete(url);
  }

  disposeTexture(url) {
    const texture = this.textures.get(url);
    if (!texture) return;
    texture.dispose();
    this.textures.delete(url);
  }

  disposeAll() {
    for (const url of this.models.keys()) {
      this.disposeModel(url);
    }
    for (const url of this.textures.keys()) {
      this.disposeTexture(url);
    }
  }
}
