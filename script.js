////////////////////////////////////////////////////////////////////////
// A simple WebGL program to draw simple 2D shapes.
//

var gl;
var color;
var matrixStack = [];

var type = 0;
var col = 0;
function triangle(){type=0;}
function points(){type=1;}
function line(){type=2;}
function light_mode(){col=0} 
function dark_mode(){col=1;}

// mMatrix is called the model matrix, transforms objects
// from local object space to world space.
var mMatrix = mat4.create();
var uMMatrixLocation;

var circleBuf;
var circleIndexBuf;

var sqVertexPositionBuffer;
var sqVertexIndexBuffer;

var aPositionLocation;
var uColorLoc;

const vertexShaderCode = `#version 300 es
in vec2 aPosition;
uniform mat4 uMMatrix;

void main() {
  gl_Position = uMMatrix*vec4(aPosition,0.0,1.0);
  gl_PointSize = 3.0;
}`;

const fragShaderCode = `#version 300 es
precision mediump float;
out vec4 fragColor;

uniform vec4 color;

void main() {
  fragColor = color;
}`;

function pushMatrix() {
  //necessary because javascript only does shallow push
  var copy = mat4.create(mMatrix);
  matrixStack.push(copy);
}

function popMatrix() {
  if (matrixStack.length > 0) return matrixStack.pop();
  else console.log("stack has no matrix to pop!");
}

function degToRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function vertexShaderSetup(vertexShaderCode) {
  shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(shader, vertexShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function fragmentShaderSetup(fragShaderCode) {
  shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(shader, fragShaderCode);
  gl.compileShader(shader);
  // Error check whether the shader is compiled correctly
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function initShaders() {
  shaderProgram = gl.createProgram();

  var vertexShader = vertexShaderSetup(vertexShaderCode);
  var fragmentShader = fragmentShaderSetup(fragShaderCode);

  // attach the shaders
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  //link the shader program
  gl.linkProgram(shaderProgram);

  // check for compilation and linking status
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  //finally use the program.
  gl.useProgram(shaderProgram);

  return shaderProgram;
}

function initGL(canvas) {
  try {
    gl = canvas.getContext("webgl2"); // the graphics webgl2 context
    gl.viewportWidth = canvas.width; // the width of the canvas
    gl.viewportHeight = canvas.height; // the height
  } catch (e) {}
  if (!gl) {
    alert("WebGL initialization failed");
  }
}

function initSquareBuffer() {
  // buffer for point locations
  const sqVertices = new Float32Array([
    0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5,
  ]);
  sqVertexPositionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sqVertices, gl.STATIC_DRAW);
  sqVertexPositionBuffer.itemSize = 2;
  sqVertexPositionBuffer.numItems = 4;

  // buffer for point indices
  const sqIndices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  sqVertexIndexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sqIndices, gl.STATIC_DRAW);
  sqVertexIndexBuffer.itemsize = 1;
  sqVertexIndexBuffer.numItems = 6;
}

function drawSquare(color, mMatrix) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // buffer for point locations
  gl.bindBuffer(gl.ARRAY_BUFFER, sqVertexPositionBuffer);
  gl.vertexAttribPointer(
    aPositionLocation,
    sqVertexPositionBuffer.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // buffer for point indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sqVertexIndexBuffer);

  gl.uniform4fv(uColorLoc, color);

  // now draw the square
  if(type==0){gl.drawElements(
    gl.TRIANGLES,
    sqVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  )};
  if(type==1){gl.drawElements(
    gl.POINTS,
    sqVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  )};
  if(type==2){gl.drawElements(
    gl.LINE_LOOP,
    sqVertexIndexBuffer.numItems,
    gl.UNSIGNED_SHORT,
    0
  )};
}

function initTriangleBuffer() {
  // buffer for point locations
  const triangleVertices = new Float32Array([0.0, 0.5, -0.5, -0.5, 0.5, -0.5]);
  triangleBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
  gl.bufferData(gl.ARRAY_BUFFER, triangleVertices, gl.STATIC_DRAW);
  triangleBuf.itemSize = 2;
  triangleBuf.numItems = 3;

  // buffer for point indices
  const triangleIndices = new Uint16Array([0, 1, 2]);
  triangleIndexBuf = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuf);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, triangleIndices, gl.STATIC_DRAW);
  triangleIndexBuf.itemsize = 1;
  triangleIndexBuf.numItems = 3;
}

