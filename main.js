
var gl;
const renderMode = "WIRE"

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    var width, height, x_spacing, y_spacing
    width = height = 17

    var vertices,indices;
    vertices = setupMesh(vec4(-1.5,1.5,0,1),width,height,vec3(.2,0,0),vec3(0,.2,0));
    if (renderMode == "WIRE")
      indices = meshToWireframe(width,height);
    else if (renderMode == "TRIANGLES")
      indices = meshToTriangles(width,height);

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

    var vertBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW );

    var indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    gl.clear(gl.COLOR_BUFFER_BIT);

    if (renderMode == "WIRE")
      gl.drawElements(gl.LINES,(width-1)*(height-1)*6+2*(width+height-2),gl.UNSIGNED_SHORT,indexBuffer)
    else if (renderMode == "TRIANGLES")
      gl.drawElements(gl.TRIANGLES,(width-1)*(height-1)*6,gl.UNSIGNED_SHORT,indexBuffer)

};

spaceVec = function(inputVec,direction,amount) {
  retVec = vec4(inputVec);
  retVec[0] += direction[0]*amount;
  retVec[1] -= direction[1]*amount;
  retVec[2] -= direction[2]*amount;
  return retVec;
}

setupMesh = function(startpos,length,width,x_spacing,y_spacing) {
  var vertices = [];
  for (var i=0;i<=length;i++) {
    vertices[i*width] = spaceVec(vec4(startpos),y_spacing,i);
    for (var j=1;j<=width;j++) {
      vertices[(i*width)+j] = spaceVec(vec4(vertices[i*width]),x_spacing,j);
    }
  }
  return vertices;
}

meshToWireframe = function(width,height) {
  var indices = [];
  for (var i=0;i<height-1;i++) {
    for (var j=0;j<width-1;j++) {
      a = (i*width)+j
      b = (i*width)+j+1
      c = ((i+1)*width)+j
      d = ((i+1)*width)+j+1
      indices.push(a)
      indices.push(b)
      indices.push(a)
      indices.push(c)
      indices.push(a)
      indices.push(d)
    }
    indices.push((i+1)*width-1)
    indices.push((i+2)*width-1)
  }

  for (var j=0;j<width-1;j++) {
    indices.push((height-1)*width + j)
    indices.push((height-1)*width + j+1)
  }

  return indices;
}

meshToTriangles = function(width,height) {
  var indices = [];
  for (var i=0;i<height-1;i++) {
    for (var j=0;j<width-1;j++) {
      a = (i*width)+j
      b = (i*width)+j+1
      c = ((i+1)*width)+j
      d = ((i+1)*width)+j+1
      indices.push(a)
      indices.push(b)
      indices.push(c)
      indices.push(b)
      indices.push(c)
      indices.push(d)
    }
  }
  return indices;
}

// function render() {
//     gl.clear( gl.COLOR_BUFFER_BIT );
//     gl.drawArrays( gl.TRIANGLES,0,11874);
// };
