"use strict";

var canvas = document.querySelector("#canvas");
var canvasPos = getPosition(canvas);

var mouse_x = 0;
var mouse_y = 0;
var clipX;
var clipY;

document.onmousemove = function(e) {
  mouse_x = e.clientX - canvasPos.x;
  mouse_y = e.clientY - canvasPos.y;
  clipX = (mouse_x / canvas.width  *  2 - 1);
  clipY = (mouse_y / canvas.height * -2 + 1);
}

var temp = 1;

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

    const vs = `
    attribute vec4 a_position;
    attribute vec3 a_normal;

    uniform mat4 u_projection;
    uniform mat4 u_view;
    uniform mat4 u_world;

    varying vec3 v_normal;

    void main() {
        gl_Position = u_projection * u_view * u_world * a_position;
        v_normal = mat3(u_world) * a_normal;
    }
    `;

    const fs = `
    precision mediump float;

    varying vec3 v_normal;

    uniform vec4 u_diffuse;
    uniform vec3 u_lightDirection;

    void main () {
        vec3 normal = normalize(v_normal);
        float fakeLight = dot(u_lightDirection, normal) * .5 + .5;
        gl_FragColor = vec4(u_diffuse.rgb * fakeLight, u_diffuse.a);
    }
    `;


    // compiles and links the shaders, looks up attribute and uniform locations
    const meshProgramInfo = webglUtils.createProgramInfo(gl, [vs, fs]);

    const response_cabinet = await fetch('objects/cabinet.obj');  
    const text_cabinet = await response_cabinet.text();
    const data_cabinet = parseOBJ(text_cabinet);

    const response_hammer = await fetch('objects/hammer.obj');  
    const text_hammer = await response_hammer.text();
    const data_hammer = parseOBJ(text_hammer);

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

    const cameraTarget = [0, 0, 0];
    const cameraPosition = [0, 3, 3];
    const zNear = 0.1;
    const zFar = 50;

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    function render(time) {

        gl.clearColor(0.75,0.85,0.8,1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        time *= 0.001;  // convert to seconds

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

        const sharedUniforms = {
        u_lightDirection: m4.normalize([-1, 3, 5]),
        u_view: view,
        u_projection: projection,
        };

        gl.useProgram(meshProgramInfo.program);

        // calls gl.uniform
        webglUtils.setUniforms(meshProgramInfo, sharedUniforms);
        
        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo_cabinet);

        // calls gl.uniform
        webglUtils.setUniforms(meshProgramInfo, {
        //u_world: m4.yRotation(time),
        //u_world: m4.translation(mouse_x,mouse_y,0),
        u_world: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        u_diffuse: [1, 0.7, 0.5, 1],
        });

        // calls gl.drawArrays or gl.drawElements
        webglUtils.drawBufferInfo(gl, bufferInfo_cabinet);
        
        const end   = m4.transformPoint(invMat, [clipX, clipY,  0.92]);

        // calls gl.bindBuffer, gl.enableVertexAttribArray, gl.vertexAttribPointer
        webglUtils.setBuffersAndAttributes(gl, meshProgramInfo, bufferInfo_hammer);
        // calls gl.uniform
        webglUtils.setUniforms(meshProgramInfo, {
        //u_world: m4.yRotation(time),
        //u_world: m4.translation((cameraTarget[2] - cameraPosition[2])*end[0]/(end[2] + (cameraTarget[2] - cameraPosition[2])),(cameraTarget[2] - cameraPosition[2])*end[1]/(end[2] + (cameraTarget[2] - cameraPosition[2])), (cameraTarget[2] - cameraPosition[2])*end[2]/(end[2] + (cameraTarget[2] - cameraPosition[2]))),
        u_world: m4.translation(end[0],end[1],end[2]),
        //u_world: [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],
        u_diffuse: [1, 0.7, 0.5, 1],
        });

        // calls gl.drawArrays or gl.drawElements
        webglUtils.drawBufferInfo(gl, bufferInfo_hammer);


        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

main();


//FUNCTIONS

function getPosition(el) {
    var xPosition = 0;
    var yPosition = 0;
   
    while (el) {
      xPosition += (el.offsetLeft - el.scrollLeft + el.clientLeft);
      yPosition += (el.offsetTop - el.scrollTop + el.clientTop);
      el = el.offsetParent;
    }
    return {
      x: xPosition,
      y: yPosition
    };
  }  