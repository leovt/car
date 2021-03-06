const deg=0.0174533;
const maxDeflection = 30*deg;
const wheelBase = 2.55;
const speed = 1.0;
const h=0.1;
const carVertex = [
  {x: 0.75, y:-0.88},
  {x: 0.75, y: 0.88},
  {x:-3.30, y: 0.88},
  {x:-3.30, y:-0.88}];

let x=20;
let y=20;
let w=-90*deg;
let a=0;
let lastY=null;
let distance=0;
let car_enable=true;

// collect the information of all obstacles in the svg into an array
let obstacles=[];
Array.from(document.getElementById('obstacles').children).forEach(
  function(rect) {
    obstacles.push({
      x0:rect.x.baseVal.value,
      y0:rect.y.baseVal.value,
      x1:rect.x.baseVal.value+rect.width.baseVal.value,
      y1:rect.y.baseVal.value+rect.height.baseVal.value,
      rect:rect});
});

// collect the information of all targets in the svg into an array
let targets=[];
Array.from(document.getElementById('targets').children).forEach(
  function(rect) {
    targets.push({
      x0:rect.x.baseVal.value,
      y0:rect.y.baseVal.value,
      x1:rect.x.baseVal.value+rect.width.baseVal.value,
      y1:rect.y.baseVal.value+rect.height.baseVal.value,
      rect:rect});
});

let car=document.getElementById('car');
let frontwheel=document.getElementById('frontwheel');

function moveCar() {
  if (!car_enable) {
    return;
  }
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
    checkCollission();
  }
  car.setAttribute('transform', `translate(${x},${y})rotate(${w/deg})`);
  frontwheel.setAttribute('transform', `rotate(${a/deg})`);
  drawTrace();
}

moveCar();

function checkCollission(){
  let x_min = x;
  let x_max = x;
  let y_min = y;
  let y_max = y;

  let cos = Math.cos(w);
  let sin = Math.sin(w);

  let u0 = x*cos + y * sin;
  let v0 = -x*sin + y * cos;

  let data = 'M ';

  carVertex.forEach(function(v) {
    let vx = x + v.x * cos - v.y * sin;
    let vy = y + v.x * sin + v.y * cos;
    data += `${vx},${vy} `;
    if (vx < x_min) {
      x_min = vx;
    }
    else if (vx > x_max) {
      x_max = vx;
    }
    if (vy < y_min) {
      y_min = vy;
    }
    else if (vy > y_max) {
      y_max = vy;
    }
  });
  data += 'Z';
  //document.getElementById('debug').setAttribute('d', data);
  //document.getElementById('debug2').setAttribute('d', '');

  obstacles.forEach(function(obstacle) {
    obstacle.rect.classList.remove("collide");

    // if bounding box of car does not intersect, no further testing
    if (obstacle.x1 < x_min || x_max < obstacle.x0) return;
    if (obstacle.y1 < y_min || y_max < obstacle.y0) return;

    let obVert = [
      {x: obstacle.x0, y: obstacle.y0},
      {x: obstacle.x1, y: obstacle.y0},
      {x: obstacle.x1, y: obstacle.y1},
      {x: obstacle.x0, y: obstacle.y1}];

    let u_min = 1000000;
    let u_max = -1000000;
    let v_min = 1000000;
    let v_max = -1000000;
    data = 'M ';
    obVert.forEach(function(v) {
      let ox = -u0 + v.x * cos + v.y * sin;
      let oy = -v0 - v.x * sin + v.y * cos;
      data += `${ox},${oy} `;
      if (ox < u_min) {
        u_min = ox;
      }
      if (ox > u_max) {
        u_max = ox;
      }
      if (oy < v_min) {
        v_min = oy;
      }
      if (oy > v_max) {
        v_max = oy;
      }
    });
    data += 'Z';
    //document.getElementById('debug2').setAttribute('d', data);
    if (u_min > 0.75 || u_max < -3.30) return;
    if (v_min > 0.88 || v_max < -0.88) return;

    // the car collides with the obstacle
    car_enable = false;
    obstacle.rect.classList.add("collide");
    document.getElementById('lose').setAttribute('style', 'display: block');
});
  targets.forEach(function(target) {
    target.rect.classList.remove("hit");
    if (target.x0 <= x_min && x_max <= target.x1 &&
        target.y0 <= y_min && y_max <= target.y1)
    {
      car_enable = false;
      target.rect.classList.add('hit');
      document.getElementById('win').setAttribute('style', 'display: block');
    }
  });
}

