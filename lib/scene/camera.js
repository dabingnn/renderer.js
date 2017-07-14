import { color4, mat4 } from 'vmath';
import { enums } from '../enums';

export default class Camera {
  constructor() {
    this._node = null;
    this._projection = enums.PROJ_PERSPECTIVE;

    // projection properties
    this._near = 0.01;
    this._far = 1000.0;
    this._fov = Math.PI/4.0; // vertical fov
    // this._aspect = 16.0/9.0; // DISABLE: use _rect.w/_rect.h

    // ortho properties
    this._orthoHeight = 10;

    // view properties
    this._rect = {
      x: 0, y: 0, w: 1, h: 1
    };
    this._scissor = {
      x: 0, y: 0, w: 1, h: 1
    };

    // clear options
    this._color = color4.create();
    // TODO: this._clearFlags

    // matrix
    this._view = mat4.create();
    this._proj = mat4.create();
    this._viewProj = mat4.create();
    this._invViewProj = mat4.create();
  }

  setNode(node) {
    this._node = node;
  }

  updateMatrix() {
    // view matrix
    this._node.getWorldMatrix(this._view);
    mat4.invert(this._view, this._view);

    // projection matrix
    // TODO: if this._projDirty
    let aspect = this._rect.w / this._rect.h;
    if (this._projection === enums.PROJ_PERSPECTIVE) {
      mat4.perspective(this._proj,
        this._fov,
        aspect,
        this._near,
        this._far
      );
    } else {
      let x = this._orthoHeight * aspect;
      let y = this._orthoHeight;
      mat4.ortho(this._proj,
        -x, x, -y, y, this._near, this._far
      );
    }

    // view-projection
    mat4.mul(this._viewProj, this._proj, this._view);
    mat4.invert(this._invViewProj, this._viewProj);
  }
}