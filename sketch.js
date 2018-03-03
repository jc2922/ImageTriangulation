var t;
var points = [];
var triangles = [];
var badTriangles = [];
var edges = [];
var k=0;
var pointCount = 750;
var threshold = 35;
var s1, s2, s3, s4;

var img;
var backup;

var edge_hash={};

function preload(){
  img = loadImage("human.jpg");
  backup = loadImage("human.jpg");
}

function setup() {
  var weight = 159;
  var Gaussian = new Matrix(5, 5);
  var Gblur = Gaussian.mat;
  Gblur[0][0]=Gblur[0][Gblur.length-1]=Gblur[Gblur.length-1][0]=Gblur[Gblur.length-1][Gblur.length-1]=2;
  Gblur[0][1]=Gblur[0][3]=Gblur[1][0]=Gblur[1][Gblur.length-1]=Gblur[3][0]=Gblur[3][Gblur.length-1]=Gblur[Gblur.length-1][1]=Gblur[Gblur.length-1][3]=4;
  Gblur[0][2]=Gblur[2][0]=Gblur[2][Gblur.length-1]=Gblur[Gblur.length-1][2]=5;
  Gblur[1][1]=Gblur[1][3]=Gblur[3][1]=Gblur[3][3]=9;
  Gblur[1][2]=Gblur[2][1]=Gblur[2][3]=Gblur[3][2]=12;
  Gblur[int(Gblur.length/2)][int(Gblur.length/2)]=15;
  Gaussian.multiply_c(Gaussian, weight);
  //Sobel Operator
  var Sobel_h = new Matrix(3, 3);
  sobel_h = Sobel_h.mat;
  sobel_h[0][0]=sobel_h[2][0]=-1;
  sobel_h[1][0]=-2; sobel_h[1][2]=2;
  sobel_h[0][1]=sobel_h[1][1]=sobel_h[2][1]=0;
  sobel_h[0][2]=sobel_h[2][2]=1;
  var Sobel_v = new Matrix(3, 3);
  sobel_v = Sobel_v.mat;
  sobel_v[0][0]=sobel_v[0][2]=1;
  sobel_v[2][0]=sobel_v[2][2]=-1;
  sobel_v[0][1]=2; sobel_v[2][1]=-2;


  createCanvas(640, 426);
  background(255);
  var output = convolute(Gaussian, img);
  for(var i=0; i<output.m; i++){
    for(var j=0; j<output.n; j++){
      var loc = (i+j*img.width)*4;
      img.pixels[loc]=red(color(int(output.mat[i][j])));
      img.pixels[loc+1]=green(color(int(output.mat[i][j])));
      img.pixels[loc+2]=blue(color(int(output.mat[i][j])));
    }
  }
  updatePixels();

  //2. Calculate gradients: apply Sobel operators on the blurred image
  var gradient_x = convolute(Sobel_h, img);
  var gradient_y = convolute(Sobel_v, img);
  var gradient = new Matrix(output.m, output.n);
  for(var i=0; i<gradient.m; i++){
    for(var j=0; j<gradient.n; j++){
      var squared = gradient_x.mat[i][j]*gradient_x.mat[i][j]+gradient_y.mat[i][j]*gradient_y.mat[i][j];
      gradient.mat[i][j]=sqrt(float(squared));
    }
  }

  var nodes = [];
  for(var i=0; i<gradient.m; i++){
    for(var j=0; j<gradient.n; j++){
      var loc = (i+j*img.width)*4;
      //float show=map((float)output.mat[i][j], 0.0, 40545.0, 0.0, 255.0);
      var r = img.pixels[loc]=red(color(int(gradient.mat[i][j])));
      var g = img.pixels[loc+1]=green(color(int(gradient.mat[i][j])));
      var b = img.pixels[loc+2]=blue(color(int(gradient.mat[i][j])));
      var col = color(r, g, b);
      if(brightness(col)>threshold){
        nodes.push(new Point(i, j));
      }
    }
  }
  updatePixels();

  var randomNode=null;
  for(var i=0; i<pointCount; i++){
   var rand = int(random(0, nodes.length));
   randomNode = nodes[rand];
   while(randomNode.x<=30||randomNode.x>=width-30||randomNode.y<=30||randomNode.y>=height-30){
     rand = int(random(0, nodes.length));
     randomNode = nodes[rand];
   }
   points.push(new Point(randomNode.x, randomNode.y));
 }

 //sort all the points:
  bucketSort(points, 30, height-30);
  for(var i=0; i<120; i++){
   points.push(new Point(int(random(30, width-30)), int(random(30, height-30))));
 }


 s1 = new Point(width-30, 30);
 s2 = new Point(30, 30);
 s3 = new Point(width-30, height-30);
 s4 = new Point(30, height-30);
 triangles.push(new Triangle(s1, s2, s3));
 triangles.push(new Triangle(s2, s3, s4));

 for(var i=0; i<triangles.length; i++){
   triangles[i].display();
 }
}

