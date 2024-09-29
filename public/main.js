window.onload = () => {
    const canvas = document.getElementById('drawingCanvas');
    const ctx = canvas.getContext('2d');

    //set canvas size
    canvas.width = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;

    //track whether drawing or not
    let drawing = false;

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

        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000000';

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    }
};