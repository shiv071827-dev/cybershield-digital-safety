import * as THREE from "three";

export const GRAPHICS_PRESETS = {
  low: {
    pixelRatio: 1,
    shadows: false,
  },
  medium: {
    pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
    shadows: true,
  },
};

export class GraphicsSettings {
  constructor(renderer) {
    this.renderer = renderer;
    this.level = "low";
  }

  apply(level) {
    this.level = level;
    const preset = GRAPHICS_PRESETS[level] || GRAPHICS_PRESETS.low;
    const renderer = this.renderer;
    renderer.setPixelRatio(preset.pixelRatio);
    renderer.shadowMap.enabled = preset.shadows;
    renderer.shadowMap.type = preset.shadows
      ? THREE.PCFSoftShadowMap
      : THREE.BasicShadowMap;
  }
}
