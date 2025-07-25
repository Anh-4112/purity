import * as NextSkyTheme from "global";
import { LazyLoader } from "module-lazyLoad";
if (!customElements.get("product-form-bundle")) {
  customElements.define(
    "product-form-bundle",
    class ProductForm extends HTMLElement {
      constructor() {
        super();
        this.form = this.querySelector("form");
        this.form.querySelector("[name=id]").disabled = false;
        this.form.addEventListener("submit", this.onSubmitHandler.bind(this));
        this.submitButton = this.querySelector('[type="submit"]');
        this.sectionId = this.dataset.sectionId;
        this.bundle = this.closest("build-your-routine");
        this.localStorageKey = `bundle-items-${this.sectionId}`;
        this.isLoadingFromStorage = false;
        
        const isFirstForm = this.bundle.querySelector("product-form-bundle") === this;
        if (isFirstForm) {
          setTimeout(() => {
            this.loadBundleFromStorage();
          }, 50);
        }
      }

      onSubmitHandler(event) {
        event.preventDefault();
        if (this.submitButton.getAttribute("aria-disabled") === "true") return;
        this.submitButton.classList.add("disabled");
        this.submitButton.setAttribute("aria-disabled", true);
        this.submitButton.setAttribute("disabled", true);
        this.submitButton.textContent = window.cartStrings?.added_to_bundle;
        const formData = new FormData(this.form);
        const variantId = formData.get("id");
        const quantity = formData.get("quantity") || 1;
        const productHandle = this.dataset.handle || this.dataset.productHandle;
        fetch(
          `/products/${productHandle}?section_id=bundle-item&variant=${variantId}`
        )
          .then((response) => response.text())
          .then((responseText) => {
            const html = NextSkyTheme.parser.parseFromString(
              responseText,
              "text/html"
            );
            const bundleContainers = this.bundle.querySelectorAll(
              "[data-product-bundle-variant]"
            );
            if (!bundleContainers.length) {
              return;
            }

            let existingItemContainer = null;
            for (const container of bundleContainers) {
              if (container.getAttribute("data-variant-id") === variantId) {
                existingItemContainer = container;
                break;
              }
            }
            if (existingItemContainer) {
            } else {
              let targetContainer = null;
              for (const container of bundleContainers) {
                if (!container.hasAttribute("data-variant-id")) {
                  targetContainer = container;
                  break;
                }
              }
              if (!targetContainer) {
                return;
              }

              const bundleImage = html.querySelector(".bundle-image");
              const bundleContent = html.querySelector(".bundle-content");
              const dataRatio = bundleImage.dataset.ratio;
              const bundleSticky =
                this.closest("build-your-routine").querySelector(
                  ".bundle-sticky"
                );
              if (!bundleImage || !bundleContent) {
                return;
              }
              const enableQuantity =
                bundleSticky.dataset.enableQuantity === "true";
              const bundleQuantity = html.querySelector(".bundle-quantity");
              if (enableQuantity === false) {
                bundleQuantity.remove();
              }
              targetContainer.setAttribute("data-variant-id", variantId);
              targetContainer.setAttribute("data-quantity", quantity);
              targetContainer.setAttribute("data-product-handle", productHandle);
              const mediaContainer = targetContainer.querySelector(
                "[data-product-bundle-variant-media]"
              );
              if (mediaContainer && bundleImage) {
                mediaContainer.innerHTML = bundleImage.innerHTML;
                mediaContainer.style.setProperty("--aspect-ratio", dataRatio);
              }
              const contentContainer = targetContainer.querySelector(
                "[data-product-bundle-variant-content]"
              );
              if (contentContainer && bundleContent) {
                contentContainer
                  .querySelectorAll(".skeleton-product__info")
                  .forEach((el) => el.remove());
                contentContainer.innerHTML = bundleContent.innerHTML;
              }
            }
          })
          .catch((error) => {
            console.error("Error adding product to bundle:", error);
          })
          .finally(() => {
            new LazyLoader(".image-lazy-load");
            this.updateBundleButtonStatus();
            this.updateBundleTotal();
            this.updateProductFormButtons();
            this.saveBundleToStorage();
            document.dispatchEvent(new CustomEvent("bundle:item-changed"));
          });
      }

      updateBundleButtonStatus() {
        const minimum = this.dataset.minimum;
        const maximum = this.dataset.maximum;
        const submitButton = this.bundle.querySelector(
          `.button-submit-bundle-${this.sectionId}`
        );
        if (!submitButton) return;

        const bundleItems = this.bundle.querySelectorAll(
          "[data-product-bundle-variant][data-variant-id]"
        );
        if (bundleItems.length >= minimum) {
          submitButton.classList.remove("disabled");
          submitButton.removeAttribute("aria-disabled");
          submitButton.removeAttribute("disabled");
          submitButton.setAttribute("tabindex", "0");
        } else {
          submitButton.classList.add("disabled");
          submitButton.setAttribute("aria-disabled", true);
          submitButton.setAttribute("disabled", true);
          submitButton.removeAttribute("tabindex");
        }

        const buttonAddBundle = this.bundle.querySelectorAll(
          "product-form-bundle button"
        );
        if (bundleItems.length >= maximum) {
          buttonAddBundle.forEach((button) => {
            button.classList.add("disabled");
            button.setAttribute("disabled", true);
            button.setAttribute("aria-disabled", true);
          });
        }
      }

      updateBundleTotal() {
        let itemTotalPrice = 0;
        const bundleItems = this.bundle.querySelectorAll(
          "[data-product-bundle-variant][data-variant-id]"
        );

        bundleItems.forEach((item) => {
          const priceElement = item.querySelector(".product__price");
          const price = parseFloat(priceElement?.dataset.price || 0);
          const quantity = parseInt(item.getAttribute("data-quantity")) || 1;

          if (price) {
            itemTotalPrice += price * quantity;
          }
        });

        const totalElement = document.querySelector(
          `.bundle-total-price-${this.sectionId}`
        );

        if (totalElement) {
          totalElement.textContent = NextSkyTheme.formatMoney(
            itemTotalPrice,
            themeGlobalVariables.settings.money_format
          );
        }
      }

      loadBundleFromStorage() {
        try {
          const savedItems = localStorage.getItem(this.localStorageKey);
          if (savedItems) {
            const bundleItems = JSON.parse(savedItems);
            
            if (this.isLoadingFromStorage) return;
            this.isLoadingFromStorage = true;
            
            if (!Array.isArray(bundleItems) || bundleItems.length === 0) {
              this.isLoadingFromStorage = false;
              return;
            }
            
            const validItems = bundleItems.filter(item => 
              item && 
              item.variantId && 
              item.productHandle && 
              item.quantity && 
              typeof item.quantity === 'number'
            );
            
            if (validItems.length === 0) {
              this.isLoadingFromStorage = false;
              return;
            }
            
            this.clearExistingBundleItems();
            
            this.loadAllItemsParallel(validItems);
          }
        } catch (error) {
          console.error('Error loading bundle from storage:', error);
          this.isLoadingFromStorage = false;
        }
      }

      loadAllItemsParallel(items) {
        const fetchPromises = items.map(item => this.fetchProductData(item));
        
        Promise.all(fetchPromises)
          .then(results => {
            const validResults = results.filter(result => result !== null);
            
            validResults.forEach((result, index) => {
              this.applyProductToContainer(result, index);
            });
            
            this.isLoadingFromStorage = false;
            setTimeout(() => {
              new LazyLoader(".image-lazy-load");
              this.updateBundleButtonStatus();
              this.updateBundleTotal();
              this.updateProductFormButtons();
              document.dispatchEvent(new CustomEvent("bundle:item-changed"));
            }, 50);
          })
          .catch(error => {
            console.error('Error loading bundle items:', error);
            this.isLoadingFromStorage = false;
          });
      }

      fetchProductData(item) {
        const { variantId, quantity, productHandle } = item;
        
        return fetch(`/products/${productHandle}?section_id=bundle-item&variant=${variantId}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = NextSkyTheme.parser.parseFromString(responseText, "text/html");
            const bundleImage = html.querySelector(".bundle-image");
            const bundleContent = html.querySelector(".bundle-content");
            
            if (!bundleImage || !bundleContent) {
              console.warn('Bundle image or content not found for variant:', variantId);
              return null;
            }
            
            return {
              variantId,
              quantity,
              productHandle,
              bundleImage,
              bundleContent,
              dataRatio: bundleImage.dataset.ratio
            };
          })
          .catch((error) => {
            console.error("Error fetching product data:", error);
            return null;
          });
      }

      applyProductToContainer(productData, index) {
        const { variantId, quantity, productHandle, bundleImage, bundleContent, dataRatio } = productData;
        
        const bundleContainers = this.bundle.querySelectorAll("[data-product-bundle-variant]");
        
        const existingContainer = Array.from(bundleContainers).find(container => 
          container.getAttribute("data-variant-id") === variantId
        );
        
        if (existingContainer) {
          const currentQuantity = parseInt(existingContainer.getAttribute("data-quantity")) || 1;
          if (currentQuantity !== quantity) {
            existingContainer.setAttribute("data-quantity", quantity);
            const quantityInput = existingContainer.querySelector('quantity-input-bundle input');
            if (quantityInput) {
              quantityInput.value = quantity;
            }
          }
          return;
        }

        let targetContainer = null;
        for (const container of bundleContainers) {
          if (!container.hasAttribute("data-variant-id")) {
            targetContainer = container;
            break;
          }
        }
        
        if (!targetContainer) {
          console.warn('No empty container available for variant:', variantId);
          return;
        }

        const bundleSticky = this.closest("build-your-routine").querySelector(".bundle-sticky");
        const enableQuantity = bundleSticky.dataset.enableQuantity === "true";
        
        const clonedContent = bundleContent.cloneNode(true);
        const bundleQuantity = clonedContent.querySelector(".bundle-quantity");
        if (enableQuantity === false && bundleQuantity) {
          bundleQuantity.remove();
        }
        
        targetContainer.setAttribute("data-variant-id", variantId);
        targetContainer.setAttribute("data-quantity", quantity);
        targetContainer.setAttribute("data-product-handle", productHandle);
        
        const mediaContainer = targetContainer.querySelector("[data-product-bundle-variant-media]");
        if (mediaContainer && bundleImage) {
          mediaContainer.innerHTML = bundleImage.innerHTML;
          mediaContainer.style.setProperty("--aspect-ratio", dataRatio);
        }
        
        const contentContainer = targetContainer.querySelector("[data-product-bundle-variant-content]");
        if (contentContainer) {
          contentContainer.querySelectorAll(".skeleton-product__info").forEach((el) => el.remove());
          contentContainer.innerHTML = clonedContent.innerHTML;
        }
        
        const quantityInput = targetContainer.querySelector('quantity-input-bundle input');
        if (quantityInput) {
          quantityInput.value = quantity;
        }
      }

      clearExistingBundleItems() {
        const bundleContainers = this.bundle.querySelectorAll("[data-product-bundle-variant][data-variant-id]");
        bundleContainers.forEach(container => {
          container.removeAttribute("data-variant-id");
          container.removeAttribute("data-quantity");
          container.removeAttribute("data-product-handle");
          
          const mediaContainer = container.querySelector("[data-product-bundle-variant-media]");
          if (mediaContainer) {
            mediaContainer.innerHTML = "";
            mediaContainer.style.setProperty("--aspect-ratio", "3/4");
          }
          
          const contentContainer = container.querySelector("[data-product-bundle-variant-content]");
          if (contentContainer) {
            contentContainer.innerHTML = `
              <span class="skeleton-product__info skeleton-1 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 100%;"></span>
              <span class="skeleton-product__info skeleton-2 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 6rem;"></span>
              <span class="skeleton-product__info skeleton-3 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 12rem"></span>
            `;
          }
          
          const actionContainer = container.querySelector(".bundle-action");
          if (actionContainer) {
            actionContainer.innerHTML = "";
          }
        });
      }

      restoreProductToBundle(item) {
        const { variantId, quantity, productHandle } = item;
        
        return fetch(`/products/${productHandle}?section_id=bundle-item&variant=${variantId}`)
          .then((response) => response.text())
          .then((responseText) => {
            const html = NextSkyTheme.parser.parseFromString(responseText, "text/html");
            const bundleContainers = this.bundle.querySelectorAll("[data-product-bundle-variant]");
            
            if (!bundleContainers.length) return;

            const existingContainer = Array.from(bundleContainers).find(container => 
              container.getAttribute("data-variant-id") === variantId
            );
            
            if (existingContainer) {
              const currentQuantity = parseInt(existingContainer.getAttribute("data-quantity")) || 1;
              if (currentQuantity !== quantity) {
                existingContainer.setAttribute("data-quantity", quantity);
                const quantityInput = existingContainer.querySelector('quantity-input-bundle input');
                if (quantityInput) {
                  quantityInput.value = quantity;
                }
              }
              return;
            }

            let targetContainer = null;
            for (const container of bundleContainers) {
              if (!container.hasAttribute("data-variant-id")) {
                targetContainer = container;
                break;
              }
            }
            
            if (!targetContainer) {
              console.warn('No empty container available for variant:', variantId);
              return;
            }

            const bundleImage = html.querySelector(".bundle-image");
            const bundleContent = html.querySelector(".bundle-content");
            
            if (!bundleImage || !bundleContent) {
              console.warn('Bundle image or content not found for variant:', variantId);
              return;
            }
            
            const dataRatio = bundleImage.dataset.ratio;
            const bundleSticky = this.closest("build-your-routine").querySelector(".bundle-sticky");
            
            const enableQuantity = bundleSticky.dataset.enableQuantity === "true";
            const bundleQuantity = html.querySelector(".bundle-quantity");
            if (enableQuantity === false && bundleQuantity) {
              bundleQuantity.remove();
            }
            
            targetContainer.setAttribute("data-variant-id", variantId);
            targetContainer.setAttribute("data-quantity", quantity);
            targetContainer.setAttribute("data-product-handle", productHandle);
            
            const mediaContainer = targetContainer.querySelector("[data-product-bundle-variant-media]");
            if (mediaContainer && bundleImage) {
              mediaContainer.innerHTML = bundleImage.innerHTML;
              mediaContainer.style.setProperty("--aspect-ratio", dataRatio);
            }
            
            const contentContainer = targetContainer.querySelector("[data-product-bundle-variant-content]");
            if (contentContainer && bundleContent) {
              contentContainer.querySelectorAll(".skeleton-product__info").forEach((el) => el.remove());
              contentContainer.innerHTML = bundleContent.innerHTML;
            }
            
            const quantityInput = targetContainer.querySelector('quantity-input-bundle input');
            if (quantityInput) {
              quantityInput.value = quantity;
            }
            
            new LazyLoader(".image-lazy-load");
            document.dispatchEvent(new CustomEvent("bundle:item-changed"));
          })
          .catch((error) => {
            console.error("Error restoring product to bundle:", error);
            throw error;
          });
      }

      saveBundleToStorage() {
        try {
          const bundleItems = this.bundle.querySelectorAll("[data-product-bundle-variant][data-variant-id]");
          const items = [];
          
          bundleItems.forEach((item) => {
            const variantId = item.getAttribute("data-variant-id");
            const quantity = parseInt(item.getAttribute("data-quantity")) || 1;
            const productHandle = item.getAttribute("data-product-handle");
            
            if (variantId && productHandle) {
              items.push({
                variantId,
                quantity,
                productHandle
              });
            }
          });
          
          if (items.length > 0) {
            localStorage.setItem(this.localStorageKey, JSON.stringify(items));
          } else {
            localStorage.removeItem(this.localStorageKey);
          }
        } catch (error) {
          console.error('Error saving bundle to storage:', error);
        }
      }

      updateProductFormButtons() {
        const bundleItems = this.bundle.querySelectorAll("[data-product-bundle-variant][data-variant-id]");
        const bundledVariantIds = Array.from(bundleItems).map(item => item.getAttribute("data-variant-id"));
        
        const productForms = this.bundle.querySelectorAll("product-form-bundle");
        productForms.forEach(form => {
          const variantIdInput = form.querySelector('input[name="id"]');
          const submitButton = form.querySelector('button[type="submit"]');
          
          if (variantIdInput && submitButton) {
            const variantId = variantIdInput.value;
            
            if (bundledVariantIds.includes(variantId)) {
              submitButton.classList.add("disabled");
              submitButton.setAttribute("disabled", true);
              submitButton.setAttribute("aria-disabled", true);
              submitButton.textContent = window.cartStrings?.added_to_bundle || "Added to Bundle";
            } else {
              submitButton.classList.remove("disabled");
              submitButton.removeAttribute("disabled");
              submitButton.removeAttribute("aria-disabled");
              submitButton.textContent = window.cartStrings?.add_to_bundle || "Add to Bundle";
            }
          }
        });
      }
    }
  );
}
class ButtonSubmitBundle extends HTMLElement {
  constructor() {
    super();
    this.submitButton = this;
    this.sectionId = this.dataset.sectionId;
    this.addEventListener("click", this.onSubmitHandler.bind(this));
    this.setAttribute("aria-disabled", true);
    this.setAttribute("disabled", true);
    this.cart = document.querySelector("cart-drawer");
    this.wrapper = this.closest("build-your-routine");
    this.minimum = this.wrapper.dataset.minimum;
    this.localStorageKey = `bundle-items-${this.sectionId}`;
    this.addEventListener("keydown", this.handleKeyDown.bind(this));
  }

  handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.onSubmitHandler(event);
    }
  }

  onSubmitHandler(event) {
    event.preventDefault();
    if (this.submitButton.getAttribute("aria-disabled") === "true") return;
    this.submitButton.setAttribute("aria-disabled", true);
    this.submitButton.classList.add("loading");
    const bundleItems = this.wrapper.querySelectorAll(
      "[data-product-bundle-variant][data-variant-id]"
    );
    const items = [];
    bundleItems.forEach((item) => {
      const variantId = item.getAttribute("data-variant-id");
      const quantity = parseInt(item.getAttribute("data-quantity")) || 1;
      items.push({ id: variantId, quantity: quantity });
    });
    this.addItemsToCart(items);
  }

  addItemsToCart(items) {
    const config = NextSkyTheme.fetchConfig("javascript");
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    delete config.headers["Content-Type"];

    const formData = new FormData();
    items.forEach((item, index) => {
      formData.append(`items[${index}][id]`, item.id);
      formData.append(`items[${index}][quantity]`, item.quantity);
    });

    if (this.cart) {
      formData.append(
        "sections",
        this.cart.getSectionsToRender().map((section) => section.id)
      );
      formData.append("sections_url", window.location.pathname);
    }

    config.body = formData;

    fetch(`${routes?.cart_add_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          NextSkyTheme.notifier.show(response.description, "error", 4000);
          const soldOutMessage =
            this.submitButton.querySelector(".sold-out-message");
          if (!soldOutMessage) return;
          this.submitButton.setAttribute("aria-disabled", true);
          this.submitButton.querySelector("span").classList.add("hidden");
          soldOutMessage.classList.remove("hidden");
          this.error = true;
          return;
        } else if (!this.cart || this.addCartType == "page") {
          window.location = window.routes.cart_url;
          return;
        }

        if (!this.error) this.error = false;
        const is_cart_page = document.body.classList.contains("template-cart");
        if (!is_cart_page) {
          this.cart.renderContents(response);
          NextSkyTheme.eventModal(this.cart, "open", false, "delay");
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        new NextSkyTheme.FSProgressBar("free-ship-progress-bar");
        this.submitButton.classList.remove("loading");
        if (!this.error) this.submitButton.removeAttribute("aria-disabled");
        this.updateButtonStatus();
        this.clearBundle();
        this.clearBundleFromStorage();
      });
  }

  clearBundleFromStorage() {
    try {
      localStorage.removeItem(this.localStorageKey);
    } catch (error) {
      console.error('Error clearing bundle from storage:', error);
    }
  }

  clearBundle() {
    document.dispatchEvent(new CustomEvent("bundle:item-changed"));
    const bundleContainers = this.wrapper.querySelectorAll(
      "[data-product-bundle-variant]"
    );
    bundleContainers.forEach((container) => {
      container.removeAttribute("data-variant-id");
      container.removeAttribute("data-quantity");
      container.removeAttribute("data-product-handle");

      const mediaContainer = container.querySelector(
        "[data-product-bundle-variant-media]"
      );
      if (mediaContainer) {
        mediaContainer.innerHTML = "";
        mediaContainer.style.setProperty("--aspect-ratio", "3/4");
      }

      const contentContainer = container.querySelector(
        "[data-product-bundle-variant-content]"
      );
      if (contentContainer) {
        contentContainer.innerHTML = `
          <span class="skeleton-product__info skeleton-1 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 100%;"></span>
          <span class="skeleton-product__info skeleton-2 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 6rem;"></span>
          <span class="skeleton-product__info skeleton-3 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 12rem"></span>
        `;
      }

      const actionContainer = container.querySelector(".bundle-action");
      if (actionContainer) {
        actionContainer.innerHTML = "";
      }
    });

    const totalElement = document.querySelector(
      `.bundle-total-price-${this.sectionId}`
    );
    if (totalElement) {
      totalElement.textContent = NextSkyTheme.formatMoney(
        0,
        themeGlobalVariables.settings.money_format
      );
    }

    this.updateButtonStatus();
    document.dispatchEvent(new CustomEvent("bundle:item-changed"));
  }

  updateButtonStatus() {
    const bundleItems = this.wrapper.querySelectorAll(
      "[data-product-bundle-variant][data-variant-id]"
    );
    const bundleBtnAddCart = this.wrapper.querySelectorAll(
      `product-form-bundle button:not(.btn-sold-out)`
    );
    bundleBtnAddCart.forEach((button) => {
      if (button.classList.contains("disabled")) {
        button.classList.remove("disabled");
        button.removeAttribute("disabled");
        button.removeAttribute("aria-disabled");
        button.textContent = window.cartStrings?.add_to_bundle;
      }
    });
    let itemCount = 0;
    if (bundleItems.length > 0) {
      itemCount = bundleItems.length + 1;
    }

    if (itemCount >= this.minimum) {
      this.classList.remove("disabled");
      this.removeAttribute("aria-disabled");
      this.removeAttribute("disabled");
      this.setAttribute("tabindex", "0");
    } else {
      this.classList.add("disabled");
      this.setAttribute("aria-disabled", true);
      this.setAttribute("disabled", true);
      this.removeAttribute("tabindex");
    }
    
    this.updateProductFormButtons();
  }

  updateProductFormButtons() {
    const bundleItems = this.wrapper.querySelectorAll("[data-product-bundle-variant][data-variant-id]");
    const bundledVariantIds = Array.from(bundleItems).map(item => item.getAttribute("data-variant-id"));
    
    const productForms = this.wrapper.querySelectorAll("product-form-bundle");
    productForms.forEach(form => {
      const variantIdInput = form.querySelector('input[name="id"]');
      const submitButton = form.querySelector('button[type="submit"]');
      
      if (variantIdInput && submitButton) {
        const variantId = variantIdInput.value;
        
        if (bundledVariantIds.includes(variantId)) {
          submitButton.classList.add("disabled");
          submitButton.setAttribute("disabled", true);
          submitButton.setAttribute("aria-disabled", true);
          submitButton.textContent = window.cartStrings?.added_to_bundle || "Added to Bundle";
        } else {
          submitButton.classList.remove("disabled");
          submitButton.removeAttribute("disabled");
          submitButton.removeAttribute("aria-disabled");
          submitButton.textContent = window.cartStrings?.add_to_bundle || "Add to Bundle";
        }
      }
    });
  }
}
customElements.define("button-submit-bundle", ButtonSubmitBundle);
class BundleCartRemoveButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.handleRemove.bind(this));
    this.bundle = this.closest("build-your-routine");
    this.variantContainer = this.closest("[data-product-bundle-variant]");
    this.sectionId = this.bundle?.dataset.sectionId || 
                    this.closest("[data-section-id]")?.dataset.sectionId;
    this.localStorageKey = `bundle-items-${this.sectionId}`;
  }

  connectedCallback() {
    this.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.handleRemove();
      }
    });
  }

  handleRemove() {
    if (!this.variantContainer) return;

    this.variantContainer.removeAttribute("data-variant-id");
    this.variantContainer.removeAttribute("data-quantity");
    this.variantContainer.removeAttribute("data-product-handle");

    const mediaContainer = this.variantContainer.querySelector(
      "[data-product-bundle-variant-media]"
    );
    if (mediaContainer) {
      mediaContainer.innerHTML = "";
      mediaContainer.style.setProperty("--aspect-ratio", "3/4");
    }

    const contentContainer = this.variantContainer.querySelector(
      "[data-product-bundle-variant-content]"
    );
    if (contentContainer) {
      contentContainer.innerHTML = `
          <span class="skeleton-product__info skeleton-1 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 100%;"></span>
          <span class="skeleton-product__info skeleton-2 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 6rem;"></span>
          <span class="skeleton-product__info skeleton-3 h-custom bg-secondary rounded-10 max-w-custom-all" style="--max-width: 12rem"></span>
        `;
    }

    if (this.parentNode) {
      this.parentNode.innerHTML = "";
    }
    this.updateContainerOrders();
    this.updateBundleTotal();
    this.updateBundleButtonStatus();
    this.updateBundleStorage();

    document.dispatchEvent(
      new CustomEvent("bundle:item-removed", {
        detail: {
          container: this.variantContainer,
        },
      })
    );
    document.dispatchEvent(new CustomEvent("bundle:item-changed"));
  }

  updateBundleStorage() {
    try {
      const bundleItems = this.bundle.querySelectorAll("[data-product-bundle-variant][data-variant-id]");
      const items = [];
      
      bundleItems.forEach((item) => {
        const variantId = item.getAttribute("data-variant-id");
        const quantity = parseInt(item.getAttribute("data-quantity")) || 1;
        const productHandle = item.getAttribute("data-product-handle");
        
        if (variantId && productHandle) {
          items.push({
            variantId,
            quantity,
            productHandle
          });
        }
      });
      
      if (items.length > 0) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(items));
      } else {
        localStorage.removeItem(this.localStorageKey);
      }
    } catch (error) {
      console.error('Error updating bundle storage:', error);
    }
  }

  updateBundleTotal() {
    let itemTotalPrice = 0;
    const bundleItems = this.bundle.querySelectorAll(
      "[data-product-bundle-variant][data-variant-id]"
    );

    bundleItems.forEach((item) => {
      const priceElement = item.querySelector(".product__price");
      const price = parseFloat(priceElement?.dataset.price || 0);
      const quantity = parseInt(item.getAttribute("data-quantity")) || 1;
      if (price) {
        itemTotalPrice += price * quantity;
      }
    });

    const sectionId =
      this.bundle?.dataset.sectionId ||
      this.closest("[data-section-id]")?.dataset.sectionId;

    if (sectionId) {
      const totalElement = document.querySelector(
        `.bundle-total-price-${sectionId}`
      );

      if (totalElement) {
        if (itemTotalPrice > 0) {
          totalElement.textContent = NextSkyTheme.formatMoney(
            itemTotalPrice,
            themeGlobalVariables.settings.money_format
          );
        } else {
          totalElement.textContent = NextSkyTheme.formatMoney(
            0,
            themeGlobalVariables.settings.money_format
          );
        }
      }
    }
  }

  updateBundleButtonStatus() {
    const sectionId =
      this.bundle?.dataset.sectionId ||
      this.closest("[data-section-id]")?.dataset.sectionId;

    if (!sectionId) return;

    const submitButton = document.querySelector(
      `.button-submit-bundle-${sectionId}`
    );

    if (!submitButton) return;

    const minimum =
      this.bundle?.dataset.minimum || submitButton.dataset.minimum || 1;

    const bundleItems = this.bundle.querySelectorAll(
      "[data-product-bundle-variant][data-variant-id]"
    );

    if (bundleItems.length >= parseInt(minimum)) {
      submitButton.classList.remove("disabled");
      submitButton.removeAttribute("aria-disabled");
      submitButton.removeAttribute("disabled");
      submitButton.setAttribute("tabindex", "0");
    } else {
      submitButton.classList.add("disabled");
      submitButton.setAttribute("aria-disabled", true);
      submitButton.setAttribute("disabled", true);
      submitButton.removeAttribute("tabindex");
    }

    this.updateProductFormButtons();
  }

  updateProductFormButtons() {
    const bundleItems = this.bundle.querySelectorAll("[data-product-bundle-variant][data-variant-id]");
    const bundledVariantIds = Array.from(bundleItems).map(item => item.getAttribute("data-variant-id"));
    
    const productForms = this.bundle.querySelectorAll("product-form-bundle");
    productForms.forEach(form => {
      const variantIdInput = form.querySelector('input[name="id"]');
      const submitButton = form.querySelector('button[type="submit"]');
      
      if (variantIdInput && submitButton) {
        const variantId = variantIdInput.value;
        
        if (bundledVariantIds.includes(variantId)) {
          submitButton.classList.add("disabled");
          submitButton.setAttribute("disabled", true);
          submitButton.setAttribute("aria-disabled", true);
          submitButton.textContent = window.cartStrings?.added_to_bundle || "Added to Bundle";
        } else {
          submitButton.classList.remove("disabled");
          submitButton.removeAttribute("disabled");
          submitButton.removeAttribute("aria-disabled");
          submitButton.textContent = window.cartStrings?.add_to_bundle || "Add to Bundle";
        }
      }
    });
  }

  updateContainerOrders() {
    if (!this.bundle) return;

    const bundleContainers = this.bundle.querySelectorAll(
      "[data-product-bundle-variant]"
    );

    bundleContainers.forEach((container) => {
      container.style.order = "";
    });

    let filledCount = 0;
    let emptyCount = 0;

    bundleContainers.forEach((container, index) => {
      if (container.hasAttribute("data-variant-id")) {
        container.style.order = filledCount.toString();
        filledCount++;
      } else {
        container.style.order = (
          bundleContainers.length + emptyCount
        ).toString();
        emptyCount++;
      }

      container.style.transition =
        "transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1)";

      if (!container.hasAttribute("data-variant-id")) {
        container.style.transform = "translateY(5px)";
        setTimeout(() => {
          container.style.transform = "translateY(0)";
        }, 50);
      }
    });
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.handleRemove);
  }
}
customElements.define("bundle-cart-remove-button", BundleCartRemoveButton);
class QuantityInputBundle extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.minusButton = this.querySelector('button[name="minus"]');
    this.plusButton = this.querySelector('button[name="plus"]');
    this.changeEvent = new Event("change", { bubbles: true });

    this.bundle = this.closest("build-your-routine");
    this.variantContainer = this.closest("[data-product-bundle-variant]");
    this.sectionId = this.bundle?.dataset.sectionId || 
                    this.closest("[data-section-id]")?.dataset.sectionId;
    this.localStorageKey = `bundle-items-${this.sectionId}`;

    this.minValue = parseInt(this.input.getAttribute("min") || 1);
    this.maxValue = parseInt(this.input.getAttribute("max") || 9999);

    if (!this.input) return;

    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.minusButton) {
      this.minusButton.addEventListener("click", this.onMinusClick.bind(this));
    }

    if (this.plusButton) {
      this.plusButton.addEventListener("click", this.onPlusClick.bind(this));
    }

    this.input.addEventListener("change", this.onInputChange.bind(this));

    this.input.addEventListener("keydown", this.onKeyDown.bind(this));

    if (this.minusButton) {
      this.minusButton.setAttribute("aria-label", "Decrease quantity");
      this.minusButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.onMinusClick(event);
        }
      });
    }

    if (this.plusButton) {
      this.plusButton.setAttribute("aria-label", "Increase quantity");
      this.plusButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          this.onPlusClick(event);
        }
      });
    }
  }

  onMinusClick(event) {
    event.preventDefault();
    this.updateQuantity(-1);
  }

  onPlusClick(event) {
    event.preventDefault();
    this.updateQuantity(1);
  }

  onInputChange(event) {
    let value = parseInt(this.input.value);

    if (isNaN(value) || value < this.minValue) {
      value = this.minValue;
    } else if (value > this.maxValue) {
      value = this.maxValue;
    }

    this.input.value = value;
    this.updateVariantQuantity(value);

    this.announceChange(value);
  }

  onKeyDown(event) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      this.updateQuantity(1);
    } else if (event.key === "ArrowDown") {
      event.preventDefault();
      this.updateQuantity(-1);
    }
  }

  updateQuantity(change) {
    const currentValue = parseInt(this.input.value) || this.minValue;
    let newValue = currentValue + change;

    if (newValue < this.minValue) {
      newValue = this.minValue;
    } else if (newValue > this.maxValue) {
      newValue = this.maxValue;
    }

    if (currentValue === newValue) return;

    this.input.value = newValue;
    this.updateVariantQuantity(newValue);

    this.announceChange(newValue);

    this.input.dispatchEvent(this.changeEvent);
  }

  updateVariantQuantity(quantity) {
    if (!this.variantContainer) return;

    this.variantContainer.setAttribute("data-quantity", quantity);

    this.updateBundleTotal();
    this.updateBundleStorage();

    document.dispatchEvent(
      new CustomEvent("bundle:quantity-changed", {
        detail: {
          container: this.variantContainer,
          quantity: quantity,
          variantId: this.variantContainer.getAttribute("data-variant-id"),
        },
      })
    );
  }

  updateBundleStorage() {
    try {
      const bundleItems = this.bundle.querySelectorAll("[data-product-bundle-variant][data-variant-id]");
      const items = [];
      
      bundleItems.forEach((item) => {
        const variantId = item.getAttribute("data-variant-id");
        const quantity = parseInt(item.getAttribute("data-quantity")) || 1;
        const productHandle = item.getAttribute("data-product-handle");
        
        if (variantId && productHandle) {
          items.push({
            variantId,
            quantity,
            productHandle
          });
        }
      });
      
      if (items.length > 0) {
        localStorage.setItem(this.localStorageKey, JSON.stringify(items));
      } else {
        localStorage.removeItem(this.localStorageKey);
      }
    } catch (error) {
      console.error('Error updating bundle storage:', error);
    }
  }

  updateBundleTotal() {
    const bundleButton = document.querySelector("button-submit-bundle");
    if (bundleButton && typeof bundleButton.updateBundleTotal === "function") {
      bundleButton.updateBundleTotal();
      return;
    }

    let itemTotalPrice = 0;
    const bundleItems = this.bundle.querySelectorAll(
      "[data-product-bundle-variant][data-variant-id]"
    );

    bundleItems.forEach((item) => {
      const priceElement = item.querySelector(".product__price");
      const price = parseFloat(priceElement?.dataset.price || 0);
      const quantity = parseInt(item.getAttribute("data-quantity")) || 1;

      if (price) {
        itemTotalPrice += price * quantity;
      }
    });

    const sectionId =
      this.bundle?.dataset.sectionId ||
      this.closest("[data-section-id]")?.dataset.sectionId;

    if (sectionId) {
      const totalElement = document.querySelector(
        `.bundle-total-price-${sectionId}`
      );

      if (totalElement) {
        totalElement.textContent = NextSkyTheme.formatMoney(
          itemTotalPrice,
          themeGlobalVariables.settings.money_format
        );
      }
    }
  }

  announceChange(value) {
    const productTitle =
      this.variantContainer?.querySelector(".product-title")?.textContent ||
      "Product";
    const ariaLive = this.querySelector('[aria-live="polite"]');

    if (!ariaLive) {
      const announcer = document.createElement("div");
      announcer.setAttribute("aria-live", "polite");
      announcer.classList.add("visually-hidden");
      this.appendChild(announcer);

      announcer.textContent = `Quantity for ${productTitle} updated to ${value}`;
    } else {
      ariaLive.textContent = `Quantity for ${productTitle} updated to ${value}`;
    }

    setTimeout(() => {
      if (ariaLive) {
        ariaLive.textContent = "";
      }
    }, 1000);
  }

  disconnectedCallback() {
    if (this.minusButton) {
      this.minusButton.removeEventListener("click", this.onMinusClick);
      this.minusButton.removeEventListener("keydown", this.onKeyDown);
    }

    if (this.plusButton) {
      this.plusButton.removeEventListener("click", this.onPlusClick);
      this.plusButton.removeEventListener("keydown", this.onKeyDown);
    }

    if (this.input) {
      this.input.removeEventListener("change", this.onInputChange);
      this.input.removeEventListener("keydown", this.onKeyDown);
    }
  }
}
customElements.define("quantity-input-bundle", QuantityInputBundle);
class BundleProgressbar extends HTMLElement {
  constructor() {
    super();
    this.minimum = parseInt(this.dataset.minimum) || 1;
    this.updateBundleProgress();

    document.addEventListener("bundle:item-changed", () =>
      this.updateBundleProgress()
    );
  }

