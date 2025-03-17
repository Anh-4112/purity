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

class ProductRecommendations extends SlideSection {
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

class CollapsibleRowDetails extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = this.firstElementChild),
      (this.contentElement = this.lastElementChild),
      this._open = this.hasAttribute("open"),
      this.content = this.querySelector(".collapsible-row__content"),
      this.summaryElement.addEventListener(
        "click",
        this.onSummaryClicked.bind(this)
      );
  }

  get open() {
    return this._open;
  }

  set open(value) {
    value !== this._open &&
      ((this._open = value),
      this.isConnected
        ? this.transition(value)
        : value
        ? this.setAttribute("open", "")
        : this.removeAttribute("open"));
  }

  onSummaryClicked(event) {
    event.preventDefault(),
    this.open = !this.open;
  }

  async transition(value) {
    return value
      ? (Motion.animate(
        this.content,
        true ? { height: "auto"} : { height: 0 },
        { duration: 0.3 } ),
        this.setAttribute("open", ""))
      : (Motion.animate(
        this.content,
        false ? { height: "auto"} : { height: 0 },
        { duration: 0.3 } ),
        this.removeAttribute("open"))
  }
}
customElements.define("collapsible-row", CollapsibleRowDetails, {
  extends: "details"
});

class StickyAddCart extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
  }
}
customElements.define("sticky-add-cart", StickyAddCart);