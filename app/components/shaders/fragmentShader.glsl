uniform vec3 uColor;

varying vec2 vUv;
varying float vWave;

void main() {
  // Simple color based on the wave value
  vec3 color = uColor * (0.5 + 0.5 * vWave);
  
  gl_FragColor = vec4(color, 1.0);
}
