export default class Material {
  /**
   * @param {Array} techniques
   */
  constructor(techniques, params = {}) {
    this._techniques = techniques;
    this._params = params;

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

  getParameter(name) {
    return this._params[name];
  }

  setParameter(name, value) {
    // TODO: check if params is valid for current technique???

    this._params[name] = value;
  }
}