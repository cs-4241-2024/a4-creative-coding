// FRONT-END (CLIENT) JAVASCRIPT HERE

const OFFSET = 100;
const DIMENSIONS = 16;
let state = [];
let step_x, step_y;

redraw = async function ( canvas, draw_context ) {
  
  reload_state();

  for(let iterator_x = step_x; iterator_x < canvas.width; iterator_x += step_x) {
    draw_context.beginPath()//fillRect(iterator_x, iterator_y, step_x, step_y);
    draw_context.moveTo(iterator_x, 0);
    draw_context.lineTo(iterator_x, canvas.height);
    draw_context.stroke();
  }

  for(let iterator_y = step_y; iterator_y < canvas.height; iterator_y += step_y) {
    draw_context.beginPath()//fillRect(iterator_x, iterator_y, step_x, step_y);
    draw_context.moveTo(0, iterator_y);
    draw_context.lineTo(canvas.width, iterator_y);
    draw_context.stroke();
  }
}

init = async function () {
  for(let i = 0; i < DIMENSIONS; i++)
  {
    let temp = [];
    for(let j = 0; j < DIMENSIONS; j++) {
      temp.push('#FFFFFF');
    }
    state.push(temp);
  }
}

reload_state = async function () {
  let canvas = document.getElementById("main-canvas");
  let draw_context = canvas.getContext('2d');

  let old_style = draw_context.fillStyle;

  for(let i = 0; i < DIMENSIONS; i++) {
    for(let j = 0; j < DIMENSIONS; j++) {
      draw_context.fillStyle = state[i][j];
      draw_context.fillRect((i * step_x), j * step_y, step_x, step_y);
    }
  }

  draw_context.fillStyle = old_style
}

reload = async function () {
  let canvas = document.getElementById("main-canvas");

  let canvas_size = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) - OFFSET;
  
  canvas.width = canvas_size;
  canvas.height = canvas_size;

  let draw_context = canvas.getContext("2d");
  
  step_x = canvas.width/DIMENSIONS;
  step_y = canvas.height/DIMENSIONS;

  redraw(canvas, draw_context);

  let canvas_left = canvas.offsetLeft + canvas.clientLeft;
  let canvas_top = canvas.offsetTop + canvas.clientTop;
  
  snap_to_grid = function (x_pos, y_pos) {
    let new_x, new_y;

    new_x = x_pos - (x_pos % step_x);
    new_y = y_pos - (y_pos % step_y);

    return [new_x, new_y];
  }

  window.onkeydown = function ( event ) {
    console.log(event.key);
    if(event.key === 'r') {
      draw_context.fillStyle = '#FF0000'
    }
    if(event.key === 'g') {
      draw_context.fillStyle = '#00FF00'
    }
    if(event.key === 'b') {
      draw_context.fillStyle = '#0000FF'
    }
  };

  canvas.onclick = function ( event ) {
    let x_pos = event.pageX - canvas_left;
    let y_pos = event.pageY - canvas_top;

    [x_pos, y_pos] = snap_to_grid(x_pos, y_pos);

    state[x_pos/step_x][y_pos/step_y] = draw_context.fillStyle;

    //draw_context.fillRect(x_pos, y_pos, step_x, step_y);

    redraw(canvas, draw_context);
  };
}

window.onresize = async function() {
  reload();
}

window.onload = async function() {
  init();
  reload();
}