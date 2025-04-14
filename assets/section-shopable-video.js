import { SlideSection } from "module-slide";
import * as NextSkyTheme from "global";

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
    if (this.classList.contains("sticky-video")) {
      this.classList.remove("active");
    }
  }

  connectedCallback() {
    this.addEventListener("click", this.onShowPopupModal.bind(this), false);
    if (this.classList.contains("sticky-video")) {
      this.initScroll();
      if (this.getStickyHiddenCookie()) {
        this.classList.remove("active");
      }
      this.setupCloseButton();
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
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking && !this.getStickyHiddenCookie()) {
          window.requestAnimationFrame(() => {
            if (window.scrollY > 0) {
              this.handleScroll(firstSections, shopableVideoSection);
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
    this.classList.remove("active");
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

  clickMuteVideo() {
    if (this.querySelector("video").muted == false) {
      this.querySelector("video").muted = true;
      this.querySelector(".mute-button").classList.remove("active");
    } else {
      this.querySelector("video").muted = false;
      this.querySelector(".mute-button").classList.add("active");
    }
  }

  onShowPopupModal(event) {
    event.preventDefault();
    const clickedItem = this;
    const productId = clickedItem.getAttribute("data-product");
    if (!productId) return;

    let modalPopup = document.querySelector("modal-popup");
    if (!modalPopup) {
      const shopable_video = event.target
        .closest(".section-shopable-video")
        .querySelector("template");
      if (shopable_video) {
        const content = document.createElement("div");
        content.appendChild(
          shopable_video.content.firstElementChild.cloneNode(true)
        );
        NextSkyTheme.body.appendChild(content.querySelector("modal-popup"));
        modalPopup = document.querySelector("modal-popup");
        this.setupModalNavigation(modalPopup);
        this.setupMobileActionButton(modalPopup);
      }
    }

    if (modalPopup) {
      modalPopup.setAttribute("data-current", productId);
      const allItems = modalPopup.querySelectorAll(".drawer__body-item");
      if (allItems.length) {
        allItems.forEach((item) => {
          item.style.display = "none";
        });
      }
      const targetItem = modalPopup.querySelector(`#${productId}`);
      if (targetItem) {
        targetItem.style.display = "block";
      }
      this.updateNavigationState(modalPopup, productId);
      setTimeout(() => NextSkyTheme.eventModal(modalPopup, "open", true), 100);
    }
  }

  setupModalNavigation(modalPopup) {
    const prevButton = modalPopup.querySelector(".modal-nav__prev");
    const nextButton = modalPopup.querySelector(".modal-nav__next");

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        this.navigateModal(modalPopup, "prev");
      });
    }

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        this.navigateModal(modalPopup, "next");
      });
    }

    modalPopup.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft") {
        this.navigateModal(modalPopup, "prev");
      } else if (e.key === "ArrowRight") {
        this.navigateModal(modalPopup, "next");
      }
    });
  }

  navigateModal(modalPopup, direction) {
    const currentId = modalPopup.getAttribute("data-current");
    const allItems = Array.from(
      modalPopup.querySelectorAll(".drawer__body-item")
    );
    const currentIndex = allItems.findIndex((item) => item.id === currentId);
    if (currentIndex === -1) return;
    let nextIndex;
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % allItems.length;
    } else {
      nextIndex = (currentIndex - 1 + allItems.length) % allItems.length;
    }
    const nextId = allItems[nextIndex].id;
    allItems.forEach((item) => {
      item.style.display = "none";
    });
    allItems[nextIndex].style.display = "block";
    modalPopup.setAttribute("data-current", nextId);
    this.updateNavigationState(modalPopup, nextId);
  }

  updateNavigationState(modalPopup, currentId) {
    const prevButton = modalPopup.querySelector(".modal-nav__prev");
    const nextButton = modalPopup.querySelector(".modal-nav__next");
    const allItems = Array.from(
      modalPopup.querySelectorAll(".drawer__body-item")
    );

    if (allItems.length <= 1) {
      if (prevButton) prevButton.style.display = "none";
      if (nextButton) nextButton.style.display = "none";
      return;
    }
    if (prevButton) prevButton.style.display = "block";
    if (nextButton) nextButton.style.display = "block";
  }
}
customElements.define("shopable-item", ShopableItem);
