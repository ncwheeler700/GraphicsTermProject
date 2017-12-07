class Mesh {
  constructor(st,h,w,sp,mode) {
    this.startpos = st
    this.height = h;
    this.width = w;
    this.spacing = sp
    this.x_spacing = this.scaleVec(vec3(1.,0,0),sp);
    this.y_spacing = this.scaleVec(vec3(0,1.,0),sp);
    this.k_struct = 50;
    this.k_shear = 25;
    this.k_bend = 25;
    this.damping = 5
    this.invMass = 1/10;

    this.velocities = []
    this.isFixed = []
    this.positions = this.setupMesh();
    this.forces = this.calculateForces();
    console.log(this.forces)
    console.log(this.positions)
    this.time = 0;
    this.step = .01;
    if (mode == 1)
      this.indices = this.meshToWireframe()
    else if (mode == 4)
      this.indices = this.meshToTriangles()

  };

  spaceVec(inputVec,direction,amount) {
    var retVec = inputVec;
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
    var tmp = vec3(vec1);
    tmp[0] *= s
    tmp[1] *= s
    tmp[2] *= s
    return tmp;
  }

  lengthVec(vec) {
    var a = Math.pow(vec[0],2)
    var b = Math.pow(vec[1],2)
    var c = Math.pow(vec[2],2)
    return Math.sqrt(a+b+c)
  }

  setupMesh() {
    var v = [];
    for (var i=0;i<this.height;i++) {
      v[i*this.width] = this.spaceVec(vec4(this.startpos),this.y_spacing,i);
      this.velocities[i*this.width] = vec3(0.0);
      this.isFixed[i*this.width] = 0;
      for (var j=1;j<this.width;j++) {
        v[(i*this.width)+j] = this.spaceVec(vec4(v[i*this.width]),this.x_spacing,j);
        this.velocities[(i*this.width)+j] = vec3(0);
        this.isFixed[i*this.width] = 0
      }
    }
    this.isFixed[0] = 1;
    this.isFixed[this.width-1] = 1;
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

  getRelPartID(id,off_x,off_y) {
    return id+off_x+(off_y*width);
  }

  forceBetween(id1,id2,k,spacing) {
    var pos1 = vec3(this.positions[id1])
    var pos2 = vec3(this.positions[id2])
    var diff = this.diffVec(pos1,pos2)
    var dist = this.lengthVec(diff)
    var normDiff = this.scaleVec(diff,spacing/dist)
    var force = this.scaleVec(this.diffVec(normDiff,diff),k)
    return force
  }

  calculateForces() {
    var forces = []
    var i=0;
    while (i<this.width*this.height) {
      var allForces = [vec3(0,-9.81,0)]
      //Structural
      //Check left
      if (i%width > 0)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,-1,0),this.k_struct,this.spacing))
      //Check right
      if ((i+1)%width > 0)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,1,0),this.k_struct,this.spacing))
      //Check top
      if (Math.floor(i/width) > 0)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,0,-1),this.k_struct,this.spacing))
      //Check bottom
      if (Math.floor(i/width) < height-1)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,0,1),this.k_struct,this.spacing))

      //Bend
      //Check top-left
      if (i%width > 0 && Math.floor(i/width) > 0)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,-1,-1),this.k_shear,this.spacing*.707))
      //Check top-right
      if ((i+1)%width > 0 && Math.floor(i/width) > 0)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,1,-1),this.k_shear,this.spacing*.707))
      //Check bottom-left
      if (i%width > 0 && Math.floor(i/width) < height-1)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,-1,1),this.k_shear,this.spacing*.707))
      //Check bottom-right
      if ((i+1)%width > 0 && Math.floor(i/width) < height-1)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,1,1),this.k_shear,this.spacing*.707))

      //Bend
      //Check left
      if (i%width > 1)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,-2,0),this.k_bend,this.spacing*2))
      //Check right
      if ((i+2)%width > 1)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,2,0),this.k_bend,this.spacing*2))
      //Check top
      if (Math.floor(i/width) > 1)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,0,-2),this.k_bend,this.spacing*2))
      //Check bottom
      if (Math.floor(i/width) < height-2)
        allForces.push(this.forceBetween(i,this.getRelPartID(i,0,2),this.k_bend,this.spacing*2))

      var netForce = allForces.reduce(this.addVec,vec3(0))
      forces[i] = netForce
      i++;
    }
    return forces;
  }

  nextStep() {
    var oldForces = this.forces.slice();
    this.forces = this.calculateForces();
    var newPositions = [];
    var newVelocities = [];
    for (var i=0;i<this.width*this.height;i++) {
      if (this.isFixed[i]) {
        newPositions.push(this.positions[i]);
        newVelocities.push(this.velocities[i]);
        continue
      }

      var dampedForce = this.diffVec(this.forces[i],this.scaleVec(this.velocities[i],this.damping));

      var oldAcl = this.scaleVec(oldForces[i],this.invMass)
      var newAcl = this.scaleVec(dampedForce,this.invMass)
      var newVel = this.addVec(this.scaleVec(this.addVec(newAcl,oldAcl),this.step/2), this.velocities[i])
      var newPos = this.addVec(this.scaleVec(newVel,this.step), this.positions[i])
      newPos = this.addVec(newPos,this.scaleVec(oldAcl,.5*this.step*this.step))

      newPositions.push(newPos)
      newVelocities.push(newVel)
    }

    for (var i=0;i<this.width*this.height;i++) {
      this.positions[i] = vec4(newPositions[i])
      this.velocities[i] = newVelocities[i]
    }
  }

};