function draw() {
  background(255);
  for(var i=0; i<points.length; i++) points[i].display();
  for(var i=0; i<triangles.length; i++){noFill(); triangles[i].display();}
   var p = points[k];
  for(var i=0; i<triangles.length; i++){
    if(inCircle(triangles[i], p)){
      //System.out.println("in circle");
      //var bad = triangles.remove(i);
      var p1 = triangles[i].p1;
      var p2 = triangles[i].p2;
      var p3 = triangles[i].p3;
      triangles.splice(i, 1);
      var l1 = new Line(p1, p2);
      var l2 = new Line(p2, p3);
      var l3 = new Line(p3, p1);
     edges.push(l1);
      edges.push(l2);
      edges.push(l3);
      if(edge_hash[l1.p1.x+" "+l1.p1.y+" "+l1.p2.x+" "+l1.p2.y]==null){
      edge_hash[l1.p1.x+" "+l1.p1.y+" "+l1.p2.x+" "+l1.p2.y]=1;
    }
    else{
      edge_hash[l1.p1.x+" "+l1.p1.y+" "+l1.p2.x+" "+l1.p2.y]=edge_hash[l1.p1.x+" "+l1.p1.y+" "+l1.p2.x+" "+l1.p2.y]+1;
    }
    if(edge_hash[l2.p1.x+" "+l2.p1.y+" "+l2.p2.x+" "+l2.p2.y]==null){
    edge_hash[l2.p1.x+" "+l2.p1.y+" "+l2.p2.x+" "+l2.p2.y]=1;
  }
  else{
    edge_hash[l2.p1.x+" "+l2.p1.y+" "+l2.p2.x+" "+l2.p2.y]=edge_hash[l2.p1.x+" "+l2.p1.y+" "+l2.p2.x+" "+l2.p2.y]+1;
  }
  if(edge_hash[l3.p1.x+" "+l3.p1.y+" "+l3.p2.x+" "+l3.p2.y]==null){
  edge_hash[l3.p1.x+" "+l3.p1.y+" "+l3.p2.x+" "+l3.p2.y]=1;
}
else{
  edge_hash[l3.p1.x+" "+l3.p1.y+" "+l3.p2.x+" "+l3.p2.y]=edge_hash[l3.p1.x+" "+l3.p1.y+" "+l3.p2.x+" "+l3.p2.y]+1;
}

      i--;
    }
  }
  for(var i=0; i<edges.length; i++){
    var edge = edges[i];
    var p1 = edges[i].p1;
    var p2 = edges[i].p2;
    edges.splice(i, 1);
    //if(!edges.includes(edge)){
    if(edge_hash[p1.x+" "+p1.y+" "+p2.x+" "+p2.y]==1){
      triangles.push(new Triangle(p, p1, p2));
    //  edge_hash[p1.x+" "+p1.y+" "+p2.x+" "+p2.y]=edge_hash[p1.x+" "+p1.y+" "+p2.x+" "+p2.y]-1;
      i--;
      //System.out.println("Does not contain edge");
    }
    else{
      edges.splice(i, 0, edge);
    }
  }
  edges = [];
  edge_hash={};
  if(k==points.length-1){
    background(255);
    backup.loadPixels();
    for(var i=0; i<points.length; i++){
      points[i].display();
    }
    for(var i=0; i<triangles.length; i++){
      var t = triangles[i];
      var x1 = int(t.p1.x);
      var y1 = int(t.p1.y);
      var x2 = int(t.p2.x);
      var y2 = int(t.p2.y);
      var x3 = int(t.p3.x);
      var y3 = int(t.p3.y);
      var loc1 = (x1+y1*backup.width)*4;
      var loc2 = (x2+y2*backup.width)*4;
      var loc3 = (x3+y3*backup.width)*4;
      var c1 = color(int(backup.pixels[loc1]), int(backup.pixels[loc1+1]), int(backup.pixels[loc1+2]));
      var c2 = color(int(backup.pixels[loc2]), int(backup.pixels[loc2+1]), int(backup.pixels[loc2+2]));
      var c3 = color(int(backup.pixels[loc3]), int(backup.pixels[loc3+1]), int(backup.pixels[loc3+2]));
      var r = 0;
      var g = 0;
      var b = 0;

       r = (red(c1)+red(c2)+red(c3))/3;
       g = (green(c1)+green(c2)+green(c3))/3;
       b = (blue(c1)+blue(c2)+blue(c3))/3;
      t.fillTriangle(color(r, g, b));
      t.display();

    }
    noLoop();
  }
  k++;
}


