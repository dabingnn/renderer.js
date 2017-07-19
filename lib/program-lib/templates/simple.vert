// precision highp float;

attribute vec3 a_position;

uniform mat4 model;
uniform mat4 viewProj;

{{#useTexture}}
  attribute vec2 a_uv0;
  varying vec2 uv0;
{{/useTexture}}

void main () {
  vec4 pos = viewProj * model * vec4(a_position, 1);

  {{#useTexture}}
    uv0 = a_uv0;
  {{/useTexture}}

  gl_Position = pos;
}