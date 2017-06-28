let _genID = 0;

export default class Technique {
  /**
   * @param {STAGE_*} stages
   * @param {Array} props
   * @param {Array} passes
   */
  constructor(stages, props, passes) {
    this._id = _genID++;
    this._passes = passes;
    this._properties = props; // {name, type, size, val}
    this._stages = stages;
    // TODO: this._version = 'webgl' or 'webgl2' // ????
  }

  sortID () {
    if (!this._passes.length) {
      return -1;
    }

    return (
      (this._passes.length & 0xf) << 24 |
      (this._passes[0]._program.id & 0xfff) << 12 |
      (this._id & 0xffff)
    ) >>> 0;
  }
}