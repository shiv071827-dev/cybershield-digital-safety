const STORAGE_KEY = "cybershield:playerName";
const SCHEMA_VERSION = 1;
const DEFAULT_NAME = "Shiva";

export class SaveManager {
  constructor() {
    this.name = DEFAULT_NAME;
    this.badge = null;
    this.missionProgress = "idle";
  }

  load() {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (!data || data.schema !== SCHEMA_VERSION) return;
      if (typeof data.name === "string" && data.name.length > 0) {
        this.name = data.name;
      }
      if (data.badge) this.badge = data.badge;
      if (data.missionProgress) this.missionProgress = data.missionProgress;
    } catch (error) {
      console.warn("Could not load saved player data.", error);
    }
  }

  save() {
    try {
      const payload = {
        schema: SCHEMA_VERSION,
        name: this.name,
        badge: this.badge,
        missionProgress: this.missionProgress,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Could not save player data.", error);
    }
  }

  setName(name) {
    this.name = name || DEFAULT_NAME;
    this.save();
  }

  setBadge(badge) {
    this.badge = badge;
    this.save();
  }

  setMissionProgress(progress) {
    this.missionProgress = progress;
    this.save();
  }
}
