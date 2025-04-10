class VariantRadiosBundle extends HTMLElement {
    constructor() {
      super();
      this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
      this.addEventListener("change", this.onVariantChange.bind(this));
      this.sectionId = this.dataset.sectionId;
      this.productUrl = this.dataset.productUrl;
    }
    onVariantChange(e) {
      e.preventDefault();
      const target = e.currentTarget;
      this.productTarget = target.closest(".product__item-js");
      const select = target.querySelector("select");
      const value = select.options[select.selectedIndex].getAttribute("data-value");
      const variant_id = select.options[select.selectedIndex].getAttribute("data-variant-id");
      const array_option = value.split("/");
      this.options = array_option.map(string => string.trim());
      this.variantData.find((variant) => {
        if (this.options.length == 1) {
          const variantOptions = {
            1: variant.option1,
            2: variant.option2,
            3: variant.option3,
          };
          if (variantOptions[this.position_swatch] === this.options[0]) {
            this.options = variant.options;
          }
        }
      });
      const currentVariant = this.updateMasterId(this.variantData);
      if (currentVariant) {
        this.updateVariant(variant_id);
        this.updatePrice(currentVariant.id);
      }
    }
    updateMasterId(variantData) {
      return (this.currentVariant = variantData.find((variant) => {
        return !variant.options
          .map((option, index) => {
            return this.options[index] === option;
          })
          .includes(false);
      }));
    }
    updateMedia() {
      if (!this.currentVariant) return;
      if (!this.currentVariant.featured_media) return;
      if (this.productTarget.querySelector(".product__media img")) {
        this.productTarget
          .querySelector(".product__media img")
          .removeAttribute("srcset");
      }
      if (this.productTarget.querySelector(".product__media img")) {
        this.productTarget
          .querySelector(".product__media img")
          .setAttribute(
            "src",
            this.currentVariant.featured_media.preview_image.src
          );
      }
    }
  
    updateVariant(variant_id) {
      const bundle = this.productTarget.closest("bundle-item");
      if (bundle) {
        const position = bundle.getAttribute("data-product-position");
        bundle.closest(".bundle-products__body").querySelector(".variant-select [data-index='"+position+"']").setAttribute('value',variant_id);
        const productForm = bundle.querySelector('product-form');
        if (productForm) {
          productForm.querySelector('input[name="id"]').setAttribute('value',variant_id);
        }
      }
    }
    
    updatePrice(variantId) {
      if (!this.productUrl || !variantId) return;
      const url = `${this.productUrl}?variant=${variantId}`;
      fetch(url)
        .then(response => response.text())
        .then(responseText => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const priceContainer = this.productTarget.querySelector('.product__price');
          
          if (priceContainer) {
            const newPriceContainer = html.querySelector('.card-product-price');
            if (newPriceContainer) {
              priceContainer.innerHTML = newPriceContainer.innerHTML;
            }
          }
        })
        .catch(e => {
          console.error('Error updating price:', e);
        });
    }
  }
  customElements.define("variant-radios-bundle", VariantRadiosBundle);


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
          const position = target.closest("bundle-item").dataset.productPosition;
          this.removeActive();
          this.querySelector(
            ".bundle-products-link[data-product-position='" +
              position +
              "']"
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
  customElements.define("bundle-products", BundleProducts);