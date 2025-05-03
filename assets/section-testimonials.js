import { SlideSection } from "module-slide";

class TestimonialsSlide extends SlideSection {
  constructor() {
    super();
    this.initThumb();
  }

  initThumb() {
    const sectionId = this.dataset.sectionId;
    const thumbsContainer = document.querySelector(
      `#testimonials-thumb-swiper-${sectionId}`
    );
    const itemDesktop = thumbsContainer?.dataset.desktop
      ? thumbsContainer?.dataset.desktop
      : 4;
    const itemTablet = thumbsContainer?.dataset.tablet
      ? thumbsContainer?.dataset.tablet
      : "";

    if (!thumbsContainer || !this.swiper) return;

    if (!thumbsContainer.classList.contains("swiper-container")) {
      thumbsContainer.classList.add("swiper-container");
    }
    this.thumbsSwiper = new Swiper(thumbsContainer, {
      slidesPerView: 1,
      spaceBetween: 60,
      watchSlidesProgress: true,
      grabCursor: true,
      loop: true,
      allowTouchMove: false,
      slideActiveClass: "swiper-slide-thumb-active",
      breakpoints: {
        768: {
          slidesPerView: itemTablet,
        },
        1025: {
          slidesPerView: itemDesktop,
        },
      },
    });

    this.swiper.thumbs.swiper = this.thumbsSwiper;
    this.swiper.thumbs.init();
    const section = this.closest(".section-testimonials");
    const nextEl = section.querySelector(
      ".testimonial-swiper-action .swiper-button-next"
    );
    const prevEl = section.querySelector(
      ".testimonial-swiper-action .swiper-button-prev"
    );
    if (nextEl) {
      this.swiper.navigation.nextEl = nextEl;
      nextEl.addEventListener("click", (e) => {
        e.preventDefault();
        this.swiper.slideNext();
      });
    }
    if (prevEl) {
      this.swiper.navigation.prevEl = prevEl;
      prevEl.addEventListener("click", (e) => {
        e.preventDefault();
        this.swiper.slidePrev();
      });
    }
    this.swiper.on("slideChangeTransitionEnd", () => {
      this.swiper.thumbs.update();
    });
  }
}
customElements.define("testimonial-slide", TestimonialsSlide);
