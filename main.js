var program;
var gl;
var shaderDir;
var model_cabinet;
var baseDir;

var textLocation;

var vertices_cabinet;
var normals_cabinet;
var indices_cabinet;
var uv_cabinet;

var vertices_hammer;
var normals_hammer;
var indices_hammer;
var uv_hammer;

var vertices_mole;
var normals_mole;
var indices_mole;
var uv_mole;

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
var worldMatrix_mole;
var viewWorldMatrix_mole;
var projectionMatrix_mole;

var nMatrixLocation;
var pMatrixLocation;
var lightAmbientLocation;
var eyePosLocation;
var lightDirLocation;
var lightColLocation;
var specularColorLocation;
var SpecShineLocation;
var emitColorLocation;
var LPosLocation;
var ConeOutLocation;
var ConeInLocation;
var DecayLocation;
var TargetLocation;

var Decay=0;
var Target=61;
var ConIn=80;
var ConOut=30;
var SpecShine=50.0;
var LPos=[0.3,5.0,0.3];
//altre variabili
var keyCode;
var duration = 45; //[s]
const cameraTarget = [0, 0, 0];
var cameraPosition = [0, 10, 10];

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
var altezza_mole = 0.8;

var score = 0;

//booleani utili
var boolClick = 0;
var boolTalpa = [0,0,0,0,0];
var bool_hit = [0,0,0,0,0];

//colors
var emitColor=[80.0/255.0, 80.0/255.0, 80.0/255.0, 255.0/255.0];
var emitColor2=[220.0/255.0, 220.0/255.0, 220.0/255.0, 255.0/255.0];
var specularColor=[255.0/255.0, 255.0/255.0, 255.0/255.0, 255.0/255.0];
var directionalLightColor = [170.0/255.0, 170.0/255.0, 170.0/255.0, 255.0/255.0];
//var ambientLightColor=[113.0/255.0, 109.0/255.0, 116.0/255.0, 255.0/255.0];
var ambientLightColor=[50.0/255.0, 50.0/255.0, 50.0/255.0, 255.0/255.0];

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

document.getElementById("score_value").innerHTML = score;
document.getElementById("time_value").innerHTML = 45;

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

const reset_but = document.getElementById("reset_but")
reset_but.onclick = function(){
  location.reload();
}

async function main() {

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

var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, vertexShaderSource_cabinet);
var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource_cabinet);
program= utils.createProgram(gl, vertexShader, fragmentShader);



  model_cabinet = new OBJ.Mesh(worldObjStr_cabinet);
  model_hammer = new OBJ.Mesh(worldObjStr_hammer);
  model_mole = new OBJ.Mesh(worldObjStr_mole);

  var dirLightAlpha=utils.degToRad(80);
  var dirLightBeta=utils.degToRad(0);
