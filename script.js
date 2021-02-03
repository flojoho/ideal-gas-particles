'use strict';

const particleCanvas = document.getElementById('particleCanvas');
const histogram = document.getElementById('histogram');

const numberSlider = document.getElementById('numberSlider');
const energySlider = document.getElementById('energySlider');

const number = document.getElementById('number');
const energy = document.getElementById('energy');


const ctx1 = particleCanvas.getContext('2d');
const ctx2 = histogram.getContext('2d');


const fps = 30;

const numberOfParticles = parseInt(numberSlider.value);
let averageVelSetting = parseInt(energySlider.value);
const radius = 10;

let averageSpeed;
let correctionFactor;



let summedVelocities = [];
let sampleSize = 0;
const resetStatistics = function(){
  summedVelocities = summedVelocities.map(entry => 0);
  sampleSize = 0;
}

function Particle() {
  this.x = Math.random() * particleCanvas.width;
  this.y = Math.random() * particleCanvas.height;
  
  this.vx = (Math.random() * 2 - 1) * averageVelSetting;
  this.vy = (Math.random() * 2 - 1) * averageVelSetting;
}

Particle.prototype.draw = function(){
  
  //iterate
  this.vx *= correctionFactor;
  this.vy *= correctionFactor;

  this.x += this.vx;
  this.y += this.vy;
  


  //wall collision
  if(this.x > particleCanvas.width - radius && this.vx > 0) {
    this.x -= 2 * (this.x - (particleCanvas.width - radius));
    this.vx = -this.vx;
  }
  
  if(this.x < radius && this.vx < 0) {
    this.x -= 2 * (this.x - radius);
    this.vx = -this.vx;
  }
  
  
  if(this.y > particleCanvas.height - radius && this.vy > 0) {
    this.y -= 2 * (this.y - (particleCanvas.height - radius));
    this.vy = -this.vy;
  }
  
  if(this.y < radius && this.vy < 0) {
    this.y -= 2 * (this.y - radius);
    this.vy = -this.vy;
  }
  
  
  //draw particle
  ctx1.fillStyle = "#ffffff";
  ctx1.beginPath();
  ctx1.arc(this.x, this.y, radius, 0, 2 * Math.PI);
  ctx1.fill();
}




number.innerText = numberSlider.value;
energy.innerText = energySlider.value;


const particles = [];
for(let i = 0; i < numberOfParticles; i++){
  particles.push(new Particle());
}




setInterval(function(){
  
  //clear canvas
  ctx1.fillStyle = "#111111";
  ctx1.fillRect(0, 0, particleCanvas.width, particleCanvas.height);
  

  averageSpeed = particles.reduce((acc, cur) => acc + Math.sqrt(cur.vx**2 + cur.vy**2), 0) / particles.length;
  correctionFactor = averageVelSetting / averageSpeed;

  for(const particle of particles){
    particle.draw();
  }
  
  
  for(let i = 0; i < particles.length; i++){
    for(let j = i + 1; j < particles.length; j++){

      //collision between particles
      if(Math.abs(particles[i].x - particles[j].x) < 2 * radius && Math.abs(particles[i].y - particles[j].y) < 2 * radius){
        const squared = (particles[i].x - particles[j].x) ** 2
                      + (particles[i].y - particles[j].y) ** 2;

        if(squared < 4 * radius ** 2){
          const dvx = particles[i].vx - particles[j].vx;
          const dvy = particles[i].vy - particles[j].vy;
          
          const dx = particles[j].x - particles[i].x;
          const dy = particles[j].y - particles[i].y;
          
          //squared = dx**2 + dy**2; //variablenname already taken!
          const scalar = dvx*dx + dvy*dy;
          
          const dvx2 = dx*scalar/squared;
          const dvy2 = dy*scalar/squared;
          
          
          particles[i].vx -= dvx2;
          particles[i].vy -= dvy2;
          
          particles[j].vx += dvx2;
          particles[j].vy += dvy2;
          
          
          
          //avoid particles 'sticking to each other'
          const versatz = (radius / Math.sqrt(squared) - 1/2);
          
          particles[i].x -= dx*versatz;
          particles[i].y -= dy*versatz;
          
          particles[j].x += dx*versatz;
          particles[j].y += dy*versatz;
        }
      }
    }
  }
  
  






  
  //histogram
  const width = 200; //actually 213
  const heightFactor = 10; //höhenfaktor
  const vmax = 10;
  const n = 20;
  
  const vel = [];
  
  //clear canvas
  ctx2.fillStyle = '#eeeeee';
  ctx2.clearRect(0, 0, histogram.width, histogram.height);
  

  for(let i = 0; i < n; i++){
    vel[i] = 0;
  }
  
  for(let i = 0; i < particles.length; i++){
    const v = Math.sqrt(particles[i].vx ** 2 + particles[i].vy ** 2);
    const range = Math.floor(v * n / vmax);
    vel[range] += 1;
  }
  
  for(let i = 0; i < n; i++) {
    ctx2.fillStyle = "rgba(255, 0, 0, 0.5)";
    ctx2.fillRect(20 + i * width / n, histogram.height - 20 - vel[i] * heightFactor, width / n, vel[i] * heightFactor);
  }
  
  
  
  
  //draw curve
  if(summedVelocities.length === 0){
    for(let i = 0; i < n; i++){
      summedVelocities[i] = 0;
    }
  }
  
  for(let i = 0; i < n; i++){
    summedVelocities[i] += vel[i];
  }
  sampleSize += 1;

  ctx2.strokeStyle = "#ff0000";
  ctx2.lineWidth = 3;
  ctx2.beginPath();
  ctx2.moveTo(20, histogram.height - 20 - summedVelocities[0] / sampleSize * heightFactor);
  for(let i = 0; i < n; i++) {
    ctx2.lineTo(20 + i * width / n, histogram.height - 20 - summedVelocities[i] / sampleSize * heightFactor);
  }
  ctx2.stroke();
  
  
}, 1000/fps);




numberSlider.addEventListener('input', () => {
  const newNumber = parseInt(numberSlider.value);

  //add/remove extra particles
  while(particles.length > newNumber){
    particles.pop();
  }

  while(particles.length < newNumber){
    particles.push(new Particle());
  }

  number.innerText = newNumber;


  resetStatistics();
});

energySlider.addEventListener('input', () => {
  averageVelSetting = parseInt(energySlider.value);

  energy.innerText = averageVelSetting;

  resetStatistics();
});