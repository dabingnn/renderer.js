export default [
  {
    name: 'simple',
    vert: '\nattribute vec3 a_position;\nuniform mat4 model;\nuniform mat4 viewProj;\n{{#useTexture}}\n  attribute vec2 a_uv0;\n  varying vec2 uv0;\n{{/useTexture}}\nvoid main () {\n  vec4 pos = viewProj * model * vec4(a_position, 1);\n  {{#useTexture}}\n    uv0 = a_uv0;\n  {{/useTexture}}\n  gl_Position = pos;\n}',
    frag: '\n{{#useTexture}}\n  uniform sampler2D texture;\n  varying vec2 uv0;\n{{/useTexture}}\n{{#useColor}}\n  uniform vec4 color;\n{{/useColor}}\nvoid main () {\n  vec4 o = vec4(1, 1, 1, 1);\n  {{#useTexture}}\n    o *= texture2D(texture, uv0);\n  {{/useTexture}}\n  {{#useColor}}\n    o *= color;\n  {{/useColor}}\n  if (!gl_FrontFacing) {\n    o.rgb *= 0.5;\n  }\n  gl_FragColor = o;\n}',
    options: [
      { name: 'useTexture', },
      { name: 'useColor', },
    ],
  },
];