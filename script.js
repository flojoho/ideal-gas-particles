var canvas = document.getElementById('canvas');
var c = canvas.getContext('2d');


var number = 500;
var r = 5;
var maxspeed = 5;
var X = canvas.width;
var Y = canvas.height;



function particle() {
  this.x = Math.random()*X;
  this.y = Math.random()*Y;
  
  this.vx = (Math.random()*2-1)*maxspeed;
  this.vy = (Math.random()*2-1)*maxspeed;
}

particle.prototype.draw = function(){
  //this.vy += 0.1;
  
  this.x += this.vx;
  this.y += this.vy;
  
  if(this.x > X && this.vx > 0) {
    this.x -= 2 * (this.x - X);
    this.vx = -this.vx;
  }
  
  if(this.x < 0 && this.vx < 0) {
    this.x -= 2 * this.x;
    this.vx = -this.vx;
  }
  
  
  if(this.y > Y && this.vy > 0) {
    this.y -= 2 * (this.y - Y);
    this.vy = -this.vy;
  }
  
  if(this.y < 0 && this.vy < 0) {
    this.y -= 2 * this.y;
    this.vy = -this.vy;
  }
  
  
  
  
  c.fillStyle = "#ffffff";
  c.beginPath();
  c.arc(this.x, this.y, r, 0, 2*Math.PI);
  c.fill();
  
  
}


var stat = new Array();


var particles = new Array();
for(var i=0; i<number; i++){
  particles[i] = new particle();
}

setInterval(function(){
  c.fillStyle = "#000000";
  c.fillRect(0, 0, canvas.width, canvas.height);
  
  for(var i=0; i<number; i++){
    particles[i].draw();
  }
  
  
  for(var i=0; i<number; i++){
    for(var j=i+1; j<number; j++){
      if(Math.abs(particles[i].x-particles[j].x)<2*r && Math.abs(particles[i].y-particles[j].y)<2*r){
        var squared = Math.pow(particles[i].x-particles[j].x, 2) + Math.pow(particles[i].y-particles[j].y, 2);
        if(squared < 4*r*r){
          /*c.fillStyle = "#ff0000";
          c.fillRect(particles[i].x, particles[i].y, 10, 10);
          c.fillRect(particles[j].x, particles[j].y, 10, 10);*/
          
          
          dvx = particles[i].vx - particles[j].vx;
          dvy = particles[i].vy - particles[j].vy;
          
          dx = particles[j].x-particles[i].x;
          dy = particles[j].y-particles[i].y;
          
          squared = dx*dx + dy*dy; //variablenname schon besetzt!
          scalar = dvx*dx + dvy*dy;
          
          dvx2 = dx*scalar/squared;
          dvy2 = dy*scalar/squared;
          
          
          particles[i].vx -= dvx2;
          particles[i].vy -= dvy2;
          
          particles[j].vx += dvx2;
          particles[j].vy += dvy2;
          
          
          
          //provisorisch!!!
          var versatz = (r/Math.sqrt(squared) - 1/2);
          
          particles[i].x -= dx*versatz;
          particles[i].y -= dy*versatz;
          
          particles[j].x += dx*versatz;
          particles[j].y += dy*versatz;
        }
      }
    }
  }
  
  
  
  //histogramm
  width = 600;
  height = 10; //höhenfaktor
  vmax = 10;
  n=50;
  
  var vel = new Array();
  
  for(var i=0; i<n; i++) vel[i]=0;
  
  for(var i=0; i<number; i++){
    v = Math.sqrt(Math.pow(particles[i].vx, 2) + Math.pow(particles[i].vy, 2));
    range = Math.floor(v*n/vmax);
    vel[range] += 1;
  }
  
  for(var i=0; i<n; i++) {
    c.fillStyle = "rgba(255, 0, 0, 0.5)";
    c.fillRect(100 + i*width/n, Y-100-vel[i]*height, width/n, vel[i]*height);
  }
  
  
  
  
  //kurve
  if(stat[0] == undefined){
    for(var i=0; i<n; i++) stat[i]=0;
    sample = 0;
  }
  
  for(var i=0; i<n; i++) stat[i]+=vel[i];
  sample += 1;
  
  c.strokeStyle = "#ff0000";
  c.lineWidth = 3;
  c.moveTo(100, Y-100-stat[0]/sample*height);
  for(var i=0; i<n; i++) c.lineTo(100 + i*width/n, Y-100-stat[i]/sample*height);
  c.stroke();
  
  
}, 1);