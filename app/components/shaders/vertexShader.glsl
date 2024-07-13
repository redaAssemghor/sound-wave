uniform float uTime;
uniform float uFrequency;

varying vec2 vUv;
varying float vWave;

void main() {
  vUv = uv;
  
  // Calculate a simple noise-based wave effect
  vec3 pos = position;
  float noiseFreq = 3.0;
  float noiseAmp = 0.5;
  
  pos.z += sin(pos.x * noiseFreq + uTime) * noiseAmp * uFrequency;
  vWave = pos.z;
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
