export default class {
  constructor() {
    this._node = null;
    this._meshes = [];
    this._materials = [];
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

  addMaterial(material) {
    if (this._materials.indexOf(material) !== -1) {
      return;
    }
    this._materials.push(material);
  }

  get meshCount() {
    return this._meshes.length;
  }

  getDrawItem(out, index) {
    if (index >= this._meshes.length ) {
      out.node = null;
      out.mesh = null;
      out.material = null;

      return;
    }

    out.node = this._node;
    out.mesh = this._meshes[index];
    if (index < this._materials.length) {
      out.material = this._materials[index];
    } else {
      out.material = this._materials[this._materials.length-1];
    }
  }
}