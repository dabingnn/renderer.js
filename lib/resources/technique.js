let _genID = 0;

export default class Technique {
  /**
   * @param {STAGE_*} stages
   * @param {Array} parameters
   * @param {Array} passes
   * @param {Number} layer
   */
  constructor(stages, parameters, passes, layer = 0) {
    this._id = _genID++;
    this._stages = stages;
    this._parameters = parameters; // {name, type, size, val}
    this._passes = passes;
    this._layer = layer;
    // TODO: this._version = 'webgl' or 'webgl2' // ????
  }

  get passes() {
    return this._passes;
  }

  get stages() {
    return this._stages;
  }
  set stages(stages) {
    this._stages = stages;
  }
}