function convolute(k, img){
  img.loadPixels();
  var kernel = k.mat;
  var k_width = k.m;
  //int k_height = k.n;
  var i_width = img.width;
  var i_height = img.height;
  var anchor = int(k_width/2);
  //set the input matrix equal to the image pixels
  var input = new Matrix(i_width+2*anchor, i_height+anchor*2);
  var output = new Matrix(i_width, i_height);
  /*for(int i=0; i<img.pixels.length; i++){
    input.mat[anchor+i/i_width][anchor+i%i_height]=brightness(img.pixels[i]);
  }*/

  for(var i=0; i<img.width; i++){
    for(var j=0; j<img.height; j++){
      var loc = (i+j*img.width)*4;
      var col = color(img.pixels[loc], img.pixels[loc+1], img.pixels[loc+2], img.pixels[loc+3]);
      input.mat[anchor+i][anchor+j]=brightness(col);
    }
  }
  //apply the filter/kernel
  for(var r=0; r<output.mat.length; r++){
    for(var c=0; c<output.mat[0].length; c++){
      for(var i=0; i<kernel.length; i++){
        for(var j=0; j<kernel[0].length; j++){
          output.mat[r][c] += kernel[i][j]*input.mat[r+i][c+j];
          //input.mat[r][c]+=kernel[i][j]*brightness(img.pixels[r*i+j]);
        }
      }
    }
  }
  return output;
}


function inCircle(t, p){
  var distance = dist(t.calcCircumcenter().x, t.calcCircumcenter().y, p.x, p.y);
  if(distance<t.calcCircumradius()) return true;
  return false;
}

function bucketSort(points, min, max){
  //create n buckets:
  var buckets = [];
  for(var i=0; i<points.length; i++){
    var pp = [];
    buckets.push(pp);
  }
  var range = max-min+1;
  var bucketSize= (int)(range/buckets.length)+2;
  for(var i=0; i<points.length; i++){
    var p = points[i];
    var bucketNum = (int)(p.y/bucketSize);
    if(buckets[bucketNum].length==0){
      buckets[bucketNum].push(p);
    }
    else{
      var j=0;
      var bucket = buckets[bucketNum];
      while(j<buckets[bucketNum].length&&p.y>bucket[j].y){
        j++;
      }
      bucket.push(p);
    }
  }
  var k=0;
  for(var i=0; i<buckets.length; i++){
     var bucket = buckets[i];
    for(var j=0; j<bucket.length; j++){
      points[k]=bucket[j];
      k++;
    }
  }
}



  function Matrix(m, n) {
    this.m=m;
    this.n=n;
    this.mat=[];
    for(var i=0; i<m; i++){
      this.mat[i]=[];
      for(var j=0; j<n; j++){
        this.mat[i][j]=0;
      }
    }

    this.multiply_c = function(d, c){
      var data = d.mat;
      for(var i=0; i<data.length; i++){
        for(var j=0; j<data.length; j++){
          d.mat[i][j]=data[i][j]/c;
        }
      }
    }
  }



