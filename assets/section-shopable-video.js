import { SlideSection } from "module-slide";
import * as NextSkyTheme from "global";

class ShopableVideo extends SlideSection {
  constructor() {
    super();
    this.initShopableVideo();
  }

  connectedCallback() {
    if (this.classList.contains("swiper-slide-center")) {
      this.handleCenterSlides();
    }
  }

  handleCenterSlides() {
    if (!this) return;
    if (window.innerWidth < 1025) return;

    const checkSwiper = setInterval(() => {
      if (this.swiper) {
        clearInterval(checkSwiper);
        this.updateCenterSlideClass();
        this.swiper.on("slideChange", () => {
          if (window.innerWidth >= 1025) {
            this.updateCenterSlideClass();
          }
        });
        this.swiper.on("breakpoint", () => {
          if (window.innerWidth >= 1025) {
            this.updateCenterSlideClass();
          }
        });

        window.addEventListener("resize", this.handleResize.bind(this));
      }
    }, 100);
  }

  handleResize() {
    if (window.innerWidth >= 1025) {
      if (this.swiper) {
        this.updateCenterSlideClass();
      }
    } else {
      this.resetCenterSlideEffects();
    }
  }

  resetCenterSlideEffects() {
    if (!this || !this.swiper) return;

    const allSlides = Array.from(this.querySelectorAll(".swiper-slide"));

    allSlides.forEach((slide) => {
      slide.classList.remove("center-slide");
      const videoInner = slide.querySelector(".video-item--ratio");
      if (videoInner) {
        videoInner.style.height = "";
        videoInner.style.marginTop = "";
        videoInner._hasSetupTransition = false;
      }
    });
  }

  updateCenterSlideClass() {
    const autoplayVideo = this.dataset.autoplayVideo === "true";
    if (!this || !this.swiper) return;

    if (!this._animations) {
      this._animations = new Map();
    }

    this._animations.forEach((animation) => {
      if (animation && typeof animation.cancel === "function") {
        animation.cancel();
      }
    });
    this._animations.clear();

    let videoHeight;
    const allSlides = Array.from(this.querySelectorAll(".swiper-slide"));
    const previousCenterSlide = this.querySelector(
      ".swiper-slide.center-slide"
    );

    if (!this._maxSlideHeight) {
      let maxHeight = 0;
      allSlides.forEach((slide) => {
        const slideHeight = slide.scrollHeight;
        if (slideHeight > maxHeight) {
          maxHeight = slideHeight;
        }
      });

      this._maxSlideHeight = maxHeight > 0 ? maxHeight : 500;
    }

    allSlides.forEach((slide) => {
      slide.classList.remove("center-slide");
    });

    const slidesPerView = parseInt(this.swiper.params.slidesPerView);
    if (typeof slidesPerView === "number" && slidesPerView % 2 !== 0) {
      const centerIndex =
        Math.floor(slidesPerView / 2) + this.swiper.activeIndex;
      if (centerIndex >= 0 && centerIndex < allSlides.length) {
        allSlides[centerIndex].classList.add("center-slide");
        const newCenterSlide = allSlides[centerIndex];
        const buttonPlay = newCenterSlide.querySelector(".play-button");
        if (buttonPlay && autoplayVideo) {
          buttonPlay.classList.add("active");
        }
        const video = newCenterSlide.querySelector("video-local");

        if (video) {
          if (!this._originalVideoHeight) {
            this._originalVideoHeight = video.offsetHeight || 300;
          }
          videoHeight = this._originalVideoHeight;

          if (!this._lastSlideChangeTime) {
            this._lastSlideChangeTime = Date.now();
            this._isRapidSwiping = false;
          } else {
            const timeSinceLastChange = Date.now() - this._lastSlideChangeTime;
            this._lastSlideChangeTime = Date.now();
            this._isRapidSwiping = timeSinceLastChange < 300;
          }

          if (!this._containerInitialized) {
            const swiperWrapper = this.querySelector(".swiper-wrapper");
            if (swiperWrapper) {
              swiperWrapper.style.minHeight = this._maxSlideHeight + 10 + "px";
              this._containerInitialized = true;
            }
          }

          const centerVideoInner =
            newCenterSlide.querySelector(".video-item--ratio");
          if (centerVideoInner) {
            this._setVideoEffectWithMargin(centerVideoInner, videoHeight, 0);
          }

          allSlides.forEach((slide) => {
            if (!slide.classList.contains("center-slide")) {
              const nonCenterVideoInner =
                slide.querySelector(".video-item--ratio");
              const buttonPlay = slide.querySelector(".play-button");
              if (buttonPlay && autoplayVideo) {
                buttonPlay.classList.remove("active");
              }
              if (nonCenterVideoInner && videoHeight) {
                const targetHeight = videoHeight - 50;
                const marginTop = Math.max(0, (videoHeight - targetHeight) / 2);
                this._setVideoEffectWithMargin(
                  nonCenterVideoInner,
                  targetHeight,
                  marginTop
                );
              }
            }
          });
        }

        if (newCenterSlide !== previousCenterSlide) {
          this.dispatchEvent(
            new CustomEvent("center-slide-updated", {
              detail: { centerSlide: newCenterSlide },
            })
          );
        }
      }
    }
  }

