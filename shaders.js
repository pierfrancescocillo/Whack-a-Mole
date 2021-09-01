
var vertexShaderSource_cabinet = `#version 300 es

in vec3 a_position;
in vec3 a_normal;
in vec2 a_uv;
out vec2 uvFS;
out vec3 fs_norm;
out vec3 fs_pos;
uniform mat4 matrix; 
uniform mat4 nMatrix;
uniform mat4 pMatrix;
void main() {
  fs_norm = mat3(nMatrix) * a_normal;
  fs_pos=(pMatrix*vec4(a_position,1.0)).xyz;
  uvFS=a_uv;
  gl_Position = matrix * vec4(a_position,1.0);
}`;

var fragmentShaderSource_cabinet = `#version 300 es

precision mediump float;

in vec2 uvFS;
in vec3 fs_norm;
in vec3 fs_pos;
uniform vec4 lightColor;
uniform vec4 emitColor;
uniform sampler2D u_texture;
uniform vec4 ambientLightColor;
uniform vec4 specularColor;
uniform vec3 eyePos;
uniform float SpecShine;
uniform vec3 LPos;
uniform float LConeOut;
uniform float LConeIn;
uniform float LDecay;
uniform float LTarget;

out vec4 color;
void main() {

  //spotLight
  vec3 spotLightDir = normalize(LPos - fs_pos);
  float LCosOut = cos(radians(LConeOut / 2.0));
	float LCosIn = cos(radians(LConeOut * LConeIn / 2.0));
  float CosAngle = dot(spotLightDir, lightDirection);
	vec4 spotLightCol = lightColor * pow(LTarget / length(LPos - fs_pos), LDecay) *
  clamp((CosAngle - LCosOut) / (LCosIn - LCosOut), 0.0, 1.0);

  vec3 norm = normalize(fs_norm);
  
  vec3 eyedirVec = normalize(eyePos - fs_pos);
  
  //texture
  vec4 texcol = texture(u_texture, uvFS);
  
  //emit
  vec4 emit = texcol* max(max(emitColor.r, emitColor.g), emitColor.b);
  
  //ambient
  vec4 ambientAmbient= ambientLightColor*texcol;
  
  //lambert
  vec4 lambertColor =texcol*spotLightCol * clamp(dot(spotLightDir,norm), 0.0, 1.0);
  
  //specular Phong

  float LdotN = max(0.0, dot(fs_norm, lightDirection));
	vec3 reflection = -reflect(lightDirection, fs_norm);
	float LdotR = max(dot(reflection, eyedirVec), 0.0);
  vec4 LScol = spotLightCol * specularColor * max(sign(LdotN),0.0);
  vec4 specularPhong = LScol * pow(LdotR, SpecShine);

  vec4 out_color= clamp(lambertColor+ambientAmbient+emit+specularPhong, 0.0,1.0);
	color = vec4(out_color.rgb, 1.0);
}`;
