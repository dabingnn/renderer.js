import gfx from 'gfx.js';

// TODO: should we change the name from Mesh to InputAssembler???
export default class Mesh {
  constructor(vb, ib, pt = gfx.PT_TRIANGLES) {
    this._vertexBuffer = vb;
    this._indexBuffer = ib;
    this._primitiveType = pt;

    // TODO
    // stream
    // instancing
  }
}