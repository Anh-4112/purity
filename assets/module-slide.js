function initSlide(_this) {
  let autoplay = _this?.dataset.autoplay === "true";
  const loop = _this?.dataset.loop === "true";
  const centerSlide = _this?.dataset.centerSlide === "true";
  const itemDesktop = _this?.dataset.desktop ? _this?.dataset.desktop : 4;
  let itemTablet = _this?.dataset.tablet ? _this?.dataset.tablet : "";
  const itemMobile = _this?.dataset.mobile ? _this?.dataset.mobile : 1;
  const direction = _this?.dataset.direction
    ? _this?.dataset.direction
    : "horizontal";
  let autoPlaySpeed = _this?.dataset.autoPlaySpeed
    ? _this?.dataset.autoPlaySpeed * 1000
    : 3000;
  let speed = _this?.dataset.speed ? _this?.dataset.speed : 400;
  const effect = _this?.dataset.effect ? _this?.dataset.effect : "slide";
  const row = _this?.dataset.row ? _this?.dataset.row : 1;
  let spacing = _this?.dataset.spacing ? _this?.dataset.spacing : 30;
  const progressbar = _this?.dataset.paginationProgressbar === "true";
  const autoItem = _this?.dataset.itemMobile === "true";
  const slideTab = _this?.dataset.slideTab === "true";
  let arrowCenterImage = _this?.dataset.itemMobile === "true";
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
  new Swiper(_this, {
    slidesPerView:  centerSlide ? 'auto' : autoItem ? "auto" : itemMobile,
    spaceBetween: centerSlide ? spacing : spacing >= 10 ? 10 : spacing,
    autoplay: autoplay,
    direction: direction,
    loop: loop,
    effect: effect,
    speed: speed,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    centeredSlides: centerSlide,
    grabCursor: true,
    allowTouchMove: true,
    grid: {
      rows: row,
      fill: "row",
    },
    navigation: {
      nextEl: slideTab ? _this.closest('.section-product-tabs').querySelector(".swiper-button-next") : _this.querySelector(".swiper-button-next"),
      prevEl: slideTab ? _this.closest('.section-product-tabs').querySelector(".swiper-button-prev") : _this.querySelector(".swiper-button-prev"),
    },
    pagination: {
      clickable: true,
      el: _this.querySelector(".swiper-pagination"),
      type: progressbar ? "progressbar" : "bullets",
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
          const items_slide = _this.querySelectorAll(
            ".product-item__media--ratio"
          );
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
      }
    },
  });
}

function initSlideMedia(_this, gallery, thumbnail) {
  let swiperElement = _this.querySelector(".swiper-wrapper-main");
  let watchSlidesProgress = true;
  let watchSlidesVisibility = true;
  let watchOverflow = true;
  let loop = true;
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
    if (_this.closest(".quickview-product")) {
      itemMobile = 1.3;
    }
  }
  const swiperSlide = new Swiper(swiperElement, {
    slidesPerView: itemMobile,
    spaceBetween: 10,
    autoplay: false,
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
      type: "custom",
      renderCustom: function (swiper, current, total) {
        return current + "/" + total;
      },
    },
    thumbs: {
      swiper: thumbnail ? thumbnail : null,
    },
    on: {
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