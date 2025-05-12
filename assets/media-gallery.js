import { SlideSection } from "module-slide";
import { LazyLoader } from "module-lazyLoad";
import PhotoSwipeLightbox from "module-photoSwipeLightbox";
import { CustomElement } from "module-safariElementPatch";

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
      let width = window.innerWidth;
      window.addEventListener("resize", () => {
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
    const actions = this.querySelector(".swiper-actions").outerHTML;
    const pagination = this.querySelector(".swiper-pagination").outerHTML;
    const html = this.MediaGalleryHtml.replaceAll("grid-item", "swiper-slide")
      .replaceAll(actions, "")
      .replaceAll(pagination, "");
    const wrapper = `${actions}<div class='swiper-wrapper'>${html}</div>${pagination}`;
    this.innerHTML = wrapper;
    this.initSlideMediaGallery("gird");
    new LazyLoader(".image-lazy-load");
  }

  actionOutMobile() {
    this.classList.remove("swiper");
    if (this.classList.contains("grid-swiper-mobile")) {
      this.classList.add("grid", "grid-cols");
    } else {
      this.classList.add("stacked", "grid");
    }
    this.innerHTML = this.MediaGalleryHtml;
    new LazyLoader(".image-lazy-load");
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

  actionOnMobile() {
    this.initSlideMediaGallery("QuickView");
    this.style.maxHeight = "auto";
    this.style.minHeight = "auto";
  }

  actionOutMobile() {
    this.initSlideMediaGallery("QuickView");
    this.style.maxHeight =
      this.closest(".drawer__body").offsetHeight - 20 + "px";
    this.style.minHeight = "calc(100vh - 20px)";
  }
}

if (!customElements.get("quick-view-gallery")) {
  customElements.define("quick-view-gallery", QuickViewGallery);
}

class MediaZoomButton extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    this.addEventListener("click", this.onButtonClick);
  }

  get gallery() {
    return this.closest("media-gallery");
  }

  onButtonClick() {
    if (this.closest(".pswp__item")) {
      return;
    }
    const lightbox = new PhotoSwipeLightbox({
      bgOpacity: 1,
      pswpModule: () => import(importJs.pswpModule),
      allowPanToNext: false,
      allowMouseDrag: true,
      wheelToZoom: false,
      returnFocus: true,
      zoom: false,
      arrowPrev: false,
      arrowNext: false,
      close: false,
    });
    lightbox.on("contentLoad", (event) => {
      const { content } = event;

      if (
        content.type === "video" ||
        content.type === "external_video" ||
        content.type === "model"
      ) {
        event.preventDefault();
        content.element = document.createElement("div");
        content.element.className = "pswp__video-container";
        content.element.appendChild(content.data.domElement.cloneNode(true));
      }
    });
    lightbox.on("uiRegister", () => {
      const { pswp } = lightbox;
      pswp?.ui.registerElement({
        name: "close-zoom",
        isButton: true,
        order: 2,
        tagName: "button",
        html: '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" class="transition-short will-change"><use href="#icon-close"></use></svg>',
        onClick: () => {
          pswp.close();
        },
      });
      pswp?.ui.registerElement({
        name: "next",
        ariaLabel: "Next slide",
        order: 3,
        isButton: true,
        html: '<svg width="6" height="11" fill="none"><use href="#icon-next"></use></svg>',
        onClick: (event, el) => {
          pswp.next();
        },
      });
      pswp?.ui.registerElement({
        name: "prev",
        ariaLabel: "Previous slide",
        order: 1,
        isButton: true,
        html: '<svg width="6" height="11" fill="none"><use href="#icon-back"></use></svg>',
        onClick: (event, el) => {
          pswp.prev();
        },
      });
    });
    lightbox.init();

    const index = this.closest(".media-gallery__image").getAttribute(
      "data-position"
    );
    const items = this.gallery.querySelectorAll("[media-gallery]");
    const itemsToShow = Array.from(items).filter(
      (element) => element.clientWidth > 0
    );

    let dataSource = itemsToShow.map((media) => {
      const image = media.querySelector("img");
      if (media.getAttribute("media-gallery") === "image") {
        return {
          thumbnailElement: image,
          src: image.src,
          srcset: image.srcset,
          msrc: image.currentSrc || image.src,
          width: parseInt(image.getAttribute("width")),
          height: parseInt(image.getAttribute("height")),
          alt: image.alt,
          mediaType: "image",
          thumbCropped: true,
        };
      }

      if (
        media.getAttribute("media-gallery") === "video" ||
        media.getAttribute("media-gallery") === "external_video" ||
        media.getAttribute("media-gallery") === "model"
      ) {
        const video =
          media.querySelector("video-product-gallery") ||
          media.querySelector("[media-model]") ||
          media;
        return {
          thumbnailElement: image,
          domElement: video,
          type: media.getAttribute("media-gallery"),
          src: image ? image.src : "",
          srcset: image ? image.srcset : "",
          msrc: image ? image.src : "",
          width: image ? parseInt(image.getAttribute("width")) : 800,
          height: image ? parseInt(image.getAttribute("height")) : 800,
          alt: image ? image.alt : "",
          mediaType: "external",
          thumbCropped: true,
        };
      }
    });
    lightbox.loadAndOpen(index - 1, dataSource);
    lightbox.on("pointerDown", (e) => {
      lightbox.pswp.currSlide.data.mediaType != "image" && e.preventDefault();
    });
  }
}
customElements.define("media-zoom-button", MediaZoomButton, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "media-zoom-button": {
    tagElement: "button",
    classElement: MediaZoomButton,
  },
});
