function getPhysicalScreenWidth() {
    const rawWidth = screen.width * window.devicePixelRatio;
    return Math.round(rawWidth / 10) * 10;

}

function setViewportToDevicePixels() {
    // Get the pixel ratio
    const pixelRatio = window.devicePixelRatio || 1;

    // Get the screen's width in CSS pixels
    const screenWidth = window.screen.width;

    // Calculate the actual pixel width
    const actualWidth = getPhysicalScreenWidth();

    console.log("pixelRatio:", pixelRatio);
    console.log("screenWidth:", screenWidth);
    console.log("actualWidth:", actualWidth);
    //log al()
    // Set the viewport meta tag
    const viewport = document.querySelector('meta[name="viewport"]');
    //user-scale need to yes, or the window size will be changed
    viewport.setAttribute(
        "content",
        `width=${actualWidth}, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes`,
    );
}
setViewportToDevicePixels();

document.querySelector("#fsbutton").addEventListener("click", () => {
    document.requestFullscreen();
    setViewportToDevicePixels();
});
// Run on page load
setViewportToDevicePixels();

// Optionally, run on orientation change
window.addEventListener("resize", setViewportToDevicePixels);
window.addEventListener("orientationchange", () => setViewportToDevicePixels());


const fileInput = document.getElementById("fileInput");
const srtInput = document.getElementById("srtInput");
const videoPlayer = document.getElementById("videoPlayer");
const imgViewer=document.getElementById('imgViewer');
const videoResolution = document.getElementById("videoResolution");
const currentVideoSize = document.getElementById("currentVideoSize");
const windowSize = document.getElementById("windowSize");
const subtitlesText = document.getElementById("subtitlesText");
const debugInfo = document.getElementById("debugInfo");
const size2xButton = document.getElementById("size2x");
const size4xButton = document.getElementById("size4x");
const resetSizeButton = document.getElementById("resetSize");
const size05xButton = document.getElementById("size05x");
const toggleFixVideoButton = document.getElementById("toggleFixVideo");
const fileMenuItem = document.getElementById("fileMenuItem");
const srtMenuItem = document.getElementById("srtMenuItem");
const menuBar = document.getElementById("menuBar");
const videoInfo = document.getElementById("videoInfo");
const toggleInfo = document.getElementById("toggleInfo");
const subtitlesContainer = document.getElementById("subtitlesContainer");
const subtitlesHeader = document.getElementById("subtitlesHeader");

let originalWidth = 0;
let subtitles = [];
let isVideoFixed = false;
let hideMenuBarTimeout;

const urlInput = document.getElementById("urlInput");
const playUrlButton = document.getElementById("playUrlButton");
playUrlButton.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (url) {
        loadVideo(url);
    }
});

function debug(message) {
    console.log(message);
    debugInfo.textContent += message + "\n";
}

fileMenuItem.addEventListener("click", () => fileInput.click());
srtMenuItem.addEventListener("click", () => srtInput.click());

fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        const videoUrl = URL.createObjectURL(file);
        loadVideo(videoUrl);
    }
});

srtInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (file) {
        debug(`Loading SRT file: ${file.name}`);
        const reader = new FileReader();
        reader.onload = function (e) {
            debug(
                `SRT file loaded, content length: ${e.target.result.length}`,
            );
            parseSRT(e.target.result);
        };
        reader.readAsText(file);
    }
});

function loadImg(url){
    imgViewer.src=url;
    videoPlayer.style.display='none';
    
}

function loadVideo(url) {
    videoPlayer.src = url;
    videoPlayer.onloadedmetadata = function () {
        videoPlayer.style.width = `${videoPlayer.videoWidth}px`;
        videoPlayer.style.height = `${videoPlayer.videoHeight}px`;

        originalWidth = videoPlayer.offsetWidth;
        updateVideoInfo();
    };
}

function updateVideoInfo() {
    videoResolution.textContent = `${videoPlayer.videoWidth}x${videoPlayer.videoHeight}`;
    currentVideoSize.textContent = `${videoPlayer.offsetWidth}x${videoPlayer.offsetHeight}`;
    windowSize.textContent = `${window.innerWidth}x${window.innerHeight} ${window.outerWidth}x${window.outerHeight}`;
    viewportSize.textContent = `${document.documentElement.clientWidth}x ${document.documentElement.clientHeight} ${window.visualViewport.scale}`
}

size2xButton.addEventListener("click", () => resizeVideo(2));
size4xButton.addEventListener("click", () => resizeVideo(4));
size05xButton.addEventListener("click", () => resizeVideo(0.5));
resetSizeButton.addEventListener("click", () => resizeVideo(1));

function resizeVideo(scale) {
    videoPlayer.style.left = 0;
    videoPlayer.style.top = 0;
    videoPlayer.style.width = `${videoPlayer.videoWidth * scale}px`;
    videoPlayer.style.height = `${videoPlayer.videoHeight * scale}px`;

    updateVideoInfo();
}

function resetVideoSize() {
    videoPlayer.style.width = `${originalWidth}px`;
    updateVideoInfo();
}

