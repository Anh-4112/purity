import { SlideSection } from "module-slide";

class ShopableVideo extends SlideSection {
  constructor() {
    super();
    this.initShopableVideo();
  }

  initShopableVideo() {
    this.setupVideoAutoplay();
  }

  setupVideoAutoplay() {
    const autoplayVideo = this.dataset.autoplayVideo === "true";
    if (!autoplayVideo || !this.swiper) return;
    this.playActiveSlideVideo(this.swiper.activeIndex);
    this.swiper.on("slideChangeTransitionEnd", () => {
      this.playActiveSlideVideo(this.swiper.activeIndex);
    });
  }

  playActiveSlideVideo(activeIndex) {
    this.pauseAllVideos();
    const activeSlide = this.swiper.slides[activeIndex];
    if (!activeSlide) return;
    const videoElement = activeSlide.querySelector("video-local video");
    if (videoElement) {
      videoElement.play();
    }
  }

  pauseAllVideos() {
    const videos = this.querySelectorAll("video-local video");
    videos.forEach((video) => {
      if (!video.paused) {
        video.pause();
      }
    });
  }
}
customElements.define("shopable-video", ShopableVideo);

class ShopableItem extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("mouseover", this.openVideo.bind(this), false);
    if (this.querySelector(".mute-button")) {
      this.querySelector(".mute-button").addEventListener(
        "click",
        this.clickMuteVideo.bind(this),
        false
      );
    }
  }

  openVideo() {
    if (
      this.querySelector("video") &&
      !this.classList.contains("active-video")
    ) {
      this.closest(".section-shopable-video")
        .querySelectorAll("shopable-item")
        .forEach((el) => {
          el.classList.remove("active-video");
          if (el.querySelector(".mute-button")) {
            el.querySelector(".mute-button").classList.remove("active");
          }
          const video = el.querySelector("video");
          if (video && !video.paused) {
            video.pause();
          }
        });
      this.querySelector("video").muted = true;
      this.querySelector("video").play();
      if (window.innerWidth > 1199) {
        this.classList.add("active-video");
      }
    }
  }

  clickMuteVideo() {
    if (this.querySelector("video").muted == false) {
      this.querySelector("video").muted = true;
      this.querySelector(".mute-button").classList.remove("active");
    } else {
      this.querySelector("video").muted = false;
      this.querySelector(".mute-button").classList.add("active");
    }
  }
}
customElements.define("shopable-item", ShopableItem);

class ShopableSticky extends HTMLElement {
  constructor() {
    super();
    this.init();
    this.classList.remove("active");
  }
  init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupScrollObserver()
      );
    } else {
      this.setupScrollObserver();
    }
  }
  setupScrollObserver() {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;
    const firstSections = Array.from(
      mainElement.querySelectorAll("section")
    ).slice(0, 2);
    const shopableVideoSection = document.querySelector(
      ".section-shopable-video"
    );
    if (firstSections.length === 0 || !shopableVideoSection) return;
    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    };
    const shopableVideoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.classList.remove("active");
        } else {
          const rect = entry.target.getBoundingClientRect();
          const hasScrolledBeyondFirstSections = firstSections.every(
            (section) => {
              return section.getBoundingClientRect().bottom <= 0;
            }
          );
          if (hasScrolledBeyondFirstSections) {
            if (rect.top > window.innerHeight) {
              this.classList.add("active");
            } else if (rect.bottom < 0) {
              this.classList.add("active");
            }
          }
        }
      });
    }, options);
    const firstSectionsObserver = new IntersectionObserver((entries) => {
      if (window.scrollY > 100) {
        const allSectionsPassedTop = firstSections.every((section) => {
          return section.getBoundingClientRect().bottom <= 0;
        });
        if (allSectionsPassedTop) {
          const shopableRect = shopableVideoSection.getBoundingClientRect();
          if (shopableRect.top > 0) {
            this.classList.add("active");
          }
        } else {
          this.classList.remove("active");
        }
      } else {
        this.classList.remove("active");
      }
    }, options);
    firstSections.forEach((section) => {
      firstSectionsObserver.observe(section);
    });
    shopableVideoObserver.observe(shopableVideoSection);
    window.addEventListener(
      "scroll",
      () => {
        if (window.scrollY > 0) {
          this.handleScroll(firstSections, shopableVideoSection);
        }
      },
      { passive: true }
    );
    this.classList.remove("active");
  }

  handleScroll(firstSections, shopableVideoSection) {
    if (window.scrollY <= 0) {
      this.classList.remove("active");
      return;
    }
    const allSectionsPassedTop = firstSections.every((section) => {
      return section.getBoundingClientRect().bottom <= 0;
    });
    const shopableVideoRect = shopableVideoSection.getBoundingClientRect();
    const isShopableVideoVisible =
      shopableVideoRect.top < window.innerHeight &&
      shopableVideoRect.bottom > 0;
    if (allSectionsPassedTop) {
      if (isShopableVideoVisible) {
        this.classList.remove("active");
      } else if (shopableVideoRect.top > window.innerHeight) {
        this.classList.add("active");
      } else if (shopableVideoRect.bottom < 0) {
        this.classList.add("active");
      }
    } else {
      this.classList.remove("active");
    }
  }
}

customElements.define("shopable-sticky", ShopableSticky);
