'use strict';

const path_ = require('path');
const fs = require('fs');
const fsJetpack = require('fs-jetpack');
const tokenizer = require("glsl-tokenizer/string");

function glslStripComment(code) {
  let tokens = tokenizer(code);

  let result = '';
  for (let i = 0; i < tokens.length; ++i) {
    let t = tokens[i];
    if (t.type != 'block-comment' && t.type != 'line-comment' && t.type != 'eof') {
      result += t.data;
    }
  }

  return result;
}

function buildChunks(dest, path) {
  let files = fsJetpack.find(path, { matching: ['**/*.vert', '**/*.frag'] });
  let code = '';

  for (let i = 0; i < files.length; ++i) {
    let file = files[i];
    let content = fs.readFileSync(file, { encoding: 'utf8' });

    content = content.replace(new RegExp('[\\r\\n]+', 'g'), '\\n');
    code += `  '${path_.basename(file)}': '${content}',\n`;
  }
  code = `export default {\n${code}};`;

  fs.writeFileSync(dest, code, { encoding: 'utf8' });
}

function buildTemplates(dest, path) {
  let files = fsJetpack.find(path, { matching: ['**/*.vert'] });
  let code = '';

  for (let i = 0; i < files.length; ++i) {
    let file = files[i];
    let dir = path_.dirname(file);
    let name = path_.basename(file, '.vert');

    let vert = fs.readFileSync(path_.join(dir, name + '.vert'), { encoding: 'utf8' });
    vert = glslStripComment(vert);
    vert = vert.replace(new RegExp('[\\r\\n]+', 'g'), '\\n');

    let frag = fs.readFileSync(path_.join(dir, name + '.frag'), { encoding: 'utf8' });
    frag = glslStripComment(frag);
    frag = frag.replace(new RegExp('[\\r\\n]+', 'g'), '\\n');

    let json = fs.readFileSync(path_.join(dir, name + '.json'), { encoding: 'utf8' });
    json = JSON.parse(json);
    let options = '';

    for (let name in json) {
      let opt = json[name];
      let optCode = '';

      optCode += `name: '${name}', `;
      for (let p in opt) {
        optCode += `${p}: ${opt[p]}, `;
      }
      optCode = `      { ${optCode}},\n`;
      options += optCode;
    }
    options = `[\n${options}    ],`;

    code += '  {\n';
    code += `    name: '${name}',\n`;
    code += `    vert: '${vert}',\n`;
    code += `    frag: '${frag}',\n`;
    code += `    options: ${options}\n`;
    code += '  },\n';
  }
  code = `export default [\n${code}];`;

  fs.writeFileSync(dest, code, { encoding: 'utf8' });
}

// ==================
// exports
// ==================

module.exports = {
  glslStripComment,
  buildChunks,
  buildTemplates,
};