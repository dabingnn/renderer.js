import { FixedArray } from 'memop';

export default class Scene {
  constructor() {
    this._lights = new FixedArray(16);
    this._models = new FixedArray(16);
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

}