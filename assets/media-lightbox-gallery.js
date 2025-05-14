import * as NextSkyTheme from "global";

class VideoLocalLightbox extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.loadContent();
    this.addEventListener("click", this.onButtonClick);
    this.addEventListener(
      "keypress",
      function (event) {
        if (event.key === "Enter") {
          this.onButtonClick.bind(this)(event);
        }
      }.bind(this),
      false
    );
  }

  async loadContentVideo(_this) {
    if (!_this.getAttribute("loaded") && _this.querySelector("template")) {
      _this.setAttribute("loaded", true);
      const div = document.createElement("div");
      div.innerHTML = _this
        .querySelector("template")
        .content.firstElementChild.cloneNode(true).outerHTML;
      const videoElement = div.querySelector("video");
      if (!_this.hasAttribute("autoplay")) {
        videoElement.autoplay = false;
      }
      _this.appendChild(videoElement);
      _this.thumb = _this.querySelector(".video-thumbnail");
      if (_this.thumb) {
        _this.thumb.remove();
      }
      videoElement.addEventListener("ended", (event) =>
        this.changeVideo(event)
      );
    }
  }

  changeVideo(event) {
    const currentTarget = event.currentTarget;
    const index = parseInt(
      this.closest("video-local-lightbox").getAttribute("data-video-index")
    );
    const lightboxItems = currentTarget.closest(".media-lightbox-slide");
    const videoIndex = lightboxItems.querySelector(
      `video-local-lightbox[data-video-index="${index + 1}"]`
    );
    if (!videoIndex) {
      lightboxItems
        .querySelector(`video-local-lightbox[data-video-index="1"]`)
        .querySelector("video")
        .play();
    } else {
      videoIndex.querySelector("video").play();
    }
  }

  loadContent() {
    const _this = this;
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(_this);
      this.loadContentVideo(_this);
    };
    new IntersectionObserver(handleIntersection.bind(_this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(_this);
  }

  get gallery() {
    return this.closest(".media-lightbox-slide");
  }

  onButtonClick(event) {
    event.preventDefault();
    const position = this.getAttribute("data-position");
    const lightbox = event.currentTarget
      .closest(".block-product__media-lightbox")
      .querySelector("template.media-lightbox-popup");
    if (!document.querySelector("media-lightbox-popup") && lightbox) {
      const content = document.createElement("div");
      content.appendChild(lightbox.content.firstElementChild.cloneNode(true));
      NextSkyTheme.body.appendChild(
        content.querySelector("media-lightbox-popup")
      );
      document.querySelector("media-lightbox-popup")?.open();
      const swiperContainer = document
        .querySelector("media-lightbox-popup")
        .querySelector("slide-section");
      const slideIndex = parseInt(position);
      swiperContainer.swiper.slideTo(slideIndex, 0, false);
      NextSkyTheme.global.rootToFocus = this;
    } else {
      const swiperContainer = document
        .querySelector("media-lightbox-popup")
        .querySelector("slide-section");
      const slideIndex = parseInt(position);
      swiperContainer.swiper.slideTo(slideIndex, 0, false);
    }
  }
}
if (!customElements.get("video-local-lightbox")) {
  customElements.define("video-local-lightbox", VideoLocalLightbox);
}

class MediaLightboxPopup extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (this.querySelector(".modal__close")) {
      this.querySelector(".modal__close").addEventListener(
        "click",
        this.close.bind(this),
        false
      );
    }
    this.addEventListener(
      "keyup",
      (event) => event.code.toUpperCase() === "ESCAPE" && this.close()
    );
  }

  open() {
    this.classList.add("active");
    const elementFocus = this.querySelector(".modal-focus");
    NextSkyTheme.trapFocus(elementFocus);
  }

  close() {
    this.classList.remove("active");
    setTimeout(() => {
      this.remove();
    }, 350);
  }
}
if (!customElements.get("media-lightbox-popup")) {
  customElements.define("media-lightbox-popup", MediaLightboxPopup);
}

class VideoLightboxItem extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (this.querySelector(".mute-button")) {
      this.querySelector(".mute-button").addEventListener(
        "click",
        this.clickMuteVideo.bind(this),
        false
      );
    }
    if (this.querySelector(".play-button")) {
      this.querySelector(".play-button").addEventListener(
        "click",
        this.clickPlayVideo.bind(this),
        false
      );
    }
  }

  clickMuteVideo(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.querySelector("video").muted == false) {
      this.querySelector("video").muted = true;
      this.querySelector(".mute-button").classList.remove("active");
    } else {
      this.querySelector("video").muted = false;
      this.querySelector(".mute-button").classList.add("active");
    }
  }

  clickPlayVideo(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.querySelector("video").paused) {
      this.querySelector("video").play();
      this.querySelector(".play-button").classList.add("active");
    } else {
      this.querySelector("video").pause();
      this.querySelector(".play-button").classList.remove("active");
    }
  }
}
if (!customElements.get("video-lightbox-item")) {
  customElements.define("video-lightbox-item", VideoLightboxItem);
}
