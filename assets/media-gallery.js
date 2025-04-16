import { SlideSection } from "module-slide";

class MediaGallery extends SlideSection {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (
      this.querySelector(".product__media-gallery").classList.contains(
        "product-thumbnail"
      )
    ) {
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
      this.resizeWindow(767);
    }
  }

  resizeWindow(width) {
    let innerWidth = window.innerWidth;
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      if (newWidth <= width && innerWidth > width) {
        this.actionOnMobile();
      }
      if (newWidth > width && innerWidth <= width) {
        this.actionOutMobile();
      }
      innerWidth = newWidth;
    });
    if (innerWidth <= width) {
      this.actionOnMobile();
    } else {
      this.actionOutMobile();
    }
  }

  actionOnMobile() {
    this.classList.add("swiper");
    this.classList.remove("grid", "grid-cols", "stacked");
    const html = this.MediaGalleryHtml.replaceAll("grid-item", "swiper-slide");
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

class QuickViewGallery extends GridGallery {
  constructor() {
    super();
    this.MediaGalleryHtml = this.innerHTML;
    this.init();
  }

  init() {
    if (this.MediaGalleryHtml) {
      this.resizeWindow(1024);
    }
  }

  actionOnMobile() {
    this.initSlideMediaGallery("QuickView");
    this.style.maxHeight = "auto";
  }

  actionOutMobile() {
    this.initSlideMediaGallery("QuickView");
    this.style.maxHeight =
      this.closest(".drawer__body").offsetHeight - 40 + "px";
  }
}

if (!customElements.get("quick-view-gallery")) {
  customElements.define("quick-view-gallery", QuickViewGallery);
}
