export const televisionSnowShader = `
  uniform float time;
  uniform mat4 inverseProjection;
  uniform mat4 viewToWorld;
  uniform vec3 screenCenter;
  varying vec2 vUv;
  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }
  void main() {
    // The original CRT UVs continue beyond its aperture, without surfaces.
    vec4 viewPoint = inverseProjection * vec4(vUv * 2.0 - 1.0, 1.0, 1.0);
    vec3 ray = mat3(viewToWorld) * (viewPoint.xyz / viewPoint.w);
    vec3 origin = viewToWorld[3].xyz;
    float distanceToScreen = (screenCenter.z - origin.z) / min(ray.z, -0.00001);
    vec2 signalUv = (origin.xy + ray.xy * distanceToScreen - screenCenter.xy)
      / vec2(0.94, 0.67) + 0.5;
    float frame = floor(time * 24.0);
    // Limit detail at a distance, retaining fine grain during the approach.
    vec2 grid = min(vec2(640.0, 480.0), 0.75 / max(fwidth(signalUv), vec2(0.0001)));
    float row = floor(signalUv.y * grid.y);
    float jitter = hash(vec2(row, frame)) * 7.0;
    vec2 cell = floor(signalUv * grid + vec2(jitter, 0.0));
    float snow = hash(cell + vec2(frame * 31.0, frame * 17.0));
    float streak = hash(vec2(floor(cell.x / 7.0), row + frame * 13.0));
    float signal = mix(snow, streak, 0.22);
    signal = smoothstep(0.12, 0.88, signal);
    float tracking = exp(-pow((fract(signalUv.y + time * 0.13) - 0.5) / 0.045, 2.0));
    float scan = 0.94 + 0.06 * cos(row * 3.14159265);
    float value = (0.035 + signal * 0.9) * scan * (1.0 - tracking * 0.3);
    gl_FragColor = vec4(vec3(value), 1.0);
  }
`;
