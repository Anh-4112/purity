import { SlideSection } from "module-slide";

document.addEventListener("DOMContentLoaded", function () {
  function addProductEntry(productJson, storedProducts) {
    if (storedProducts === null) storedProducts = [];
    const currentProductID = productJson.id.toString();
    if (!storedProducts.includes(currentProductID)) {
      storedProducts.unshift(currentProductID);
      if (storedProducts.length > 25) {
        storedProducts.pop();
      }
      localStorage.setItem(
        "recently-viewed-products",
        JSON.stringify(storedProducts)
      );
    } else {
      const index = storedProducts.indexOf(currentProductID);
      if (index > -1) {
        storedProducts.splice(index, 1);
      }
      storedProducts.unshift(currentProductID);
      localStorage.setItem(
        "recently-viewed-products",
        JSON.stringify(storedProducts)
      );
    }
  }

  const prodData = document.querySelector("[data-product-json]");
  if (prodData != null) {
    const productJson = JSON.parse(prodData.innerHTML);
    const storedProducts = JSON.parse(
      localStorage.getItem("recently-viewed-products")
    );
    addProductEntry(productJson, storedProducts);
  }
});

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
        })
        .finally(() => {})
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

class StickyAddCart extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {}
}
customElements.define("sticky-add-cart", StickyAddCart);