function drawTriangle(color, mMatrix) {
  gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

  // buffer for point locations
  gl.bindBuffer(gl.ARRAY_BUFFER, triangleBuf);
  gl.vertexAttribPointer(
    aPositionLocation,
    triangleBuf.itemSize,
    gl.FLOAT,
    false,
    0,
    0
  );

  // buffer for point indices
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleIndexBuf);

  gl.uniform4fv(uColorLoc, color);

  // now draw the triangle
  if(type==0){gl.drawElements(
    gl.TRIANGLES,
    triangleIndexBuf.numItems,
    gl.UNSIGNED_SHORT,
    0
  )};
  if(type==1){gl.drawElements(
    gl.POINTS,
    triangleIndexBuf.numItems,
    gl.UNSIGNED_SHORT,
    0
  )}
  if(type==2){gl.drawElements(
    gl.LINE_LOOP,
    triangleIndexBuf.numItems,
    gl.UNSIGNED_SHORT,
    0
  )}
}

function initCircleBuffer(){
    // buffer for point locations
    var circleVertices = [];
    var res = 100;
    var angle = 360 / res;
    for (var i = 0; i <= res; i++) {
        var j = angle*i * (Math.PI / 180);
        circleVertices.push(Math.cos(j), Math.sin(j));
    }
    circleBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(circleVertices), gl.STATIC_DRAW);
    circleBuf.itemSize = 2;
    circleBuf.numItems = res+2;
}

function drawCircle(color, mMatrix){
    gl.uniformMatrix4fv(uMMatrixLocation, false, mMatrix);

    // buffer for point locations
    gl.bindBuffer(gl.ARRAY_BUFFER, circleBuf);
    gl.vertexAttribPointer(
        aPositionLocation,
        circleBuf.itemSize,
        gl.FLOAT,
        false,
        0,
        0
    );

    gl.uniform4fv(uColorLoc, color);

    // now draw the circle
    if(type==0){gl.drawArrays(gl.TRIANGLE_FAN, 0, circleBuf.numItems)};
    if(type==1){gl.drawArrays(gl.POINTS, 0, circleBuf.numItems)};
    if(type==2){gl.drawArrays(gl.LINE_LOOP, 0, circleBuf.numItems)};

    }

function pahad(){
    pushMatrix()
    // mat4.rotate(mMatrix, degToRad(5), [0, 0, 1])
    mat4.translate(mMatrix, [-0.0399, 0.097, 0.0])
    mat4.scale(mMatrix, [1.5, 0.4, 0.0])
    color=[0.4, 0.2, 0.1, 0.8]
    drawTriangle(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.rotate(mMatrix, degToRad(8), [0, 0, 1])
    mat4.translate(mMatrix, [-0.0, 0.1, 0.0])
    mat4.scale(mMatrix, [1.4, 0.4, 0.0])
    color=[0.6, 0.3, 0.1, 0.7]
    drawTriangle(color, mMatrix)
    mMatrix=popMatrix()
}

function baadal(){
    pushMatrix()
    mat4.translate(mMatrix, [-0.2, 0.06, 0.0])
    mat4.scale(mMatrix, [0.22, 0.13, 0.0])
    color=[0, 0, 0, 0.3]
    drawCircle(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.scale(mMatrix, [0.15, 0.1, 0.0])
    color=[1.0, 1.0, 1.0, 1.0]
    drawCircle(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [0.2, 0.005, 0.0])
    mat4.scale(mMatrix, [0.11, 0.07, 0.0])
    color=[0, 0, 0, 0.3]
    drawCircle(color, mMatrix)
    mMatrix=popMatrix()

}
function ghar(){
    //kamra
    pushMatrix()
    mat4.scale(mMatrix, [0.5, 0.28, 0.0])
    color=[1,1,1,1]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()

    //chhat
    {pushMatrix()
    mat4.translate(mMatrix, [0, 0.2, 0.0])
    mat4.scale(mMatrix, [0.45, 0.25, 0.0])
    color = [0.9, 0.35, 0.1, 1.0]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [-0.227, 0.2, 0.0])
    mat4.scale(mMatrix, [0.2, 0.25, 0.0])
    color = [0.9, 0.35, 0.1, 1.0]
    drawTriangle(color, mMatrix)
    mMatrix = popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [0.227, 0.2, 0.0])
    mat4.scale(mMatrix, [0.2, 0.25, 0.0])
    color = [0.9, 0.35, 0.1, 1.0]
    drawTriangle(color, mMatrix)
    mMatrix = popMatrix()
    }
    //khidki
    {
    pushMatrix()
    mat4.translate(mMatrix, [-0.15, 0.01, 0.0])
    mat4.scale(mMatrix, [0.07, 0.07, 0.0])
    color = [0.9, 0.8, 0.2, 1.0]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [0.15, 0.01, 0.0])
    mat4.scale(mMatrix, [0.07, 0.07, 0.0])
    color = [0.9, 0.8, 0.2, 1.0]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()}

    //darwaza
    {pushMatrix()
    mat4.translate(mMatrix, [0, -0.06, 0.0])
    mat4.scale(mMatrix, [0.07, 0.16, 0.0])
    color = [0.9, 0.8, 0.2, 1.0]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    }
}

