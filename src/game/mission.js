export const MISSION_STATES = {
  IDLE: "idle",
  APPROACH: "approach",
  INTERACT: "interact",
  EXAMINE: "examine",
  DECIDE: "decide",
  COMPLETE: "complete",
};

export class Mission {
  constructor() {
    this.state = MISSION_STATES.IDLE;
    this.onStateChange = null;
  }

  setState(state) {
    this.state = state;
    if (this.onStateChange) this.onStateChange(state);
  }

  enterShop() {
    if (this.state === MISSION_STATES.IDLE) {
      this.setState(MISSION_STATES.APPROACH);
    }
  }

  startInteraction() {
    if (this.state === MISSION_STATES.APPROACH) {
      this.setState(MISSION_STATES.INTERACT);
    }
  }

  examineRefund() {
    if (this.state === MISSION_STATES.INTERACT) {
      this.setState(MISSION_STATES.EXAMINE);
    }
  }

  openDecision() {
    if (this.state === MISSION_STATES.EXAMINE) {
      this.setState(MISSION_STATES.DECIDE);
    }
  }

  complete(safe) {
    if (this.state === MISSION_STATES.DECIDE) {
      this.setState(MISSION_STATES.COMPLETE);
      return safe;
    }
    return null;
  }

  reset() {
    this.setState(MISSION_STATES.IDLE);
  }
}
