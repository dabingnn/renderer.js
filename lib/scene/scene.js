import { FixedArray } from 'memop';
import { color3 } from 'vmath';

export default class Scene {
  constructor() {
    this._lights = new FixedArray(16);
    this._models = new FixedArray(16);
    this._sceneAmbient = color3.new(0, 0, 0);
  }

  addModel(model) {
    let idx = this._models.indexOf(model);
    if (idx === -1) {
      this._models.push(model);
    }
  }

  removeModel(model) {
    let idx = this._models.indexOf(model);
    if (idx !== -1) {
      this._models.fastRemove(idx);
    }
  }

  addLight(light) {
    let idx = this._lights.indexOf(light);
    if(idx === -1) {
      this._lights.push(light);
    }
  }

  removeLight(light) {
    let idx = this._lights.indexOf(light);
    if (idx !== -1) {
      this._lights.fastRemove(idx);
    }
  }

  set sceneAmbient(val) {
    color3.copy(this._sceneAmbient, val);
  }
}