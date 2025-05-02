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
    };
    new IntersectionObserver(handleIntersection.bind(_this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(_this);
  }

  get gallery() {
    return this.closest(".media-lightbox-slide");
  }

  onButtonClick() {}
}
if (!customElements.get("video-local-lightbox")) {
  customElements.define("video-local-lightbox", VideoLocalLightbox);
}
