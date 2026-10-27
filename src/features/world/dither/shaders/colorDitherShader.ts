// Ordered tonal dither keeps material color and specular gradients. One texture
// sample for the treatment and one for blending; stable in screen space.
export const colorDitherFragmentShader = `
  uniform sampler2D tDiffuse;
  uniform vec2 resolution;
  uniform float cellSize;
  uniform float intensity;
  uniform float levels;
  uniform float strength;
  uniform float bias;
  uniform float rotation;
  uniform float brightness;
  uniform float contrast;
  uniform float saturation;
  uniform float gamma;
  uniform float paletteMix;
  uniform bool invert;
  uniform int pattern;
  uniform bool duotone;
  uniform vec3 darkColor;
  uniform vec3 lightColor;
  varying vec2 vUv;
  float bayer2(vec2 p) {
    return 2.0 * p.x + 3.0 * p.y - 4.0 * p.x * p.y;
  }
  void main() {
    vec4 original = texture2D(tDiffuse, vUv);
    // Exterior media uses opaque rendering with zero alpha as an exclusion mask.
    // Resolve it before quantization, color adjustments or coarse cell sampling.
    if (original.a < 0.5 || intensity <= 0.0) {
      gl_FragColor = vec4(original.rgb, 1.0);
      return;
    }
    vec2 samplePixel = floor(vUv * resolution / cellSize);
    vec2 uv = (samplePixel + 0.5) * cellSize / resolution;
    float angle = radians(rotation);
    vec2 center = resolution / (2.0 * cellSize);
    vec2 pixel = floor(mat2(cos(angle), sin(angle), -sin(angle), cos(angle))
      * (vUv * resolution / cellSize - center) + center);
    vec3 source = texture2D(tDiffuse, uv).rgb;
    float threshold = (4.0 * bayer2(mod(pixel, 2.0))
      + bayer2(mod(floor(pixel / 2.0), 2.0)) + 0.5) / 16.0;
    if (pattern == 1) threshold = fract(sin(dot(pixel, vec2(12.9898, 78.233))) * 43758.5453);
    if (pattern == 2) threshold = (mod(pixel.y, 4.0) + 0.5) / 4.0;
    if (pattern == 3) threshold = (bayer2(mod(pixel, 2.0)) + 0.5) / 4.0;
    if (pattern == 4) threshold = (16.0 * bayer2(mod(pixel, 2.0))
      + 4.0 * bayer2(mod(floor(pixel / 2.0), 2.0))
      + bayer2(mod(floor(pixel / 4.0), 2.0)) + 0.5) / 64.0;
    if (pattern == 5) threshold = (mod(pixel.x + pixel.y, 2.0) + 0.5) / 2.0;
    if (pattern == 6) {
      vec2 point = (mod(pixel, 8.0) + 0.5) / 8.0 - 0.5;
      threshold = clamp(dot(point, point) * 2.0, 0.0, 1.0);
    }
    if (pattern == 7) threshold = (mod(pixel.x + pixel.y, 6.0) + 0.5) / 6.0;
    if (pattern == 8) {
      vec2 hatch = abs(fract(vec2(pixel.x + pixel.y, pixel.x - pixel.y) / 8.0) - 0.5) * 2.0;
      threshold = min(hatch.x, hatch.y);
    }
    threshold = (threshold - 0.5) * strength + 0.5 + bias;
    vec3 color = pow(max(source, vec3(0.0)), vec3(0.94 / gamma));
    color = (color - 0.5) * contrast + 0.5 + brightness;
    float gray = dot(color, vec3(0.2126, 0.7152, 0.0722));
    color = clamp(mix(vec3(gray), color, saturation), 0.0, 1.0);
    if (invert) color = 1.0 - color;
    float steps = max(levels - 1.0, 1.0);
    vec3 treated = clamp(floor(color * steps + threshold) / steps, 0.0, 1.0);
    if (duotone) {
      float tone = dot(clamp(color, 0.0, 1.0), vec3(0.2126, 0.7152, 0.0722));
      tone = clamp(floor(tone * steps + threshold) / steps, 0.0, 1.0);
      treated = mix(treated, mix(darkColor, lightColor, tone), paletteMix);
    }
    gl_FragColor = vec4(mix(original.rgb, treated, intensity), original.a);
  }
`;