  _setVideoEffectWithMargin(element, targetHeight, marginTop) {
    if (!element._hasSetupTransition) {
      element.style.transition = this._isRapidSwiping
        ? "height 0.15s cubic-bezier(0.4, 0, 0.2, 1), margin-top 0.15s cubic-bezier(0.4, 0, 0.2, 1)"
        : "height 0.3s cubic-bezier(0.4, 0, 0.2, 1), margin-top 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

      element._hasSetupTransition = true;

      requestAnimationFrame(() => {
        element.style.height = `${targetHeight}px`;
        element.style.marginTop = `${marginTop}px`;
      });
    } else {
      element.style.height = `${targetHeight}px`;
      element.style.marginTop = `${marginTop}px`;
    }
  }

  initShopableVideo() {
    this.setupVideoAutoplay();
  }

  setupVideoAutoplay() {
    const autoplayVideo = this.dataset.autoplayVideo === "true";
    if (!autoplayVideo || !this.swiper) return;
    const useCenterSlideMode = this.classList.contains("swiper-slide-center");
    if (useCenterSlideMode) {
      this.playCenterSlideVideo();
    } else {
      this.playActiveSlideVideo(this.swiper.activeIndex);
    }
    this.swiper.on("slideChangeTransitionEnd", () => {
      if (useCenterSlideMode) {
        this.playCenterSlideVideo();
      } else {
        this.playActiveSlideVideo(this.swiper.activeIndex);
      }
    });
    this.addEventListener("center-slide-updated", () => {
      if (useCenterSlideMode) {
        this.playCenterSlideVideo();
      }
    });
  }

  playCenterSlideVideo() {
    this.pauseAllVideos();
    const centerSlide = this.querySelector(".swiper-slide.center-slide");
    if (!centerSlide) return;
    const videoElement = centerSlide.querySelector("video-local video");
    if (videoElement) {
      videoElement.play();
    }
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
    if (this.classList.contains("sticky-video")) {
      this.classList.remove("active");
    }
  }

  connectedCallback() {
    this.addEventListener("click", this.onShowPopupModal.bind(this), false);
    if (this.classList.contains("sticky-video")) {
      const allStickyVideos = document.querySelectorAll(".sticky-video");
      const isFirstStickyVideo = this === allStickyVideos[0];
      if (isFirstStickyVideo) {
        this.initScroll();
        if (this.getStickyHiddenCookie()) {
          this.classList.remove("active");
        }
        this.setupCloseButton();
      } else {
        this.classList.remove("active");
      }
    }
    this.addEventListener("keydown", this.handleKeyDown.bind(this), false);
  }

