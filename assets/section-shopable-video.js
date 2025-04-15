import { SlideSection } from "module-slide";
import * as NextSkyTheme from "global";

class ShopableVideo extends SlideSection {
  constructor() {
    super();
    this.initShopableVideo();
  }

  connectedCallback() {
    if (
      this.classList.contains("swiper-slide-center")
    ) {
      this.handleCenterSlides();
    }
  }

  handleCenterSlides() {
    if (!this) return;
    const checkSwiper = setInterval(() => {
      if (this.swiper) {
        clearInterval(checkSwiper);
        this.updateCenterSlideClass();
        this.swiper.on("slideChange", () => {
          this.updateCenterSlideClass();
        });
        this.swiper.on("breakpoint", () => {
          this.updateCenterSlideClass();
        });
      }
    }, 100);
  }

  updateCenterSlideClass() {
    if (!this || !this.swiper) return;
    const allSlides = Array.from(this.querySelectorAll(".swiper-slide"));
    const previousCenterSlide = this.querySelector(".swiper-slide.center-slide");
    allSlides.forEach((slide) => {
      slide.classList.remove("center-slide");
    });
    const slidesPerView = parseInt(this.swiper.params.slidesPerView);
    if (typeof slidesPerView === "number" && slidesPerView % 2 !== 0) {
      const centerIndex = Math.floor(slidesPerView / 2) + this.swiper.activeIndex;
      if (centerIndex >= 0 && centerIndex < allSlides.length) {
        allSlides[centerIndex].classList.add("center-slide");
        const newCenterSlide = allSlides[centerIndex];
        if (newCenterSlide !== previousCenterSlide) {
          this.dispatchEvent(new CustomEvent("center-slide-updated", {
            detail: { centerSlide: newCenterSlide }
          }));
        }
      }
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
    const isPlayButton = event.target.closest('.play-button');
    const isMuteButton = event.target.closest('.mute-button');
    if (event.key === "Enter" && !isPlayButton && !isMuteButton) {
      event.preventDefault();
      this.onShowPopupModal(event);
    }
  }

  setupMobileActionButton(modalPopup) {
    modalPopup.addEventListener("click", (event) => {
      const actionButton = event.target.closest(".btn-shopable__action-mobile");
      if (actionButton) {
        event.preventDefault();
        event.stopPropagation();
        const currentId = modalPopup.getAttribute("data-current");
        if (!currentId) return;
        const currentItem = modalPopup.querySelector(`#${currentId}`);
        if (!currentItem) return;
        const popupInfo = currentItem.querySelector(".popup-information");
        if (!popupInfo) return;
        if (popupInfo.classList.contains("hidden")) {
          popupInfo.classList.remove("hidden");
          popupInfo.classList.add("active");
        } else {
          this.hidePopupInformation(popupInfo);
        }
      }
    });
  }

  hidePopupInformation(popupInfo) {
    popupInfo.classList.remove("active");
    popupInfo.classList.add("hidden");
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
    ).slice(0, 2);
    const allStickyVideos = document.querySelectorAll(".sticky-video");
    if (allStickyVideos.length === 0) return;
    const firstStickyVideo = allStickyVideos[0];
    const isFirstStickyVideo = this === firstStickyVideo;
    if (!isFirstStickyVideo) {
      this.classList.remove("active");
      return;
    }
    const shopableVideoSection = firstStickyVideo.closest(".section-shopable-video");
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
  
    if (nextButton && prevButton && swiperContainer.swiper.navigation) {
      nextButton.setAttribute("tabindex", "0");
      prevButton.setAttribute("tabindex", "0");
      swiperContainer.swiper.navigation.nextEl = nextButton;
      swiperContainer.swiper.navigation.prevEl = prevButton;
      nextButton.addEventListener("click", (e) => {
        e.preventDefault();
        swiperContainer.swiper.slideNext();
        setTimeout(() => nextButton.focus(), 10);
      });
      prevButton.addEventListener("click", (e) => {
        e.preventDefault();
        swiperContainer.swiper.slidePrev();
        setTimeout(() => prevButton.focus(), 10);
      });
      modalPopup.addEventListener("keydown", (e) => {
        const isVariantInputFocused = document.activeElement && 
          (document.activeElement.tagName.toLowerCase() === 'variant-input' ||
           document.activeElement.closest('variant-input'));
        if (!isVariantInputFocused) {
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            prevButton.click();
          } else if (e.key === "ArrowRight") {
            e.preventDefault();
            nextButton.click();
          } else if (e.key === "Escape") {
            NextSkyTheme.eventModal(modalPopup, "close", true);
          }
        }
      });
    }
    modalPopup.removeAttribute("data-loading");
    setTimeout(() => this.setFocusInModal(modalPopup), 100);
  }
  
  setFocusInModal(modalPopup) {
    if (!modalPopup) return;
    if (!modalPopup.hasAttribute("tabindex")) {
      modalPopup.setAttribute("tabindex", "-1");
    }
    const focusableElements = modalPopup.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), .swiper-button-next, .swiper-button-prev'
    );
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    } else {
      modalPopup.focus();
    }
    if (typeof NextSkyTheme.trapFocus === "function") {
      NextSkyTheme.trapFocus(modalPopup);
    } else {
      this.setupSimpleFocusTrap(modalPopup, focusableElements);
    }
  }
  
  setupSimpleFocusTrap(modalPopup, focusableElements) {
    if (!focusableElements || focusableElements.length === 0) return;
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];
    if (modalPopup._tabKeydownHandler) {
      modalPopup.removeEventListener("keydown", modalPopup._tabKeydownHandler);
    }
    const tabKeydownHandler = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusableElement) {
          e.preventDefault();
          lastFocusableElement.focus();
        }
        else if (!e.shiftKey && document.activeElement === lastFocusableElement) {
          e.preventDefault();
          firstFocusableElement.focus();
        }
      }
    };
    modalPopup._tabKeydownHandler = tabKeydownHandler;
    modalPopup.addEventListener("keydown", tabKeydownHandler);
    modalPopup.addEventListener("modal:close", () => {
      modalPopup.removeEventListener("keydown", tabKeydownHandler);
    }, { once: true });
  }
  
  onShowPopupModal(event) {
    event.preventDefault();
    const clickedItem = this;
    const productId = clickedItem.getAttribute("data-product");
    if (!productId) return;
    const previouslyFocusedElement = document.activeElement;
    let modalPopup = document.querySelector("modal-popup");
    if (!modalPopup) {
      const shopable_video = this.closest(".section-shopable-video")
        .querySelector("template");
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
      modalPopup._previouslyFocusedElement = previouslyFocusedElement;
      modalPopup.addEventListener("modal:close", () => {
        if (modalPopup._previouslyFocusedElement) {
          setTimeout(() => {
            modalPopup._previouslyFocusedElement.focus();
          }, 10);
        }
      }, { once: true });
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
        setTimeout(() => this.setFocusInModal(modalPopup), 100);
      }
    }
  }
}
customElements.define("shopable-item", ShopableItem);
