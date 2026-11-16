export class InputManager {
  constructor() {
    this.move = { x: 0, y: 0 };
    this.look = { x: 0, y: 0 };
    this.pausePressed = false;
    this.interactPressed = false;
    this._keys = {};
    this._canvas = null;
    this._pointerLocked = false;
    this._dragActive = false;
    this._dragStart = { x: 0, y: 0 };
    this._touchJoystick = { active: false, start: { x: 0, y: 0 }, pos: { x: 0, y: 0 } };
    this._touchLook = { active: false, start: { x: 0, y: 0 } };

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);
    this._onPointerLockError = this._onPointerLockError.bind(this);
    this._onPointerDown = this._onPointerDown.bind(this);
    this._onPointerMove = this._onPointerMove.bind(this);
    this._onPointerUp = this._onPointerUp.bind(this);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onTouchMove = this._onTouchMove.bind(this);
    this._onTouchEnd = this._onTouchEnd.bind(this);
  }

  connect(canvas) {
    this._canvas = canvas;
    window.addEventListener("keydown", this._onKeyDown, { passive: false });
    window.addEventListener("keyup", this._onKeyUp, { passive: false });
    document.addEventListener("pointerlockchange", this._onPointerLockChange);
    document.addEventListener("pointerlockerror", this._onPointerLockError);
    canvas.addEventListener("pointerdown", this._onPointerDown, { passive: false });
    canvas.addEventListener("pointermove", this._onPointerMove, { passive: false });
    canvas.addEventListener("pointerup", this._onPointerUp, { passive: false });
    canvas.addEventListener("pointercancel", this._onPointerUp, { passive: false });
    canvas.addEventListener("touchstart", this._onTouchStart, { passive: false });
    canvas.addEventListener("touchmove", this._onTouchMove, { passive: false });
    canvas.addEventListener("touchend", this._onTouchEnd, { passive: false });
    canvas.addEventListener("touchcancel", this._onTouchEnd, { passive: false });
  }

  disconnect() {
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    document.removeEventListener("pointerlockchange", this._onPointerLockChange);
    document.removeEventListener("pointerlockerror", this._onPointerLockError);
    if (this._canvas) {
      this._canvas.removeEventListener("pointerdown", this._onPointerDown);
      this._canvas.removeEventListener("pointermove", this._onPointerMove);
      this._canvas.removeEventListener("pointerup", this._onPointerUp);
      this._canvas.removeEventListener("pointercancel", this._onPointerUp);
      this._canvas.removeEventListener("touchstart", this._onTouchStart);
      this._canvas.removeEventListener("touchmove", this._onTouchMove);
      this._canvas.removeEventListener("touchend", this._onTouchEnd);
      this._canvas.removeEventListener("touchcancel", this._onTouchEnd);
    }
    if (document.pointerLockElement === this._canvas) {
      document.exitPointerLock();
    }
  }

  requestPointerLock() {
    if (!this._canvas) return;
    this._canvas.requestPointerLock();
  }

  _onKeyDown(event) {
    const key = event.key.toLowerCase();
    if (this._keys[key]) return;
    this._keys[key] = true;
    this._updateMoveFromKeys();
    if (key === "escape") {
      this.pausePressed = true;
    }
    if (key === "e" || key === "enter") {
      this.interactPressed = true;
    }
  }

  _onKeyUp(event) {
    const key = event.key.toLowerCase();
    this._keys[key] = false;
    this._updateMoveFromKeys();
  }

  _updateMoveFromKeys() {
    let x = 0;
    let y = 0;
    if (this._keys["w"] || this._keys["arrowup"]) y = 1;
    if (this._keys["s"] || this._keys["arrowdown"]) y = -1;
    if (this._keys["a"] || this._keys["arrowleft"]) x = -1;
    if (this._keys["d"] || this._keys["arrowright"]) x = 1;
    const len = Math.sqrt(x * x + y * y);
    if (len > 0) {
      this.move.x = x / len;
      this.move.y = y / len;
    } else {
      this.move.x = 0;
      this.move.y = 0;
    }
  }

  _onPointerLockChange() {
    this._pointerLocked = document.pointerLockElement === this._canvas;
  }

  _onPointerLockError() {
    this._pointerLocked = false;
  }

  _onPointerDown(event) {
    if (event.target.closest("button, input, select, textarea, details, summary")) return;
    if (this._pointerLocked) return;
    this._dragActive = true;
    this._dragStart.x = event.clientX;
    this._dragStart.y = event.clientY;
    event.preventDefault();
  }

  _onPointerMove(event) {
    if (this._pointerLocked) {
      this.look.x += event.movementX;
      this.look.y += event.movementY;
      return;
    }
    if (!this._dragActive) return;
    const dx = event.clientX - this._dragStart.x;
    const dy = event.clientY - this._dragStart.y;
    this.look.x += dx * 0.5;
    this.look.y += dy * 0.5;
    this._dragStart.x = event.clientX;
    this._dragStart.y = event.clientY;
    event.preventDefault();
  }

  _onPointerUp() {
    this._dragActive = false;
  }

  _onTouchStart(event) {
    for (const touch of event.changedTouches) {
      const side = touch.clientX < window.innerWidth / 2 ? "left" : "right";
      if (side === "left") {
        this._touchJoystick.active = true;
        this._touchJoystick.start.x = touch.clientX;
        this._touchJoystick.start.y = touch.clientY;
        this._touchJoystick.pos.x = touch.clientX;
        this._touchJoystick.pos.y = touch.clientY;
      } else {
        this._touchLook.active = true;
        this._touchLook.start.x = touch.clientX;
        this._touchLook.start.y = touch.clientY;
      }
    }
    event.preventDefault();
  }

  _onTouchMove(event) {
    for (const touch of event.changedTouches) {
      const side = touch.clientX < window.innerWidth / 2 ? "left" : "right";
      if (side === "left" && this._touchJoystick.active) {
        this._touchJoystick.pos.x = touch.clientX;
        this._touchJoystick.pos.y = touch.clientY;
        const dx = (touch.clientX - this._touchJoystick.start.x) / 60;
        const dy = (touch.clientY - this._touchJoystick.start.y) / 60;
        const len = Math.sqrt(dx * dx + dy * dy);
        const capped = Math.min(len, 1);
        const angle = Math.atan2(dy, dx);
        this.move.x = Math.cos(angle) * capped;
        this.move.y = Math.sin(angle) * capped;
      } else if (side === "right" && this._touchLook.active) {
        const dx = (touch.clientX - this._touchLook.start.x) * 0.4;
        const dy = (touch.clientY - this._touchLook.start.y) * 0.4;
        this.look.x += dx;
        this.look.y += dy;
        this._touchLook.start.x = touch.clientX;
        this._touchLook.start.y = touch.clientY;
      }
    }
    event.preventDefault();
  }

  _onTouchEnd(event) {
    for (const touch of event.changedTouches) {
      const side = touch.clientX < window.innerWidth / 2 ? "left" : "right";
      if (side === "left") {
        this._touchJoystick.active = false;
        this.move.x = 0;
        this.move.y = 0;
      } else {
        this._touchLook.active = false;
      }
    }
    event.preventDefault();
  }

  takeLook() {
    const look = { x: this.look.x, y: this.look.y };
    this.look.x = 0;
    this.look.y = 0;
    return look;
  }

  takePause() {
    const pressed = this.pausePressed;
    this.pausePressed = false;
    return pressed;
  }

  takeInteract() {
    const pressed = this.interactPressed;
    this.interactPressed = false;
    return pressed;
  }
}
