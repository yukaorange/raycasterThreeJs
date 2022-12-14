uniform sampler2D uTexture;

uniform float uProgress;

varying vec2 vUv;

#define R_LUMINANCE 0.298912
#define G_LUMINANCE 0.586611
#define B_LUMINANCE 0.114478
const vec3 monochromeScale = vec3(R_LUMINANCE, G_LUMINANCE, B_LUMINANCE);

void main() {
  vec4 textureColor = texture2D(uTexture, vUv);
  float grayScale = dot(textureColor.rgb, monochromeScale);
  vec4 textureGrayscale = vec4(vec3(grayScale),1.);
  gl_FragColor = mix(textureGrayscale,textureColor,uProgress);
}