function drawTrace() {
  let d1='0,0';
  let d2='0,0';
  let d3='0,0';
  let d4='0,0';
  let w=0;
  let x=0;
  let y=0;
  let i,x1,x2,x3,x4,y1,y2,y3,y4;
  let dw = Math.asin(Math.sin(a) * h / wheelBase);
  for(i=0; i<60; i++) {
    w -= dw;
    x -= h*Math.cos(w+a);
    y -= h*Math.sin(w+a);

    let cos=Math.cos(w);
    let sin=Math.sin(w);

    x1 = x - 0.71*sin;
    y1 = y + 0.71*cos;
    x2 = x + 0.71*sin;
    y2 = y - 0.71*cos;

    x3 = x1 - 2.55*cos;
    y3 = y1 - 2.55*sin;
    x4 = x2 - 2.55*cos;
    y4 = y2 - 2.55*sin;

    d1 = `${x1},${y1} ` + d1;
    d2 = `${x2},${y2} ` + d2;
    d3 = `${x3},${y3} ` + d3;
    d4 = `${x4},${y4} ` + d4;
  }
  d1='M' + d1;
  d2='M' + d2;
  d3='M' + d3;
  d4='M' + d4;
  x=0;
  y=0;
  w=0;
  for(i=0; i<60; i++) {
    x += h*Math.cos(w+a);
    y += h*Math.sin(w+a);
    w += dw;

    let cos=Math.cos(w);
    let sin=Math.sin(w);

    x1 = x - 0.71*sin;
    y1 = y + 0.71*cos;
    x2 = x + 0.71*sin;
    y2 = y - 0.71*cos;

    x3 = x1 - 2.55*cos;
    y3 = y1 - 2.55*sin;
    x4 = x2 - 2.55*cos;
    y4 = y2 - 2.55*sin;

    d1 = d1 + ` ${x1},${y1}`;
    d2 = d2 + ` ${x2},${y2}`;
    d3 = d3 + ` ${x3},${y3}`;
    d4 = d4 + ` ${x4},${y4}`;
  }
  document.getElementById('trace').setAttribute('d', d1+d2+d3+d4);
}

function handleMove(clientX, clientY, moveY) {
  let client = document.documentElement.getBoundingClientRect();
  let xRatio = (clientX - client.left) / client.width;

  if (xRatio < 0.3) {
    a = -maxDeflection;}
  else if (xRatio < 0.5) {
    a = -maxDeflection * (0.5 - xRatio) / 0.2;}
  else if (xRatio <= 0.7) {
    a = maxDeflection * (xRatio - 0.5) / 0.2;}
  else {
    a = maxDeflection;}

  if (moveY) {
    distance += 40*speed*(lastY - clientY)/client.height;
    lastY = clientY;
  }
  moveCar();
}

function onMouseMove(evt) {
  handleMove(evt.clientX, evt.clientY, (evt.buttons % 2 == 1));
}

function onMouseDown(evt) {
  if (evt.buttons % 2 == 1) {
    lastY = evt.clientY;
    distance = 0;
  }
}

function onKeyDown(evt) {
  if (evt.key === 'ArrowUp' || evt.key === 'W' || evt.key === 'w'){
    distance += 0.1;
    moveCar();
  }
  else if (evt.key === 'ArrowDown' || evt.key === 'S' || evt.key === 's'){
    distance -= 0.1;
    moveCar();
  }
}

function onWheel(evt) {
  const BASE_SPEED = -6;
  const FACTOR = [1, 1/40, 1/800];
  evt.preventDefault();
  distance += evt.deltaY * BASE_SPEED * FACTOR[evt.deltaMode];
  moveCar();
}

document.addEventListener('mousemove', onMouseMove);
document.addEventListener('mousedown', onMouseDown);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('wheel', onWheel);

function onTouchStart(evt) {
  if (evt.touches.length === 1) {
    evt.preventDefault();
  }
}

function onTouchMove(evt) {
  console.log(evt);
  if (evt.touches.length === 1) {
    evt.preventDefault();
    handleMove(evt.touches[0].clientX, evt.touches[0].clientY, false);
  }
}

function onTouchCancel(evt) {
  if (evt.touches.length === 1) {
    evt.preventDefault();
  }
}

function onTouchEnd(evt) {
  console.log(evt);
  if (evt.changedTouches.length === 1) {
    evt.preventDefault();
    let client = document.documentElement.getBoundingClientRect();
    if (evt.changedTouches[0].clientY < client.height / 2) {
      distance = 5 * h;
    }
    else {
      distance = -5 * h;
    }
    moveCar();
  }
}

document.addEventListener('touchstart', onTouchStart);
document.addEventListener('touchmove', onTouchMove);
document.addEventListener('touchcancel', onTouchCancel);
document.addEventListener('touchend', onTouchEnd);
