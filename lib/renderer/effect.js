export default class Effect {
  /**
   * @param {Array} techniques
   */
  constructor(techniques, values = {}, opts = []) {
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
    for (let i = 0; i < this._options.length; ++i) {
      let opt = this._options[i];
      if ( opt.name === name ) {
        return opt.value;
      }
    }

    console.warn(`Failed to get option ${name}, option not found.`);
    return null;
  }

  setOption(name, value) {
    for (let i = 0; i < this._options.length; ++i) {
      let opt = this._options[i];
      if ( opt.name === name ) {
        opt.value = value;
        return;
      }
    }

    console.warn(`Failed to set option ${name}, option not found.`);
  }

  extractOptions(out = {}) {
    for (let i = 0; i < this._options.length; ++i) {
      let opt = this._options[i];
      out[opt.name] = opt.value;
    }

    return out;
  }
}