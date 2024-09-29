// FRONT-END (CLIENT) JAVASCRIPT HERE

const OFFSET = 100;
let dimensions = 16;
let spawn_counter = 0;
let old_style = '#000000'
let background = '#FFFFFF';

let state = [];

let activate_queue = [];
let update_queue = [];

let step_x, step_y;
let should_update = true;
let canvas;
let draw_context;

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;  
  }
}

class StaticCell extends Cell {
  constructor(color, x, y) {
    super(x, y);
    this.color = color;
  }
}

class ActivatingCell extends Cell {
  constructor(color, x, y) {
    super(x, y);
    this.color = color;
  }

  activate(state) {}
}

class UpdatingCell extends Cell {
  constructor(color, x, y) {
    super(x, y);
    this.color = color;
  }

  update(state) {}
}

class DiagonalCell extends ActivatingCell {
  activate(state) {
    for(let [x_mod, y_mod] of [[-1, 1], [-1, -1], [1, -1], [1, 1]])
    {
      let new_x = this.x + x_mod;
      let new_y = this.y + y_mod;

      if(new_x < dimensions && new_x >= 0 && new_y < dimensions && new_y >= 0)
      {
        if(state[new_x][new_y] instanceof StaticCell)
        {
          state[new_x][new_y] = new DiagonalCellChild(this.color, new_x, new_y, x_mod, y_mod);
        }

        if(state[new_x][new_y] instanceof ActivatingCell)  {
          activate_queue.push(state[new_x][new_y]);
        }
      }
    }

    state[this.x][this.y] = new StaticCell(background, this.x, this.y);
  }
}

class DiagonalCellChild extends UpdatingCell {
  constructor(color, x, y, x_mod, y_mod) {
    super(color, x, y);
    this.x_mod = x_mod;
    this.y_mod = y_mod;
  }

  update(state) { 
    let checks = [[this.x_mod, this.y_mod]];

    for(let [temp_x_mod, temp_y_mod] of checks) {
      if(this.x + temp_x_mod < dimensions && this.x + temp_x_mod >= 0 && this.y + temp_y_mod < dimensions && this.y + temp_y_mod >= 0)
      {
        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof ActivatingCell)  {
          activate_queue.push(state[this.x + temp_x_mod][this.y + temp_y_mod]);
        
        }
        
        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof UpdatingCell)  {
          let other_color = state[this.x + temp_x_mod][this.y + temp_y_mod].color;
          state[this.x + temp_x_mod][this.y + temp_y_mod] = new DiagonalCellChild(combine_color(this.color, other_color), this.x + temp_x_mod, this.y + temp_y_mod, temp_x_mod, temp_y_mod);
        }

        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof StaticCell)  {
          state[this.x + temp_x_mod][this.y + temp_y_mod] = new DiagonalCellChild(this.color, this.x + temp_x_mod, this.y + temp_y_mod, temp_x_mod, temp_y_mod);
        }
      }
    } 

    state[this.x][this.y] = new StaticCell(background, this.x, this.y);
  }
}

class CrossCell extends ActivatingCell {
  activate(state) {
    for(let [x_mod, y_mod] of [[-1, 0], [1, 0], [0, -1], [0, 1]])
    {
      let new_x = this.x + x_mod;
      let new_y = this.y + y_mod;

      if(new_x < dimensions && new_x >= 0 && new_y < dimensions && new_y >= 0)
      {
        if(state[new_x][new_y] instanceof StaticCell)
        {
          state[new_x][new_y] = new CrossCellChild(this.color, new_x, new_y, x_mod, y_mod);
        }

        if(state[new_x][new_y] instanceof ActivatingCell)  {
          activate_queue.push(state[new_x][new_y]);
        }
      }
    }

    state[this.x][this.y] = new StaticCell(background, this.x, this.y);
  }
}

class CrossCellChild extends UpdatingCell {
  constructor(color, x, y, x_mod, y_mod) {
    super(color, x, y);
    this.x_mod = x_mod;
    this.y_mod = y_mod;
  }

  update(state) { 
    let checks = [[this.x_mod, this.y_mod]];

    for(let [temp_x_mod, temp_y_mod] of checks) {
      if(this.x + temp_x_mod < dimensions && this.x + temp_x_mod >= 0 && this.y + temp_y_mod < dimensions && this.y + temp_y_mod >= 0)
      {
        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof ActivatingCell)  {
          activate_queue.push(state[this.x + temp_x_mod][this.y + temp_y_mod]);
        
        }
        
        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof UpdatingCell)  {
          let other_color = state[this.x + temp_x_mod][this.y + temp_y_mod].color;
          state[this.x + temp_x_mod][this.y + temp_y_mod] = new CrossCellChild(combine_color(this.color, other_color), this.x + temp_x_mod, this.y + temp_y_mod, temp_x_mod, temp_y_mod);
        }

        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof StaticCell)  {
          state[this.x + temp_x_mod][this.y + temp_y_mod] = new CrossCellChild(this.color, this.x + temp_x_mod, this.y + temp_y_mod, temp_x_mod, temp_y_mod);
        }
      }
    } 

    state[this.x][this.y] = new StaticCell(background, this.x, this.y);
  }
}

