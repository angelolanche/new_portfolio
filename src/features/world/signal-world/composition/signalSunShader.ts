export const sunVertexShader = /* glsl */ `
  uniform float time;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    float corona = smoothstep(5.8, 8.0, length(position));
    vec3 radial = normalize(position);
    vec3 tangent = cross(radial, vec3(0.0, 0.0, 1.0));
    float wave = sin(length(position) * 1.8 - time * 2.4 + radial.y * 7.0);
    vec3 animated = position + radial * (corona * wave * 0.24
      + (1.0 - corona) * 0.035 * sin(time * 1.5 + position.x * 1.8 + position.y));
    animated += tangent * corona * 0.16 * sin(time * 2.0 + position.y * 2.3);
    vec4 viewPosition = modelViewMatrix * vec4(animated, 1.0);
    vViewPosition = -viewPosition.xyz;
    gl_Position = projectionMatrix * viewPosition;
  }
`;

export const sunFragmentShader = /* glsl */ `
  uniform float time;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.17, 0.31, 0.53));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }
  float noise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(hash(i), hash(i + vec3(1,0,0)), f.x),
                   mix(hash(i + vec3(0,1,0)), hash(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(hash(i + vec3(0,0,1)), hash(i + vec3(1,0,1)), f.x),
                   mix(hash(i + vec3(0,1,1)), hash(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) {
    float value = 0.0, amplitude = 0.5;
    for (int i = 0; i < 4; i++) {
      value += noise(p) * amplitude;
      p = p * 2.07 + vec3(17.1, 9.2, 13.7);
      amplitude *= 0.5;
    }
    return value;
  }
  void main() {
    vec3 p = normalize(vPosition);
    float t = time * 0.32;
    float angle = time * 0.1;
    p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
    vec3 flow = vec3(t, -t * 0.7, t * 0.35);
    float convection = fbm(p * 5.0 + flow);
    float turbulence = fbm(p * 14.0 + convection * 2.4 - flow);
    // Fade unresolved grain instead of letting it shimmer at a distance.
    float grainScale = 82.0;
    float footprint = length(fwidth(p * grainScale));
    float grain = mix(noise(p * grainScale + turbulence * 3.0 + flow), 0.5,
                      smoothstep(0.4, 1.4, footprint));
    float cells = smoothstep(0.24, 0.78, turbulence * 0.65 + grain * 0.35);
    float spots = 1.0 - smoothstep(0.22, 0.34, convection);
    float facing = clamp(dot(normalize(vNormal), normalize(vViewPosition)), 0.0, 1.0);
    float limb = 0.32 + 0.68 * pow(facing, 0.45);
    vec3 plasma = mix(vec3(0.22, 0.001, 0.003), vec3(1.0, 0.018, 0.008), cells);
    plasma = mix(plasma, vec3(1.0, 0.095, 0.035), pow(cells, 6.0) * 0.75);
    plasma *= mix(1.0, 0.18, spots) * limb;
    plasma *= 0.9 + 0.16 * sin(time * 1.7 + convection * 8.0);
    // Needles carry streaks of plasma and cool toward their tips.
    float corona = smoothstep(5.8, 6.3, length(vPosition));
    float height = clamp((length(vPosition) - 5.8) / 7.8, 0.0, 1.0);
    float filaments = pow(1.0 - abs(turbulence * 2.0 - 1.0), 4.0);
    vec3 flare = mix(vec3(1.0, 0.03, 0.009), vec3(0.18, 0.001, 0.003), height);
    flare *= (0.35 + filaments * 0.8) * (1.0 - height * 0.7);
    flare *= 0.72 + 0.28 * sin(time * 2.1 - height * 12.0 + convection * 6.0);
    gl_FragColor = vec4(mix(plasma, flare, corona), 1.0);
    #include <colorspace_fragment>
  }
`;

export const sunAtmosphereFragmentShader = /* glsl */ `
  uniform float time;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  void main() {
    float facing = abs(dot(normalize(vNormal), normalize(vViewPosition)));
    float rim = pow(1.0 - facing, 3.5);
    gl_FragColor = vec4(1.0, 0.015, 0.008, rim * (0.32 + 0.06 * sin(time * 1.7)));
    #include <colorspace_fragment>
  }
`;
