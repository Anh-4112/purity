import { initSlide } from './module_slide.js?v=1';

class SlideSection extends HTMLElement {
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
customElements.define("slide-section", SlideSection);
