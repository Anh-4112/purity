function initSlide(_this) {
  let autoplay = _this?.dataset.autoplay === "true";
  const loop = _this?.dataset.loop === "true";
  const itemDesktop = _this?.dataset.desktop ? _this?.dataset.desktop : 4;
  const freeMode = _this?.dataset.freeMode === "true";
  let itemTablet = _this?.dataset.tablet ? _this?.dataset.tablet : "";
  const itemMobile = _this?.dataset.mobile ? _this?.dataset.mobile : 1;
  const direction = _this?.dataset.direction
    ? _this?.dataset.direction
    : "horizontal";
  let autoPlaySpeed = _this?.dataset.autoPlaySpeed
    ? _this?.dataset.autoPlaySpeed
    : 3000;
  let speed = _this?.dataset.speed ? _this?.dataset.speed : 400;
  const effect = _this?.dataset.effect ? _this?.dataset.effect : "slide";
  const row = _this?.dataset.row ? _this?.dataset.row : 1;
  let spacing = _this?.dataset.spacing ? _this?.dataset.spacing : 30;
  const pagination = _this?.dataset.pagination
    ? _this?.dataset.pagination
    : "bullets";
  const autoItem = _this?.dataset.itemMobile === "true";
  let arrowCenterImage = _this?.dataset.arrowCenterImage === "true";
  spacing = Number(spacing);
  autoPlaySpeed = Number(autoPlaySpeed);
  speed = Number(speed);
  if (autoplay) {
    autoplay = { delay: autoPlaySpeed };
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
  if (direction == "vertical") {
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
  new Swiper(_this, {
    slidesPerView: freeMode ? "auto" : autoItem ? "auto" : itemMobile,
    spaceBetween: freeMode ? spacing : spacing >= 10 ? 10 : spacing,
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
        spaceBetween: spacing >= 30 ? 30 : spacing,
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
      slideChangeTransitionEnd: function () {
        _this.querySelectorAll("video-local-slide").forEach((video) => {
          loadSlideVideo(video);
        });
      },
    },
  });
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
  let spaceBetween = 10;
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
  } else if (gallery == "QuickView" || gallery == "CartUpSell") {
    swiperElement = _this;
    spaceBetween = 10;
    if (gallery == "QuickView") {
      const items = _this.querySelectorAll(".swiper-slide");
      const itemsToShow = Array.from(items);
      if (itemsToShow.length > 1) {
        itemMobile = 1.5;
      }
    }
    direction = "horizontal";
    if (window.innerWidth >= 768) {
      itemMobile = "auto";
      direction = "vertical";
      mousewheel = true;
      loop = false;
      speed = 150;
    }
  }
  const swiperSlide = new Swiper(swiperElement, {
    slidesPerView: itemMobile,
    spaceBetween: spaceBetween,
    autoplay: false,
    mousewheel: mousewheel,
    speed: speed,
    direction: "horizontal",
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
            if (currentSlide.classList.contains("media-gallery__model")) {
              this.allowTouchMove = false;
            } else {
              this.allowTouchMove = true;
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
              // Play Vimeo
              if (video.src.includes("vimeo")) {
                const vimeoPlayer = new Vimeo.Player(video);
                vimeoPlayer.play();
              }
              // Play YouTube
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
    if (document.body.classList.contains("index")) {
      let pos = window.pageYOffset;
      if (pos > 0 || document.body.classList.contains("swiper-lazy")) {
        initSlide(this);
      } else {
        if (this.classList.contains("lazy-loading-swiper-before")) {
          initSlide(this);
        } else {
          this.classList.add("lazy-loading-swiper-after");
        }
      }
    } else {
      initSlide(this);
    }
  }

  initSlideMediaGallery(gallery, thumbnail = null) {
    let swiperSlide = null;
    if (document.body.classList.contains("index")) {
      let pos = window.pageYOffset;
      if (pos > 0 || document.body.classList.contains("swiper-lazy")) {
        swiperSlide = initSlideMedia(this, gallery, thumbnail);
      } else {
        if (this.classList.contains("lazy-loading-swiper-before")) {
          swiperSlide = initSlideMedia(this, gallery, thumbnail);
        } else {
          this.classList.add("lazy-loading-swiper-after");
        }
      }
    } else {
      swiperSlide = initSlideMedia(this, gallery, thumbnail);
    }
    return swiperSlide;
  }
}
if (!customElements.get("slide-section")) {
  customElements.define("slide-section", SlideSection);
}

export { initSlide, initSlideMedia, SlideSection };
