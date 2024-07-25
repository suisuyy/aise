document.addEventListener("DOMContentLoaded", () => {
    const fileInput = document.getElementById("fileInput");
    const srtInput = document.getElementById("srtInput");
    const videoPlayer = document.getElementById("videoPlayer");
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
        windowSize.textContent = `${window.innerWidth}x${window.innerHeight}`;
    }

    size2xButton.addEventListener("click", () => resizeVideo(2));
    size4xButton.addEventListener("click", () => resizeVideo(4));
    size05xButton.addEventListener("click", () => resizeVideo(0.5));
    resetSizeButton.addEventListener("click", ()=>resizeVideo(1));

    function resizeVideo(scale) {
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

    videoPlayer.addEventListener("timeupdate", function () {
        const currentTime = videoPlayer.currentTime;
        const currentSubtitle = subtitles.find(
            (s) => currentTime >= s.startTime && currentTime <= s.endTime,
        );

        document
            .querySelectorAll(".current-subtitle")
            .forEach((el) => el.classList.remove("current-subtitle"));

        if (currentSubtitle) {
            const subtitleElement = document.getElementById(
                `subtitle-${currentSubtitle.index}`,
            );
            if (subtitleElement) {
                subtitleElement.classList.add("current-subtitle");
                subtitleElement.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }
    });

    window.addEventListener("resize", updateVideoInfo);
    videoPlayer.addEventListener("loadedmetadata", updateVideoInfo);
    videoPlayer.addEventListener("resize", updateVideoInfo);

    updateVideoInfo();

    document.addEventListener("pointerdown", resetMenuBarTimeout);
    document.addEventListener("keydown", resetMenuBarTimeout);

    function resetMenuBarTimeout() {
        clearTimeout(hideMenuBarTimeout);
        menuBar.classList.remove("hidden");
        hideMenuBarTimeout = setTimeout(() => {
            menuBar.classList.add("hidden");
        }, 5000);
    }

    subtitlesHeader.addEventListener("mousedown", startDrag);
    subtitlesHeader.addEventListener("touchstart", startDrag);

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
});
