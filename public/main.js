import {Pane} from 'https://cdn.jsdelivr.net/npm/tweakpane@4.0.3/dist/tweakpane.min.js';


window.onload = function () {
    const canvas = document.getElementById('drawing');
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let isDrawing = false;
    let color = '#000000';
    let size = 5;
    let tool = 'pen'

    canvas.addEventListener('pointerdown', startDrawing);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', stopDrawing);
    canvas.addEventListener('pointerout', stopDrawing);

    function startDrawing(e) {
        isDrawing = true;
        draw(e);
    }

    function draw(e) {
        if (!isDrawing) return;

        if (tool === 'pen') {
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.strokeStyle = color;
        }

        else if (tool === 'eraser') {
            ctx.lineWidth = size;
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#ffffff';
        }
       

        ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
    }

    function stopDrawing() {
        isDrawing = false;
        ctx.beginPath(); // reset the path
    }

    const deleteButton = document.getElementById('deleteButton');

    deleteButton.addEventListener('click', () => {
        clearCanvas();
    });

    function clearCanvas() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const fillButton = document.getElementById('fillButton');
    fillButton.addEventListener('click', () => {
        fillCanvas();
    });

    function fillCanvas() {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const downloadButton = document.getElementById('downloadButton');
    downloadButton.addEventListener('click', () => {
        saveImage();
    });

    function saveImage() {
        var canvas = document.getElementById('drawing');
        var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  
        var element = document.createElement('a');
        var filename = 'yourDrawing.png';
        element.setAttribute('href', image);
        element.setAttribute('download', filename);

        element.click();
    }

    const eraserButton = document.getElementById('eraserButton');
    eraserButton.addEventListener('click', () => {
        tool = 'eraser';
    });

    const penButton = document.getElementById('penButton');
    penButton.addEventListener('click', () => {
        tool = 'pen';
    });

    const pane = new Pane({
        title: 'Parameters',
        expanded: true,
    });

    const PARAMS = {
        color: '#000000',
        size: 5,
    };

    pane.addBinding(PARAMS, 'color').on('change', (ev) => {
        if (tool === 'pen') {
            color = ev.value;
        }
    });
    pane.addBinding(PARAMS, 'size',
        {min:1, max: 100,}).on('change', (ev) => {
        size = ev.value;
    });

};
