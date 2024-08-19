import {writeToLocalStorage,readFromLocalStorage} from './storage.mjs'

const audioPlayer = document.getElementById("audioPlayer");
const videoPlayer = document.getElementById("videoPlayer");
const playPauseButton = document.getElementById("playPause");
const stopButton = document.getElementById("stop");
const volumeControl = document.getElementById("volume");
const audioSourcesTextarea = document.getElementById("audioSources");
const loadPlaylistButton = document.getElementById("loadPlaylist");
const fileInput = document.getElementById("fileInput");
const startTimeSlider = document.getElementById("startTime");
const endTimeSlider = document.getElementById("endTime");
const stopTimeSlider = document.getElementById("stopTimeSlider");
let stopTimeDisplay = document.getElementById("stopTimeDisplay");
const currentTimeSlider = document.getElementById("currentTime");
const startTimeValue = document.getElementById("startTimeValue");
const endTimeValue = document.getElementById("endTimeValue");
const stopTimeValue = document.getElementById("stopTimeValue");
const currentTimeValue = document.getElementById("currentTimeValue");
const currentAudioName = document.getElementById("audioName");
const controlDiv = document.getElementById("controlDiv");

let playlist = [];
let currentIndex = 0;
let stopTime = 0;
let mediaPlayer = audioPlayer; // Default to audioPlayer
let waveSurfer; // WaveSurfer instance


audioSourcesTextarea.value=readFromLocalStorage('lplay')?.urls
// Initialize media player
audioPlayer.volume = 1;
videoPlayer.volume = 1;
 
// Initialize WaveSurfer
function initializeWaveSurfer() {
  waveSurfer = WaveSurfer.create({
    container: "#waveform",
    waveColor: "violet",
    progressColor: "purple"
  });

  waveSurfer.on("ready", () => {
    //waveSurfer.play();
  });

  waveSurfer.on("audioprocess", () => {
    const currentTime = waveSurfer.getCurrentTime();
    currentTimeValue.textContent = Math.floor(currentTime);
    currentTimeSlider.value = Math.floor(currentTime);
  });
}

// Play/Pause button click event
playPauseButton.addEventListener("click", () => {
  if (mediaPlayer.paused) {
    mediaPlayer.play();
  } else {
    mediaPlayer.pause();
  }
});

// Stop button click event
stopButton.addEventListener("click", () => {
  mediaPlayer.pause();
  mediaPlayer.currentTime = 0;
  playPauseButton.textContent = "Play";
});

// Volume control
volumeControl.addEventListener("input", () => {
  mediaPlayer.volume = volumeControl.value;
  if (waveSurfer) {
    waveSurfer.setVolume(volumeControl.value);
  }
});
  
// Load playlist button click event
loadPlaylistButton.addEventListener("click", () => {
    writeToLocalStorage('lplay',{urls: audioSourcesTextarea.value});
  playlist = audioSourcesTextarea.value
    .split("\n")
    .filter((url) => url.trim() !== "");
  currentIndex = 0;
  loadMedia(playlist[currentIndex]);

});
  
// File input change event
fileInput.addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    loadMedia(url, file.name);
  }
  playlist = [];
});

// Function to play media within a specified range
function playWithinRange() {
  const currentTime = mediaPlayer.currentTime;
  currentTimeValue.textContent = Math.floor(currentTime);
  currentTimeSlider.value = Math.floor(currentTime);
  waveSurfer.setTime(currentTime);
}

// Start Time slider input event
startTimeSlider.addEventListener("input", () => {
  startTimeValue.textContent = startTimeSlider.value;
  mediaPlayer.currentTime = startTimeSlider.value;
  playWithinRange();
});

// End Time slider input event
endTimeSlider.addEventListener("input", () => {
  endTimeValue.textContent = endTimeSlider.value;
  playWithinRange();
});

// Stop Time slider input event
stopTimeSlider.addEventListener("input", () => {
  stopTime = stopTimeSlider.value;
  playWithinRange();
  stopTimeDisplay.innerHTML = stopTimeSlider.value;
});

// Current Time slider input event
currentTimeSlider.addEventListener("input", () => {
  currentTimeValue.textContent = currentTimeSlider.value;
  mediaPlayer.currentTime = currentTimeSlider.value;
  playWithinRange();
});

// Media time update event
function onTimeUpdate() {
  playWithinRange();
  if (mediaPlayer.currentTime >= endTimeSlider.value) {
    mediaPlayer.currentTime = startTimeSlider.value;
  }
}

// Media ended event
function onMediaEnded() {
  currentIndex++;
  if (currentIndex < playlist.length) {
    loadMedia(playlist[currentIndex]);
  } else {
    // If all media sources have played, start from the beginning
    currentIndex = 0;
    loadMedia(playlist[currentIndex]);
  }
}