/*
var dirLightAlpha=-170;
var dirLightBeta=170;*/
  var directionalLight = [Math.sin(dirLightAlpha) * Math.sin(dirLightBeta),
                    Math.cos(dirLightAlpha),
                    Math.sin(dirLightAlpha) * Math.cos(dirLightBeta)
                    ];

  
  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0.75,0.85,0.8,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
 
  positionAttributeLocation = gl.getAttribLocation(program, "a_position");  
  normalsAttributeLocation = gl.getAttribLocation(program, "a_normal");
  uvAttributeLocation = gl.getAttribLocation(program,"a_uv");
  textLocation = gl.getUniformLocation(program, "u_texture");
  matrixLocation = gl.getUniformLocation(program, "matrix"); 
  nMatrixLocation= gl.getUniformLocation(program, "nMatrix");
  pMatrixLocation= gl.getUniformLocation(program, "pMatrix");
  lightDirLocation= gl.getUniformLocation(program, "lightDirection");
  specularColorLocation=gl.getUniformLocation(program,"specularColor")
  lightColLocation=gl.getUniformLocation(program, "lightColor");
  lightAmbientLocation=gl.getUniformLocation(program,"ambientLightColor");
  eyePosLocation=gl.getUniformLocation(program,"eyePos");
  SpecShineLocation=gl.getUniformLocation(program,"SpecShine");
  emitColorLocation=gl.getUniformLocation(program,"emitColor");
  LPosLocation=gl.getUniformLocation(program,"LPos");
  ConeOutLocation=gl.getUniformLocation(program,"LConeOut");
  ConeInLocation=gl.getUniformLocation(program,"LConeIn");
  DecayLocation=gl.getUniformLocation(program,"LDecay");
  TargetLocation=gl.getUniformLocation(program,"LTarget");
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

  var normalsBuffer_cabinet = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_cabinet);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals_cabinet), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalsAttributeLocation);
  gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  
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

  var normalsBuffer_hammer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_hammer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals_hammer), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalsAttributeLocation);
  gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  
  var uvBuffer_hammer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer_hammer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv_hammer), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer_hammer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_hammer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_hammer), gl.STATIC_DRAW); 
  
  //BUFFERS FOR MOLE
  vertices_mole = model_mole.vertices;
  normals_mole  = model_mole.vertexNormals;
  indices_mole  = model_mole.indices;
  uv_mole = model_mole.textures;

  vao_mole= gl.createVertexArray();
  gl.bindVertexArray(vao_mole);

  var positionBuffer_mole = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer_mole);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_mole), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);

  var normalsBuffer_mole = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalsBuffer_mole);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals_mole), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(normalsAttributeLocation);
  gl.vertexAttribPointer(normalsAttributeLocation, 3, gl.FLOAT, false, 0, 0);
  
  var uvBuffer_mole = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer_mole);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uv_mole), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(uvAttributeLocation);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 0, 0);

  var indexBuffer_mole = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer_mole);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices_mole), gl.STATIC_DRAW); 


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

    gl.useProgram(program)
    cameraPosition = [
      cameraTarget[0] + document.getElementById("sl_rho").value * Math.cos(degToRad(document.getElementById("sl_theta").value)) * Math.sin(degToRad(document.getElementById("sl_phi").value)),
      cameraTarget[1] + document.getElementById("sl_rho").value * Math.sin(degToRad(document.getElementById("sl_theta").value)),
      cameraTarget[2] + document.getElementById("sl_rho").value * Math.cos(degToRad(document.getElementById("sl_theta").value)) * Math.cos(degToRad(document.getElementById("sl_phi").value))
    ];
    var eyePos=[cameraPosition[0],cameraPosition[1],cameraPosition[2]];
    perspectiveMatrix = utils.MakePerspective(60, gl.canvas.width/gl.canvas.height, 0.1, 100.0);//(fieldOfView,aspect,zNear,zFar)
    viewMatrix = utils.MakeView(cameraPosition[0],cameraPosition[1],cameraPosition[2],-document.getElementById("sl_theta").value,-document.getElementById("sl_phi").value),

    //DRAW CABINET
    gl.clearColor(0.75,0.85,0.8,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    worldMatrix_cabinet = utils.identityMatrix();
    //worldMatrix_cabinet = MakeRotateArbMatrix(time,[1,0,0]);
    viewWorldMatrix_cabinet = utils.multiplyMatrices(viewMatrix, worldMatrix_cabinet);
    projectionMatrix_cabinet = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix_cabinet);
    var normalMatrix_cabinet=utils.invertMatrix(utils.transposeMatrix(worldMatrix_cabinet));

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix_cabinet));
    gl.uniformMatrix4fv(nMatrixLocation, gl.FALSE, utils.transposeMatrix(normalMatrix_cabinet));
    gl.uniformMatrix4fv(pMatrixLocation, gl.FALSE, utils.transposeMatrix(worldMatrix_cabinet));
    gl.uniform3fv(lightDirLocation, directionalLight);
    gl.uniform4fv(lightColLocation, directionalLightColor);
    gl.uniform4fv(lightAmbientLocation, ambientLightColor);
    gl.uniform4fv(specularColorLocation, specularColor);
    gl.uniform4fv(emitColorLocation, emitColor);
    gl.uniform3fv(LPosLocation, LPos);
    gl.uniform1f(ConeOutLocation, ConOut);
    gl.uniform1f(ConeInLocation, ConIn);
    gl.uniform1f(DecayLocation, Decay);
    gl.uniform1f(TargetLocation,Target);
    gl.uniform3fv(eyePosLocation, eyePos);
    gl.uniform1f(SpecShineLocation, SpecShine);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textLocation, 0);
    gl.bindVertexArray(vao_cabinet);

    gl.drawElements(gl.TRIANGLES, indices_cabinet.length, gl.UNSIGNED_SHORT, 0);
   gl.useProgram(program)
    //DRAW HAMMER
    if(boolClick != 0){
      if(keyCode == 65){ //A
        if(c*Math.PI/2 < Math.PI/2){
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((molePos[0][0] - hamm_initPos[0])*c,(molePos[0][1] - hamm_initPos[1] + altezza_mole)*c,(molePos[0][2] - hamm_initPos[2])*c), MakeRotateArbMatrix([(molePos[0][0] - hamm_initPos[2]),0,molePos[0][2] - hamm_initPos[0]],-c*Math.PI/2,hamm_initPos));
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(hamm_initPos[0],hamm_initPos[1],hamm_initPos[2]));
        } else {
          //hamm_world = utils.multiplyMatrices(MakeRotateArbMatrix([(molePos[0][0] - hamm_initPos[2]),0,molePos[0][2] - hamm_initPos[0]],c*Math.PI/4,[molePos[0][0],molePos[0][1] + altezza_mole,molePos[0][2]]) , MakeRotateArbMatrix([(molePos[0][0] - hamm_initPos[2]),0,molePos[0][2] - hamm_initPos[0]],-Math.PI/2,[molePos[0][0],molePos[0][1] altezza_mole,molePos[0][2]]) );
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((hamm_initPos[0] - molePos[0][0])*c/2,(hamm_initPos[1] - molePos[0][1] - altezza_mole)*c/2,(hamm_initPos[2] - molePos[0][2])*c/2) , utils.multiplyMatrices(MakeRotateArbMatrix([(molePos[0][0] - hamm_initPos[2]),0,molePos[0][2] - hamm_initPos[0]],c*Math.PI/4,[molePos[0][0],molePos[0][1] + altezza_mole,molePos[0][2]]) , MakeRotateArbMatrix([(molePos[0][0] - hamm_initPos[2]),0,molePos[0][2] - hamm_initPos[0]],-Math.PI/2,[molePos[0][0],molePos[0][1] + altezza_mole,molePos[0][2]]) ) );
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(molePos[0][0],molePos[0][1]+altezza_mole,molePos[0][2]));
        }
      } else if(keyCode == 83){ //S
        if(c*Math.PI/2 < Math.PI/2){
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((molePos[1][0] - hamm_initPos[0])*c,(molePos[1][1] - hamm_initPos[1] + altezza_mole)*c,(molePos[1][2] - hamm_initPos[2])*c), MakeRotateArbMatrix([(molePos[1][0] - hamm_initPos[2]),0,molePos[1][2] - hamm_initPos[0]],-c*Math.PI/2,hamm_initPos));
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(hamm_initPos[0],hamm_initPos[1],hamm_initPos[2]));
        } else {
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((hamm_initPos[0] - molePos[1][0])*c/2,(hamm_initPos[1] - molePos[1][1] - altezza_mole)*c/2,(hamm_initPos[2] - molePos[1][2])*c/2) , utils.multiplyMatrices(MakeRotateArbMatrix([(molePos[1][0] - hamm_initPos[2]),0,molePos[1][2] - hamm_initPos[0]],c*Math.PI/4,[molePos[1][0],molePos[1][1] + altezza_mole,molePos[1][2]]) , MakeRotateArbMatrix([(molePos[1][0] - hamm_initPos[2]),0,molePos[1][2] - hamm_initPos[0]],-Math.PI/2,[molePos[1][0],molePos[1][1] + altezza_mole,molePos[1][2]]) ) );
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(molePos[1][0],molePos[1][1]+altezza_mole,molePos[1][2]));
        }
      } else if(keyCode == 68 ){ //D
        if(c*Math.PI/2 < Math.PI/2){
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((molePos[2][0] - hamm_initPos[0])*c,(molePos[2][1] - hamm_initPos[1] + altezza_mole)*c,(molePos[2][2] - hamm_initPos[2])*c), MakeRotateArbMatrix([(molePos[2][0] - hamm_initPos[2]),0,molePos[2][2] - hamm_initPos[0]],-c*Math.PI/2,hamm_initPos));
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(hamm_initPos[0],hamm_initPos[1],hamm_initPos[2]));
        } else {
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((hamm_initPos[0] - molePos[2][0])*c/2,(hamm_initPos[1] - molePos[2][1] - altezza_mole)*c/2,(hamm_initPos[2] - molePos[2][2])*c/2) , utils.multiplyMatrices(MakeRotateArbMatrix([(molePos[2][0] - hamm_initPos[2]),0,molePos[2][2] - hamm_initPos[0]],c*Math.PI/4,[molePos[2][0],molePos[2][1] + altezza_mole,molePos[2][2]]) , MakeRotateArbMatrix([(molePos[2][0] - hamm_initPos[2]),0,molePos[2][2] - hamm_initPos[0]],-Math.PI/2,[molePos[2][0],molePos[2][1] + altezza_mole,molePos[2][2]]) ) );
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(molePos[2][0],molePos[2][1]+altezza_mole,molePos[2][2]));
        }
      } else if(keyCode == 90){ //Z
        if(c*Math.PI/2 < Math.PI/2){
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((molePos[3][0] - hamm_initPos[0])*c,(molePos[3][1] - hamm_initPos[1] + altezza_mole)*c,(molePos[3][2] - hamm_initPos[2])*c), MakeRotateArbMatrix([(molePos[3][0] - hamm_initPos[2]),0,molePos[3][2] - hamm_initPos[0]],-c*Math.PI/2,hamm_initPos));
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(hamm_initPos[0],hamm_initPos[1],hamm_initPos[2]));
        } else {
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((hamm_initPos[0] - molePos[3][0])*c/2,(hamm_initPos[1] - molePos[3][1] - altezza_mole)*c/2,(hamm_initPos[2] - molePos[3][2])*c/2) , utils.multiplyMatrices(MakeRotateArbMatrix([(molePos[3][0] - hamm_initPos[2]),0,molePos[3][2] - hamm_initPos[0]],c*Math.PI/4,[molePos[3][0],molePos[3][1] + altezza_mole,molePos[3][2]]) , MakeRotateArbMatrix([(molePos[3][0] - hamm_initPos[2]),0,molePos[3][2] - hamm_initPos[0]],-Math.PI/2,[molePos[3][0],molePos[3][1] + altezza_mole,molePos[3][2]]) ) );
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(molePos[3][0],molePos[3][1]+altezza_mole,molePos[3][2]));
        }
      } else if(keyCode == 88){ //X
        if(c*Math.PI/2 < Math.PI/2){
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((molePos[4][0] - hamm_initPos[0])*c,(molePos[4][1] - hamm_initPos[1] + altezza_mole)*c,(molePos[4][2] - hamm_initPos[2])*c), MakeRotateArbMatrix([(molePos[4][0] - hamm_initPos[2]),0,molePos[4][2] - hamm_initPos[0]],-c*Math.PI/2,hamm_initPos));
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(hamm_initPos[0],hamm_initPos[1],hamm_initPos[2]));
        } else {
          hamm_world = utils.multiplyMatrices(utils.MakeTranslateMatrix((hamm_initPos[0] - molePos[4][0])*c/2,(hamm_initPos[1] - molePos[4][1] - altezza_mole)*c/2,(hamm_initPos[2] - molePos[4][2])*c/2) , utils.multiplyMatrices(MakeRotateArbMatrix([(molePos[4][0] - hamm_initPos[2]),0,molePos[4][2] - hamm_initPos[0]],c*Math.PI/4,[molePos[4][0],molePos[4][1] + altezza_mole,molePos[4][2]]) , MakeRotateArbMatrix([(molePos[4][0] - hamm_initPos[2]),0,molePos[4][2] - hamm_initPos[0]],-Math.PI/2,[molePos[4][0],molePos[4][1] + altezza_mole,molePos[4][2]]) ) );
          worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(molePos[4][0],molePos[4][1]+altezza_mole,molePos[4][2]));
        }
      }
      c = c + 6*timeInt*0.001;
      if(c*Math.PI/2 > Math.PI){
        boolClick = 0;
      }
    } else {
      hamm_world = utils.identityMatrix();
      worldMatrix_hammer = utils.multiplyMatrices(hamm_world,utils.MakeTranslateMatrix(hamm_initPos[0],hamm_initPos[1],hamm_initPos[2]));
    }

    viewWorldMatrix_hammer = utils.multiplyMatrices(viewMatrix, worldMatrix_hammer);
    projectionMatrix_hammer = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix_hammer);
    var normalMatrix_hammer=utils.invertMatrix(utils.transposeMatrix(worldMatrix_hammer));
    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix_hammer));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textLocation, 0);
    gl.uniformMatrix4fv(nMatrixLocation, gl.FALSE, utils.transposeMatrix(normalMatrix_hammer));
    gl.uniformMatrix4fv(pMatrixLocation, gl.FALSE, utils.transposeMatrix(worldMatrix_hammer));
    gl.uniform3fv(lightDirLocation, directionalLight);
    gl.uniform4fv(lightColLocation, directionalLightColor);
    gl.uniform4fv(lightAmbientLocation, ambientLightColor);
    gl.uniform4fv(specularColorLocation, specularColor);
    gl.uniform4fv(emitColorLocation, emitColor);
    gl.uniform3fv(LPosLocation, LPos);
    gl.uniform1f(ConeOutLocation, ConOut);
    gl.uniform1f(ConeInLocation, ConIn);
    gl.uniform1f(DecayLocation, Decay);
    gl.uniform1f(TargetLocation,Target);
    gl.uniform3fv(eyePosLocation, eyePos);
    gl.uniform1f(SpecShineLocation, SpecShine);

    gl.bindVertexArray(vao_hammer);

    gl.drawElements(gl.TRIANGLES, indices_hammer.length, gl.UNSIGNED_SHORT, 0);
