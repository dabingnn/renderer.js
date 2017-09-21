import { color4, mat4 } from 'vmath';
import enums from '../enums';

export default class Camera {
  constructor() {
    this._poolID = -1;
    this._node = null;

    //
    this._projection = enums.PROJ_PERSPECTIVE;

    // clear options
    this._color = color4.new(0.2, 0.3, 0.47, 1);
    this._depth = 1;
    this._stencil = 1;
    this._clearFlags = enums.CLEAR_COLOR | enums.CLEAR_DEPTH;

    // projection properties
    this._near = 0.01;
    this._far = 1000.0;
    this._fov = Math.PI/4.0; // vertical fov
    // this._aspect = 16.0/9.0; // DISABLE: use _rect.w/_rect.h
    this._rect = {
      x: 0, y: 0, w: 1, h: 1
    };

    // ortho properties
    this._orthoHeight = 10;
  }

  setColor(r, g, b, a) {
    color4.set(this._color, r, g, b, a);
  }

  setDepth(depth) {
    this._depth = depth;
  }

  setStencil(stencil) {
    this._stencil = stencil;
  }

  setClearFlags(flags) {
    this._clearFlags = flags;
  }

  setNode(node) {
    this._node = node;
  }

  /**
   * @param {Number} x - [0,1]
   * @param {Number} y - [0,1]
   * @param {Number} w - [0,1]
   * @param {Number} h - [0,1]
   */
  setRect(x, y, w, h) {
    this._rect.x = x;
    this._rect.y = y;
    this._rect.w = w;
    this._rect.h = h;
  }

  extractView(out, width, height) {
    // rect
    out._rect.x = this._rect.x;
    out._rect.y = this._rect.y;
    out._rect.w = this._rect.w * width;
    out._rect.h = this._rect.h * height;

    // clear opts
    out._color = this._color;
    out._depth = this._depth;
    out._stencil = this._stencil;
    out._clearFlags = this._clearFlags;

    // view matrix
    this._node.getWorldRT(out._matView);
    mat4.invert(out._matView, out._matView);

    // projection matrix
    // TODO: if this._projDirty
    let aspect = width / height;
    if (this._projection === enums.PROJ_PERSPECTIVE) {
      mat4.perspective(out._matProj,
        this._fov,
        aspect,
        this._near,
        this._far
      );
    } else {
      let x = this._orthoHeight * aspect;
      let y = this._orthoHeight;
      mat4.ortho(out._matProj,
        -x, x, -y, y, this._near, this._far
      );
    }

    // view-projection
    mat4.mul(out._matViewProj, out._matProj, out._matView);
    mat4.invert(out._matInvViewProj, out._matViewProj);
  }
}