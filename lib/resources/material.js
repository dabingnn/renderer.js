export default class Material {
  constructor(params, techniques) {
    this._techniques = techniques;
    this._params = params;
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
}