// Function to load and play media
function loadMedia(source, name) {
  if (!source) return;

  const isAudio = source.endsWith(".mp3") || source.endsWith(".wav");
  const isVideo = !isAudio;

  if (isVideo) {
    audioPlayer.style.display = "none";
    videoPlayer.style.display = "block";
    videoPlayer.src = source;
    videoPlayer.load();
    mediaPlayer = videoPlayer;
  } else {
    videoPlayer.style.display = "none";
    audioPlayer.style.display = "block";
    audioPlayer.src = source;
    audioPlayer.load();
    mediaPlayer = audioPlayer;

    // Load audio into WaveSurfer
    waveSurfer.load(source);
    //setTimeout(()=>{ waveSurfer.pause();},500)
  }

  mediaPlayer.play();

  mediaPlayer.addEventListener("loadedmetadata", () => {
    const mediaDuration = mediaPlayer.duration;
    startTimeSlider.max = mediaDuration;
    endTimeSlider.max = mediaDuration;
    endTimeSlider.value = mediaDuration;
    currentTimeSlider.max = mediaDuration;
  });

  currentAudioName.textContent = name || mediaPlayer.src;

  mediaPlayer.addEventListener("timeupdate", onTimeUpdate);
  mediaPlayer.addEventListener("ended", onMediaEnded);
}

// Initialize WaveSurfer when the page loads
document.addEventListener("DOMContentLoaded", initializeWaveSurfer);
  
setInterval(() => {
  if (!mediaPlayer.paused) {
    stopTimeSlider.value--;
  }
  if (stopTimeSlider.value <= 0) {
    mediaPlayer.pause();
    stopTimeSlider.value = 10000;
  }
  stopTimeDisplay.innerHTML = stopTimeSlider.value;
}, 1000);

// Function to create and append a new button
function createButton(id, text, onClick) {
  const button = document.createElement("button");
  button.id = id;
  button.textContent = text;
  button.addEventListener("click", onClick);
  controlDiv.prepend(button);
  return button;
}

// Create buttons for adjusting time
const addSecondButton = createButton("addSecond", "+2s", () => adjustTime(2));
const subtractSecondButton = createButton("subtractSecond", "-2s", () =>
  adjustTime(-2)
);

// Function to adjust time
function adjustTime(seconds) {
  // Adjust current time
  mediaPlayer.currentTime += seconds;

  // Update WaveSurfer
  if (waveSurfer) {
    waveSurfer.setTime(mediaPlayer.currentTime);
  }

  playWithinRange();
}

// Create container for time adjustment
const timeAdjustContainer = document.createElement("div");
timeAdjustContainer.id = "timeAdjustContainer";

// Move buttons into the container
controlDiv.prepend(addSecondButton);
controlDiv.prepend(subtractSecondButton);

// Create a display for adjusted time
const adjustedTimeDisplay = document.createElement("span");
adjustedTimeDisplay.id = "adjustedTimeDisplay";
timeAdjustContainer.appendChild(adjustedTimeDisplay);

// Update the adjustedTimeDisplay
function updateAdjustedTimeDisplay() {}

// Modify the playWithinRange function to update the adjusted time display

 
export default {readFromLocalStorage,writeToLocalStorage};

// Add event listeners to update the display when sliders change
startTimeSlider.addEventListener("input", updateAdjustedTimeDisplay);
endTimeSlider.addEventListener("input", updateAdjustedTimeDisplay);
currentTimeSlider.addEventListener("input", updateAdjustedTimeDisplay);



 // Create the tab bar container
 const tabBar = document.createElement('div');
 tabBar.style.display = 'flex';
 tabBar.style.justifyContent = 'left';
 tabBar.style.padding = '10px';
 tabBar.style.backgroundColor = '#f4f4f4';
 tabBar.style.borderBottom = '2px solid #ddd';
 tabBar.style.boxShadow = '0px 2px 5px rgba(0, 0, 0, 0.1)';

 // Create tab buttons for playlist, controlDiv, and cloudstorage
 const tabs = ['playlist', 'controlDiv', 'cloudstorage'];
 
 tabs.forEach(id => {
   const button = document.createElement('button');
   button.textContent = id.charAt(0).toUpperCase() + id.slice(1); // Capitalize text
   button.id = `${id}-tab`;
   button.style.padding = '10px 20px';
   button.style.margin = '0 5px';
   button.style.border = 'none';
   button.style.borderRadius = '5px';
   button.style.backgroundColor = '#ffffff';
   button.style.color = '#333';
   button.style.cursor = 'pointer';
   button.style.fontSize = '16px';
   button.style.transition = 'background-color 0.3s ease, color 0.3s ease';
  
   // Add event listener to each button
   button.addEventListener('click', () => {
     // Show the clicked tab content and hide others
     tabs.forEach(tabId => {
       const tabElement = document.getElementById(tabId);
       const tabButton = document.getElementById(`${tabId}-tab`);
       if (tabId === id) {
         tabElement.style.display = 'block'; // Show current tab
         tabButton.style.backgroundColor = 'lightgreen'; // Highlight active tab
         tabButton.style.color = 'blue';
       } else {
         tabElement.style.display = 'none'; // Hide other tabs
         tabButton.style.backgroundColor = '#ffffff'; // Reset other tabs
         tabButton.style.color = '#333';
       }
     });
   });

   tabBar.appendChild(button);
 });

 // Prepend the tab bar to the body
 document.body.prepend(tabBar);

 // Hide all tabs initially, except the first one
 tabs.forEach((id, index) => {
   const tabElement = document.getElementById(id);
   if (index === 0) {
     tabElement.style.display = 'block'; // Show the first tab initially
   } else {
     tabElement.style.display = 'none'; // Hide others
   }
 });

