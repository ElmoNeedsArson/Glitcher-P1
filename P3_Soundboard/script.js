document.addEventListener("DOMContentLoaded", () => {
    const soundItems = document.querySelectorAll(".sound-item");

    soundItems.forEach(item => {
        const playButton = item.querySelector(".play-btn");
        const pauseButton = item.querySelector(".pause-btn");
        const resetButton = item.querySelector(".reset-btn");
        const volumeControl = item.querySelector(".volume-control");
        const progressBar = item.querySelector(".progress-bar");
        const currentTimeDisplay = item.querySelector(".current-time");
        const durationDisplay = item.querySelector(".duration");

        const soundFile = playButton.getAttribute("data-sound");
        let audio = new Audio(soundFile);
        let isPlaying = false;

        // Update the duration when the audio metadata is loaded
        audio.addEventListener("loadedmetadata", () => {
            durationDisplay.textContent = formatTime(audio.duration);
            progressBar.max = audio.duration;
        });

        // Play button functionality
        playButton.addEventListener("click", () => {
            if (audio.paused || audio.ended) {
                audio.play();
                playButton.disabled = true; // Disable play button while audio is playing
                pauseButton.disabled = false; // Enable pause button
                isPlaying = true;
            }
        });

        // Pause button functionality
        pauseButton.addEventListener("click", () => {
            if (!audio.paused) {
                audio.pause();
                playButton.disabled = false; // Enable play button when audio is paused
                pauseButton.disabled = true; // Disable pause button
                isPlaying = false;
            }
        });

        // Reset button functionality
        resetButton.addEventListener("click", () => {
            audio.pause();
            audio.currentTime = 0;
            playButton.disabled = false; // Enable play button after reset
            pauseButton.disabled = true; // Disable pause button after reset
            isPlaying = false;
            progressBar.value = 0;
            currentTimeDisplay.textContent = "0:00";
        });

        // Volume control functionality
        volumeControl.addEventListener("input", () => {
            audio.volume = volumeControl.value;
        });

        // Update the progress bar and current time
        audio.addEventListener("timeupdate", () => {
            if (isPlaying) {
                progressBar.value = audio.currentTime;
                currentTimeDisplay.textContent = formatTime(audio.currentTime);
            }
        });

        // Make the progress bar draggable to adjust the audio time
        progressBar.addEventListener("input", () => {
            audio.currentTime = progressBar.value;
        });

        // Reset play button when audio ends
        audio.addEventListener("ended", () => {
            audio.currentTime = 0;
            playButton.disabled = false; // Enable play button when audio ends
            pauseButton.disabled = true; // Disable pause button when audio ends
            isPlaying = false;
            progressBar.value = 0;
            currentTimeDisplay.textContent = "0:00"; // Reset the time display
        });

        // Format the time in minutes:seconds format
        function formatTime(seconds) {
            const mins = Math.floor(seconds / 60);
            const secs = Math.floor(seconds % 60);
            return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
    });
});
