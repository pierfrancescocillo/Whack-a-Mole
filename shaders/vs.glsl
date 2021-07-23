//`#version 300 es

in vec3 a_position;
//in vec3 a_normal;
in vec2 a_uv;
//out vec3 fs_norm;
out vec2 uvFS;

uniform mat4 matrix; 
//We need to transform the normals with the position
//We will see in a future lesson why and how to do it
//uniform mat4 nMatrix; 
void main() {
  uvFS=a_uv;
  //fs_norm = mat3(nMatrix) * a_normal;
  gl_Position = matrix * vec4(a_position,1.0);
};