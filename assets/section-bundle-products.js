class VariantRadiosBundle extends HTMLElement {
    constructor() {
      super();
      this.variantData =
      this.variantData ||
      JSON.parse(this.querySelector('[type="application/json"]').textContent);
      this.addEventListener("change", this.onVariantChange.bind(this));
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
      console.log('currentVariant', currentVariant)
      // this.updateVariantStatuses();
      if (currentVariant) {
        // this.updateMedia();
        // this.updatePrice(this.productTarget);
        this.updateVariant(variant_id);
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
      console.log('variant_id', variant_id)
      const bundle = this.productTarget.closest("bundle-item");
      if (bundle) {
        const position = bundle.getAttribute("data-product-position");
        bundle.closest(".bundle-products__body").querySelector(".variant-select [data-index='"+position+"']").setAttribute('value',variant_id);
      }
    }
  }
  customElements.define("variant-radios-bundle", VariantRadiosBundle);