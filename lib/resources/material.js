export default class Material {
  /**
   * @param {Array} techniques
   */
  constructor(techniques, values = {}, opts = {}) {
    this._techniques = techniques;
    this._values = values;
    this._options = opts;

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

  getOption(name) {
    return this._options[name];
  }

  setOption(name, value) {
    this._options[name] = value;
  }
}