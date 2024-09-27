// FRONT-END (CLIENT) JAVASCRIPT HERE

const OFFSET = 100;
const DIMENSIONS = 50;
let spawn_counter = 0;
let old_style = '#000000'
let background = '#FFFFFF';
let state = [];
let step_x, step_y;
let should_update = true;
let canvas;
let draw_context;

class Cell {
  constructor(color, x, y) {
      this.color = color;
      this.x = x;
      this.y = y;  
      this.spawn_time = spawn_counter;
  }

  activate(state) {}

  ping(state) {}
}

class ColoredCell extends Cell {
  constructor(color, x, y) {
      super(color, x, y);
  }

  activate(state) {}

  ping(state) {}
}

class CellChild {
  constructor(color, x, y) {
      this.color = color;
      this.x = x;
      this.y = y;  
      this.spawn_time = spawn_counter;
  }

  activate(state) {}

  ping(state) {}
}

class ComplexCell extends Cell {
  constructor(color, x, y, lifetime) {
      super(color, x, y);
      this.lifetime = lifetime;
  }

  activate(state) {
    state[this.x][this.y] = new ColoredCell(background, this.x, this.y);
  }

  ping(state) {
    this.lifetime -= 1;
    if(this.lifetime === 0) {
      this.activate(state);
    }
  }
}

class SpreadCell extends Cell {
  constructor(color, x, y, lifetime) {
      super(color, x, y);
      this.lifetime = lifetime;
      this.base_lifetime = lifetime;
  }

  activate(state) {
    for(let x_mod = -1; x_mod <= 1; x_mod++)
    {
      for(let y_mod = -1; y_mod <= 1; y_mod++)
      {
        let new_x = this.x + x_mod;
        let new_y = this.y + y_mod;
        if(new_x < DIMENSIONS && new_x >= 0 && new_y < DIMENSIONS && new_y >= 0)
        {
          if(state[new_x][new_y] instanceof ColoredCell)
          {
            state[new_x][new_y] = new SpreadCellChild(this.color, new_x, new_y, x_mod, y_mod);
          }
        }
      }
    }

    this.lifetime = this.base_lifetime
  }

  ping(state) {
    this.lifetime -= 1;
    if(this.lifetime === 0) {
      this.activate(state);
    }
  }
}

class SpreadCellChild extends ColoredCell {
  constructor(color, x, y, x_mod, y_mod) {
      super(color, x, y);
      this.x_mod = x_mod;
      this.y_mod = y_mod;
  }

  activate(state) {
    state[this.x][this.y] = new ColoredCell(background, this.x, this.y);

    if(this.x + this.x_mod < DIMENSIONS && this.x + this.x_mod >= 0 && this.y + this.y_mod < DIMENSIONS && this.y + this.y_mod >= 0)
    {
      if(state[this.x + this.x_mod][this.y + this.y_mod] instanceof ColoredCell)  {
        state[this.x + this.x_mod][this.y + this.y_mod] = new SpreadCellChild(this.color, this.x + this.x_mod, this.y + this.y_mod, this.x_mod, this.y_mod);
      }
    }
  }

  ping(state) {
    this.activate(state);
  }
}

update = async function () {
  if(should_update) {
    redraw();
  }

  await new Promise(r => setTimeout(r, 64));

  window.requestAnimationFrame(update);
}

redraw = async function () {
  
  reload_state();

  for(let iterator_x = step_x; iterator_x < canvas.width; iterator_x += step_x) {
    draw_context.beginPath()
    draw_context.moveTo(iterator_x, 0);
    draw_context.lineTo(iterator_x, canvas.height);
    draw_context.stroke();
  }

  for(let iterator_y = step_y; iterator_y < canvas.height; iterator_y += step_y) {
    draw_context.beginPath()
    draw_context.moveTo(0, iterator_y);
    draw_context.lineTo(canvas.width, iterator_y);
    draw_context.stroke();
  }
}

init = async function () {
  canvas = document.getElementById("main-canvas");
  draw_context = canvas.getContext('2d');
  
  for(let i = 0; i < DIMENSIONS; i++)
  {
    let temp = [];
    for(let j = 0; j < DIMENSIONS; j++) {
      temp.push(new ColoredCell(background, function(){}, function(){}));
    }
    state.push(temp);
  }
}

reload_state = async function () {

  for(let i = 0; i < DIMENSIONS; i++) {
    for(let j = 0; j < DIMENSIONS; j++) {
      if(state[i][j].spawn_time != spawn_counter)
      {
        state[i][j].ping(state);
        state[i][j].spawn_time = -1;
      }
    }
  }

  spawn_counter = (spawn_counter + 1) % 10;

  for(let i = 0; i < DIMENSIONS; i++) {
    for(let j = 0; j < DIMENSIONS; j++) {
      draw_context.fillStyle = state[i][j].color;
      draw_context.fillRect((i * step_x), j * step_y, step_x, step_y);
    }
  }

  draw_context.fillStyle = old_style
}

reload = async function () {
  let canvas_size = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) - OFFSET;
  
  canvas.width = canvas_size;
  canvas.height = canvas_size;
  
  step_x = canvas.width/DIMENSIONS;
  step_y = canvas.height/DIMENSIONS;

  redraw(canvas, draw_context);

  canvas_left = canvas.offsetLeft + canvas.clientLeft;
  canvas_top = canvas.offsetTop + canvas.clientTop;
  
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

    old_style = draw_context.fillStyle;
  };

  canvas.onclick = function ( event ) {
    let x_pos = event.pageX - canvas_left;
    let y_pos = event.pageY - canvas_top;

    [x_pos, y_pos] = snap_to_grid(x_pos, y_pos);

    state[x_pos/step_x][y_pos/step_y] = new SpreadCell(draw_context.fillStyle, x_pos/step_x, y_pos/step_y, 5);
  };
}

window.onresize = async function() {
  reload();
}

window.onload = async function() {
  init();
  reload();
  requestAnimationFrame(update);
}