toggleFixVideoButton.addEventListener("click", () => toggleFixVideo());

function toggleFixVideo() {
    if (!isVideoFixed) {
        videoPlayer.style.position = "fixed";
        videoPlayer.style.top = "0px";
        videoPlayer.style.left = "0px";
        toggleFixVideoButton.textContent = "Toggle Unfix Video";
    } else {
        videoPlayer.style.position = "static";
        toggleFixVideoButton.textContent = "Toggle Fix Video";
    }
    isVideoFixed = !isVideoFixed;
}

toggleInfo.addEventListener("click", () => {
    updateVideoInfo();

    videoInfo.classList.toggle("hidden");
});

function parseSRT(srtContent) {
    debug("Parsing SRT content");
    const lines = srtContent.split(/\r?\n/);
    let currentSubtitle = {};
    subtitles = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        if (line === "") {
            if (Object.keys(currentSubtitle).length > 0) {
                subtitles.push(currentSubtitle);
                currentSubtitle = {};
            }
        } else if (!isNaN(line)) {
            currentSubtitle.index = parseInt(line);
        } else if (line.includes("-->")) {
            const [start, end] = line
                .split("-->")
                .map((timeStr) => timeStr.trim());
            currentSubtitle.startTime = timeToSeconds(start);
            currentSubtitle.endTime = timeToSeconds(end);
        } else {
            if (currentSubtitle.text) {
                currentSubtitle.text += " " + line;
            } else {
                currentSubtitle.text = line;
            }
        }
    }

    if (Object.keys(currentSubtitle).length > 0) {
        subtitles.push(currentSubtitle);
    }

    debug(`Parsed ${subtitles.length} subtitles`);
    if (subtitles.length === 0) {
        debug("Parsing failed. Here's a sample of the content:");
        debug(srtContent.slice(0, 500));
    }

    renderSubtitles();
}

function timeToSeconds(timeString) {
    const [time, milliseconds] = timeString.split(",");
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return (
        hours * 3600 +
        minutes * 60 +
        seconds +
        parseInt(milliseconds) / 1000
    );
}

function renderSubtitles() {
    debug("Rendering subtitles");
    subtitlesText.innerHTML = "";

    for (const subtitle of subtitles) {
        const item = document.createElement("div");
        item.className = "subtitle-item";
        item.textContent = `${subtitle.index}: ${subtitle.text}`;
        item.id = `subtitle-${subtitle.index}`;
        item.addEventListener("click", () => seekToSubtitle(subtitle));
        subtitlesText.appendChild(item);
    }

    debug(`Rendered ${subtitles.length} subtitle items`);
}

function seekToSubtitle(subtitle) {
    videoPlayer.currentTime = subtitle.startTime;
    videoPlayer.play();
}

makeMovable(videoPlayer);

let preSubtitleElement;
videoPlayer.addEventListener("timeupdate", function () {
    const currentTime = videoPlayer.currentTime;
    const currentSubtitle = subtitles.find(
        (s) => currentTime >= s.startTime && currentTime <= s.endTime,
    );

    // document
    //     .querySelectorAll(".current-subtitle")
    //     .forEach((el) => el.classList.remove("current-subtitle"));

    if (currentSubtitle) {
        let currentSubtitleElement = document.getElementById(
            `subtitle-${currentSubtitle.index}`,
        );

        if (currentSubtitleElement) {
            currentSubtitleElement.classList.add("current-subtitle");
            currentSubtitleElement.scrollIntoView({
                behavior: "instant",
                block: "nearest",
            });

            if (preSubtitleElement && preSubtitleElement.id !== currentSubtitleElement.id) {
                console.log(currentSubtitleElement, preSubtitleElement)
                preSubtitleElement.classList.remove("current-subtitle")
            }
            preSubtitleElement = currentSubtitleElement;


        }

    }
});

window.addEventListener("resize", updateVideoInfo);
videoPlayer.addEventListener("loadedmetadata", updateVideoInfo);
videoPlayer.addEventListener("resize", updateVideoInfo);

updateVideoInfo();

document.addEventListener("dblclick", ()=>{
    resetMenuBarTimeout();
    console.log('show menubar dbclick');

});

function resetMenuBarTimeout() {
    
    clearTimeout(hideMenuBarTimeout);
    menuBar.classList.remove("hidden");
    hideMenuBarTimeout = setTimeout(() => {
        menuBar.classList.add("hidden");
        //todo
    }, 5000);
}

subtitlesHeader.addEventListener("mousedown", startDrag);
subtitlesHeader.addEventListener("touchstart", startDrag);
subtitlesContainer.addEventListener('dblclick', ()=>{
    videoPlayer.pause();
});