class SpreadCell extends ActivatingCell {
  activate(state) {
    for(let x_mod = -1; x_mod <= 1; x_mod++)
    {
      for(let y_mod = -1; y_mod <= 1; y_mod++)
      {
        if(x_mod == 0 && y_mod == 0) {
          continue; // Avoid infinite loop
        }

        let new_x = this.x + x_mod;
        let new_y = this.y + y_mod;

        if(new_x < dimensions && new_x >= 0 && new_y < dimensions && new_y >= 0)
        {
          if(state[new_x][new_y] instanceof StaticCell)
          {
            state[new_x][new_y] = new SpreadCellChild(this.color, new_x, new_y, x_mod, y_mod);
          }

          if(state[new_x][new_y] instanceof ActivatingCell)  {
            activate_queue.push(state[new_x][new_y]);
          }
        }
      }
    }

    state[this.x][this.y] = new StaticCell(background, this.x, this.y);
  }
}

class SpreadCellChild extends UpdatingCell {
  constructor(color, x, y, x_mod, y_mod) {
    super(color, x, y);
    this.x_mod = x_mod;
    this.y_mod = y_mod;
  }

  update(state) { 
    let checks = [];
    if(this.x_mod != 0 && this.y_mod != 0) {
      checks = [[this.x_mod, 0], [this.x_mod, this.y_mod], [0, this.y_mod]];
    } else {
      checks = [[this.x_mod, this.y_mod]];
    }

    for(let [temp_x_mod, temp_y_mod] of checks) {
      if(this.x + temp_x_mod < dimensions && this.x + temp_x_mod >= 0 && this.y + temp_y_mod < dimensions && this.y + temp_y_mod >= 0)
      {
        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof ActivatingCell)  {
          activate_queue.push(state[this.x + temp_x_mod][this.y + temp_y_mod]);
        }
  
        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof StaticCell)  {
          state[this.x + temp_x_mod][this.y + temp_y_mod] = new SpreadCellChild(this.color, this.x + temp_x_mod, this.y + temp_y_mod, temp_x_mod, temp_y_mod);
        }
  
        if(state[this.x + temp_x_mod][this.y + temp_y_mod] instanceof UpdatingCell)  {
          let other_color = state[this.x + temp_x_mod][this.y + temp_y_mod].color;
          state[this.x + temp_x_mod][this.y + temp_y_mod] = new SpreadCellChild(combine_color(this.color, other_color), this.x + temp_x_mod, this.y + temp_y_mod, temp_x_mod, temp_y_mod);
        }
      }
    } 

    state[this.x][this.y] = new StaticCell(background, this.x, this.y);
  }
}

const translator = {
  "spread": SpreadCell,
  "diagonal": DiagonalCell,
  "cross": CrossCell
}

combine_component = function(color_1, color_2) {
  return ('00' + Math.min(255, Math.round(parseInt(color_1, 16) * 0.5) + Math.round(parseInt(color_2, 16) * 0.5)).toString(16)).slice(-2);
}

combine_color = function(color_1, color_2) {
  let red_component = combine_component(color_1.substring(1, 3), color_2.substring(1, 3));
  let green_component = combine_component(color_1.substring(3, 5), color_2.substring(3, 5));
  let blue_component = combine_component(color_1.substring(5), color_2.substring(5));

  return '#' + red_component + green_component + blue_component;
}