gl.useProgram(program);
    //DRAW MOLES
    for(let i = 0; i<5; i++){
      if(Math.random()*20000<10){
        boolTalpa[i] = 1;
      }
  
      if(boolTalpa[i]){
        if(m[i]*altezza_mole/2<altezza_mole/2){
          mole_world = utils.MakeTranslateMatrix(0,m[i]*altezza_mole/2,0);
        } else {
          mole_world = utils.multiplyMatrices(utils.MakeTranslateMatrix(0,-m[i]*altezza_mole/2,0),utils.MakeTranslateMatrix(0,altezza_mole,0));
        }
        m[i] = m[i] + 2*timeInt*0.001;
        if(m[i]*altezza_mole/2 > altezza_mole){
          bool_hit[i] = 0;
          boolTalpa[i] = 0;
          m[i]=0;
        }
      } else {
        mole_world = m4.identity();
      }

      worldMatrix_mole = utils.multiplyMatrices(mole_world,utils.MakeTranslateMatrix(molePos[i][0],molePos[i][1],molePos[i][2]))
      viewWorldMatrix_mole = utils.multiplyMatrices(viewMatrix, worldMatrix_mole);
      projectionMatrix_mole = utils.multiplyMatrices(perspectiveMatrix, viewWorldMatrix_mole);
      var normalMatrix_mole=utils.invertMatrix(utils.transposeMatrix(worldMatrix_mole));
      gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix_mole));

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(textLocation, 0);
      gl.uniformMatrix4fv(nMatrixLocation, gl.FALSE, utils.transposeMatrix(normalMatrix_mole));
      gl.uniformMatrix4fv(pMatrixLocation, gl.FALSE, utils.transposeMatrix(worldMatrix_mole));
      gl.uniform3fv(lightDirLocation, directionalLight);
      gl.uniform4fv(lightColLocation, directionalLightColor);
      gl.uniform4fv(lightAmbientLocation, ambientLightColor);
      gl.uniform4fv(specularColorLocation, specularColor);
      gl.uniform4fv(emitColorLocation, emitColor);
      gl.uniform3fv(LPosLocation, LPos);
      gl.uniform1f(ConeOutLocation, ConOut);
      gl.uniform1f(ConeInLocation, ConIn);
      gl.uniform1f(DecayLocation, Decay);
      gl.uniform1f(TargetLocation,Target);
      gl.uniform3fv(eyePosLocation, eyePos);
      gl.uniform1f(SpecShineLocation, SpecShine);
      gl.bindVertexArray(vao_mole);

      gl.drawElements(gl.TRIANGLES, indices_mole.length, gl.UNSIGNED_SHORT, 0);

      if(boolTalpa[i] && boolClick){
        if((i==0 && keyCode == 65) || (i==1 && keyCode == 83) || (i==2 && keyCode == 68) || (i==3 && keyCode == 90) || (i==4 && keyCode == 88)){
          if(c>1 && bool_hit[i] == 0){
            score = score + 1;
            bool_hit[i] = 1;
          }
        }
      }
    }

    time = time+timeInt;

    document.getElementById("score_value").innerHTML = score;
    document.getElementById("time_value").innerHTML = Math.round(((duration - time*0.001)+Number.EPSILON)*10)/ 10;
    if(time*0.001 > duration){
      clearInterval(refreshID);
      swal({
        title: "Hai totalizzato "+score.toString()+" punti",
        confirmButtonText: 'Play Again',
      }).then((value) => {
        location.reload();
      });
    }
  }
  var refreshID = setInterval(drawScene,timeInt);

}  