function ghaas(){
    //left wali ghaas
    pushMatrix()
    mat4.translate(mMatrix, [-0.14, -0.02, 0.0])
    mat4.scale(mMatrix, [0.088, 0.068, 0.0])
    color=[0, 0.75, 0.15, 1]
    drawCircle(color, mMatrix)
    mMatrix=popMatrix()
    //right wali ghaas
    pushMatrix()
    mat4.translate(mMatrix, [0.15, -0.03, 0.0])
    mat4.scale(mMatrix, [0.07, 0.055, 0.0])
    color=[0.1, 0.3, 0.1, 0.9]
    drawCircle(color, mMatrix)
    mat4.translate(mMatrix, [0.15, -0.03, 0.0])
    mat4.scale(mMatrix, [0.07, 0.055, 0.0])
    color=[0.5, .6, 0.5, 0.9]
    drawCircle(color, mMatrix)
    mMatrix=popMatrix()
    //beech wali ghaas
    pushMatrix()
    mat4.scale(mMatrix, [0.13, 0.09, 0.0])
    color=[0, 0.6, 0, 1.0]
    drawCircle(color, mMatrix)
    mMatrix=popMatrix()

}

function suraj(degree){
    for(i=0;i<4;i++){
        pushMatrix()
        mat4.rotate(mMatrix, degToRad(45*i + degree), [0,0,1])
        mat4.scale(mMatrix, [0.006, 0.28, 0.0])
        // color=[1,1,1,1]
        if(col == 0){color=[0,0,0,1]}
        if(col == 1){color=[1,1,1,1]}
        drawSquare(color, mMatrix)
        mMatrix=popMatrix()
        pushMatrix()
        mat4.rotate(mMatrix, degToRad(45*i + degree), [0,0,1])
        mat4.scale(mMatrix, [0.006, 0.28, 0.0])
        // color=[1,1,1,1]
        if(col == 0){color=[0,0,0,1]}
        if(col == 1){color=[1,1,1,1]}
        drawSquare(color, mMatrix)
        mMatrix=popMatrix()
    }    
    pushMatrix()
    mat4.scale(mMatrix, [0.11, 0.11, 0.0])
    color=[1,1,1,1]
    drawCircle(color,mMatrix)
    mMatrix=popMatrix()
}

function pawanchakki(chakka){
    //dandi
    pushMatrix()
    mat4.translate(mMatrix, [0.0, -0.16, 0.0])
    mat4.scale(mMatrix, [0.02, 0.3, 0.0])
    color=[0.3,0.2,0.1,1]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()

    //pankhe
    for(i=0;i<4;i++){
        pushMatrix()
        // mat4.translate(mMatrix, [-0.6, 0, 0])
        mat4.rotate(mMatrix, degToRad(90*i + chakka), [0,0,1])
        mat4.scale(mMatrix, [0.045, 0.15, 0.0])
        mat4.translate(mMatrix, [0, -0.4, 0])
        color=[0.8,0.7,0.1,0.8]
        drawTriangle(color, mMatrix)
        mMatrix=popMatrix()
    }    

    //ball
    pushMatrix()
    mat4.translate(mMatrix, [0.0, 0, 0.0])
    mat4.scale(mMatrix, [0.018, 0.018, 0.0])
    color=[0,0.1,0.1,1]
    drawCircle(color, mMatrix)
    mMatrix=popMatrix()


}

