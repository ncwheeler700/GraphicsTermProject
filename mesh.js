class Mesh {
  constructor(st,h,w,sp,mode) {
    this.startpos = st
    this.height = h;
    this.width = w;
    this.spacing = sp
    this.x_spacing = this.scaleVec(vec3(1.,0,0),sp);
    this.y_spacing = this.scaleVec(vec3(0,1.,0),sp);
    this.k_struct = .1;

    this.velocities = []
    this.positions = this.setupMesh();
    this.forces = this.calculateForces();
    console.log(this.forces)
    console.log(this.positions)
    this.time = 0;
    this.step = .001;
    if (mode == 1)
      this.indices = this.meshToWireframe()
    else if (mode == 4)
      this.indices = this.meshToTriangles()
    console.log(this.indices)

  };
  spaceVec(inputVec,direction,amount) {
    var retVec = vec4(inputVec);
    retVec[0] += direction[0]*amount;
    retVec[1] -= direction[1]*amount;
    retVec[2] += direction[2]*amount;
    return retVec;
  }
  addVec(vec1,vec2) {
    var tmp = vec1;
    tmp[0] += vec2[0]
    tmp[1] += vec2[1]
    tmp[2] += vec2[2]
    return tmp;
  }
  diffVec(vec1,vec2) {
    var tmp = vec1;
    tmp[0] -= vec2[0]
    tmp[1] -= vec2[1]
    tmp[2] -= vec2[2]
    return tmp;
  }
  scaleVec(vec1,s) {
    var tmp = vec1;
    tmp[0] *= s
    tmp[1] *= s
    tmp[2] *= s
    return tmp;
  }
  lengthVec(vec) {
    var a = pow(vec[0],2)
    var b = pow(vec[1],2)
    var c = pow(vec[2],2)
    return sqrt(a+b+c)
  }
  setupMesh() {
    var v = [];
    for (var i=0;i<this.height;i++) {
      v[i*this.width] = this.spaceVec(vec4(this.startpos),this.y_spacing,i);
      this.velocities[i*this.width] = vec3(0.0);
      for (var j=1;j<this.width;j++) {
        v[(i*this.width)+j] = this.spaceVec(vec4(v[i*this.width]),this.x_spacing,j);
        this.velocities[(i*this.width)+j] = vec3(0);
      }
    }
    return v;
  }
  meshToWireframe(){
    var indices = []
    for (var i=0;i<this.height-1;i++) {
      for (var j=0;j<this.width-1;j++) {
        var a,b,c,d
        a = (i*this.width)+j
        b = (i*this.width)+j+1
        c = ((i+1)*this.width)+j
        d = ((i+1)*this.width)+j+1
        indices.push(a)
        indices.push(b)
        indices.push(a)
        indices.push(c)
        indices.push(a)
        indices.push(d)
        indices.push(b)
        indices.push(c)
      }
      //Right side
      indices.push((i+1)*this.width-1)
      indices.push((i+2)*this.width-1)
    }

    //Bottom row
    for (var j=0;j<this.width-1;j++) {
      indices.push((this.height-1)*this.width + j)
      indices.push((this.height-1)*this.width + j+1)
    }
    return indices;
  }
  meshToTriangles() {
    var indices = []
    for (var i=0;i<this.height-1;i++) {
      for (var j=0;j<this.width-1;j++) {
        a = (i*this.width)+j
        b = (i*this.width)+j+1
        c = ((i+1)*this.width)+j
        d = ((i+1)*this.width)+j+1
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

  forceBetween(p1,p2,restLength) {
    var diff = diffVec(p1,p2)
    var dist = lengthVec(diff)
    return
  }

  calculateForces() {
    var forces = []
    var i=0;
    while (i<this.width*this.height) {
      var allForces = [vec3(0,-9.81,0)]

      //Structural: restLength = this.spacing
      if (i%width > 0) {
        //Check left
      }
      if ((i+1)%width > 0) {
        //Check right
      }
      if (i/width > 0) {
        //Check top
      }

      if (i/width < height-1) {
        //Check bottom
      }
      var netForce = allForces.reduce(this.addVec,vec3(0))
      forces[i] = netForce
      i++;
    }
    return forces;
  }

};
