var gl;
var shaderProgram;
var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;
var mMatrix = mat4.create();
var mMatrixPilha = [];
var pMatrix = mat4.create();
var vMatrix = mat4.create();
var rPyramid = 0;
var rCube= 0;
var last = 0;

$(function(){
    startWebGL();
})

function startWebGL(){
    var canvas = $('#canvas-webgl')[0];
    startGL(canvas);
    startShaders();
    startBuffers();
    startAmbient();
    repeat();
}

function startGL(canvas){
    try{
	    gl = canvas.getContext("webgl")
	    gl.viewportWidth = canvas.width;
	    gl.viewportHeight = canvas.height;
    }
    catch(e){
	    if(!gl)
	    alert("Não pode inicializar WebGL, desculpe");
    }
}

function startShaders(){
    var vertexShader = getShader(gl, "#shader-vs");
    var fragmentShader = getShader(gl, "#shader-fs");
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
	    alert("Não pode inicializar shaders");
    }
    gl.useProgram(shaderProgram);
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram,"uPMatrix");
    shaderProgram.vMatrixUniform = gl.getUniformLocation(shaderProgram,"uVMatrix");
    shaderProgram.mMatrixUniform = gl.getUniformLocation(shaderProgram,"uMMatrix");
}

function getShader(gl, id){
    var shaderScript = $(id)[0];
    if(!shaderScript){
	    return null;
    }
    var str = "";
    var k = shaderScript.firstChild;
    while(k){
	    if(k.nodeType == 3)
	    str += k.textContent;
	    k = k.nextSibling;
    }
    var shader;
    if(shaderScript.type == "x-shader/x-fragment"){
	    shader = gl.createShader(gl.FRAGMENT_SHADER);
    }
    else if(shaderScript.type == "x-shader/x-vertex"){
	    shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else{
	    return null;
    }
    gl.shaderSource(shader, str);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
	    alert(gl.getShaderInfoLog(shader));
	    return null;
    }
    return shader;
}

function startBuffers(){
    pyramidVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    var vertices = [
	    // Frente
        0.0,  1.0,  0.0,
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        // Direita
        0.0,  1.0,  0.0,
        1.0, -1.0,  1.0,
        1.0, -1.0, -1.0,
        // Trás
        0.0,  1.0,  0.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,
        // Esquerda
        0.0,  1.0,  0.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pyramidVertexPositionBuffer.itemSize = 3;
    pyramidVertexPositionBuffer.numItems = 12;

    pyramidVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    var cores = [
        [0.6, 0.0, 0.0, 1.0],     // Frente
        [0.4, 0.0, 0.0, 1.0],     // Direita
        [0.2, 0.0, 0.0, 1.0],     // Trás
        [0.4, 0.0, 0.0, 1.0]];   // Esquerda
    var coresReplicadas = [];
    for (var i in cores) {
        var cor = cores[i];
        for (var j=0; j < 3; j++) {
            coresReplicadas = coresReplicadas.concat(cor);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coresReplicadas), gl.STATIC_DRAW);
    pyramidVertexColorBuffer.itemSize = 4;
    pyramidVertexColorBuffer.numItems = 12;

    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    vertices = [
        // Frente
        -1.0, -1.0,  1.0,
        1.0, -1.0,  1.0,
        1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        // Trás
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0, -1.0, -1.0,
        // Topo
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
        1.0,  1.0,  1.0,
        1.0,  1.0, -1.0,
        // Base
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0,  1.0,
        -1.0, -1.0,  1.0,
        // Direita
        1.0, -1.0, -1.0,
        1.0,  1.0, -1.0,
        1.0,  1.0,  1.0,
        1.0, -1.0,  1.0,
        // Esquerda
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
        -1.0,  1.0,  1.0,
        -1.0,  1.0, -1.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    cores = [
        [1.0, 1.0, 0.0, 1.0],     // Frente
        [0.5, 0.5, 0.0, 1.0],     // Trás
        [0.0, 0.0, 0.0, 1.0],     // Topo
        [0.0, 0.0, 0.0, 1.0],     // Base
        [0.8, 0.8, 0.0, 1.0],     // Direita
        [0.8, 0.8, 0.0, 1.0]];    // Esquerda
    coresReplicadas = [];
    for (var i in cores) {
        var cor = cores[i];
        for (var j=0; j < 4; j++) {
            coresReplicadas = coresReplicadas.concat(cor);
        }
      }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coresReplicadas), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    var indices = [
        0, 1, 2,      0, 2, 3,    // Frente
        4, 5, 6,      4, 6, 7,    // Trás
        8, 9, 10,     8, 10, 11,  // Topo
        12, 13, 14,   12, 14, 15, // Base
        16, 17, 18,   16, 18, 19, // Direita
        20, 21, 22,   20, 22, 23]  // Esquerda
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    cubeVertexIndexBuffer.itemSize = 1;
    cubeVertexIndexBuffer.numItems = 36;
}

function startAmbient(){
    gl.clearColor(0.68, 0.85, 0.90, 1.0);
    gl.enable(gl.DEPTH_TEST);
}

function drawScene(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
    mat4.identity(mMatrix);
    mat4.identity(vMatrix);
    // Desenhando Triângulo
    mat4.translate(mMatrix, [0.0, 1.0, -7.0]);
    mPushMatrix();
    mat4.rotate(mMatrix, degToRad(rPyramid), [0, 1, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
    mPopMatrix();
    // Desenhando o Quadrado
    mat4.translate(mMatrix, [0.0, -2.0, 0.0]);
    mPushMatrix();
    mat4.rotate(mMatrix, degToRad(rCube), [0, 1, 0]);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT,0);
    mPopMatrix();
}

function setMatrixUniforms(){
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.vMatrixUniform, false, vMatrix);
    gl.uniformMatrix4fv(shaderProgram.mMatrixUniform, false, mMatrix);
}

function repeat(){
    requestAnimFrame(repeat);
    drawScene();
    animate();
}

function animate(){
    var now = new Date().getTime();
    if(last != 0)
    {
      var diferenca = now - last;
      rPyramid  += ((100*diferenca)/1000.0) % 360.0;
      rCube += -((100*diferenca)/1000.0) % 360.0;
    }
    last = now;
}

function mPushMatrix(){
    var copy = mat4.create();
    mat4.set(mMatrix, copy);
    mMatrixPilha.push(copy);

}

function mPopMatrix(){
    if (mMatrixPilha.length == 0) {
        throw "inválido popMatrix!";
    }
    mMatrix = mMatrixPilha.pop();
}

function degToRad(graus){
    return graus * Math.PI / 180;
}