function tara(){
    pushMatrix()
    mat4.translate(mMatrix, [0, 0, 0.0])
    mat4.rotate(mMatrix, degToRad(45), [0,0,1])
    mat4.scale(mMatrix, [0.38, 0.38, 0.0])
    color=[1,1,1,1]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    for(i=0;i<4;i++){
        pushMatrix()
        // mat4.translate(mMatrix, [-0.6, 0, 0])
        mat4.rotate(mMatrix, degToRad(90*i+45), [0,0,1])
        mat4.scale(mMatrix, [0.4, 0.15, 0.0])
        mat4.translate(mMatrix, [0, -0.799, 0])
        if(col == 0){color=[0,0,0,1]}
        if(col == 1){color=[0.9,0.9,0.99,1]}
        drawTriangle(color, mMatrix)
        mMatrix=popMatrix()
    }    
}

function naav(rang){
    //base
    {pushMatrix()
        mat4.translate(mMatrix, [0, 0.195, 0.0])
        mat4.scale(mMatrix, [0.25, 0.06, 0.0])
        color = [1, 1, 1, 1.0]
        drawSquare(color, mMatrix)
        mMatrix=popMatrix()
        pushMatrix()
        mat4.translate(mMatrix, [-0.127, 0.195, 0.0])
        mat4.scale(mMatrix, [0.1, -0.06, 0.0])
        color = [1, 1, 1, 1.0]
        drawTriangle(color, mMatrix)
        mMatrix = popMatrix()
        pushMatrix()
        mat4.translate(mMatrix, [0.127, 0.195, 0.0])
        mat4.scale(mMatrix, [0.1, -0.06, 0.0])
        color = [1, 1, 1, 1.0]
        drawTriangle(color, mMatrix)
        mMatrix = popMatrix()
        }

    //pole
    {pushMatrix()
    mat4.translate(mMatrix, [0.0, 0.375, 0.0])
    mat4.scale(mMatrix, [0.013, 0.3, 0.0])
    color=[0.3,0.2,0.1,1]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [-0.07, 0.36, 0.0])
    mat4.rotate(mMatrix, degToRad(-25), [0,0,1])
    mat4.scale(mMatrix, [0.006, 0.3, 0.0])
    color=[0.3,0.2,0.1,1]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    }
    //jhanda
    {pushMatrix()
        mat4.translate(mMatrix, [0.105, 0.38, 0.0])
        mat4.scale(mMatrix, [0.2, 0.25, 0.0])
        mat4.rotate(mMatrix, degToRad(-90), [0,0,1])
        drawTriangle(rang, mMatrix)
        mMatrix=popMatrix()
    }
}

function badi_naav(pos){
    //naav#1
    pushMatrix()
    mat4.translate(mMatrix, [pos, -0.3, 0.0])
    mat4.scale(mMatrix, [1, 1, 0.0])
    color=[0.9,0.2,0.1,1]
    naav(color)
    mMatrix=popMatrix()

}

function choti_naav(pos){
    //naav#1
    pushMatrix()
    mat4.translate(mMatrix, [pos, -0.15, 0.0])
    mat4.scale(mMatrix, [0.5, 0.5, 0.0])
    color=[0.3, 0.1, 0.6, 0.88]
    naav(color)
    mMatrix=popMatrix()

}

function ped(){
    pushMatrix()
    mat4.translate(mMatrix, [0, -0.15, 0.0])
    mat4.scale(mMatrix, [.04, .38, 0.0])
    color=[0.4,0.25,0.09,1]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [0, 0.12, 0.0])
    mat4.scale(mMatrix, [.3, .25, 0.0])
    color=[0.1,0.45,0.15,1]
    drawTriangle(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [0, 0.168, 0.0])
    mat4.scale(mMatrix, [.33, .26, 0.0])
    color=[0.2,0.55,0.25,1]
    drawTriangle(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [0, 0.22, 0.0])
    mat4.scale(mMatrix, [.37, .28, 0.0])
    color=[0.45,0.85,0.25,1]
    drawTriangle(color, mMatrix)
    mMatrix=popMatrix()
}

