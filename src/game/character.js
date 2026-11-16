import * as THREE from "three";

export class Character {
  constructor(assetCache) {
    this.assetCache = assetCache;
    this.mesh = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    this.modelUrl = null;
    this.loaded = false;

    this._fallbackMesh = null;
    this._fallbackTime = 0;
    this._lastMoving = null;
  }

  load(url) {
    if (url) {
      this.modelUrl = url;
      return this.assetCache
        .loadModel(url)
        .then((gltf) => {
          // Validate skeleton: require at least one SkinnedMesh
          let skinnedMesh = null;
          gltf.scene.traverse((object) => {
            if (object.isSkinnedMesh && !skinnedMesh) {
              skinnedMesh = object;
            }
          });

          if (!skinnedMesh) {
            throw new Error("No skinned mesh found in character GLB");
          }

          // Validate animation clips: require idle and walk
          const clips = gltf.animations;
          console.log("Character animation clips:", clips.map((c) => `${c.name} (${c.duration.toFixed(3)}s)`));
          const idleClip = clips.find((c) => /idle/i.test(c.name));
          const walkClip = clips.find((c) => /walk/i.test(c.name));
          console.log("Selected idle clip:", idleClip ? idleClip.name : null);
          console.log("Selected walk clip:", walkClip ? walkClip.name : null);
          if (walkClip) {
            console.log("Walk clip tracks:", walkClip.tracks.map((t) => t.name));
          }

          if (!idleClip || !walkClip) {
            throw new Error(
              "Missing idle or walk animation clip in character GLB"
            );
          }

          this.mesh = gltf.scene;
          let skinnedMeshCount = 0;
          this.mesh.traverse((object) => {
            if (object.isSkinnedMesh) {
              skinnedMeshCount++;
              console.log(
                "SkinnedMesh:",
                object.name,
                "bones:",
                object.skeleton ? object.skeleton.bones.length : 0
              );
            }
          });
          console.log("Total SkinnedMesh objects:", skinnedMeshCount);
          this.mesh.traverse((object) => {
            if (object.isSkinnedMesh) {
              object.castShadow = true;
              object.receiveShadow = true;
            }
          });

          // Correct scale: normalize to adult height ~1.7 units
          const box = new THREE.Box3().setFromObject(this.mesh);
          const height = box.getSize(new THREE.Vector3()).y;
          if (height > 0) {
            const scale = 1.7 / height;
            this.mesh.scale.set(scale, scale, scale);
          }

          // Ground alignment: center model bounding box at player height (y = 1.2)
          const box2 = new THREE.Box3().setFromObject(this.mesh);
          const centerY = (box2.min.y + box2.max.y) / 2;
          this.mesh.position.y = 1.2 - centerY;

          this.mixer = new THREE.AnimationMixer(this.mesh);

          if (idleClip) {
            this.actions.idle = this.mixer.clipAction(idleClip);
          }
          if (walkClip) {
            this.actions.walk = this.mixer.clipAction(walkClip);
            this.actions.walk.play();
            this.actions.walk.weight = 0;
            console.log("Walk action initial state:", {
              isRunning: this.actions.walk.isRunning(),
              enabled: this.actions.walk.enabled,
              paused: this.actions.walk.paused,
              time: this.actions.walk.time,
              weight: this.actions.walk.weight,
              effectiveWeight: this.actions.walk.getEffectiveWeight(),
            });
          }

          if (this.actions.idle) {
            this.actions.idle.play();
            this.currentAction = this.actions.idle;
          }

          this.loaded = true;
          return this.mesh;
        })
        .catch((error) => {
          console.warn(
            "Character GLTF load or validation failed; using capsule fallback.",
            error
          );
          this._buildFallback();
        });
    } else {
      this._buildFallback();
      return Promise.resolve(this.mesh);
    }
  }

  _buildFallback() {
    const geometry = new THREE.CapsuleGeometry(0.3, 1.2, 4, 8);
    const material = new THREE.MeshStandardMaterial({ color: 0x00d2ff });
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.castShadow = true;
    this.mesh.position.set(0, 1.2, 0);
    this._fallbackMesh = this.mesh;
    this._fallbackTime = 0;
    this.loaded = true;
  }

  setPosition(x, y, z) {
    if (!this.mesh) return;
    if (typeof x === "object" && x !== null && "x" in x) {
      this.mesh.position.copy(x);
    } else {
      this.mesh.position.set(x, y, z);
    }
  }

  update(dt, isMoving) {
    if (!this.mesh) return;

    if (this.mixer) {
      this.mixer.update(dt);

      if (isMoving !== this._lastMoving && this.actions.walk) {
        console.log("Walk action state (movement changed):", {
          isMoving,
          isRunning: this.actions.walk.isRunning(),
          enabled: this.actions.walk.enabled,
          paused: this.actions.walk.paused,
          time: this.actions.walk.time,
          weight: this.actions.walk.weight,
          effectiveWeight: this.actions.walk.getEffectiveWeight(),
        });
        this._lastMoving = isMoving;
      }

      const targetAction = isMoving ? this.actions.walk : this.actions.idle;
      if (targetAction && targetAction !== this.currentAction) {
        if (this.currentAction) {
          this.currentAction.crossFadeTo(targetAction, 0.25);
        } else {
          targetAction.play();
        }
        this.currentAction = targetAction;
      }
    } else if (this._fallbackMesh) {
      this._fallbackTime += dt;
      this._fallbackMesh.position.y = 1.2 + Math.sin(this._fallbackTime * 4) * 0.03;
      if (isMoving) {
        this._fallbackMesh.rotation.x = Math.sin(this._fallbackTime * 8) * 0.1;
        this._fallbackMesh.rotation.z = Math.cos(this._fallbackTime * 8) * 0.05;
      } else {
        this._fallbackMesh.rotation.x = 0;
        this._fallbackMesh.rotation.z = 0;
      }
    }
  }

  dispose() {
    const isGltf = this.mixer !== null;

    if (this.mixer) {
      this.mixer.stopAllAction();
      this.mixer = null;
    }
    this.actions = {};
    this.currentAction = null;

    if (this.mesh) {
      this.mesh.removeFromParent();
      // Only dispose independently owned fallback resources.
      // GLTF geometries/materials are owned by AssetCache and must not be
      // disposed here to avoid double disposal.
      if (!isGltf && this._fallbackMesh) {
        this._fallbackMesh.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            const materials = Array.isArray(object.material)
              ? object.material
              : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
      }
      this.mesh = null;
    }

    this.modelUrl = null;
    this.loaded = false;
    this._fallbackMesh = null;
    this._fallbackTime = 0;
  }
}