window.onload = main;

//random functions

function MakeRotateArbMatrix(axis,a,point){
  if(!point){
    point = [0,0,0];
  }
  var alpha_R1 = a;
	var beta_R1 = (Math.atan(axis[0]/axis[2]));
	var gamma_R1 = (Math.atan(axis[1]/Math.sqrt(axis[0]**2 + axis[2]**2)));
  var T_R1 = [1.0,		0.0,		0.0,		point[0],
              0.0,		1.0,		0.0,		point[1],
              0.0,		0.0,		1.0,		point[2],
              0.0,		0.0,		0.0,		1.0];
	var Ry_R1 =[Math.cos(beta_R1),		0.0,		Math.sin(beta_R1),		0.0,
			   0.0,		1.0,		0.0,		0.0,
			   -Math.sin(beta_R1),		0.0,		Math.cos(beta_R1),		0.0,
			   0.0,		0.0,		0.0,		1.0];
	var Rz_R1 =[Math.cos(gamma_R1),		-Math.sin(gamma_R1),		0.0,		0.0,
				Math.sin(gamma_R1),		Math.cos(gamma_R1),		0.0,		0.0,
			   0,		0.0,		1,		0.0,
			   0.0,		0.0,		0.0,		1.0];
	var Rx_R1 =[1.0,		0.0,		0.0,		0.0,
			   0.0,		Math.cos(alpha_R1),		-Math.sin(alpha_R1),		0.0,
			   0.0,		Math.sin(alpha_R1),		Math.cos(alpha_R1),		0.0,
			   0.0,		0.0,		0.0,		1.0];
  var R1 = utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(utils.multiplyMatrices(T_R1,Ry_R1),Rz_R1),Rx_R1),utils.invertMatrix(Rz_R1)),utils.invertMatrix(Ry_R1)),utils.invertMatrix(T_R1));
	return R1;
}
