
document.addEventListener("DOMContentLoaded", () =>{
const canvas = document.getElementById("canvas");
//document.body.appendChild(canvas)
const ctx = canvas.getContext("2d");
canvas.width = canvas.height = 512

const button =document.querySelector('button');
button.addEventListener('click', ()=>{
button.style.display = 'none';
letsGetItStarted();
})


const aspects = {
color: "cyan",
pitch: 1.0,
heightOfShape: 100.0,
widthOfShape: 4.0

} ;



const pitchInput =document.getElementById('pitch')
const pitchValue = document.getElementById('pitchValue')
pitchInput.addEventListener('input', (e) => {
    aspects.pitch = parseFloat(e.target.value);
    pitchValue.textContent = aspects.pitch
    if(biquad){
        biquad.frequency.value = aspects.pitch * 1000
    }
})


const colorInput = document.getElementById('color')
colorInput.addEventListener('input', (e) => {
    aspects.color = e.target.value;
})


const heightInput =document.getElementById('heightOfShape')
const heightValue = document.getElementById('heightValue')
heightInput.addEventListener('input', (e) => {
    aspects.heightOfShape = parseFloat(e.target.value);
    heightValue.textContent = aspects.heightOfShape;
})

const widthInput =document.getElementById('widthOfShape')
const widthValue = document.getElementById('widthValue')
widthInput.addEventListener('input', (e) => {
    aspects.widthOfShape = parseFloat(e.target.value);
    widthValue.textContent = aspects.widthOfShape;
})

let biquad;

 function letsGetItStarted (){
    const audioCtx = new (window.webkitAudioContext || window.AudioContext)();
    const audioElement = document.createElement('audio')
    audioElement.crossOrigin = 'anonymous' //this ensures the program will run properly on Glitch
    audioElement.controls = true;
    document.body.appendChild(audioElement)
    audioElement.src = './Drake and Josh Beat.mp3'

    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 1024;

biquad = audioCtx.createBiquadFilter()
biquad.type = "highpass"
biquad.frequency.value = aspects.pitch * 1000



    const player = audioCtx.createMediaElementSource(audioElement)
    player.connect(biquad)
    biquad.connect(analyser)
    analyser.connect(audioCtx.destination)
    audioElement.play().catch(error => {
        console.error("Autoplay is unavailable. User must play the audio manually.")
      })


const bufferLength = analyser.frequencyBinCount
const dataArray = new Uint8Array(bufferLength)

const draw = () => //examine
    {
        analyser.getByteFrequencyData(dataArray)
    

    ctx.clearRect( 0,0,canvas.width,canvas.height ) //cleans the canvas
    ctx.fillStyle = aspects.color //fills with the color I chose
    const myShapeWidth = aspects.widthOfShape


    for( let i = 0; i < bufferLength; i++ ) {
       const adjustHeight = (dataArray[i]/255)*aspects.heightOfShape //this scales the height of the figure
        const horizPosition = i*(myShapeWidth+1)
     
ctx.fillRect(horizPosition, canvas.height - adjustHeight, myShapeWidth, adjustHeight) //this draws onto the canvas, as it fills the shape

    }
requestAnimationFrame(draw);
}

draw(); //examine
}

})