const colorPicker = document.getElementById("colorPicker")
const size = document.getElementById("size")
const radiusNumber = document.getElementById("radiusNumber")

let radius = size.getAttribute("value")
let color = colorPicker.getAttribute("value")

colorPicker.oninput = (e) => {
  color = e.target.value
}
size.oninput = (e) => {
  radius = e.target.value
  radiusNumber.textContent = "Radius: " + radius + "px"
}

drawPreview = function() {
  const preview = document.getElementById("preview")
  const pctx = preview.getContext("2d")

  let x = preview.width / 2
  let y = preview.height / 2

  pctx.clearRect(0, 0, preview.width, preview.height)
  pctx.beginPath()
  pctx.arc(x, y, radius, 0, Math.PI * 2, true)
  pctx.closePath()
  pctx.fillStyle = color
  pctx.fill()
}

drawPreview()
document.oninput = drawPreview



const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")

canvas.setAttribute("width", window.innerWidth * 0.8)
canvas.setAttribute("height", window.innerHeight)

draw = function(e) {
  let x = e.clientX - canvas.getBoundingClientRect().left
  let y = e.clientY
  let eraser = "rgba(255, 255, 255, 1)"
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2, true)
  ctx.closePath()
  if(erasing)
    ctx.fillStyle = eraser
  else
    ctx.fillStyle = color
  ctx.fill()
}

let drawing = false

canvas.onpointerdown = (e) => {
  draw(e)
  drawing = true
}

canvas.onpointermove = (e) => {
  if(drawing) draw(e)
}

canvas.onpointerup = () => {drawing = false}
canvas.onpointerleave = () => {drawing = false}



const eraser = document.getElementById("eraser")
const fill = document.getElementById("fill")
const clear = document.getElementById("clear")

let erasing = false

eraser.onclick = () => {
  erasing = !erasing
  if(erasing)
    eraser.textContent = "Eraser: Enabled"
  else
    eraser.textContent = "Eraser: Disabled"
}

fill.onclick = () => {
  ctx.rect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = color
  ctx.fill()
}

clear.onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}



const title = document.getElementById("title")
let cycle = -1
let rgb = [255, 0, 0]

titleColor = function() {
  let newCycle = true
  for(let i = 0; i < rgb.length; i++) {
    if(rgb[i] != 0 && rgb[i] != 255) {
      newCycle = false
      break
    }
  }
  if(newCycle) cycle++

  switch(cycle % 6) {
    case 0:
      rgb[2] += 1
      break
    case 1:
      rgb[0] -= 1
      break
    case 2:
      rgb[1] += 1
      break
    case 3:
      rgb[2] -= 1
      break
    case 4:
      rgb[0] += 1
      break
    case 5:
      rgb[1] -= 1
      break
  }

  title.style.color = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
}

setInterval(titleColor)