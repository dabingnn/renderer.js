
/*
 * renderer.js v1.0.0
 * (c) 2017 @Johnny Wu
 * Released under the MIT License.
 */

(function (exports,vmath,memop) {
'use strict';

class Material {
  constructor() {
    this._shader = null;
    // this._properties ???
  }
}

class Light {
  constructor() {
    this._color = vmath.color3.create();
  }
}

class RenderObject {
  constructor() {
    this.tag = 'default';
    this.node = null;
    this.mesh = null;
    this.material = null;
  }
}

class Scene {
  constructor() {
    this._lights = new memop.FixedArray(16);
    this._objects = new memop.FixedArray(16);
  }

  addObject(obj) {
    let idx = this._objects.indexOf(obj);
    if (idx === -1) {
      this._objects.push(obj);
    }
  }

  removeObject(obj) {
    let idx = this._objects.indexOf(obj);
    if (idx !== -1) {
      this._objects.fastRemove(idx);
    }
  }
}

class ForwardRenderer {
  constructor(device) {
    this._device = device;
  }

  render(scene, camera) {
    // TODO: update frustum

    // TODO: draw opaques
    // TODO: sort by material

    // TODO: draw transparents
    // TODO: sort by material
  }
}

// export {default as DeferredRenderer} from './lib/deferred';

exports.Material = Material;
exports.Light = Light;
exports.RenderObject = RenderObject;
exports.Scene = Scene;
exports.ForwardRenderer = ForwardRenderer;

}((this.renderer = this.renderer || {}),vmath,memop));
//# sourceMappingURL=renderer.dev.js.map