function Point(x, y) {
  this.x=x;
  this.y= y;

  this.display=function(){
    fill(255, 102, 102);
    stroke(255, 102, 102);
    ellipse(x, y, 3, 3);
  }
};



function Line(p1, p2) {
  if(p1.x<p2.x){
  this.p1=p1;
  this.p2= p2;
}
else{
  this.p1=p2;
  this.p2=p1;
}

  this.display=function(){
    stroke(255, 0, 255);
    line(this.p1.x, this.p1.y, this.p2.x, this.p2.y);
  };
  this.equals=function(o){
    if(o instanceof Line){
      if(((Line(o)).p1.x==this.p1.x&&(Line(o)).p1.y==this.p1.y&&(Line(o)).p2.x==this.p2.x&&(Line(o)).p2.y==this.p2.y)||
          ((Line(o)).p1.x==this.p2.x&&(Line(o)).p1.y==this.p2.y&&(Line(o)).p2.x==this.p1.x&&(Line(o)).p2.y==this.p1.y)){
            return true;
    }
  }
  return false;
};
  this.calcSlope = function(){
    var rise = this.p2.y-this.p1.y;
    var run = this.p2.x-this.p1.x;
    if(run==0) {return Number.POSITIVE_INFINITY;}
    return rise/run;
  };

  this.calcMid=function(){
    return new Point((this.p2.x+this.p1.x)/2, (this.p2.y+this.p1.y)/2);
  };

  this.perpendicularSlope=function(){
    if(this.calcSlope()==0){ return Number.POSITIVE_INFINITY;}
    return -1/this.calcSlope();
  }
};



function Triangle(p1, p2, p3) {
   this.p1=p1;
   this.p2=p2;
   this.p3=p3;

    this.display=function(){
      strokeWeight(2);
      //stroke(255, 153, 153);
      //noFill();
      triangle(this.p1.x, this.p1.y, this.p2.x, this.p2.y, this.p3.x, this.p3.y);
    //stroke(0, 255, 0);
    //ellipse(circumcenter.x, circumcenter.y, 2*circumradius, 2*circumradius);
  };
  this.calcCircumradius=function(){
    return dist(this.calcCircumcenter().x, this.calcCircumcenter().y, this.p1.x, this.p1.y);
  };
  this.fillTriangle=function(c){
    stroke(c);
    fill(c);
  };
  this.calcCircumcenter=function(){
    var l1_=new Line(this.p1, this.p2);
    var l2_=new Line(this.p2, this.p3);
    var m1 = l1_.calcMid();
    var m2 = l2_.calcMid();
    var slope1 = l1_.perpendicularSlope();
    var slope2 = l2_.perpendicularSlope();
    var x=0; var y =0;
    if(slope1==float(Number.POSITIVE_INFINITY)){
       //System.out.println("positive infinity 1");
       x = m1.x;
       y = slope2*(x-m2.x)+m2.y;
    }
    else if(slope2==float(Number.POSITIVE_INFINITY)){
      //System.out.println("positive infinity");
      x = m2.x;
      y = slope1*(x-m1.x)+m1.y;
    }
    else{
       x = m2.y-m1.y+slope1*m1.x-slope2*m2.x;
       x=x/(slope1-slope2);
       y = slope1*(x-m1.x)+m1.y;
    }
    return new Point(x, y);
  }
};
