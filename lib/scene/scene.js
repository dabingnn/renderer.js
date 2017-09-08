import { FixedArray } from 'memop';

export default class Scene {
  constructor() {
    this._lights = new FixedArray(16);
    this._models = new FixedArray(16);
    this._cameras = new FixedArray(16);
  }

  _add(pool, item) {
    if (item._poolID !== -1) {
      return;
    }

    pool.push(item);
    item._poolID = pool.length - 1;
  }

  _remove(pool, item) {
    if (item._poolID === -1) {
      return;
    }

    pool.data[pool.length-1]._poolID = item._poolID;
    pool.fastRemove(item._poolID);
    item._poolID = -1;
  }

  addCamera(camera) {
    this._add(this._cameras, camera);
  }

  removeCamera(camera) {
    this._remove(this._cameras, camera);
  }

  addModel(model) {
    this._add(this._models, model);
  }

  removeModel(model) {
    this._remove(this._models, model);
  }

  addLight(light) {
    this._add(this._lights, light);
  }

  removeLight(light) {
    this._remove(this._lights, light);
  }
}