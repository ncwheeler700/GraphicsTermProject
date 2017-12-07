
var gl;

const LINES = 1, TRIANGLES = 4
const renderMode = TRIANGLES
const width = height = 11
const spacing = 2
const startpos = vec3(-height*spacing/2,width*spacing/2,0)

window.onload = function init()
{
  var canvas = document.getElementById( "gl-canvas" );

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  //
  //  Configure WebGL
  //
  gl.viewport( 0, 0, canvas.width, canvas.height);
  gl.clearColor( 0, 0, 0, 1.0 );
  gl.enable(gl.DEPTH_TEST);
  gl.clear(gl.DEPTH_BUFFER_BIT);
  gl.depthFunc(gl.LESS);

  //  Load shaders and initialize attribute buffers

  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  // Load the data into the GPU

  var vertices,indices,mesh;
  mesh = new Mesh(startpos,height,width,spacing,renderMode)

  vertices = mesh.positions
  indices = mesh.indices

  var vertBuffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, new Float32Array(flatten(vertices)), gl.DYNAMIC_DRAW );

  var indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.DYNAMIC_DRAW);

  var vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(renderMode,indices.length,gl.UNSIGNED_SHORT,indexBuffer)

  var animate = function() {
    window.requestAnimationFrame(animate)
    for (var i=0;i<20;i++) {
      mesh.nextStep();
    }
    refresh(mesh,indexBuffer)
  }
  animate()

}



refresh = function(mesh,indexBuffer) {
    gl.clear(gl.COLOR_BUFFER_BIT);
    vertices = mesh.positions
    indices = mesh.indices

    // Associate out shader variables with our data buffer
    gl.bufferData( gl.ARRAY_BUFFER,new Float32Array(flatten(vertices)),gl.DYNAMIC_DRAW);
    gl.drawElements(renderMode,indices.length,gl.UNSIGNED_SHORT,indexBuffer)

};


// render = function(mesh,indexBuffer)
