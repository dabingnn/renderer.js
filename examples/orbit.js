'use strict';

(() => {
  const { vec3, mat3, quat } = window.vmath;

  let damping = 10.0;
  let moveSpeed = 10.0;

  const v3_f = vec3.new(0, 0, -1);
  const v3_r = vec3.new(1, 0, 0);
  const v3_u = vec3.new(0, 1, 0);

  let rot3x3 = mat3.create();

  let front = vec3.create();
  let right = vec3.create();
  let up = vec3.create();
  let front2 = vec3.create();
  let right2 = vec3.create();

  class Orbit {
    constructor(node, input) {
      this._node = node;
      this._input = input;

      this._df = 0;
      this._dr = 0;
      this._panX = 0;
      this._panY = 0;
      this._panZ = 0;
      this._rotX = 0;
      this._rotY = 0;

      this._curRot = quat.create();
      this._destRot = quat.create();

      this._curEye = vec3.create();
      this._destEye = vec3.create();

      this._node.getWorldRot(this._curRot);
      this._destRot = quat.clone(this._curRot);

      this._node.getWorldPos(this._curEye);
      this._destEye = vec3.clone(this._curEye);
    }

    tick(dt) {
      this._handleInput();
      this._lerp(dt);
    }

    _handleInput() {
      let input = this._input;
      this._df = 0;
      this._dr = 0;
      this._panX = 0;
      this._panY = 0;
      this._panZ = 0;
      this._rotX = 0;
      this._rotY = 0;

      if (input.mousepress('left') && input.mousepress('right')) {
        let dx = input.mouseDeltaX;
        let dy = input.mouseDeltaY;

        this._panX = dx;
        this._panY = -dy;

      } else if (input.mousepress('left')) {
        let dx = input.mouseDeltaX;
        let dy = input.mouseDeltaY;

        this._rotY = -dx * 0.002;
        this._panZ = -dy;

      } else if (input.mousepress('right')) {
        let dx = input.mouseDeltaX;
        let dy = input.mouseDeltaY;

        this._rotY = -dx * 0.002;
        this._rotX = -dy * 0.002;
      }

      if (input.keypress('w')) {
        this._df += 1;
      }
      if (input.keypress('s')) {
        this._df -= 1;
      }
      if (input.keypress('a')) {
        this._dr -= 1;
      }
      if (input.keypress('d')) {
        this._dr += 1;
      }

      if (input.mouseScrollY) {
        this._df -= input.mouseScrollY * 0.05;
      }
    }

    _lerp(dt) {
      const panX = this._panX;
      const panY = this._panY;
      const panZ = this._panZ;
      let eye = this._destEye;
      let rot = this._destRot;

      // calculate curRot
      quat.rotateX(rot, rot, this._rotX);
      quat.rotateAround(rot, rot, v3_u, this._rotY);
      quat.slerp(this._curRot, this._curRot, rot, dt * damping);

      // calculate curEye
      mat3.fromQuat(rot3x3, this._curRot);

      vec3.transformMat3(front, v3_f, rot3x3);
      vec3.transformMat3(up, v3_u, rot3x3);
      vec3.transformMat3(right, v3_r, rot3x3);

      //
      if (this._df !== 0) {
        vec3.scaleAndAdd(eye, eye, front, this._df * dt * moveSpeed);
      }

      if (this._dr !== 0) {
        vec3.scaleAndAdd(eye, eye, right, this._dr * dt * moveSpeed);
      }

      if (panZ !== 0) {
        vec3.copy(front2, front);
        front2.y = 0.0;
        vec3.normalize(front2, front2);
        vec3.scaleAndAdd(eye, eye, front2, panZ * dt * moveSpeed);
      }

      if (panX !== 0) {
        vec3.copy(right2, right);
        right2.y = 0.0;
        vec3.normalize(right2, right2);
        vec3.scaleAndAdd(eye, eye, right2, panX * dt * moveSpeed);
      }

      if (panY !== 0) {
        vec3.scaleAndAdd(eye, eye, v3_u, panY * dt * moveSpeed);
      }

      vec3.lerp(this._curEye, this._curEye, eye, dt * damping);

      //
      this._node.setWorldPos(this._curEye);
      this._node.setWorldRot(this._curRot);
    }
  }
  window.Orbit = Orbit;
})();