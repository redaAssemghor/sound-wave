uniform float u_red;
uniform float u_green;
uniform float u_blue;

varying vec2 vUv;
varying float vWave;

void main() {
  // Set the color based on the wave value
  vec3 color = vec3(u_red, u_green, u_blue) * (0.5 + 0.5 * vWave);
  gl_FragColor = vec4(color, 1.0);
}
