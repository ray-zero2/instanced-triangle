precision highp float;
attribute vec2 circlePoint;
attribute float theta;
varying vec3 vColor;
uniform vec2 resolution;
uniform float time;
const float PI = 3.1415926535;
float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}
void main () {
    // Use lots of sines and cosines to place the circles
    vec2 circleCenter = vec2(cos(theta), sin(theta))
    * (0.6 + 0.2 * cos(theta * 6.0 + cos(theta * 8.0 + time)));

    // Modulate the circle sizes around the circle and in time
    float rnd = random(circlePoint.xy * theta) ;
    float circleSize = 0.2 + 0.12  * cos(theta * 9.0  - time * 0.5);

    vec2 xy = circleCenter + circlePoint * circleSize;

    // Define some pretty colors
    float th = 8.0 * theta + time * 0.5;
    vColor = 0.6 + 0.2 * vec3(
    cos(th),
    cos(th - PI / 3.0),
    cos(th - PI * 2.0 / 3.0)
    ) + 0.2 * rnd;

    //   gl_Position = vec4(xy / aspectRatio, 0, 1);
    float aspectRatio = resolution.y / resolution.x;
    gl_Position = vec4(xy, 0.0, 1.0);
    // gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}