function gaadi(){
    //roof
    {pushMatrix()
        mat4.translate(mMatrix, [0.0, 0.26, 0.0])
        mat4.scale(mMatrix, [0.16, 0.1, 0.0])
        color=[0,0,1,1]
        drawCircle(color,mMatrix)
        mMatrix=popMatrix()
    }
    //khidki
    {pushMatrix()
        mat4.translate(mMatrix, [0, 0.27, 0.0])
        mat4.scale(mMatrix, [0.19, 0.09, 0.0])
        color = [0.8, 0.8, 0.8, 1]
        drawSquare(color, mMatrix)
        mMatrix=popMatrix()
        
    }
    //pahiya
    {pushMatrix()
        mat4.translate(mMatrix, [-0.1, 0.12, 0.0])
        mat4.scale(mMatrix, [0.045, 0.045, 0.0])
        color=[0,0,0,1]
        drawCircle(color,mMatrix)
        mMatrix=popMatrix()
        pushMatrix()
        mat4.translate(mMatrix, [-0.1, 0.12, 0.0])
        mat4.scale(mMatrix, [0.035, 0.035, 0.0])
        color=[0.8,0.8,0.8,1]
        drawCircle(color,mMatrix)
        mMatrix=popMatrix()
        pushMatrix()
        mat4.translate(mMatrix, [0.1, 0.12, 0.0])
        mat4.scale(mMatrix, [0.045, 0.045, 0.0])
        color=[0,0,0,1]
        drawCircle(color,mMatrix)
        mMatrix=popMatrix()
        pushMatrix()
        mat4.translate(mMatrix, [0.1, 0.12, 0.0])
        mat4.scale(mMatrix, [0.035, 0.035, 0.0])
        color=[0.8,0.8,0.8,1]
        drawCircle(color,mMatrix)
        mMatrix=popMatrix()
    }
    //chassis
    {pushMatrix()
        mat4.translate(mMatrix, [0, 0.2, 0.0])
        mat4.scale(mMatrix, [0.38, 0.1, 0.0])
        color = [0.2, 0.35, 0.9, 0.95]
        drawSquare(color, mMatrix)
        mMatrix=popMatrix()
        pushMatrix()
        mat4.translate(mMatrix, [-0.189, 0.2, 0.0])
        mat4.scale(mMatrix, [0.1, 0.1, 0.0])
        color = [0.2, 0.35, 0.9, 0.95]
        drawTriangle(color, mMatrix)
        mMatrix = popMatrix()
        pushMatrix()
        mat4.translate(mMatrix, [0.189, 0.2, 0.0])
        mat4.scale(mMatrix, [0.1, 0.1, 0.0])
        color = [0.2, 0.35, 0.9, 0.95]
        drawTriangle(color, mMatrix)
        mMatrix = popMatrix()
    }


}

