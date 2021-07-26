
var gl;
var shaderDir;
var model_cabinet;
var baseDir;

var TextCoords;
var textLocation;

var vertices_cabinet;
var normals_cabinet;
var indices_cabinet;
var uv_cabinet;

var vertices_hammer;
var normals_hammer;
var indices_hammer;
var uv_hammer;

var positionAttributeLocation;
var normalsAttributeLocation;
var matrixLocation;
var uvAttributeLocation;

var vao_cabinet;
var vao_hammer;
var vao_mole;

var perspectiveMatrix;
var viewMatrix;

var worldMatrix_cabinet;
var viewWorldMatrix_cabinet;
var projectionMatrix_cabinet;
var worldMatrix_hammer;
var viewWorldMatrix_hammer;
var projectionMatrix_hammer;

var nMatrixLocation;
var diffColorLocation;
var lightDirLocation;
var lightColLocation;

//altre variabili
var keyCode;

var time = 0;
var timeInt = 5; //[ms]
var c;
var m = [0,0,0,0,0];
const hamm_initPos = [1.5,1.5,1.5];
var hamm_world;
var mole_world;
const molePos = [
  [-0.63,0.4,0.21],
  [0,0.4,0.21],
  [0.63,0.4,0.21],
  [-0.3,0.4,0.65],
  [0.3,0.4,0.65]
];

//booleani utili
var boolClick = 0;
var boolTalpa = [0,0,0,0,0];


//sliders
document.getElementById("rho_value").innerHTML = document.getElementById("sl_rho").value;
document.getElementById("sl_rho").oninput = function(){
  document.getElementById("rho_value").innerHTML = this.value;
}

document.getElementById("theta_value").innerHTML = document.getElementById("sl_theta").value;
document.getElementById("sl_theta").oninput = function(){
  document.getElementById("theta_value").innerHTML = this.value;
}

document.getElementById("phi_value").innerHTML = document.getElementById("sl_phi").value;
document.getElementById("sl_phi").oninput = function(){
  document.getElementById("phi_value").innerHTML = this.value;
}

//key codes:
//A -> 65
//S -> 83
//D -> 68
//Z -> 90
//X -> 88
document.onkeydown = function(key){
  if(key.keyCode == 65 || key.keyCode == 83 || key.keyCode == 68 || key.keyCode == 90 || key.keyCode == 88){
    console.log('hey');
    boolClick = 1;
    c = 0;
    keyCode = key.keyCode;
  }
}

