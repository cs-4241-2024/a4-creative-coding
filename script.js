
const uStrings = document.querySelectorAll(".uStrings .string"),
      volumeSlider = document.querySelector(".volume-slider input"),
      stringsCheckbox = document.querySelector(".strings-checkbox input");


let allStrings = [],
    audio = new Audio(`samples/A.ogg`);

uStrings.forEach((string) => {
    allStrings.push(string.dataset.string);
    string.addEventListener("click", () => playTune(string.dataset.string));
  });

const playTune = (string) => {
    audio.src = `Chords${string}.wav`;
    audio.play();
  const clickedString = document.querySelector(`[data-string="${string}"]`);
    clickedString.classList.add("active");
    setTimeout(() => { 
        clickedString.classList.remove("active");
    }, 150);
  };

  const pressedString = (e) => {
    if (allStrings.includes(e.string)) playTune(e.string);
  };
const handleVolume = (e) => {
  audio.volume = e.target.value;
};
const hideStrings = () => {
    uStrings.forEach((string) => string.classList.toggle("hide"));
  };

document.addEventListener("click", pressedString);
stringsCheckbox.addEventListener("click", hideStrings);
volumeSlider.addEventListener("input", handleVolume);