function drawStatic(){
    //pahaad banaao
    {pushMatrix()
    mat4.translate(mMatrix, [0.8, -0.13, 0.0])
    pahad()
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [-0.65, -0.08, 0.0])
    pahad()
    mMatrix=popMatrix()
    pushMatrix()
    pahad()
    mMatrix=popMatrix()
    }

    //ped banaao
    //left ped
    {
        {
    pushMatrix()
    mat4.translate(mMatrix, [0.8, 0.26, 0.0])
    mat4.scale(mMatrix, [1.1, 0.95, 0.0])
    ped()
    mMatrix=popMatrix()
    }
    //beech wala ped
    {
        pushMatrix()
        mat4.translate(mMatrix, [0.5, 0.3, 0.0])
        mat4.scale(mMatrix, [1.2, 1.05, 0.0])
        ped()
        mMatrix=popMatrix()
    }
    //right ped
    {
        pushMatrix()
        mat4.translate(mMatrix, [0.22, 0.24, 0.0])
        mat4.scale(mMatrix, [0.9, 0.75, 0.0])
        ped()
        mMatrix=popMatrix()
    }
    }

    //horizon bnaao
    {pushMatrix()
    mat4.translate(mMatrix, [0.0 , -0.5, 0.0])
    mat4.scale(mMatrix, [2.0, 1.0, 0.0])
    color=[0.4, 0.8, 0.5, 1.0]
    drawSquare(color,mMatrix)
    mMatrix=popMatrix()
    }

    //draw sadak
    {pushMatrix()
    mat4.scale(mMatrix, [0.9, 0.8, 0.0])
    mat4.rotate(mMatrix, degToRad(40), [0.0, 0.0, 1.0])
    mat4.scale(mMatrix, [1.9, 1.8, 0.0])
    mat4.translate(mMatrix, [-0.15, -0.45, 0.0])
    color=[0.45 , 0.65, 0.2, 1]
    drawTriangle(color, mMatrix)
    mMatrix=popMatrix()}

    //draw nadi
    {pushMatrix()
    mat4.translate(mMatrix, [0.0, -0.12, 0.0])
    mat4.scale(mMatrix, [2.0, 0.2, 0.0])
    color=[0.0, 0.0, 0.8, 0.7]
    drawSquare(color, mMatrix)
    mMatrix= popMatrix()
    // nadi ki lines
    pushMatrix()
    mat4.translate(mMatrix, [-0.6, -0.15, 0.0])
    mat4.scale(mMatrix, [0.4, 0.005, 0.0])
    color=[0.9, 0.9, 0.9, 1.0]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [0.05, -0.08, 0.0])
    mat4.scale(mMatrix, [0.4, 0.005, 0.0])
    color=[0.9, 0.9, 0.9, 1.0]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [0.6, -0.2, 0.0])
    mat4.scale(mMatrix, [0.4, 0.005, 0.0])
    color=[0.9, 0.9, 0.9, 1.0]
    drawSquare(color, mMatrix)
    mMatrix=popMatrix()
    }

    //baadal banaao
    {pushMatrix()
    mat4.scale(mMatrix, [1.0, 0.9, 0.0])
    mat4.translate(mMatrix, [-0.65 , 0.58, 0.0])
    baadal()
    mMatrix=popMatrix()
    }

    //ghaas banaao
    {pushMatrix()
    mat4.translate(mMatrix, [-0.9, -0.56, 0.0])
    mat4.scale(mMatrix, [0.7, 0.65, 0.0])
    ghaas()
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [-0.25, -0.54, 0.0])
    mat4.scale(mMatrix, [0.8, 0.8, 0.0])
    ghaas()
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [-0.1, -1.01, 0.0])
    mat4.scale(mMatrix, [1.5, 1.3, 0.0])
    ghaas()
    mMatrix=popMatrix()
    pushMatrix()
    mat4.translate(mMatrix, [1.0, -0.45, 0.0])
    mat4.scale(mMatrix, [1.1, 1.1, 0.0])
    ghaas()
    mMatrix=popMatrix()
    }

    //ghar banaao
    {pushMatrix()
    mat4.translate(mMatrix, [-0.6, -0.5, 0.0])
    ghar()
    mMatrix=popMatrix()
    }

    //gaadi banaao
    {pushMatrix()
        mat4.translate(mMatrix, [-0.52, -1, 0.0])
        gaadi()
        mMatrix=popMatrix()

    }
}

