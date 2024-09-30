//color palettes
let palette1 = ["#DEC0AE", "#D4949D", "#5C63A4", "#8B7FAC", "#ACB0CC"];
let palette2 = ["#9B7D61", "#DAA38F", "#E9D7C0", "#92ADA4", "#FED8A6"];
let palette3 = ["#914E56", "#4D303F", "#E6D389", "#2F2A35", "#F8E8CC"];
let palette4 = ["#F6724B", "#FC8A55", "#8F4E51", "#2B3349", "#223C63"];
let palette5 = ["#8b5a91", "#bf83b9", "#f4f0e5", "#fbd3dc", "#a24c71", "#f28290"];
let palette6 = ["#edd5c0", "#b3d9e0", "#92ada4", "#f2d6a1", "#f1a805"];
let palette7 = ["#87A680", "#f7e9de", "#db3e1c", "#4f364b", "#cabad8"];
let palette8 = ["#3B395D", "#9085BC", "#F2CBE0", "#CB6D9A", "#8F477B"];
let palette9 = ["#914E56", "#4D303F", "#E6D389", "#2F2A35", "#F8E8CC"];
let palette10 = ["#0F0000", "#440000", "#6E1313", "#F4B3B3", "#002028"];
let paletteDirectory = [palette1, palette2, palette3, palette4, palette5, palette6, palette7, palette8, palette9, palette10];

let currentPalette = '';
let strokeColor = currentPalette[0];

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

//randomize color palette
function randomPalette() {
    const randInt = Math.floor(Math.random() * paletteDirectory.length);
    currentPalette = paletteDirectory[randInt];
    console.log(currentPalette);
}

window.onload = () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');
    const toggleSliderBtn = document.getElementById('toggleLineThicknessBtn');
    const lineThicknessSlider = document.getElementById('lineThicknessSlider');
    const eraserBtn = document.getElementById('eraserBtn');
    const drawBtn = document.getElementById('drawBtn');
    const clearBtn = document.getElementById('clearBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const toolBarButtons = document.querySelectorAll('.toolBar button');

    randomPalette();
    

    //set canvas size
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;

    //track whether drawing or not
    let drawing = false;

    //set default line thickness
    let lineWidth = 2;

    // Add event listeners to each button
    toolBarButtons.forEach(button => {
        button.addEventListener('click', () => {
            toolBarButtons.forEach(btn => btn.classList.remove('active'));
            
            button.classList.add('active');
        });
    });    

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

    //erase strokes on canvas
    eraserBtn.addEventListener('click', () => {
        ctx.globalCompositeOperation = 'destination-out';
    });

    //switch to drawing mode
    drawBtn.addEventListener('click', () => {
        ctx.globalCompositeOperation = 'source-over';
    });

    //clear the canvas
    clearBtn.addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    })

    //download the drawing as an image
    downloadBtn.addEventListener('click', () => {
        const fileName = getFileName();
        let canvasURL = canvas.toDataURL("image/jpeg", 0.5);
        const createFile = document.createElement('a');
        createFile.href = canvasURL;
        createFile.download = fileName;
        createFile.click();
        createFile.remove();
    })

    //make color palette
    makePalette(currentPalette);

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

//prompts user for file name and converts it to comp friendly string
function getFileName() {
    let fileName = prompt("Please enter a name for your file:");

    if (fileName == null || fileName == "") {
        console.log("User cancelled the prompt.");
        return;
    } else {
        fileName = fileName.split(' ').join('_');
        console.log(fileName);
    }

    return fileName;
}
  
