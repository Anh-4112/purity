function initSlide(_this) {
  let autoplay = _this?.dataset.autoplay === "true";
  const loop = _this?.dataset.loop === "true";
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
    slidesPerView: autoItem ? "auto" : itemMobile,
    spaceBetween: spacing >= 15 ? 15 : spacing,
    autoplay: autoplay,
    direction: direction,
    loop: loop,
    effect: effect,
    speed: speed,
    watchSlidesProgress: true,
    watchSlidesVisibility: true,
    grid: {
      rows: row,
      fill: "row",
    },
    navigation: {
      nextEl: _this.querySelector(".swiper-button-next"),
      prevEl: _this.querySelector(".swiper-button-prev"),
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
    }
  });
};

export class SlideSection extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const _this = this;
    if (document.body.classList.contains("index")) {
      let pos = window.pageYOffset;
      if (pos > 0 || document.body.classList.contains("swiper-lazy")) {
        initSlide(_this);
      } else {
        if (this.classList.contains("lazy-loading-swiper-before")) {
          initSlide(_this);
        } else {
          this.classList.add("lazy-loading-swiper-after");
        }
      }
    } else {
      initSlide(_this);
    }
  }
}
if (!customElements.get("slide-section")) {
  customElements.define("slide-section", SlideSection);
}