  handleKeyDown(event) {
    const isPlayButton = event.target.closest(".play-button");
    const isMuteButton = event.target.closest(".mute-button");
    if (event.key === "Enter" && !isPlayButton && !isMuteButton) {
      event.preventDefault();
      this.onShowPopupModal(event);
    }
  }

  setupMobileActionButton(modalPopup) {
    modalPopup.addEventListener("click", (event) => {
      const actionButton = event.target.closest(".popup-information__mobile");
      if (actionButton) {
        event.preventDefault();
        event.stopPropagation();
        actionButton.classList.add("active");
        const currentId = modalPopup.getAttribute("data-current");
        if (!currentId) return;
        const currentItem = modalPopup.querySelector(`#${currentId}`);
        if (!currentItem) return;
        const popupInfo = currentItem.querySelector(".popup-information");
        const buttonCloseModal = modalPopup.querySelector(".modal__close");
        const buttonCloseInformation = currentItem.querySelector(
          ".modal__close-information"
        );
        if (!popupInfo) return;
        if (buttonCloseInformation.classList.contains("hidden-important")) {
          buttonCloseInformation.classList.remove("hidden-important");
          buttonCloseInformation.classList.add("active");
          buttonCloseModal.classList.add("hidden-important");
        } else {
          buttonCloseInformation.classList.remove("active");
          buttonCloseInformation.classList.add("hidden-important");
          buttonCloseModal.classList.remove("hidden-important");
        }
        if (popupInfo.classList.contains("active")) {
          popupInfo.classList.remove("active");
        } else {
          popupInfo.classList.add("active");
        }
        const swiperContainer = modalPopup.querySelector("slide-section");
        if (swiperContainer && swiperContainer.swiper) {
          this.handleSwipeability(modalPopup, swiperContainer);
        }
      }
      const closeInfoButton = event.target.closest(".modal__close-information");
      if (closeInfoButton) {
        const actionButton = event.target
          .closest(".drawer__body")
          .querySelector(".popup-information__mobile");
        event.preventDefault();
        event.stopPropagation();
        if (actionButton.classList.contains("active")) {
          actionButton.classList.remove("active");
        }
        const currentId = modalPopup.getAttribute("data-current");
        if (!currentId) return;
        const currentItem = modalPopup.querySelector(`#${currentId}`);
        if (!currentItem) return;
        const popupInfo = currentItem.querySelector(".popup-information");
        const buttonCloseModal = modalPopup.querySelector(".modal__close");

        if (popupInfo) {
          this.hidePopupInformation(popupInfo);
          closeInfoButton.classList.add("hidden-important");
          closeInfoButton.classList.remove("active");
          buttonCloseModal.classList.remove("hidden-important");
          const swiperContainer = modalPopup.querySelector("slide-section");
          if (swiperContainer && swiperContainer.swiper) {
            this.handleSwipeability(modalPopup, swiperContainer);
          }
        }
      }
    });
  }

  hidePopupInformation(popupInfo) {
    popupInfo.classList.remove("active");
    popupInfo.dispatchEvent(
      new CustomEvent("popup-information:closed", {
        bubbles: true,
        detail: { popupInfo },
      })
    );
    const modalPopup = popupInfo.closest("modal-popup");
    if (modalPopup) {
      const swiperContainer = modalPopup.querySelector("slide-section");
      if (swiperContainer && swiperContainer.swiper) {
        this.handleSwipeability(modalPopup, swiperContainer);
      }
    }
  }

