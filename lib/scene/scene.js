import { FixedArray } from 'memop';

export default class Scene {
  constructor() {
    this._lights = new FixedArray(16);
    this._models = new FixedArray(16);
  }

  addModel(model) {
    if (model._poolID !== -1) {
      return;
    }

    this._models.push(model);
    model._poolID = this._models.length - 1;
  }

  removeModel(model) {
    if (model._poolID === -1) {
      return;
    }

    this._models.data[this._models.length-1]._poolID = model._poolID;
    this._models.fastRemove(model._poolID);
    model._poolID = -1;
  }

  addLight(light) {
    if (light._poolID !== -1) {
      return;
    }

    this._lights.push(light);
    light._poolID = this._lights.length - 1;
  }

  removeLight(light) {
    if (light._poolID === -1) {
      return;
    }

    this._lights.data[this._lights.length-1]._poolID = light._poolID;
    this._lights.fastRemove(light._poolID);
    light._poolID = -1;
  }
}