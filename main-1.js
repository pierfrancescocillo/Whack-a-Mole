"use strict";

////

var gl;
var shaderDir;
var model_cabinet;
var model_hammer;
var model_mole;
var baseDir;

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

//var TextCoords;
var positionAttributeLocation;
var normalsAttributeLocation;
var matrixLocation;
var nMatrixLocation;
var diffColorLocation;
var lightDirLocation;
var lightColLocation;
var perspectiveMatrix;
var viewMatrix;
///

var canvas = document.querySelector("#canvas");

var keyCode;
var time = 0;
var timeInt = 1; //[ms]
var c;
var m = [0,0,0,0,0];
const hamm_initPos = [1.5,1.5,1.5];
var hamm_world;
var mole_world;

//booleani utili
var boolClick = 0;
var boolTalpa = [0,0,0,0,0];

//Assigning value to the sliders------------------------------------------------------------
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
  console.log('scià');
  if(key.keyCode == 65 || key.keyCode == 83 || key.keyCode == 68 || key.keyCode == 90 || key.keyCode == 88){
    console.log('scià');
    boolClick = 1;
    c = 0;
    keyCode = key.keyCode;
  }
}

function parseOBJ(text) {
  // because indices are base 1 let's just fill in the 0th data
  const objPositions = [[0, 0, 0]];
  const objTexcoords = [[0, 0]];
  const objNormals = [[0, 0, 0]];

  // same order as `f` indices
  const objVertexData = [
    objPositions,
    objTexcoords,
    objNormals,
  ];

  // same order as `f` indices
  let webglVertexData = [
    [],   // positions
    [],   // texcoords
    [],   // normals
  ];

  function newGeometry() {
    // If there is an existing geometry and it's
    // not empty then start a new one.
    if (geometry && geometry.data.position.length) {
      geometry = undefined;
    }
    setGeometry();
  }

  function addVertex(vert) {
    const ptn = vert.split('/');
    ptn.forEach((objIndexStr, i) => {
      if (!objIndexStr) {
        return;
      }
      const objIndex = parseInt(objIndexStr);
      const index = objIndex + (objIndex >= 0 ? 0 : objVertexData[i].length);
      webglVertexData[i].push(...objVertexData[i][index]);
    });
  }

  const keywords = {
    v(parts) {
      objPositions.push(parts.map(parseFloat));
    },
    vn(parts) {
      objNormals.push(parts.map(parseFloat));
    },
    vt(parts) {
      // should check for missing v and extra w?
      objTexcoords.push(parts.map(parseFloat));
    },
    f(parts) {
      const numTriangles = parts.length - 2;
      for (let tri = 0; tri < numTriangles; ++tri) {
        addVertex(parts[0]);
        addVertex(parts[tri + 1]);
        addVertex(parts[tri + 2]);
      }
    },
  };

  const keywordRE = /(\w*)(?: )*(.*)/;
  const lines = text.split('\n');
  for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
    const line = lines[lineNo].trim();
    if (line === '' || line.startsWith('#')) {
      continue;
    }
    const m = keywordRE.exec(line);
    if (!m) {
      continue;
    }
    const [, keyword, unparsedArgs] = m;
    const parts = line.split(/\s+/).slice(1);
    const handler = keywords[keyword];
    if (!handler) {
      console.warn('unhandled keyword:', keyword);  // eslint-disable-line no-console
      continue;
    }
    handler(parts, unparsedArgs);
  }

  return {
    position: webglVertexData[0],
    texcoord: webglVertexData[1],
    normal: webglVertexData[2],
  };
}

