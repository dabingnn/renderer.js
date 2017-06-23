import { gfx } from 'gfx';

export default class Mesh {
  constructor() {
    this._vertexBuffer = null;
    this._indexBuffer = null;
    this._primitiveType = gfx.PT_TRIANGLES;

    // TODO: this._aabb;
  }
}