  setupCloseButton() {
    const closeButton = this.querySelector(".shopable-sticky__close");
    if (closeButton) {
      closeButton.classList.remove("pointer-none");
      closeButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        this.closeStickyPopup();
      });
    }
  }

  initScroll() {
    if (this.getStickyHiddenCookie()) {
      return;
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.setupScrollObserver()
      );
    } else {
      this.setupScrollObserver();
    }
  }

  closeStickyPopup() {
    this.classList.remove("active");
    NextSkyTheme.setCookie("shopable_sticky_closed", "true", 1);
  }

  getStickyHiddenCookie() {
    const getCookieValue = NextSkyTheme.getCookie("shopable_sticky_closed");
    return getCookieValue === "true";
  }

  setupScrollObserver() {
    const mainElement = document.querySelector("main");
    if (!mainElement) return;

    const firstSections = Array.from(
      mainElement.querySelectorAll("section")
    ).slice(0, 1);
    const allStickyVideos = document.querySelectorAll(".sticky-video");
    if (allStickyVideos.length === 0) return;
    const firstStickyVideo = allStickyVideos[0];
    const isFirstStickyVideo = this === firstStickyVideo;
    if (!isFirstStickyVideo) {
      this.classList.remove("active");
      return;
    }
    const shopableVideoSection = firstStickyVideo.closest(
      ".section-shopable-video"
    );
    if (!shopableVideoSection) return;

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    };

    const shopableVideoObserver = new IntersectionObserver((entries) => {
      if (this.getStickyHiddenCookie()) {
        return;
      }
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
      if (this.getStickyHiddenCookie()) {
        return;
      }
      if (window.scrollY > 100) {
        const allSectionsPassedTop = firstSections.every((section) => {
          return section.getBoundingClientRect().bottom <= 0;
        });
        if (allSectionsPassedTop) {
          const shopableRect = shopableVideoSection.getBoundingClientRect();
          if (shopableRect.top > 0) {
            this.classList.add("active");
          } else {
            this.classList.remove("active");
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
    let ticking = false;
    const scrollHandler = () => {
      if (!ticking && !this.getStickyHiddenCookie()) {
        window.requestAnimationFrame(() => {
          if (window.scrollY > 0) {
            this.handleScroll(firstSections, shopableVideoSection);
          }
          ticking = false;
        });
        ticking = true;
      }
    };
    this._scrollHandler = scrollHandler;
    window.addEventListener("scroll", this._scrollHandler, { passive: true });
    this.classList.remove("active");
    this._shopableVideoObserver = shopableVideoObserver;
    this._firstSectionsObserver = firstSectionsObserver;
  }

  handleScroll(firstSections, shopableVideoSection) {
    if (this.getStickyHiddenCookie()) {
      return;
    }
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

  clickMuteVideoPopup(slide) {
    const muteButton = slide.querySelector(".mute-button");
    if (muteButton) {
      const newPlayButton = muteButton.cloneNode(true);
      muteButton.parentNode.replaceChild(newPlayButton, muteButton);
      newPlayButton.addEventListener("click", (event) => {
        const currentTarget = event.currentTarget;
        const videoLocal = currentTarget.closest(".modal-shopable_content");
        if (videoLocal && videoLocal.querySelector("video")) {
          const video = videoLocal.querySelector("video");
          if (video.muted == false) {
            video.muted = true;
            currentTarget.classList.remove("active");
          } else {
            video.muted = false;
            currentTarget.classList.add("active");
          }
        }
      });
    }
  }

  clickMuteVideoPopupMobile(slide) {
    const muteButton = slide.querySelector(".mute-button-mobile");
    if (muteButton) {
      const newPlayButton = muteButton.cloneNode(true);
      muteButton.parentNode.replaceChild(newPlayButton, muteButton);
      newPlayButton.addEventListener("click", (event) => {
        const currentTarget = event.currentTarget;
        const videoLocal = currentTarget.closest(".modal-shopable_content");
        if (videoLocal && videoLocal.querySelector("video")) {
          const video = videoLocal.querySelector("video");
          if (video.muted == false) {
            video.muted = true;
            currentTarget.classList.remove("active");
          } else {
            video.muted = false;
            currentTarget.classList.add("active");
          }
        }
      });
    }
  }

  clickPlayVideoPopup(slide) {
    const videoElement = slide.querySelector("video");
    if (videoElement) {
      if (videoElement._clickHandler) {
        videoElement.removeEventListener("click", videoElement._clickHandler);
      }
      videoElement._clickHandler = function(event) {
        event.preventDefault();
        event.stopPropagation();
        const videoLocal = this.closest("video-local");
        const playButton = videoLocal?.querySelector(".play-button");
        if (this.paused) {
          this.play();
          if (playButton) playButton.classList.add("active");
          if (videoLocal) videoLocal.classList.remove("active");
        } else {
          this.pause();
          if (playButton) playButton.classList.remove("active");
          if (videoLocal) videoLocal.classList.add("active");
        }
      };
      videoElement.addEventListener("click", videoElement._clickHandler);
    }
  }

  findAndActivateSlide(modalPopup, productId) {
    const swiperContainer = modalPopup.querySelector("slide-section");
    if (!swiperContainer || !swiperContainer.swiper) {
      modalPopup.removeAttribute("data-loading");
      return;
    }

    const clickedItem = document.querySelector(`[data-product="${productId}"]`);
    if (!clickedItem) {
      modalPopup.removeAttribute("data-loading");
      return;
    }

    const position = clickedItem.getAttribute("data-position");
    if (position !== null && !isNaN(parseInt(position))) {
      const slideIndex = parseInt(position);
      swiperContainer.swiper.slideTo(slideIndex, 0, false);
    } else {
      swiperContainer.swiper.slideTo(0, 0, false);
    }

    const nextButton = modalPopup.querySelector(
      ".modal-nav .swiper-button-next"
    );
    const prevButton = modalPopup.querySelector(
      ".modal-nav .swiper-button-prev"
    );

    const swiperPagination = modalPopup.querySelector(
      ".modal-pagination .swiper-pagination"
    );
    if (swiperPagination) {
      swiperContainer.swiper.params.pagination = {
        ...swiperContainer.swiper.params.pagination,
        el: swiperPagination,
        clickable: true,
        type: "custom",
        renderCustom: function (swiper, current, total) {
          return current + "/" + total;
        },
      };

      swiperContainer.swiper.pagination.destroy();
      swiperContainer.swiper.pagination.init();
      swiperContainer.swiper.pagination.render();
      swiperContainer.swiper.pagination.update();
    }

    if (nextButton && prevButton && swiperContainer.swiper.navigation) {
      const _self = this;
      _self.updateCurrentSlideId(modalPopup, swiperContainer);
      nextButton.setAttribute("tabindex", "0");
      prevButton.setAttribute("tabindex", "0");
      swiperContainer.swiper.navigation.nextEl = nextButton;
      swiperContainer.swiper.navigation.prevEl = prevButton;
      nextButton.addEventListener("click", (e) => {
        e.preventDefault();
        swiperContainer.swiper.slideNext();
        _self.updateCurrentSlideId(modalPopup, swiperContainer);
      });
      prevButton.addEventListener("click", (e) => {
        e.preventDefault();
        swiperContainer.swiper.slidePrev();
        _self.updateCurrentSlideId(modalPopup, swiperContainer);
      });
      if (!swiperContainer._hasSlideChangeHandler) {
        swiperContainer.swiper.on("slideChange", () => {
          _self.updateCurrentSlideId(modalPopup, swiperContainer);
        });
        swiperContainer._hasSlideChangeHandler = true;
      }
    }

    modalPopup.removeAttribute("data-loading");
  }

  handleSwipeability(modalPopup, swiperContainer) {
    if (!modalPopup || !swiperContainer || !swiperContainer.swiper) return;

    const isLargeScreen = window.innerWidth >= 1025;

    const hasPopupInfo =
      modalPopup.querySelector(".popup-information") !== null;

    const hasActivePopupInfo =
      modalPopup.querySelector(".popup-information.active") !== null;

    if (isLargeScreen) {
      if (hasPopupInfo) {
        swiperContainer.swiper.allowTouchMove = false;
        swiperContainer.swiper.unsetGrabCursor();
      } else {
        swiperContainer.swiper.allowTouchMove = true;
        swiperContainer.swiper.setGrabCursor();
      }
    } else {
      if (hasActivePopupInfo) {
        swiperContainer.swiper.allowTouchMove = false;
        swiperContainer.swiper.unsetGrabCursor();
      } else {
        swiperContainer.swiper.allowTouchMove = true;
        swiperContainer.swiper.setGrabCursor();
      }
    }
  }

  onShowPopupModal(event) {
    event.preventDefault();
    const clickedItem = this;
    const productId = clickedItem.getAttribute("data-product");
    if (!productId) return;
    let modalPopup = document.querySelector("modal-popup");
    if (!modalPopup) {
      const shopable_video = this.closest(
        ".section-shopable-video"
      ).querySelector("template");
      if (shopable_video) {
        const content = document.createElement("div");
        content.appendChild(
          shopable_video.content.firstElementChild.cloneNode(true)
        );
        NextSkyTheme.body.appendChild(content.querySelector("modal-popup"));
        modalPopup = document.querySelector("modal-popup");
        this.setupMobileActionButton(modalPopup);
      }
    }

    if (modalPopup) {
      modalPopup.setAttribute("data-loading", "true");
      modalPopup.setAttribute("data-current", productId);
      NextSkyTheme.eventModal(modalPopup, "open", true);
      const swiperContainer = modalPopup.querySelector("slide-section");
      if (swiperContainer) {
        if (!swiperContainer.swiper) {
          setTimeout(() => {
            this.findAndActivateSlide(modalPopup, productId);
          }, 100);
        } else {
          this.findAndActivateSlide(modalPopup, productId);
        }
      } else {
        modalPopup.removeAttribute("data-loading");
      }
    }
  }

  closeAllPopupInformation(modalPopup) {
    const popupInfo = modalPopup.querySelectorAll(".popup-information");
    popupInfo.forEach((info) => {
      if (info.classList.contains("active")) {
        info.classList.remove("active");
      }
    });
  }

  updateCurrentSlideId(modalPopup, swiperContainer) {
    if (!modalPopup || !swiperContainer || !swiperContainer.swiper) return;

    const _self = this;
    const activeIndex = swiperContainer.swiper.activeIndex;
    const activeSlide = swiperContainer.swiper.slides[activeIndex];

    if (activeSlide) {
      const productId =
        activeSlide.getAttribute("data-product-id") ||
        activeSlide
          .querySelector("[data-product-id]")
          ?.getAttribute("data-product-id");

      if (productId) {
        const buttonCloseModal = modalPopup.querySelector(".modal__close");
        if (buttonCloseModal.classList.contains("hidden-important")) {
          buttonCloseModal.classList.remove("hidden-important");
        }
        modalPopup.setAttribute("data-current", productId);
        _self.closeAllPopupInformation(modalPopup);
        const allSlides = swiperContainer.swiper.slides;
        allSlides.forEach((slide, index) => {
          const video = slide.querySelector("video");
          const videoLocal = slide.querySelector("video-local");
          const btnMute = videoLocal.querySelector(".mute-button");
          const btnMuteMobile = slide.querySelector(".mute-button-mobile");
          const buttonCloseInformation = slide.querySelector(
            ".modal__close-information"
          );
          if (buttonCloseInformation) {
            buttonCloseInformation.classList.add("hidden-important");
          }
          if (video) {
            if (index === activeIndex) {
              video.muted = false;
              btnMute.classList.add("active");
              btnMuteMobile.classList.add("active");
            } else {
              video.muted = true;
              btnMute.classList.remove("active");
              btnMuteMobile.classList.remove("active");
            }
          }
        });
        _self.clickPlayVideoPopup(activeSlide);
        _self.clickMuteVideoPopup(activeSlide);
        _self.clickMuteVideoPopupMobile(activeSlide);
        _self.handleSwipeability(modalPopup, swiperContainer);
      }
    }
  }
}
customElements.define("shopable-item", ShopableItem);