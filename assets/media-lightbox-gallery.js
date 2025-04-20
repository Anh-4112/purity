import PhotoSwipeLightbox from "module-photoSwipeLightbox";

class VideoLocalLightbox extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    setTimeout(() => {
      this.loadContent();
    }, 100);
    this.addEventListener("click", this.onButtonClick);
  }

  loadContentVideo(_this) {
    if (!_this.getAttribute("loaded") && _this.querySelector("template")) {
      const content = document.createElement("div");
      content.appendChild(
        _this
          .querySelector("template")
          .content.firstElementChild.cloneNode(true)
      );
      _this.setAttribute("loaded", true);
      const video = content.querySelector("video")
        ? content.querySelector("video")
        : content.querySelector("iframe");
      const deferredElement = _this.appendChild(video);
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

  loadContent() {
    const _this = this;
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(_this);
      this.loadContentVideo(_this);
      const videos = _this.querySelectorAll("video");
      videos.forEach((video) => {
        const dataSrc = video.dataset.src;
        if (dataSrc) {
          video.src = dataSrc;
          video.removeAttribute("data-src");
        }
      });
    };
    new IntersectionObserver(handleIntersection.bind(_this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(_this);
  }

  get gallery() {
    return this.closest(".media-lightbox-slide");
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
    });
    lightbox.on("contentLoad", (event) => {
      const { content } = event;
      if (content.type === "video") {
        event.preventDefault();
        content.element = document.createElement("div");
        content.element.className = "pswp__video-container";
        content.element.appendChild(content.data.domElement.cloneNode(true));
      }
    });
    lightbox.init();

    const index = this.getAttribute("data-position");
    const items = this.gallery.querySelectorAll("video-local-lightbox");
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
          thumbCropped: true,
        };
      }

      if (media.getAttribute("media-gallery") === "video") {
        const video = media;
        return {
          thumbnailElement: image,
          domElement: video,
          type: "video",
          src: image ? image.src : "",
          srcset: image ? image.srcset : "",
          msrc: image ? image.src : "",
          width: image ? parseInt(image.getAttribute("width")) : 800,
          height: image ? parseInt(image.getAttribute("height")) : 800,
          alt: image ? image.alt : "",
          thumbCropped: true,
        };
      }
    });
    lightbox.loadAndOpen(index - 1, dataSource);
  }
}
if (!customElements.get("video-local-lightbox")) {
  customElements.define("video-local-lightbox", VideoLocalLightbox);
}
