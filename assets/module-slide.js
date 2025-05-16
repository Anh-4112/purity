function initSlide(_this) {
  let autoplay = _this?.dataset.autoplay === "true";
  const loop = _this?.dataset.loop === "true";
  const itemDesktop = _this?.dataset.desktop ? _this?.dataset.desktop : 4;
  const freeMode = _this?.dataset.freeMode === "true";
  const mousewheel = _this?.dataset.mousewheel === "true";
  let itemTablet = _this?.dataset.tablet ? _this?.dataset.tablet : "";
  const itemMobile = _this?.dataset.mobile ? _this?.dataset.mobile : 1;
  const direction = _this?.dataset.direction
    ? _this?.dataset.direction
    : "horizontal";
  const heightAuto = _this?.dataset.heightAuto === "true";
  let autoPlaySpeed = _this?.dataset.autoPlaySpeed
    ? _this?.dataset.autoPlaySpeed
    : 3000;
  let speed = _this?.dataset.speed ? _this?.dataset.speed : 400;
  const effect = _this?.dataset.effect ? _this?.dataset.effect : "slide";
  const row = _this?.dataset.row ? _this?.dataset.row : 1;
  let spacing = _this?.dataset.spacing ? _this?.dataset.spacing : 30;
  let spacingMobile = spacing;
  const pagination = _this?.dataset.pagination
    ? _this?.dataset.pagination
    : "bullets";
  const autoItem = _this?.dataset.itemMobile === "true";
  let arrowCenterImage = _this?.dataset.arrowCenterImage === "true";
  const mutedVideo = _this?.dataset.mutedVideo === "true";
  const pauseOnMouseEnter = _this?.dataset.pauseOnMouseEnter === "true";
  spacing = Number(spacing);
  spacingMobile = Number(spacingMobile);
  autoPlaySpeed = Number(autoPlaySpeed);
  speed = Number(speed);
  if (autoplay) {
    autoplay = { delay: autoPlaySpeed, pauseOnMouseEnter: pauseOnMouseEnter };
  }
  if (!itemTablet) {
    if (itemDesktop < 2) {
      itemTablet = 1;
    } else if (itemDesktop < 3) {
      itemTablet = 2;
    } else {
      itemTablet = 3;
    }
  }
  if (spacingMobile > 15) {
    spacingMobile = 15;
  } else if (spacingMobile > 10) {
    spacingMobile = 10;
  } else if (spacingMobile > 5) {
    spacingMobile = 5;
  }
  if (direction == "vertical" || heightAuto) {
    _this.style.maxHeight = _this.offsetHeight + "px";
  }
  let nextEl = _this.querySelector(".swiper-button-next");
  let prevEl = _this.querySelector(".swiper-button-prev");
  let paginationSwiper = _this.querySelector(".swiper-pagination");
  const swiperControls = _this.closest(".swiper__controls-group");
  if (swiperControls) {
    nextEl = swiperControls.querySelector(".swiper-button-next");
    prevEl = swiperControls.querySelector(".swiper-button-prev");
    paginationSwiper = swiperControls.querySelector(".swiper-pagination");
  }
  const swiper = new Swiper(_this, {
    slidesPerView: freeMode ? "auto" : autoItem ? "auto" : itemMobile,
    spaceBetween: spacingMobile,
    mousewheel: mousewheel,
    autoplay: autoplay,
    direction: direction,
    loop: loop,
    effect: effect,
    speed: speed,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    grabCursor: true,
    allowTouchMove: true,
    freeMode: freeMode,
    grid: {
      rows: row,
      fill: "row",
    },
    navigation: {
      nextEl: nextEl,
      prevEl: prevEl,
    },
    pagination: {
      clickable: true,
      el: paginationSwiper,
      type: pagination ? pagination : "bullets",
      renderCustom: function (swiper, current, total) {
        return current + "/" + total;
      },
    },
    breakpoints: {
      768: {
        slidesPerView: itemTablet,
        spaceBetween: spacing,
      },
      1025: {
        slidesPerView: itemDesktop,
        spaceBetween: spacing,
      },
    },
    on: {
      init: function () {
        if (arrowCenterImage) {
          const items_slide = _this.querySelectorAll(".center_swiper-arrow");
          if (items_slide.length != 0) {
            const oH = [];
            items_slide.forEach((e) => {
              oH.push(e.offsetHeight / 2);
            });
            const max = Math.max(...oH);
            const arrowsOffset = "--arrows-offset-top: " + max + "px";
            if (_this.querySelectorAll(".swiper-arrow")) {
              _this.querySelectorAll(".swiper-arrow").forEach((arrow) => {
                arrow.setAttribute("style", arrowsOffset);
              });
            }
          }
        }
        if (_this.querySelector(".slide-video-1")) {
          loadSlideVideo(_this.querySelector(".slide-video-1"));
        }
      },
      slideChange: function () {
        const currentSlide = this.slides[this.activeIndex];
        if (mutedVideo && currentSlide) {
          this.slides.forEach((slide, index) => {
            if (index != this.activeIndex) {
              const video = slide.querySelector("video");
              if (video) {
                video.muted = true;
                video.pause();
                slide.querySelector(".mute-button").classList.remove("active");
                slide.querySelector(".play-button").classList.remove("active");
              }
            }
          });
          const video = currentSlide.querySelector("video");
          if (video) {
            video.muted = false;
            currentSlide.querySelector(".mute-button").classList.add("active");
            if (video.paused) {
              video.play();
              currentSlide
                .querySelector(".play-button")
                .classList.add("active");
            }
          }
        }
      },
      slideChangeTransitionEnd: function () {
        _this.querySelectorAll("video-local-slide").forEach((video) => {
          loadSlideVideo(video);
        });
      },
      resize: function () {
        if (heightAuto) {
          const items = _this.querySelectorAll(
            ".announcement-bar__content-inner"
          );
          if (items.length === 0) return;
          let maxHeight = items[0].offsetHeight;
          for (let i = 1; i < items.length; i++) {
            const itemHeight = items[i].offsetHeight;
            if (itemHeight > maxHeight) {
              maxHeight = itemHeight;
            }
          }
          _this.style.maxHeight = maxHeight + "px";
        }
      },
    },
  });
  return swiper;
}

