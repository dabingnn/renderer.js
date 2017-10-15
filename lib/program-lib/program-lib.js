import gfx from 'gfx.js';
import mustache from './mustache';
import builtinChunks from './chunks/index.js';
import builtinTemplates from './templates/index.js';

let _shdID = 0;

export default class ProgramLib {
  /**
   * @param {gfx.Device} device
   * @param {Array} templates
   * @param {Object} chunks
   */
  constructor(device, templates = [], chunks = {}) {
    this._device = device;
    this._precision = `precision highp float;\n`;

    // register templates
    this._templates = {};
    for (let i = 0; i < builtinTemplates.length; ++i) {
      let tmpl = builtinTemplates[i];
      this.define(tmpl.name, tmpl.vert, tmpl.frag, tmpl.options);
    }
    for (let i = 0; i < templates.length; ++i) {
      let tmpl = templates[i];
      this.define(tmpl.name, tmpl.vert, tmpl.frag, tmpl.options);
    }

    // register chunks
    this._chunks = {};
    Object.assign(this._chunks, builtinChunks);
    Object.assign(this._chunks, chunks);

    this._cache = {};
  }

  /**
   * @param {string} name
   * @param {string} template
   * @param {Array} options
   *
   * @example:
   *   programLib.define('foobar', vertTmpl, fragTmpl, [
   *     { name: 'shadow' },
   *     { name: 'lightCount', min: 1, max: 4 }
   *   ]);
   */
  define(name, vert, frag, options) {
    if (this._templates[name]) {
      console.warn(`Failed to define shader ${name}: already exists.`);
      return;
    }

    let id = ++_shdID;

    // calculate option mask offset
    let offset = 0;
    for (let i = 0; i < options.length; ++i) {
      let op = options[i];
      op._offset = offset;

      let cnt = 1;

      if (op.min !== undefined && op.max !== undefined) {
        cnt = Math.ceil((op.max - op.min) * 0.5);

        op._map = function (value) {
          return (value - this._min) << op._offset;
        }.bind(op);
      } else {
        op._map = function (value) {
          if (value) {
            return 1 << op._offset;
          }
          return 0;
        }.bind(op);
      }

      offset += cnt;

      op._offset = offset;
    }

    vert = this._precision + vert;
    frag = this._precision + frag;

    // pre-parse the vs and fs template to speed up `mustache.render()` method
    mustache.parse(vert);
    mustache.parse(frag);

    // store it
    this._templates[name] = {
      id,
      name,
      vert,
      frag,
      options
    };
  }

  /**
   * @param {string} name
   * @param {Object} options
   */
  getKey(name, options) {
    let tmpl = this._templates[name];
    let key = 0;
    for (let i = 0; i < tmpl.options.length; ++i) {
      let tmplOpts = tmpl.options[i];
      let value = options[tmplOpts.name];
      if (value === undefined) {
        continue;
      }

      key |= tmplOpts._map(value);
    }

    return key << 8 | tmpl.id;
  }

  /**
   * @param {string} name
   * @param {Object} options
   */
  getProgram(name, options) {
    let key = this.getKey(name, options);
    let program = this._cache[key];
    if (program) {
      return program;
    }

    // get template
    let tmpl = this._templates[name];
    let vert = mustache.render(tmpl.vert, options, this._chunks);
    let frag = mustache.render(tmpl.frag, options, this._chunks);

    program = new gfx.Program(this._device, {
      vert,
      frag
    });
    program.link();
    this._cache[key] = program;

    return program;
  }
}