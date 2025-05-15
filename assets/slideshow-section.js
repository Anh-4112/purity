import { initSlide } from "module-slide";

class SlideshowSection extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const slideshow = initSlide(this);
    if ((slideshow.init(), slideshow)) {
      slideshow.on("slideChangeTransitionStart", function () {
        const currentSlide = slideshow.slides[slideshow.activeIndex];
        currentSlide
          .querySelectorAll("motion-effect")
          .forEach(async (motion) => {
            motion.classList.remove("animate-delay"),
              await motion.initAnimate(),
              setTimeout(() => {
                motion.initAnimateEffect();
              }, 100);
          });
      });
    }
  }
}
if (!customElements.get("slideshow-section")) {
  customElements.define("slideshow-section", SlideshowSection);
}