function loadSlideVideo(_this) {
  if (!_this.getAttribute("loaded") && _this.querySelector("template")) {
    const content = document.createElement("div");
    content.appendChild(
      _this.querySelector("template").content.firstElementChild.cloneNode(true)
    );
    _this.setAttribute("loaded", true);
    const deferredElement = _this.appendChild(content.querySelector("video"));
    const alt = deferredElement.getAttribute("alt");
    const img = deferredElement.querySelector("img");
    if (alt && img) {
      img.setAttribute("alt", alt);
    }
    _this.thumb = _this.querySelector(".video-thumbnail");
    if (_this.thumb) {
      _this.thumb.remove();
    }
    if (
      deferredElement.nodeName == "VIDEO" &&
      deferredElement.getAttribute("autoplay")
    ) {
      deferredElement.play();
    }
  }
}

function initSlideMedia(_this, gallery, thumbnail) {
  let swiperElement = _this.querySelector(".swiper-wrapper-main");
  let watchSlidesProgress = true;
  let watchSlidesVisibility = true;
  let watchOverflow = true;
  let loop = true;
  let speed = 300;
  let spaceBetween = _this?.dataset.spacing ? _this?.dataset.spacing : 10;
  let spacingMobile = spaceBetween;
  let mousewheel = false;
  let itemMobile = gallery == "thumbnail" ? 5 : 1;
  let direction = _this.dataset.thumbDirection
    ? _this.dataset.thumbDirection
    : "horizontal";
  if (gallery == "thumbnail" && direction == "vertical") {
    direction = "vertical";
    if (window.innerWidth >= 768) {
      itemMobile = "auto";
    }
  } else if (gallery == "main" || gallery == "gird") {
    direction = "horizontal";
  }
  if (gallery == "thumbnail") {
    loop = false;
  }
  const autoplayVideo = _this?.dataset.autoPlayVideo === "true";
  if (gallery == "thumbnail") {
    swiperElement = _this.querySelector(".swiper-wrapper-thumbnail");
    watchSlidesVisibility = false;
    watchOverflow = false;
  } else if (gallery == "gird") {
    swiperElement = _this;
    itemMobile = 1.5;
  } else if (gallery == "QuickView" || gallery == "CartUpSell") {
    swiperElement = _this;
    spaceBetween = 10;
    if (gallery == "QuickView") {
      const items = _this.querySelectorAll(".swiper-slide");
      const itemsToShow = Array.from(items);
      if (itemsToShow.length > 1) {
        itemMobile = 2;
      }
    }
    direction = "horizontal";
    if (gallery == "QuickView" && window.innerWidth >= 768) {
      itemMobile = "auto";
      direction = "vertical";
      mousewheel = true;
      loop = false;
      speed = 150;
    }
    if (gallery == "CartUpSell" && window.innerWidth > 1024) {
      itemMobile = "auto";
      direction = "vertical";
      mousewheel = true;
      loop = false;
      speed = 150;
    }
  } else if (gallery == "OfferSlide") {
    swiperElement = _this;
    itemMobile = "auto";
    direction = "vertical";
    mousewheel = true;
    loop = false;
    speed = 150;
  }
  if (spacingMobile > 15) {
    spacingMobile = 15;
  } else if (spacingMobile > 10) {
    spacingMobile = 10;
  } else if (spacingMobile > 5) {
    spacingMobile = 5;
  }
  const swiperSlide = new Swiper(swiperElement, {
    slidesPerView: itemMobile,
    spaceBetween: spacingMobile,
    autoplay: false,
    mousewheel: mousewheel,
    speed: speed,
    direction: gallery == "OfferSlide" ? direction : "horizontal",
    loop: loop,
    watchSlidesProgress: watchSlidesProgress,
    watchSlidesVisibility: watchSlidesVisibility,
    watchOverflow: watchOverflow,
    navigation: {
      nextEl: swiperElement.querySelector(".swiper-button-next"),
      prevEl: swiperElement.querySelector(".swiper-button-prev"),
    },
    breakpoints: {
      768: {
        direction: direction,
        spaceBetween: spaceBetween,
      },
    },
    pagination: {
      clickable: true,
      el: swiperElement.querySelector(".swiper-pagination"),
      type: gallery !== "CartUpSell" ? "custom" : "bullets",
      renderCustom: function (swiper, current, total) {
        return current + "/" + total;
      },
    },
    thumbs: {
      swiper: thumbnail ? thumbnail : null,
    },
    on: {
      slideChange: function () {
        const currentSlide = this.slides[this.activeIndex];
        if (currentSlide) {
          if (gallery !== "thumbnail") {
            const gallery =
              currentSlide.closest("grid-gallery") ||
              currentSlide.closest("quick-view-gallery");
            const actions = gallery
              ? gallery.querySelector(".swiper-actions")
              : false;
            if (currentSlide.classList.contains("media-gallery__model")) {
              this.allowTouchMove = false;
              if (actions) {
                actions.classList.remove("hidden");
              }
            } else {
              this.allowTouchMove = true;
              if (actions) {
                actions.classList.add("hidden");
              }
            }
          }
        }
      },
      slideChangeTransitionEnd: function () {
        if (autoplayVideo && !thumbnail) {
          const vimeoTag = document.createElement("script");
          vimeoTag.src = "https://player.vimeo.com/api/player.js";
          document.head.appendChild(vimeoTag);
          const activeSlide = this.slides[this.activeIndex];
          const video = activeSlide.querySelector(".media-video");
          if (video) {
            if (video.tagName === "VIDEO") {
              video.play();
            } else if (video.tagName === "IFRAME") {
              if (video.src.includes("vimeo")) {
                const vimeoPlayer = new Vimeo.Player(video);
                vimeoPlayer.play();
              }
              if (video.src.includes("youtube")) {
                video.contentWindow.postMessage(
                  '{"event":"command","func":"playVideo","args":""}',
                  "*"
                );
              }
            }
          }
        }
      },
    },
  });
  return swiperSlide;
}

class SlideSection extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    initSlide(this);
  }

  initSlideMediaGallery(gallery, thumbnail = null) {
    return initSlideMedia(this, gallery, thumbnail);
  }
}
if (!customElements.get("slide-section")) {
  customElements.define("slide-section", SlideSection);
}

export { initSlide, initSlideMedia, SlideSection };
