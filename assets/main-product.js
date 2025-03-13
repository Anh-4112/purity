import { initSlide } from './module_slide.js';

class ProductRecommendations extends HTMLElement {
  constructor() {
    super();
  }
  init() {
    this.connectedCallback();
  }
  connectedCallback() {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          const recommendations = html.querySelector("product-recommendations");
          if (recommendations && recommendations.innerHTML.trim().length) {
            this.innerHTML = recommendations.innerHTML;
          }
          if (recommendations.innerHTML.trim().length === 0) {
            this.remove();
            if (document.querySelector(".product-recommendations-heading")) {
              document
                .querySelector(".product-recommendations-heading")
                .remove();
            }
          }
        })
        .finally(() => {
          if (this.querySelector(".swiper-wrapper")) {
            initSlide(this);
          }
        })
        .catch((e) => {
          console.error(e);
        });
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 400px 0px",
    }).observe(this);
  }
}
customElements.define("product-recommendations", ProductRecommendations);