  updateBundleProgress() {
    const bundleItems = Array.from(
      this.closest("build-your-routine").querySelectorAll(
        "[data-product-bundle-variant][data-variant-id]"
      )
    );
    const itemCount = bundleItems.length;
    let progressPercentage;
    if (itemCount >= this.minimum) {
      progressPercentage = 100;
    } else {
      progressPercentage = (itemCount / this.minimum) * 100;
    }

    this.style.setProperty("--width", `${progressPercentage}%`);

    if (progressPercentage >= 100) {
      this.classList.add("complete");
    } else {
      this.classList.remove("complete");
    }
  }
}
customElements.define("bundle-progress-bar", BundleProgressbar);
class BundleHeader extends HTMLElement {
  constructor() {
    super();
    this._title = this.querySelector(".bundle-title");
    this._content =
      this.closest(".bundle-sticky").querySelector(".bundle-content");
    this.init();
  }

  init() {
    const mediaQuery = window.matchMedia("(max-width: 1024.98px)");
    const handleMediaQueryChange = (mediaQuery) => {
      if (mediaQuery.matches) {
        this.style.pointerEvents = "auto";
        this._content.style.height = 0;
        Motion.press(this._title, (event) => {
          this.onHeaderClicked(event);
        });
      } else {
        this.style.pointerEvents = "none";
        this._content.style.height = "auto";
      }
    };
    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
  }

  onHeaderClicked(event) {
    const transition = { duration: 0.3 };
    let isOpen = event.dataset.isOpen === "true";
    isOpen = !isOpen;
    event.dataset.isOpen = isOpen;
    event.setAttribute("aria-expanded", isOpen);
    const chevron = event.querySelector("svg");
    Motion.animate(chevron, { rotate: isOpen ? 180 : 0 }, { duration: 0.2 });
    Motion.animate(
      this._content,
      isOpen
        ? {
            height: "auto",
          }
        : {
            height: 0,
          },
      transition
    );
  }
}
customElements.define("bundle-header", BundleHeader);