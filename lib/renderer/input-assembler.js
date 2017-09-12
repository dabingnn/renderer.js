import gfx from 'gfx.js';

export default class InputAssembler {
  constructor(vb, ib, pt = gfx.PT_TRIANGLES) {
    this._vertexBuffer = vb;
    this._indexBuffer = ib;
    this._primitiveType = pt;

    // TODO: instancing data
    // this._stream = 0;
  }
}