window.addEventListener('DOMContentLoaded', function () {
  const video = document.getElementById('main-video');
  const videoContainer = document.querySelector('.video-container');
  const videoControls = document.querySelector('.video-controls');
  const playPauseBtn = document.getElementById('play-pause');
  const progress = document.getElementById('progress');
  const volumeBtn = document.getElementById('volume-btn');
  const volumeSlider = document.getElementById('volume');
  const fullscreenBtn = document.getElementById('fullscreen');
  const currentTimeElem = document.getElementById('current-time');
  const durationElem = document.getElementById('duration');
  const speedBtn = document.getElementById('speed-btn');
  const speedOptions = document.querySelector('.speed-options');
  const qualityBtn = document.getElementById('quality-btn');
  const qualityOptions = document.querySelector('.quality-options');
  const subtitleBtn = document.getElementById('subtitle-btn');

  let controlsTimeout;
  let isSeeking = false;

  // Controls visibility
  videoContainer.addEventListener('mousemove', showControls);
  videoContainer.addEventListener('mouseleave', hideControls);

  function showControls() {
    videoControls.classList.add('active');
    resetControlsTimeout();
  }

  function hideControls() {
    if (!video.paused && !isSeeking) {
      videoControls.classList.remove('active');
    }
  }

  function resetControlsTimeout() {
    clearTimeout(controlsTimeout);
    if (!video.paused) {
      controlsTimeout = setTimeout(hideControls, 1000);
    }
  }

  // Play/Pause
  playPauseBtn.addEventListener('click', togglePlay);
  video.addEventListener('click', togglePlay);

  function togglePlay() {
    if (video.paused) {
      video.play();
      playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
      resetControlsTimeout();
    } else {
      video.pause();
      playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
      showControls();
    }
  }

  // Progress Bar
  video.addEventListener('timeupdate', updateProgress);
  progress.addEventListener('input', () => {
    isSeeking = true;
    seekVideo();
  });
  progress.addEventListener('mouseup', () => {
    isSeeking = false;
    resetControlsTimeout();
  });

  function updateProgress() {
    const value = (video.currentTime / video.duration) * 100;
    progress.value = value;
    currentTimeElem.textContent = formatTime(video.currentTime);
  }

  function seekVideo() {
    const time = (progress.value * video.duration) / 100;
    video.currentTime = time;
  }

  // Volume
  volumeSlider.addEventListener('input', updateVolume);
  volumeBtn.addEventListener('click', toggleMute);

  function updateVolume() {
    video.volume = volumeSlider.value;
    volumeBtn.innerHTML =
      video.volume === 0
        ? '<i class="fas fa-volume-mute"></i>'
        : '<i class="fas fa-volume-up"></i>';
  }

  function toggleMute() {
    video.muted = !video.muted;
    volumeSlider.value = video.muted ? 0 : video.volume;
    updateVolume();
  }

  // Quality Control
  qualityBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    qualityOptions.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.quality-control')) {
      qualityOptions.classList.remove('active');
    }
  });

  document.querySelectorAll('.quality-options button').forEach((option) => {
    option.addEventListener('click', () => {
      let currentTime = video.currentTime;
      let currentState = video.paused ? 'paused' : 'playing';
      video.src = `./videos/v-${option.dataset.quality}p.mp4`;
      video.currentTime = currentTime;
      if (currentState === 'playing') {
        video.play();
      } else {
        video.pause();
      }
      qualityOptions.classList.remove('active');
      showSpeedIndicator(option.dataset.quality + 'p');
      highlightActiveQualityOption();
    });
  });

  function highlightActiveQualityOption() {
    document.querySelectorAll('.quality-options button').forEach((option) => {
      const quality = option.dataset.quality;
      option.classList.toggle(
        'active',
        quality === video.src.split('-')[1].split('.')[0].split('p')[0]
      );
    });
  }

  // Subtitle Control
  subtitleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleSubtitles();
    activeSubtitles();
  });

  function toggleSubtitles() {
    video.textTracks[0].mode =
      video.textTracks[0].mode === 'showing' ? 'hidden' : 'showing';
  }

  function activeSubtitles() {
    if (video.textTracks[0].mode === 'showing') {
      subtitleBtn.classList.add('active');
    } else {
      subtitleBtn.classList.remove('active');
    }
  }

  // Speed Control
  speedBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    speedOptions.classList.toggle('active');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.speed-control')) {
      speedOptions.classList.remove('active');
    }
  });

  document.querySelectorAll('.speed-options button').forEach((option) => {
    option.addEventListener('click', () => {
      video.playbackRate = parseFloat(option.dataset.speed);
      speedOptions.classList.remove('active');
      showSpeedIndicator(option.dataset.speed + 'x');
      highlightActiveSpeedOption();
    });
  });

  function showSpeedIndicator(speed) {
    const indicator = document.createElement('div');
    indicator.className = 'speed-indicator';
    indicator.textContent = speed;

    videoContainer.appendChild(indicator);

    setTimeout(() => indicator.remove(), 1000);
  }

  function highlightActiveSpeedOption() {
    document.querySelectorAll('.speed-options button').forEach((option) => {
      const speed = parseFloat(option.dataset.speed);
      option.classList.toggle('active', speed === video.playbackRate);
    });
  }

  // Fullscreen
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen();
      fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
      document.exitFullscreen();
      fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
  }

  // Keep controls
  document
    .querySelectorAll('.control-btn, .progress, .volume-slider')
    .forEach((element) => {
      element.addEventListener('mouseenter', () =>
        clearTimeout(controlsTimeout)
      );
      element.addEventListener('mouseleave', resetControlsTimeout);
    });

  // Initialize duration
  const setVideoDuration = () => {
    if (video.duration !== Infinity && !isNaN(video.duration)) {
      durationElem.textContent = formatTime(video.duration);
    }
  };

  video.addEventListener('loadedmetadata', setVideoDuration);
  video.addEventListener('canplay', setVideoDuration);
  setTimeout(setVideoDuration, 1000);

  // Helpers
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  // Keyboard controls
  document.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
      case ' ':
        e.preventDefault();
        togglePlay();
        break;
      case 'f':
        toggleFullscreen();
        break;
      case 'm':
        toggleMute();
        break;
      case 'c':
        toggleSubtitles();
        activeSubtitles();
        break;
      case 'q':
        qualityOptions.classList.toggle('active');
        break;
      case 'arrowleft':
        video.currentTime -= 5;
        break;
      case 'arrowright':
        video.currentTime += 5;
        break;
      case 'arrowup':
        video.volume = Math.min(video.volume + 0.1, 1);
        volumeSlider.value = video.volume;
        updateVolume();
        break;
      case 'arrowdown':
        video.volume = Math.max(video.volume - 0.1, 0);
        volumeSlider.value = video.volume;
        updateVolume();
        break;
      case '.':
      case '>':
        if (e.shiftKey) {
          e.preventDefault();
          adjustSpeed(0.25);
        }
        break;
      case ',':
      case '<':
        if (e.shiftKey) {
          e.preventDefault();
          adjustSpeed(-0.25);
        }
        break;
    }
  });

  function adjustSpeed(change) {
    const newSpeed = Math.min(Math.max(video.playbackRate + change, 0.25), 2);
    video.playbackRate = Number(newSpeed.toFixed(2));
    showSpeedIndicator(`${newSpeed}x`);
    highlightActiveSpeedOption();
  }

  // Initial setup
  highlightActiveSpeedOption();
});
