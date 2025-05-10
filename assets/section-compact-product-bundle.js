if (!customElements.get("bundle-products")) {
  customElements.define(
    "bundle-products",
    class BundleProducts extends HTMLElement {
      constructor() {
        super();
        this.dot = this.querySelectorAll(".bundle-products-hotspot");
        this.item = this.querySelectorAll("bundle-item");
        if (this.dot.length < 1) return;
        const _this = this;
        this.dot.forEach((e) => {
          e.addEventListener(
            "mouseenter",
            _this.onMouseoverPopup.bind(_this),
            false
          );
          e.addEventListener("mouseleave", _this.onMouseout.bind(_this), false);
        });
        this.item.forEach((e) => {
          e.addEventListener(
            "mouseenter",
            _this.onMouseoverItem.bind(_this),
            false
          );
          e.addEventListener("mouseleave", _this.onMouseout.bind(_this), false);
        });
      }

      onMouseoverPopup(e) {
        const target = e.target;
        if (window.innerWidth >= 768) {
          if (
            !target
              .closest(".bundle-products-link")
              .classList.contains("active")
          ) {
            const position = target.closest(".bundle-products-link").dataset
              .productPosition;
            this.removeActive();
            this.querySelector(
              "bundle-item[data-product-position='" + position + "']"
            ).classList.add("active");
            this.classList.add("is-hover");
            target.closest(".bundle-products-link").classList.add("active");
          }
        }
      }

      onMouseoverItem(e) {
        const target = e.target;
        if (window.innerWidth >= 768) {
          if (!target.closest("bundle-item").classList.contains("active")) {
            const position =
              target.closest("bundle-item").dataset.productPosition;
            this.removeActive();
            this.querySelector(
              ".bundle-products-link[data-product-position='" + position + "']"
            ).classList.add("active");
            this.classList.add("is-hover");
            target.closest("bundle-item").classList.add("active");
          }
        }
      }

      onMouseout() {
        this.removeActive();
      }

      removeActive() {
        if (this.dot.length < 1) return;
        this.dot.forEach((e) => {
          if (!e.closest(".bundle-products-link")) return;
          e.closest(".bundle-products-link").classList.remove("active");
        });
        this.item.forEach((e) => {
          e.classList.remove("active");
        });
        this.classList.remove("is-hover");
      }
    }
  );
}
