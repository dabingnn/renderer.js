export default class Model {
  constructor() {
    this._node = null;
    this._meshes = [];
    this._effects = [];

    // TODO: we calculate aabb based on mesh vertices
    // this._aabb
  }

  setNode(node) {
    this._node = node;
  }

  addMesh(mesh) {
    if (this._meshes.indexOf(mesh) !== -1) {
      return;
    }
    this._meshes.push(mesh);
  }

  addEffect(effect) {
    if (this._effects.indexOf(effect) !== -1) {
      return;
    }
    this._effects.push(effect);
  }

  get meshCount() {
    return this._meshes.length;
  }

  getDrawItem(out, index) {
    if (index >= this._meshes.length ) {
      out.node = null;
      out.mesh = null;
      out.effect = null;

      return;
    }

    out.node = this._node;
    out.mesh = this._meshes[index];
    if (index < this._effects.length) {
      out.effect = this._effects[index];
    } else {
      out.effect = this._effects[this._effects.length-1];
    }
  }
}