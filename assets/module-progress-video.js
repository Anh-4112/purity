/**
 * VideoProgressBar - Class quản lý progress bar cho video
 * Hiển thị tiến trình phát video, buffer và thời gian
 * Chỉ hiển thị thông tin, không có khả năng điều khiển
 */
class VideoProgressBar {
  constructor(videoElement, options = {}) {
    this.video = videoElement;
    this.container = options.container || videoElement.parentElement;
    this.options = {
      showTime: options.showTime || false, // Hiển thị thời gian hiện tại
      showDuration: options.showDuration || false, // Hiển thị tổng thời gian
      className: options.className || 'video-progress-bar',
      allowHide: options.allowHide === true, // Mặc định KHÔNG cho phép ẩn, set true để cho phép ẩn
      ...options
    };
    
    this.isVisible = false;
    
    this.init();
  }

  init() {
    this.createProgressBar();
    this.bindEvents();
    this.updateProgress();
    
    // Hiển thị ngay lập tức nếu không cho phép ẩn
    if (!this.options.allowHide) {
      this.show();
    }
  }

  createProgressBar() {
    // Tạo container cho progress bar
    this.progressContainer = document.createElement('div');
    this.progressContainer.className = `${this.options.className}-container`;

    // Tạo progress bar
    this.progressBar = document.createElement('div');
    this.progressBar.className = `${this.options.className}`;

    // Tạo progress fill
    this.progressFill = document.createElement('div');
    this.progressFill.className = `${this.options.className}-fill`;

    // Tạo buffer bar (cho video buffering)
    this.bufferBar = document.createElement('div');
    this.bufferBar.className = `${this.options.className}-buffer`;

    // Tạo time display
    if (this.options.showTime || this.options.showDuration) {
      this.timeDisplay = document.createElement('div');
      this.timeDisplay.className = `${this.options.className}-time`;

      this.currentTime = document.createElement('span');
      this.currentTime.textContent = '0:00';

      this.duration = document.createElement('span');
      this.duration.textContent = '0:00';

      this.timeDisplay.appendChild(this.currentTime);
      this.timeDisplay.appendChild(this.duration);
    }

    // Ghép các element
    this.progressBar.appendChild(this.bufferBar);
    this.progressBar.appendChild(this.progressFill);
    
    this.progressContainer.appendChild(this.progressBar);
    if (this.timeDisplay) {
      this.progressContainer.appendChild(this.timeDisplay);
    }

    this.container.appendChild(this.progressContainer);
  }

  bindEvents() {
    // Video events
    this.video.addEventListener('loadedmetadata', () => this.updateDuration());
    this.video.addEventListener('timeupdate', () => this.updateProgress());
    this.video.addEventListener('progress', () => this.updateBuffer());
    this.video.addEventListener('play', () => this.show());
    this.video.addEventListener('pause', () => this.show());
    this.video.addEventListener('ended', () => this.hide());
  }

  updateProgress() {
    if (!this.video.duration) return;

    const progress = (this.video.currentTime / this.video.duration) * 100;
    this.progressFill.style.width = `${progress}%`;

    if (this.currentTime) {
      this.currentTime.textContent = this.formatTime(this.video.currentTime);
    }
  }

  updateBuffer() {
    if (!this.video.duration || !this.video.buffered.length) return;

    const buffered = this.video.buffered.end(this.video.buffered.length - 1);
    const bufferProgress = (buffered / this.video.duration) * 100;
    this.bufferBar.style.width = `${bufferProgress}%`;
  }

  updateDuration() {
    if (this.duration && this.video.duration) {
      this.duration.textContent = this.formatTime(this.video.duration);
    }
  }

  show() {
    this.isVisible = true;
    this.progressContainer.style.display = 'block';
  }

  hide() {
    // Chỉ ẩn progress bar nếu allowHide = true
    if (!this.options.allowHide) return;
    
    this.isVisible = false;
    this.progressContainer.style.display = 'none';
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // Phương thức để tùy chỉnh style
  setStyles(styles) {
    Object.assign(this.progressContainer.style, styles.container || {});
    Object.assign(this.progressBar.style, styles.progressBar || {});
    Object.assign(this.progressFill.style, styles.progressFill || {});
    Object.assign(this.bufferBar.style, styles.bufferBar || {});
    if (this.timeDisplay && styles.timeDisplay) {
      Object.assign(this.timeDisplay.style, styles.timeDisplay);
    }
  }

  // Phương thức để destroy progress bar
  destroy() {
    if (this.progressContainer && this.progressContainer.parentNode) {
      this.progressContainer.parentNode.removeChild(this.progressContainer);
    }
  }
}

/**
 * Utility function để tạo progress bar cho video
 * @param {HTMLVideoElement} videoElement - Video element
 * @param {Object} options - Tùy chọn cấu hình
 * @param {boolean} options.showTime - Hiển thị thời gian hiện tại (mặc định: false)
 * @param {boolean} options.showDuration - Hiển thị tổng thời gian (mặc định: false)
 * @param {string} options.className - CSS class name (mặc định: 'video-progress-bar')
 * @param {boolean} options.allowHide - Cho phép ẩn progress bar (mặc định: false - luôn hiển thị)
 * @returns {VideoProgressBar} Instance của VideoProgressBar
 */
export function createVideoProgressBar(videoElement, options = {}) {
  return new VideoProgressBar(videoElement, options);
}