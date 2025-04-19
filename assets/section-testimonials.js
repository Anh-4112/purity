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
    if (!thumbsContainer || !this.swiper) return;

    if (!thumbsContainer.classList.contains('swiper-container')) {
      thumbsContainer.classList.add('swiper-container');
    }
    this.thumbsSwiper = new Swiper(thumbsContainer, {
      slidesPerView: 1,
      spaceBetween: 60,
      watchSlidesProgress: true,
      grabCursor: true,
      allowTouchMove: true,
      slideActiveClass: 'swiper-slide-thumb-active',
      breakpoints: {
        768: {
          slidesPerView: "auto"
        }
      },
    });

    this.swiper.thumbs.swiper = this.thumbsSwiper;
    this.swiper.thumbs.init();
    
    this.swiper.on('slideChangeTransitionEnd', () => {
      this.swiper.thumbs.update();
    });
  }
}
customElements.define("testimonial-slide", TestimonialsSlide);