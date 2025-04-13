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
        const autoplayVideo = this.dataset.autoplayVideo === 'true';
        if (!autoplayVideo || !this.swiper) return;
        this.playActiveSlideVideo(this.swiper.activeIndex);
        this.swiper.on('slideChangeTransitionEnd', () => {
            this.playActiveSlideVideo(this.swiper.activeIndex);
        });
    }

    playActiveSlideVideo(activeIndex) {
        this.pauseAllVideos();
        const activeSlide = this.swiper.slides[activeIndex];
        if (!activeSlide) return;
        const videoElement = activeSlide.querySelector('video-local video');
        if (videoElement) {
            videoElement.play();
        }
    }

    pauseAllVideos() {
        const videos = this.querySelectorAll('video-local video');
        videos.forEach(video => {
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
            this.querySelector(".mute-button").addEventListener("click", this.clickMuteVideo.bind(this), false);
        }
    }

    openVideo() {
        if (this.querySelector("video") && !this.classList.contains("active-video")) {
            this.closest(".section-shopable-video").querySelectorAll("shopable-item").forEach((el) => {
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
                this.classList.add('active-video');
            }
        }
    }

    clickMuteVideo() {
        if (this.querySelector("video").muted == false) {
            this.querySelector("video").muted = true;
            this.querySelector(".mute-button").classList.remove('active');
        } else {
            this.querySelector("video").muted = false;
            this.querySelector(".mute-button").classList.add('active');
        }
    }
}
customElements.define('shopable-item', ShopableItem);