'use strict';

const buble = require('rollup-plugin-buble');
const fsJetpack = require('fs-jetpack');
const pjson = require('../package.json');

let banner = `
/*
 * ${pjson.name} v${pjson.version}
 * (c) ${new Date().getFullYear()} @Johnny Wu
 * Released under the MIT License.
 */
`;

let dest = './dist';
let file = 'renderer';
let moduleName = 'renderer';

// clear directory
fsJetpack.dir(dest, { empty: true });

module.exports = {
  entry: './index.js',
  targets: [
    { dest: `${dest}/${file}.dev.js`, format: 'iife' },
    { dest: `${dest}/${file}.js`, format: 'cjs' },
  ],
  moduleName,
  banner,
  external: [
    'gfx',
    'memop',
    'vmath',
  ],
  globals: {
    'gfx': 'window.gfx',
    'memop': 'window.memop',
    'vmath': 'window.vmath',
  },
  sourceMap: true,
  plugins: [
    buble(),
  ]
};