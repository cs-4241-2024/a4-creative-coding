// FRONT-END (CLIENT) JAVASCRIPT HERE

window.onload = async function() {
  let canvas = document.getElementById("main-canvas");

  const OFFSET = 100;
  const DIMENSIONS = 20;

  let canvas_size = (window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight) - OFFSET;
  
  canvas.width = canvas_size;
  canvas.height = canvas_size;

  let draw_context = canvas.getContext("2d");

  let fill_styles = ['#003355', '#553300']
  
  let step_x = canvas.width/DIMENSIONS;
  let step_y = canvas.height/DIMENSIONS;

  let counter = 0;

  for(let iterator_x = 0; iterator_x < canvas.width; iterator_x += step_x) {
    for(let iterator_y = 0; iterator_y < canvas.height; iterator_y += step_y) {
      draw_context.fillStyle = fill_styles[counter++ % 2];
      draw_context.fillRect(iterator_x, iterator_y, step_x, step_y);
    }
  }
  
}