async function main() {

  var vs_text = [
  '#version 300 es',
  '',
  'in vec3 a_position;',
  'in vec3 a_normal;',
  'in vec2 a_uv;',
  'out vec2 uvFS;',
  '',
  'uniform mat4 matrix;' ,
  '',
  'void main()',
  '{',
  '  uvFS=a_uv;',
  '  gl_Position = matrix * vec4(a_position,1.0);',
  '}'
  ].join('\n');

  var fs_text = [
  '#version 300 es',
  '',
  'precision mediump float;',
  '',
  'in vec2 uvFS;',
  'out vec4 outColor;',
  'uniform sampler2D u_texture;',
  '',
  'void main()', 
  '{',
  '   outColor = texture(u_texture, uvFS);',
  '}'
  ].join('\n');

  var canvas = document.getElementById("canvas");
  
  //window.addEventListener("keydown", keyFunctionDown, false);
  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir+"shaders/";
  

  gl = canvas.getContext("webgl2");
  if (!gl) {
      document.write("GL context not opened");
      return;
  }

  
  /*
  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    program = createProgram(gl, vertexShader, fragmentShader);

  });
  */

  var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vs_text);
  var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fs_text);
  program = utils.createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  model_cabinet = new OBJ.Mesh(worldObjStr_cabinet);
  model_hammer = new OBJ.Mesh(worldObjStr_hammer);
  model_mole = new OBJ.Mesh(worldObjStr_mole);

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  gl.clearColor(0.75,0.85,0.8,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);

  utils.resizeCanvasToDisplaySize(gl.canvas);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  positionAttributeLocation = gl.getAttribLocation(program, "a_position");  
  normalsAttributeLocation = gl.getAttribLocation(program, "a_normal");
  uvAttributeLocation = gl.getAttribLocation(program,"a_uv");
  textLocation = gl.getUniformLocation(program, "u_texture");
  matrixLocation = gl.getUniformLocation(program, "matrix"); 

  //BUFFERS FOR CABINET
  vertices_cabinet = model_cabinet.vertices;
  normals_cabinet  = model_cabinet.vertexNormals;
  indices_cabinet  = model_cabinet.indices;
  uv_cabinet = model_cabinet.textures;
  
  vao_cabinet= gl.createVertexArray();
  gl.bindVertexArray(vao_cabinet);

  var positionBuffer_cabinet = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_cabinet);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_cabinet), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var uvBuffer_cabinet = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer_cabinet);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv_cabinet), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer_cabinet = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_cabinet);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_cabinet), gl.STATIC_DRAW); 

  //BUFFERS FOR HAMMER
  vertices_hammer = model_hammer.vertices;
  normals_hammer  = model_hammer.vertexNormals;
  indices_hammer  = model_hammer.indices;
  uv_hammer = model_hammer.textures;

  vao_hammer= gl.createVertexArray();
  gl.bindVertexArray(vao_hammer);

  var positionBuffer_hammer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_hammer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_hammer), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var uvBuffer_hammer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer_hammer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv_hammer), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer_hammer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_hammer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_hammer), gl.STATIC_DRAW); 
  

  const cameraTarget = [0, 0, 0];
  var cameraPosition = [0, 10, 10];
  const zNear = 0.1;
  const zFar = 100;

  // Create a texture.
  var texture = gl.createTexture();
  // use texture unit 0
  gl.activeTexture(gl.TEXTURE0);
  // bind to the TEXTURE_2D bind point of texture unit 0
 gl.bindTexture(gl.TEXTURE_2D, texture);
  
  // Asynchronously load an image
  var image = new Image();
  image.src = baseDir + "Mole.png";
  image.onload = function() {
    //Make sure this is the active one
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.generateMipmap(gl.TEXTURE_2D);
  };
  
  function drawScene() {

    /*
    utils.resizeCanvasToDisplaySize(gl.canvas);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    */
    gl.clearColor(0.75,0.85,0.8,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    /*
    cameraPosition = [
      cameraTarget[0] + document.getElementById("sl_rho").value * Math.cos(degToRad(document.getElementById("sl_theta").value)) * Math.sin(degToRad(document.getElementById("sl_phi").value)),
      cameraTarget[1] + document.getElementById("sl_rho").value * Math.sin(degToRad(document.getElementById("sl_theta").value)),
      cameraTarget[2] + document.getElementById("sl_rho").value * Math.cos(degToRad(document.getElementById("sl_theta").value)) * Math.cos(degToRad(document.getElementById("sl_phi").value))
    ];
    */
    const fieldOfViewDeg = 60;
    const fieldOfViewRadians = degToRad(fieldOfViewDeg);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);
    
    const up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    const camera = m4.lookAt(cameraPosition, cameraTarget, up);
    
    // Make a view matrix from the camera matrix.
    const view = m4.inverse(camera);
    
    const viewProjection = m4.multiply(projection, view);
    const invMat = m4.inverse(viewProjection);

    perspectiveMatrix = utils.MakePerspective(fieldOfViewDeg, aspect, zFar, zNear);
    viewMatrix = utils.MakeView(cameraPosition[0]-cameraTarget[0],cameraPosition[1]-cameraTarget[1],cameraPosition[2]-cameraTarget[2],-30,0),

    //DRAW CABINET
    worldMatrix_cabinet = utils.identityMatrix();
    viewWorldMatrix_cabinet = utils.multiplyMatrices(viewMatrix, worldMatrix_cabinet);
    projectionMatrix_cabinet = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix_cabinet);

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix_cabinet));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textLocation, 0);

    gl.bindVertexArray(vao_cabinet);

    gl.drawElements(gl.TRIANGLES, indices_cabinet.length, gl.UNSIGNED_SHORT, 0);

    //DRAW HAMMER
    if(boolClick != 0){
      if(keyCode == 65){ //A
        if(c*Math.PI/2 < Math.PI/2){
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(-c*Math.PI/2)), m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(m4.axisRotation([-(molePos[0][2] - hamm_initPos[2]),0,molePos[0][0] - hamm_initPos[0]],-c*Math.PI/2),m4.translation((molePos[0][0] - hamm_initPos[0])*c,(molePos[0][1] - hamm_initPos[1] + 0.8)*c,(molePos[0][2] - hamm_initPos[2])*c));
          console.log(hamm_world);
        } else {
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(c*Math.PI/2)), m4.xRotation(Math.PI)),m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.axisRotation([-(molePos[0][2] - hamm_initPos[2]),0,molePos[0][0] - hamm_initPos[0]],c*Math.PI/2), m4.axisRotation([-(molePos[0][2] - hamm_initPos[2]),0,molePos[0][0] - hamm_initPos[0]],Math.PI)),m4.translation((molePos[0][0] - hamm_initPos[0])*-c/2,(molePos[0][1] - hamm_initPos[1] + 0.8)*-c/2,(molePos[0][2] - hamm_initPos[2])*-c/2)),m4.translation((molePos[0][0] - hamm_initPos[0]),(molePos[0][1] - hamm_initPos[1] + 0.8),(molePos[0][2] - hamm_initPos[2])));
        }
      } else if(keyCode == 83){ //S
        if(c*Math.PI/2 < Math.PI/2){
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(-c*Math.PI/2)), m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(m4.axisRotation([-(molePos[1][2] - hamm_initPos[2]),0,molePos[1][0] - hamm_initPos[0]],-c*Math.PI/2),m4.translation((molePos[1][0] - hamm_initPos[0])*c,(molePos[1][1] - hamm_initPos[1] + 0.8)*c,(molePos[1][2] - hamm_initPos[2])*c));
        } else {
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(c*Math.PI/2)), m4.xRotation(Math.PI)),m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.axisRotation([-(molePos[1][2] - hamm_initPos[2]),0,molePos[1][0] - hamm_initPos[0]],c*Math.PI/2), m4.axisRotation([-(molePos[1][2] - hamm_initPos[2]),0,molePos[1][0] - hamm_initPos[0]],Math.PI)),m4.translation((molePos[1][0] - hamm_initPos[0])*-c/2,(molePos[1][1] - hamm_initPos[1] + 0.8)*-c/2,(molePos[1][2] - hamm_initPos[2])*-c/2)),m4.translation((molePos[1][0] - hamm_initPos[0]),(molePos[1][1] - hamm_initPos[1] + 0.8),(molePos[1][2] - hamm_initPos[2])));
        }
      } else if(keyCode == 68 ){ //D
        if(c*Math.PI/2 < Math.PI/2){
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(-c*Math.PI/2)), m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(m4.axisRotation([-(molePos[2][2] - hamm_initPos[2]),0,molePos[2][0] - hamm_initPos[0]],-c*Math.PI/2),m4.translation((molePos[2][0] - hamm_initPos[0])*c,(molePos[2][1] - hamm_initPos[1] + 0.8)*c,(molePos[2][2] - hamm_initPos[2])*c));
        } else {
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(c*Math.PI/2)), m4.xRotation(Math.PI)),m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.axisRotation([-(molePos[2][2] - hamm_initPos[2]),0,molePos[2][0] - hamm_initPos[0]],c*Math.PI/2), m4.axisRotation([-(molePos[2][2] - hamm_initPos[2]),0,molePos[2][0] - hamm_initPos[0]],Math.PI)),m4.translation((molePos[2][0] - hamm_initPos[0])*-c/2,(molePos[2][1] - hamm_initPos[1] + 0.8)*-c/2,(molePos[2][2] - hamm_initPos[2])*-c/2)),m4.translation((molePos[2][0] - hamm_initPos[0]),(molePos[2][1] - hamm_initPos[1] + 0.8),(molePos[2][2] - hamm_initPos[2])));
        }
      } else if(keyCode == 90){ //Z
        if(c*Math.PI/2 < Math.PI/2){
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(-c*Math.PI/2)), m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(m4.axisRotation([-(molePos[3][2] - hamm_initPos[2]),0,molePos[3][0] - hamm_initPos[0]],-c*Math.PI/2),m4.translation((molePos[3][0] - hamm_initPos[0])*c,(molePos[3][1] - hamm_initPos[1] + 0.8)*c,(molePos[3][2] - hamm_initPos[2])*c));
        } else {
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(c*Math.PI/2)), m4.xRotation(Math.PI)),m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.axisRotation([-(molePos[3][2] - hamm_initPos[2]),0,molePos[3][0] - hamm_initPos[0]],c*Math.PI/2), m4.axisRotation([-(molePos[3][2] - hamm_initPos[2]),0,molePos[3][0] - hamm_initPos[0]],Math.PI)),m4.translation((molePos[3][0] - hamm_initPos[0])*-c/2,(molePos[3][1] - hamm_initPos[1] + 0.8)*-c/2,(molePos[3][2] - hamm_initPos[2])*-c/2)),m4.translation((molePos[3][0] - hamm_initPos[0]),(molePos[3][1] - hamm_initPos[1] + 0.8),(molePos[3][2] - hamm_initPos[2])));
        }
      } else if(keyCode == 88){ //X
        if(c*Math.PI/2 < Math.PI/2){
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(-c*Math.PI/2)), m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(m4.axisRotation([-(molePos[4][2] - hamm_initPos[2]),0,molePos[4][0] - hamm_initPos[0]],-c*Math.PI/2),m4.translation((molePos[4][0] - hamm_initPos[0])*c,(molePos[4][1] - hamm_initPos[1] + 0.8)*c,(molePos[4][2] - hamm_initPos[2])*c));
        } else {
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(c*Math.PI/2)), m4.xRotation(Math.PI)),m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(m4.axisRotation([-(molePos[4][2] - hamm_initPos[2]),0,molePos[4][0] - hamm_initPos[0]],c*Math.PI/2), m4.axisRotation([-(molePos[4][2] - hamm_initPos[2]),0,molePos[4][0] - hamm_initPos[0]],Math.PI)),m4.translation((molePos[4][0] - hamm_initPos[0])*-c/2,(molePos[4][1] - hamm_initPos[1] + 0.8)*-c/2,(molePos[4][2] - hamm_initPos[2])*-c/2)),m4.translation((molePos[4][0] - hamm_initPos[0]),(molePos[4][1] - hamm_initPos[1] + 0.8),(molePos[4][2] - hamm_initPos[2])));
        }
      }
      c = c + timeInt*0.001;
      console.log("c: ", c);
      if(c*Math.PI/2 > Math.PI){
        boolClick = 0;
      }
    } else {
      hamm_world = utils.identityMatrix();
    }

    worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(hamm_initPos[0],hamm_initPos[1],hamm_initPos[2]));
    viewWorldMatrix_hammer = utils.multiplyMatrices(viewMatrix, worldMatrix_hammer);
    projectionMatrix_hammer = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix_hammer);

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix_hammer));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textLocation, 0);

    gl.bindVertexArray(vao_hammer);

    gl.drawElements(gl.TRIANGLES, indices_hammer.length, gl.UNSIGNED_SHORT, 0);
    
  }
  setInterval(drawScene,timeInt);

}  

window.onload = main;

function m4toUsual(m4){
  var temp = [];
  for(i=0;i<m4.length;i++){
    temp[i] = m4[i];
  }
  return temp;
}