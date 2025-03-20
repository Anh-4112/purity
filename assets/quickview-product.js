import { SlideSection } from "./module_slide.js?v=162927532222223223";
import * as global from "./global.js?v=31222323223";

class MediaGallery extends SlideSection {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (this.querySelector(".product__media-gallery").classList.contains("product-thumbnail")) {
      let thumbnail = this.initSlideMediaGallery("thumbnail");
      this.initSlideMediaGallery("main", thumbnail);
    }
  }
}
if (!customElements.get("media-gallery")) {
  customElements.define("media-gallery", MediaGallery);
}

class GridGallery extends MediaGallery {
  constructor() {
    super();
    this.MediaGalleryHtml = this.innerHTML;
    this.init();
  }

  init() {
    if (this.MediaGalleryHtml) {
      let width = window.innerWidth;
      window.addEventListener('resize', () => {
        const newWidth = window.innerWidth;
        if (newWidth <= 767 && width > 767) {
          this.actionOnMobile();
        }
        if (newWidth > 767 && width <= 767) {
          this.actionOutMobile();
        }
        width = newWidth;
      });
      if (width <= 767) {
        this.actionOnMobile();
      } else {
        this.actionOutMobile();
      }
    }
  }

  actionOnMobile() {
    this.classList.add("swiper");
    this.classList.remove("grid", "grid-cols", "stacked");
    const html = this.MediaGalleryHtml.replaceAll(
      "grid-item",
      "swiper-slide"
    );
    const wrapper = `<div class='swiper-wrapper'>${html}</div> <div
      class="swiper-pagination"
    ></div> `;
    this.innerHTML = wrapper;
    this.initSlideMediaGallery("gird");
  }

  actionOutMobile() {
    this.classList.remove("swiper");
    if (this.classList.contains("grid-swiper-mobile")) {
      this.classList.add("grid", "grid-cols");
    } else {
      this.classList.add("stacked");
    }
    this.innerHTML = this.MediaGalleryHtml;
  }
}

if (!customElements.get("grid-gallery")) {
  customElements.define("grid-gallery", GridGallery);
}

class ButtonQuickView extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
    this.addEventListener(
      "keypress",
      function (event) {
        if (event.key === "Enter") {
          this.onClick.bind(this)(event);
        }
      }.bind(this),
      false
    );
  }

  onClick(e) {
    e.preventDefault();
    if (this.dataset.url) {
      this.setAttribute("aria-disabled", true);
      this.classList.add("loading");
      this.fetchUrl();
    }
  }

  fetchUrl() {
    const _this = this;
    fetch(this.dataset.url)
      .then((response) => response.text())
      .then((text) => {
        const html = global.parser.parseFromString(text, "text/html");
        document.querySelector(".quickview-product").innerHTML =
          html.querySelector(
            ".quickview-product"
          ).innerHTML;
      })
      .finally(() => {
        this.classList.remove("loading");
        this.removeAttribute("aria-disabled");
        global.eventModal(document.querySelector("quickview-drawer"), "open");
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
customElements.define("button-quick-view", ButtonQuickView, {
  extends: "button"
});