function startDrag(e) {
    e.preventDefault();
    const initialX =
        e.type === "mousedown" ? e.clientX : e.touches[0].clientX;
    const initialY =
        e.type === "mousedown" ? e.clientY : e.touches[0].clientY;
    const rect = subtitlesContainer.getBoundingClientRect();

    const offsetX = initialX - rect.left;
    const offsetY = initialY - rect.top;

    function drag(e) {
        e.preventDefault();
        const clientX =
            e.type === "mousemove" ? e.clientX : e.touches[0].clientX;
        const clientY =
            e.type === "mousemove" ? e.clientY : e.touches[0].clientY;

        subtitlesContainer.style.left = `${clientX - offsetX}px`;
        subtitlesContainer.style.top = `${clientY - offsetY}px`;
    }

    function stopDrag() {
        document.removeEventListener("mousemove", drag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchmove", drag);
        document.removeEventListener("touchend", stopDrag);
    }

    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", stopDrag);
    document.addEventListener("touchmove", drag);
    document.addEventListener("touchend", stopDrag);
}

setTimeout(() => {
    loadVideo(
        "https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_30mb.mp4",
    );
}, 1000);

setInterval(() => {
    updateVideoInfo();
}, 3000);

function controlVideo() {
    // Create and append video player elements
    const videoContainer = document.createElement("div");
    videoContainer.id = "videoPlayerContainer";
    videoContainer.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        width: 90vw;
        background-color: #333;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        Z-index:101;
    `;
    let video = document.querySelector("#videoPlayer");
    const controls = document.createElement("div");
    controls.style.cssText = `
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: rgba(0, 0, 0, 0.5);
    `;
    const playPauseBtn = document.createElement("button");
    playPauseBtn.innerHTML = "▶";
    playPauseBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-right: 10px;
    `;
    const progress = document.createElement("input");
    progress.type = "range";
    progress.style.cssText = `
        flex-grow: 1;
        margin: 0 10px;
    `;
    const muteBtn = document.createElement("button");
    muteBtn.innerHTML = "🔊";
    muteBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
    `;
    const timeDisplay = document.createElement("span");
    timeDisplay.style.cssText = `
        color: white;
        font-size: 14px;
        margin-left: 10px;
    `;
    controls.appendChild(playPauseBtn);
    controls.appendChild(progress);
    controls.appendChild(timeDisplay);
    controls.appendChild(muteBtn);
    videoContainer.appendChild(controls);
    document.body.appendChild(videoContainer);

    // Control functions
    function togglePlay() {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = "⏸";
        } else {
            video.pause();
            playPauseBtn.innerHTML = "▶";
        }
    }

    function updateProgress() {
        progress.value = (video.currentTime / video.duration) * 100;
        updateTimeDisplay();
    }

    function setVideoProgress() {
        video.currentTime = (+progress.value * video.duration) / 100;
    }

    function toggleMute() {
        video.muted = !video.muted;
        muteBtn.innerHTML = video.muted ? "🔇" : "🔊";
    }

    function formatTime(timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = Math.floor(timeInSeconds % 60);
        return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    function updateTimeDisplay() {
        const currentTime = formatTime(video.currentTime);
        const duration = formatTime(video.duration);
        timeDisplay.textContent = `${currentTime} / ${duration}`;
    }

    // Event listeners
    playPauseBtn.addEventListener("click", togglePlay);
    video.addEventListener("timeupdate", updateProgress);
    progress.addEventListener("change", setVideoProgress);
    muteBtn.addEventListener("click", toggleMute);

    // Initialize progress bar and time display
    video.addEventListener("loadedmetadata", () => {
        progress.value = 0;
        updateTimeDisplay();
    });
}
controlVideo();

function makeMovable(elem) {
    // Select the element you want to make movable
    const movableElement = elem;

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    // Mouse event listeners
    movableElement.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);

    // Touch event listeners
    movableElement.addEventListener("touchstart", dragStart);
    document.addEventListener("touchmove", drag);
    document.addEventListener("touchend", dragEnd);

    function dragStart(e) {
        if (e.type === "touchstart") {
            initialX = e.touches[0].clientX - xOffset;
            initialY = e.touches[0].clientY - yOffset;
        } else {
            initialX = e.clientX - xOffset;
            initialY = e.clientY - yOffset;
        }

        if (e.target === movableElement) {
            isDragging = true;
        }
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            if (e.type === "touchmove") {
                currentX = e.touches[0].clientX - initialX;
                currentY = e.touches[0].clientY - initialY;
            } else {
                currentX = e.clientX - initialX;
                currentY = e.clientY - initialY;
            }

            xOffset = currentX;
            yOffset = currentY;

            setTranslate(currentX * 2, currentY * 2, movableElement);
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;

        isDragging = false;
    }

    function setTranslate(xPos, yPos, el) {
        el.style.left = `${xPos}px`;
        el.style.top = `${yPos}px`;
    }
}

//same effect as touchaction:none in css
function preventZoom() {
    let container = document.querySelector(".container");
    // Prevent zooming
    document.addEventListener(
        "touchmove",
        function (event) {
            if (event.scale !== 1) {
                event.preventDefault();
            }
        },
        { passive: false },
    );
    document.addEventListener("gesturestart", function (event) {
        event.preventDefault();
    });
}
//preventZoom();
