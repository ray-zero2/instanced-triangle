precision highp float;
varying vec3 vColor;
uniform float alpha;
uniform float time;

void main () {
  gl_FragColor = vec4(vColor, alpha);
}
