attribute vec4 a_weight;
attribute vec4 a_joint;

uniform sampler2D u_bonesTexture;
uniform float u_bonesTextureSize;

mat4 getBoneMatrix(const in float i) {
  float size = u_bonesTextureSize;
  float j = i * 4.0;
  float x = mod(j, size);
  float y = floor(j / size);

  float dx = 1.0 / size;
  float dy = 1.0 / size;

  y = dy * (y + 0.5);

  vec4 v1 = texture2D(u_bonesTexture, vec2(dx * (x + 0.5), y));
  vec4 v2 = texture2D(u_bonesTexture, vec2(dx * (x + 1.5), y));
  vec4 v3 = texture2D(u_bonesTexture, vec2(dx * (x + 2.5), y));
  vec4 v4 = texture2D(u_bonesTexture, vec2(dx * (x + 3.5), y));

  return mat4(v1, v2, v3, v4);
}

mat4 skinMatrix() {
  return
    getBoneMatrix(a_joint.x) * a_weight.x +
    getBoneMatrix(a_joint.y) * a_weight.y +
    getBoneMatrix(a_joint.z) * a_weight.z +
    getBoneMatrix(a_joint.w) * a_weight.w
    ;
}