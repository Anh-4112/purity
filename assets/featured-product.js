import { SlideSection } from "./module_slide.js?v=36923263232898";

class MediaGallery extends SlideSection {
  constructor() {
    super();
    this.init();
  }

  init() {
    let thumbnail = this.initSlideMediaGallery("thumbnail");
    this.initSlideMediaGallery("main", thumbnail);
  }
}
if (!customElements.get("media-gallery")) {
  customElements.define("media-gallery", MediaGallery);
}