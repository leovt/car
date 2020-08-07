const deg=0.0174533;
const maxDeflection = 30*deg;
const wheelBase = 2.55;
const speed = 1.0;
const h=0.1;

let x=20;
let y=20;
let w=-90*deg;
let a=0;
let lastY=null;
let distance=0;

let car=document.getElementById('car');
let frontwheel=document.getElementById('frontwheel');

function moveCar() {
  while (Math.abs(distance) >= h) {
    if (distance > 0) {
      x += h*Math.cos(w+a);
      y += h*Math.sin(w+a);
      w += Math.asin(Math.sin(a) * h / wheelBase);
      distance -= h;
    }
    else {
      w -= Math.asin(Math.sin(a) * h / wheelBase);
      x -= h*Math.cos(w+a);
      y -= h*Math.sin(w+a);
      distance += h;
    }
  }
  car.setAttribute('transform', `translate(${x},${y})rotate(${w/deg})`);
  frontwheel.setAttribute('transform', `rotate(${a/deg})`);
}

moveCar();

function onMouseMove(evt) {
  let client = document.documentElement.getBoundingClientRect();
  let xRatio = (evt.clientX - client.left) / client.width;

  if (xRatio < 0.3) {
    a = -maxDeflection;}
  else if (xRatio < 0.5) {
    a = -maxDeflection * (0.5 - xRatio) / 0.2;}
  else if (xRatio <= 0.7) {
    a = maxDeflection * (xRatio - 0.5) / 0.2;}
  else {
    a = maxDeflection;}

  if (evt.buttons % 2 == 1) {
    distance += 40*speed*(lastY - evt.clientY)/client.height;
    lastY = evt.clientY;
  }
  moveCar();
}

function onMouseDown(evt) {
  if (evt.buttons % 2 == 1) {
    lastY = evt.clientY;
    distance = 0;
  }
}

function onKeyDown(evt) {
  if (evt.key === 'ArrowUp'){
    distance += 0.1;
    moveCar();
  }
  else if (evt.key === 'ArrowDown'){
    distance -= 0.1;
    moveCar();
  }
}

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('keydown', onKeyDown);