async function main() {
  // Get A WebGL context
  /** @type {HTMLCanvasElement} */
  var gl = canvas.getContext("webgl");
  if (!gl) {
      return;
  }

  gl.clearColor(0.75,0.85,0.8,1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.frontFace(gl.CCW);
  gl.cullFace(gl.BACK);
  //-----------------------------------
  /*
  // compiles and links the shaders, looks up attribute and uniform locations
  const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

  const response_cabinet = await fetch('objects/cabinet.obj');  
  const text_cabinet = await response_cabinet.text();
  const data_cabinet = parseOBJ(text_cabinet);

  const response_hammer = await fetch('objects/hammer.obj');  
  const text_hammer = await response_hammer.text();
  const data_hammer = parseOBJ(text_hammer);

  const response_mole = await fetch('objects/mole.obj');  
  const text_mole = await response_mole.text();
  const data_mole = parseOBJ(text_mole);

  // Because data is just named arrays like this
  //
  // {
  //   position: [...],
  //   texcoord: [...],
  //   normal: [...],
  // }
  //
  // and because those names match the attributes in our vertex
  // shader we can pass it directly into `createBufferInfoFromArrays`
  // from the article "less code more fun".

  // create a buffer for each array by calling
  // gl.createBuffer, gl.bindBuffer, gl.bufferData
  const bufferInfo_cabinet = webglUtils.createBufferInfoFromArrays(gl, data_cabinet);
  const bufferInfo_hammer = webglUtils.createBufferInfoFromArrays(gl, data_hammer);
  const bufferInfo_mole = webglUtils.createBufferInfoFromArrays(gl, data_mole);
  */
//-----------------------------------

  var path = window.location.pathname;
  var page = path.split("/").pop();
  baseDir = window.location.href.replace(page, '');
  shaderDir = baseDir+"shaders/";

  await utils.loadFiles([shaderDir + 'vs.glsl', shaderDir + 'fs.glsl'], function (shaderText) {
    var vertexShader = utils.createShader(gl, gl.VERTEX_SHADER, shaderText[0]);
    console.log(vertexShader);
    var fragmentShader = utils.createShader(gl, gl.FRAGMENT_SHADER, shaderText[1]);
    program = utils.createProgram(gl, vertexShader, fragmentShader);

  });

  gl.useProgram(program);

  model_cabinet = new OBJ.Mesh(worldObjStr_cabinet);
  model_hammer = new OBJ.Mesh(worldObjStr_hammer);
  model_mole = new OBJ.Mesh(worldObjStr_mole);

  vertices_cabinet= model_cabinet.vertices;
  normals_cabinet = model_cabinet.vertexNormals;
  indices_cabinet = model_cabinet.indices;
  uv_cabinet=model_cabinet.textures;

  vertices_hammer= model_hammer.vertices;
  normals_hammer = model_hammer.vertexNormals;
  indices_hammer = model_hammer.indices;
  uv_hammer=model_hammer.textures;

  vertices_mole= model_mole.vertices;
  normals_mole = model_mole.vertexNormals;
  indices_mole = model_mole.indices;
  uv_mole=model_mole.textures;

  positionAttributeLocation = gl.getAttribLocation(program, "a_position");  
  normalsAttributeLocation = gl.getAttribLocation(program, "a_normal");
  uvAttributeLocation=gl.getAttribLocation(program,"a_uv");
  textLocation=gl.getUniformLocation(program, "u_texture");
  matrixLocation = gl.getUniformLocation(program, "matrix");  


  vao_cabinet = gl.createVertexArray();
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


  vao_hammer = gl.createVertexArray();
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


  vao_mole = gl.createVertexArray();
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

  ///////
  const cameraTarget = [0, 0, 0];
  var cameraPosition = [0, 3, 3];
  const zNear = 0.1;
  const zFar = 50;

  const molePos = [
    [-0.63,0.4,0.21],
    [0,0.4,0.21],
    [0.63,0.4,0.21],
    [-0.3,0.4,0.65],
    [0.3,0.4,0.65]
  ];

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function render() {

    cameraPosition = [
      cameraTarget[0] + document.getElementById("sl_rho").value * Math.cos(degToRad(document.getElementById("sl_theta").value)) * Math.sin(degToRad(document.getElementById("sl_phi").value)),
      cameraTarget[1] + document.getElementById("sl_rho").value * Math.sin(degToRad(document.getElementById("sl_theta").value)),
      cameraTarget[2] + document.getElementById("sl_rho").value * Math.cos(degToRad(document.getElementById("sl_theta").value)) * Math.cos(degToRad(document.getElementById("sl_phi").value))
    ]

    gl.clearColor(0.75,0.85,0.8,1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);

    time = time + timeInt*0.001;  // [s]
    //console.log(time);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    const fieldOfViewRadians = degToRad(60);
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const projection = m4.perspective(fieldOfViewRadians, aspect, zNear, zFar);

    const up = [0, 1, 0];
    // Compute the camera's matrix using look at.
    const camera = m4.lookAt(cameraPosition, cameraTarget, up);

    // Make a view matrix from the camera matrix.
    const view = m4.inverse(camera);

    const viewProjection = m4.multiply(projection, view);
    const invMat = m4.inverse(viewProjection);


    //CABINET
    worldMatrix = m4.identity();
    viewWorldMatrix = utils.multiplyMatrices(view, worldMatrix);
    projectionMatrix = utils.multiplyMatrices(projection, viewWorldMatrix);

    gl.uniformMatrix4fv(matrixLocation, gl.FALSE, utils.transposeMatrix(projectionMatrix));

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(textLocation, 0);

    gl.bindVertexArray(vao);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    //HAMMER
/*
    if(boolClick != 0){
      if(keyCode == 65){ //A
        if(c*Math.PI/2 < Math.PI/2){
          //hamm_world = utils.multiplyMatrices(utils.multiplyMatrices(m4.translation(0,1,0), m4.xRotation(-c*Math.PI/2)), m4.translation(0,-1,0));
          hamm_world = utils.multiplyMatrices(m4.axisRotation([-(molePos[0][2] - hamm_initPos[2]),0,molePos[0][0] - hamm_initPos[0]],-c*Math.PI/2),m4.translation((molePos[0][0] - hamm_initPos[0])*c,(molePos[0][1] - hamm_initPos[1] + 0.8)*c,(molePos[0][2] - hamm_initPos[2])*c));
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
      c = c + time*0.001;
      if(c*Math.PI/2 > Math.PI){
        boolClick = 0;
      }
    } else {
      hamm_world = m4.identity();
    }

    // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
    webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo_hammer);
    // calls gl.uniform
    webglUtils.setUniforms(meshProgramInfo, {
    //u_world: m4.yRotation(time),
    //u_world: m4.translation(end[0],end[1],end[2]),
    //u_world: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
    u_world: utils.multiplyMatrices(hamm_world, m4.translation(hamm_initPos[0],hamm_initPos[1],hamm_initPos[2])),
    u_diffuse: [1, 0.7, 0.5, 1],
    });

    // calls gl.drawArrays or gl.drawElements
    webglUtils.drawBufferInfo(gl, bufferInfo_hammer);

    //MOLE
    for(let i = 0; i<5; i++){
      if(Math.random()*20000<10){
        boolTalpa[i] = 1;
      }
  
      if(boolTalpa[i]){
        if(m[i]*0.4<0.4){
          mole_world = m4.translation(0,m[i]*0.4,0);
        } else {
          mole_world = utils.multiplyMatrices(m4.translation(0,-m[i]*0.4,0),m4.translation(0,0.8,0));
        }
        m[i] = m[i] + time*0.001;
        if(m[i]*0.4 > 0.8){
          boolTalpa[i] = 0;
          m[i]=0;
        }
      } else {
        mole_world = m4.identity();
      }
      // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
      webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo_mole);
      // calls gl.uniform
      webglUtils.setUniforms(meshProgramInfo, {
      u_world: utils.multiplyMatrices(mole_world,m4.translation(molePos[i][0],molePos[i][1],molePos[i][2])),
      //u_world: m4.identity(),
      u_diffuse: [1, 0.7, 0.5, 1],
      });
      // calls gl.drawArrays or gl.drawElements
      webglUtils.drawBufferInfo(gl, bufferInfo_mole);
    }
    */

  }
  setInterval(render,timeInt);
}

main();
