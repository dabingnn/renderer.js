import { color3 } from 'vmath';

export default class Light {
  constructor() {
    this._node = null;
    this._color = color3.create();
  }

  setNode(node) {
    this._node = node;
  }
}