update = async function () {
  if(should_update) {
    redraw();
  }

  await new Promise(r => setTimeout(r, 256));

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
  let resize_button = document.getElementById("set-size");
  let color_selector = document.getElementById("color");
  size = document.getElementById("size");
  dimensions = parseInt(size.value, 10);
  draw_context = canvas.getContext('2d');

  let red = document.getElementById("red");
  let green = document.getElementById("green");
  let blue = document.getElementById("blue");
  
  let red_label = document.getElementById("red-label");
  let green_label = document.getElementById("green-label");
  let blue_label = document.getElementById("blue-label");
  let color_label = document.getElementById("color-label");

  red_label.innerText = "Red Component: " + red.value;
  blue_label.innerText = "Blue Component: " + blue.value;
  green_label.innerText = "Green Component: " + green.value;
  color_label.innerText = "Color: " + color_selector.value;

  red.onchange = async function () {
    let color_label = document.getElementById("color-label");
    let label = document.getElementById("red-label");
    label.innerText = "Red Component: " + red.value;
    color_selector.value = '#' + ('00' + parseInt(red.value, 10).toString(16)).slice(-2) + ('00' + parseInt(green.value, 10).toString(16)).slice(-2) + ('00' + parseInt(blue.value, 10).toString(16)).slice(-2);
    color_label.innerText = "Color: " + color_selector.value;
  }

  blue.onchange = async function () {
    let color_label = document.getElementById("color-label");
    let label = document.getElementById("blue-label");
    label.innerText = "Blue Component: " + blue.value;
    color_selector.value = '#' + ('00' + parseInt(red.value, 10).toString(16)).slice(-2) + ('00' + parseInt(green.value, 10).toString(16)).slice(-2) + ('00' + parseInt(blue.value, 10).toString(16)).slice(-2);
    color_label.innerText = "Color: " + color_selector.value;
  }

  green.onchange = async function () {
    let color_label = document.getElementById("color-label");
    let label = document.getElementById("green-label");
    label.innerText = "Green Component: " + green.value;
    color_selector.value = '#' + ('00' + parseInt(red.value, 10).toString(16)).slice(-2) + ('00' + parseInt(green.value, 10).toString(16)).slice(-2) + ('00' + parseInt(blue.value, 10).toString(16)).slice(-2);
    color_label.innerText = "Color: " + color_selector.value;
  }

  resize_button.onclick = async function() {
    init();
    reload();
  }

  color_selector.onchange = async function() {
    let result = color_selector.value;
    let red = document.getElementById("red");
    let green = document.getElementById("green");
    let blue = document.getElementById("blue");
    let red_label = document.getElementById("red-label");
    let green_label = document.getElementById("green-label");
    let blue_label = document.getElementById("blue-label");
    let color_label = document.getElementById("color-label");
    
    red.value = parseInt(result.substring(1, 3), 16);
    red_label.innerText = "Red Component: " + red.value;
    green.value = parseInt(result.substring(3, 5), 16);
    green_label.innerText = "Green Component: " + green.value;
    blue.value = parseInt(result.substring(5), 16);
    blue_label.innerText = "Blue Component: " + blue.value;

    color_label.innerText = "Color: " + color_selector.value;
  }

  state = [];
  for(let i = 0; i < dimensions; i++)
  {
    let temp = [];
    for(let j = 0; j < dimensions; j++) {
      temp.push(new StaticCell(background, i, j));
    }
    state.push(temp);
  }
}

reload_state = async function () {

  for(let i = 0; i < dimensions; i++) {
    for(let j = 0; j < dimensions; j++) {
      draw_context.fillStyle = state[i][j].color;
      draw_context.fillRect((i * step_x), j * step_y, step_x, step_y);
    }
  }

  for(let i = 0; i < dimensions; i++) {
    for(let j = 0; j < dimensions; j++) {
      if(state[i][j] instanceof UpdatingCell)
      {
        update_queue.push(state[i][j]);
      }
    }
  }

  let new_updates = [...update_queue];
  update_queue = [];

  let new_activations = [...activate_queue];
  activate_queue = [];

  for(let item of new_activations) {
    item.activate(state);
  }

  for(let item of new_updates) {
    item.update(state);
  }

  draw_context.fillStyle = old_style
}

reload = async function () {
  let canvas_size = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) - OFFSET;
  
  canvas.width = canvas_size;
  canvas.height = canvas_size;
  
  step_x = canvas.width/dimensions;
  step_y = canvas.height/dimensions;

  redraw(canvas, draw_context);

  canvas_left = canvas.offsetLeft + canvas.clientLeft;
  canvas_top = canvas.offsetTop + canvas.clientTop;
  
  snap_to_grid = function (x_pos, y_pos) {
    let new_x, new_y;

    new_x = x_pos - (x_pos % step_x);
    new_y = y_pos - (y_pos % step_y);

    return [Math.round(new_x/step_x), Math.round(new_y/step_y)];
  }

  canvas.onclick = function ( event ) {
    let red = document.getElementById("red");
    let green = document.getElementById("green");
    let blue = document.getElementById("blue");

    let draw_color = '#' + ('00' + parseInt(red.value, 10).toString(16)).slice(-2) + ('00' + parseInt(green.value, 10).toString(16)).slice(-2) + ('00' + parseInt(blue.value, 10).toString(16)).slice(-2);

    let x_pos = event.pageX - canvas_left;
    let y_pos = event.pageY - canvas_top;

    [x_pos, y_pos] = snap_to_grid(x_pos, y_pos);

    let type = document.getElementById("type").value
    if(type == 'erase') {
      state[x_pos][y_pos] = new StaticCell(background, x_pos, y_pos)
      return;
    }

    if(state[x_pos][y_pos] instanceof ActivatingCell) {
      state[x_pos][y_pos].activate(state);
    } else {
        let class_to_render = translator[type];
        state[x_pos][y_pos] = new class_to_render(draw_color, x_pos, y_pos);
    }
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