export default class Material {
  /**
   * @param {Array} techniques
   */
  constructor(techniques, values = {}) {
    this._techniques = techniques;
    this._values = values;

    // TODO: check if params is valid for current technique???
  }

  getTechnique(stage) {
    for (let i = 0; i < this._techniques.length; ++i) {
      let tech = this._techniques[i];
      if (tech._stages & stage) {
        return tech;
      }
    }

    return null;
  }

  getValue(name) {
    return this._values[name];
  }

  setValue(name, value) {
    // TODO: check if params is valid for current technique???

    this._values[name] = value;
  }
}