function drawAnimate(suraj_speed, chakka_speed, timtim, pos, pos1){
    // suraj banaao
    {pushMatrix()
    mat4.translate(mMatrix, [-0.6, 0.8, 0.0])
    suraj(suraj_speed)
    mMatrix=popMatrix()
    }
    
    //taare banaao
    //tara#1
    {pushMatrix()
    mat4.translate(mMatrix, [-0.14, 0.64, 0.0])
    mat4.scale(mMatrix, [0.15*timtim, 0.15*timtim, 0.0])
    // color=[0.3,0.2,0.1,1]
    tara()
    mMatrix=popMatrix()
    //tara#2
    pushMatrix()
    mat4.translate(mMatrix, [-0.2, 0.52, 0.0])
    mat4.scale(mMatrix, [0.12*timtim, 0.12*timtim, 0.0])
    // color=[0.3,0.2,0.1,1]
    tara()
    mMatrix=popMatrix()
    //tara#3
    pushMatrix()
    mat4.translate(mMatrix, [-0.3, 0.75, 0.0])
    mat4.scale(mMatrix, [0.12*timtim, 0.12*timtim, 0.0])
    // color=[0.3,0.2,0.1,1]
    tara()
    mMatrix=popMatrix()
    //tara#4
    pushMatrix()
    mat4.translate(mMatrix, [0.32, 0.8, 0.0])
    mat4.scale(mMatrix, [0.2*timtim, 0.2*timtim, 0.0])
    // color=[0.3,0.2,0.1,1]
    tara()
    mMatrix=popMatrix()
    //tara#5
    pushMatrix()
    mat4.translate(mMatrix, [0.48, 0.92, 0.0])
    mat4.scale(mMatrix, [0.12*timtim, 0.12*timtim, 0.0])
    // color=[0.3,0.2,0.1,1]
    tara()
    mMatrix=popMatrix()
    }
    //naav banaao
    //naav#1
    pushMatrix()
    choti_naav(pos1)
    mMatrix=popMatrix()
    //naav#2
    pushMatrix()
    mat4.scale(mMatrix, [1, 1, 0.0])
    badi_naav(pos)
    mMatrix=popMatrix()

    //windmill banaao
    {
        pushMatrix()
        mat4.translate(mMatrix, [0.65, 0.0, 0.0])
        mat4.scale(mMatrix, [1.4, 1.4, 0.0])
        pawanchakki(chakka_speed)
        mMatrix=popMatrix()
    
        pushMatrix()
        mat4.translate(mMatrix, [0.45, 0.0, 0.0])
        mat4.scale(mMatrix, [1, 1, 0.0])
        pawanchakki(chakka_speed)
        mMatrix=popMatrix()}
    
}

////////////////////////////////////////////////////////////////////////
function drawScene() {
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  gl.clearColor(0, 0, 0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


  // initialize the model matrix to identity matrix
  mat4.identity(mMatrix);

  var degree = 0;
  var flag = 0;
  var flag1 = 0;
  var flash =0;
  var speed = -0.6;
  var speed1 = -0.3;
  var chakka = 0;
  var tim = 1;
  var din = 0 ;

  function animate(){


        if(col == 0){gl.clearColor(0, 0, 0, 1.0)};
        if(col == 1){gl.clearColor(0.9, 0.9, 0.99, 1.0)};

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
        // initialize the model matrix to identity matrix
        mat4.identity(mMatrix);
        //choti ki speed
        {
            if( speed1 >= 0.9){
                flag1 = 1;
            }
            else if( speed1 <= -0.88){
                flag1 = 0;
            }
            if(flag1 == 0){
                speed1 = speed1 + 0.005
            }
            else{
                speed1 = speed1 - 0.005
            }
        }
        //badi naav ki speed
        {
        if( speed >= 0.8){
            flag = 1;
        }
        else if( speed <= -0.78){
            flag = 0;
        }
        if(flag == 0){
            speed = speed + 0.005
        }
        else{
            speed = speed - 0.005
        }
        }

        degree = (degree + .15) % 360
        chakka = (chakka + 1) % 360

        if( tim >= 1.1){
            flash = 1;
        }
        else if( tim <= 0.6){
            flash = 0;
        }
        if(flash == 0){
            tim = tim + 0.005
        }
        else{
            tim = tim - 0.005
        }
        din =0
        drawStatic()
        if(col ==0 ){drawAnimate(degree, chakka, tim, speed,speed1)}
        if(col ==1 ){drawAnimate(degree, chakka, din, speed,speed1)}


    
        animation = window.requestAnimationFrame(animate);
  }

  animate()

//   drawStatic()
  //// This translation applies to both the objects below
  //mMatrix = mat4.translate(mMatrix, [0.0, 0.2, 0]);

}

// This is the entry point from the html
function webGLStart() {
  var canvas = document.getElementById("aryan's_canvas");
  initGL(canvas);
  shaderProgram = initShaders();

  //get locations of attributes declared in the vertex shader
  const aPositionLocation = gl.getAttribLocation(shaderProgram, "aPosition");

  uMMatrixLocation = gl.getUniformLocation(shaderProgram, "uMMatrix");

  //enable the attribute arrays
  gl.enableVertexAttribArray(aPositionLocation);

  uColorLoc = gl.getUniformLocation(shaderProgram, "color");

  initSquareBuffer();
  initTriangleBuffer();
  initCircleBuffer();
  
  drawScene();
}
