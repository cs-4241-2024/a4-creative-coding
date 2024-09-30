//color palettes
let palette1 = ["#DEC0AE", "#D4949D", "#5C63A4", "#8B7FAC", "#ACB0CC"];

let strokeColor = palette1[0];

//generate a limited color bar based on predefined color palette
function makePalette(c) {
    const colorBar = document.querySelector('.colorBar');
    for (var i = 0; i < c.length; i++) {
      const button = document.createElement('button');
      button.value = c[i];
      button.onclick = updateColor;
      button.style = `background-color: ${c[i]}`;
      colorBar.appendChild(button);
    }
};

//update stroke color
function updateColor(e) {
    strokeColor = e.target.value; 
}

window.onload = () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const toggleSliderBtn = document.getElementById('toggleLineThicknessBtn');
    const lineThicknessSlider = document.getElementById('lineThicknessSlider');
    const eraserBtn = document.getElementById('eraserBtn');
    const drawBtn = document.getElementById('drawBtn');

    //set canvas size
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;

    //track whether drawing or not
    let drawing = false;

    //set default line thickness
    let lineWidth = 2;

    //toggles slider visibility
    toggleSliderBtn.addEventListener('click', () => {
        if(lineThicknessSlider.style.display === 'none') {
            lineThicknessSlider.style.display = 'block';
        } else {
            lineThicknessSlider.style.display = 'none';
        }
    });

    //update line width to slider value
    lineThicknessSlider.addEventListener('input', (e) => {
        lineWidth = e.target.value;
    });

    eraserBtn.addEventListener('click', () => {
        ctx.globalCompositeOperation = 'destination-out';
    });

    drawBtn.addEventListener('click', () => {
        ctx.globalCompositeOperation = 'source-over';
    });

    //make color palette
    makePalette(palette1);

    //start drawing
    canvas.addEventListener('mousedown', (e) => {
        drawing = true;
        draw(e);
    });

    //stop drawing
    canvas.addEventListener('mouseup', (e) => {
        drawing = false;
        ctx.beginPath();
    });

    //draw based on the mouse movement
    canvas.addEventListener('mousemove', draw);

    function draw(e) {
        if (!drawing) return;

        //get the mouse coords
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = strokeColor;

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
};


  
