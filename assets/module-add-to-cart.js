import * as NextSkyTheme from "global";

export class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector("form");
    this.cart = document.querySelector("cart-drawer");
    this.quickView = document.querySelector("quickview-drawer");
    this.shopifyShopableVideo = document.querySelector('.modal-shopable-video');
    if (this.form) {
      if (this.form.querySelector("[name=id]")) {
        this.form.querySelector("[name=id]").disabled = false;
      }
      this.form.addEventListener("submit", this.onSubmitHandler.bind(this));

      this.submitButton = this.querySelector('[type="submit"]');
      if (this.cart && this.submitButton)
        this.submitButton.setAttribute("aria-haspopup", "dialog");
      this.hideErrors = this.dataset.hideErrors === "true";
    }
  }

  get addCartType() {
    return this.cart && this.cart.hasAttribute("data-cart-type")
      ? this.cart.getAttribute("data-cart-type")
      : "page";
  }

  onSubmitHandler(event) {
    event.preventDefault();
    if (this.submitButton.getAttribute("aria-disabled") === "true") return;
    this.handleErrorMessage();
    this.submitButton.setAttribute("aria-disabled", true);
    this.submitButton.classList.add("loading");
    const config = NextSkyTheme.fetchConfig("javascript");
    config.headers["X-Requested-With"] = "XMLHttpRequest";
    delete config.headers["Content-Type"];
    const formData = new FormData(this.form);
    if (this.cart) {
      formData.append(
        "sections",
        this.cart.getSectionsToRender().map((section) => section.id)
      );
      formData.append("sections_url", window.location.pathname);
    }
    config.body = formData;
    fetch(`${routes.cart_add_url}`, config)
      .then((response) => response.json())
      .then((response) => {
        if (response.status) {
          NextSkyTheme.publish(NextSkyTheme.PUB_SUB_EVENTS.cartError, {
            source: "product-form",
            productVariantId: formData.get("id"),
            errors: response.errors || response.description,
            message: response.message,
          });
          if (this.querySelector(".product-form__error-message-wrapper")) {
            this.handleErrorMessage(response.description);
          } else {
            NextSkyTheme.notifier.show(response.description, "error", 4000);
          }

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

        if (!this.error)
          NextSkyTheme.publish(NextSkyTheme.PUB_SUB_EVENTS.cartUpdate, {
            source: "product-form",
            productVariantId: formData.get("id"),
            cartData: response,
          });
        this.error = false;
        const is_cart_page = document.body.classList.contains("template-cart");
        if (!is_cart_page) {
          this.cart.renderContents(response);
          NextSkyTheme.eventModal(this.cart, "open", false, "delay");
          if (document.querySelector("quickview-drawer.active")) {
            NextSkyTheme.eventModal(this.quickView, "close", false);
          }
          if (document.querySelector(".modal-shopable-video.active")) {
            NextSkyTheme.eventModal(this.shopifyShopableVideo, "close", false);
          }
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.submitButton.classList.remove("loading");
        if (!this.error) this.submitButton.removeAttribute("aria-disabled");
      });
  }

  handleErrorMessage(errorMessage = false) {
    if (this.hideErrors) return;
    this.errorMessageWrapper =
      this.errorMessageWrapper ||
      this.querySelector(".product-form__error-message-wrapper");
    if (!this.errorMessageWrapper) return;
    this.errorMessage =
      this.errorMessage ||
      this.errorMessageWrapper.querySelector(".product-form__error-message");
    this.errorMessageWrapper.toggleAttribute("hidden", !errorMessage);
    if (errorMessage) {
      this.errorMessage.textContent = errorMessage;
    }
  }

  getSectionsToRender() {
    return [
      {
        id: this.cart.sectionId,
        section: this.cart.sectionId,
        selector: ".drawer__header-cart",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
      },
      {
        id: this.cart.sectionId,
        section: this.cart.sectionId,
        selector: ".free-shipping-bar",
      },
      {
        id: this.cart.sectionId,
        section: this.cart.sectionId,
        selector: ".cart-drawer__form",
      },
      {
        id: this.cart.sectionId,
        section: this.cart.sectionId,
        selector: ".drawer__footer-bottom-total",
      },
    ];
  }

  updateQuantity(line, quantity, name) {
    this.addLoading(line, true);
    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });
    fetch(`${routes.cart_change_url}`, {
      ...NextSkyTheme.fetchConfig(),
      ...{ body },
    })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const cartDrawerEmpty = this.cart.getSectionDOM(
          parsedState.sections[this.cart.sectionId],
          ".drawer__inner-empty"
        );

        if (cartDrawerEmpty) {
          const drawerBody = this.getSectionDOM(
            parsedState.sections[this.cart.sectionId],
            ".drawer__body"
          );
          this.cart.querySelector(".drawer__body").innerHTML =
            drawerBody.innerHTML;
          NextSkyTheme.trapFocus(this.cart);
        } else {
          this.getSectionsToRender().forEach((section, index) => {
            const sectionElement = section.selector
              ? document.querySelector(section.selector)
              : document.getElementById(section.id);
            if (!sectionElement) {
              return;
            }
            if (index === 2) {
              const progress_message = this.getSectionDOM(
                parsedState.sections[section.id],
                ".progress-bar-message"
              );
              const progress = this.getSectionDOM(
                parsedState.sections[section.id],
                ".progress"
              );
              if (sectionElement.querySelector(".progress-bar-message")) {
                sectionElement.querySelector(
                  ".progress-bar-message"
                ).innerHTML = progress_message.innerHTML;
              }
              if (sectionElement.querySelector(".progress")) {
                sectionElement.querySelector(".progress").style.width =
                  progress.style.width;
              }
            } else {
              sectionElement.innerHTML = this.cart.getSectionInnerHTML(
                parsedState.sections[section.id],
                section.selector
              );
            }
            if (index === 1) {
              const nav_bar_id = document.querySelector("#cart-icon-bubble");
              if (
                nav_bar_id &&
                nav_bar_id.querySelector(".cart-count") &&
                sectionElement.querySelector(".cart-count")
              ) {
                nav_bar_id.querySelector(".cart-count").innerHTML =
                  sectionElement.querySelector(".cart-count").innerHTML;
              }
            }
          });
        }
      })
      .catch(() => {
        const errors =
          document.getElementById("cart-errors") ||
          document.getElementById("CartDrawer-CartErrors");
        if (!errors) return;
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.addLoading(line, false);
        const lineItem =
          document.getElementById(`CartItem-${line}`) ||
          document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          lineItem.querySelector(`[name="${name}"]`).focus();
        }
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) ||
      document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (message.length > 0) {
      lineItemError.querySelector(".cart-item__error-text").innerHTML = message;
      lineItemError.removeAttribute("hidden");
    }
    if (this.lineItemStatusElement) {
      this.lineItemStatusElement.setAttribute("aria-hidden", true);
    }

    const cartStatus =
      document.getElementById("cart-live-region-text") ||
      document.getElementById("CartDrawer-LiveRegionText");
    cartStatus.setAttribute("aria-hidden", false);

    setTimeout(() => {
      cartStatus.setAttribute("aria-hidden", true);
    }, 1000);
  }

  getSectionDOM(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }

  addLoading(line, action = false) {
    const cartDrawerItemElements = this.cart.querySelector(
      `#CartDrawer-Item-${line}`
    );
    if (cartDrawerItemElements) {
      if (action) {
        cartDrawerItemElements.classList.add("loading");
      } else {
        cartDrawerItemElements.classList.remove("loading");
      }
    }
  }
}
if (!customElements.get("product-form")) {
  customElements.define("product-form", ProductForm);
}

class CartRemoveButton extends ProductForm {
  constructor() {
    super();
    this.addEventListener("click", (event) => {
      event.preventDefault();
      this.updateQuantity(this.dataset.index, 0);
    });
  }
}
if (!customElements.get("cart-remove-button")) {
  customElements.define("cart-remove-button", CartRemoveButton);
}

class CartItems extends ProductForm {
  constructor() {
    super();
    const debouncedOnChange = NextSkyTheme.debounce((event) => {
      this.onChange(event);
    }, 300);
    this.addEventListener("change", debouncedOnChange.bind(this));
  }

  getSectionsToRender() {
    return [
      {
        id: this.cart.sectionId,
        section: this.cart.sectionId,
        selector: ".drawer__header-cart",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
      },
      {
        id: this.cart.sectionId,
        section: this.cart.sectionId,
        selector: ".free-shipping-bar",
      },
      {
        id: this.cart.sectionId,
        section: this.cart.sectionId,
        selector: ".drawer__footer-bottom-total",
      },
    ];
  }

  onChange(event) {
    this.updateQuantity(
      event.target.dataset.index,
      event.target.value,
      document.activeElement.getAttribute("name")
    );
  }
}
if (!customElements.get("cart-items")) {
  customElements.define("cart-items", CartItems);
}

class CartGiftWrap extends HTMLElement {
  constructor() {
    super();
  }

  get cartActionId() {
    return this.querySelector(".select-package") || null;
  }

  get cartActionAddons() {
    return this.querySelector(".toggle-addons") || null;
  }

  get cartContentAddons() {
    return this.querySelector(".cart-addons-content");
  }

  get cart() {
    return document.querySelector("cart-drawer");
  }

  connectedCallback() {
    if (this.cartActionId) {
      this.cartActionId.addEventListener(
        "click",
        this.addGiftWrapClick.bind(this)
      );
    }

    if (this.cartActionAddons) {
      this.cartActionAddons.addEventListener(
        "click",
        this.handleGiftWrapToggle.bind(this)
      );
    }
  }

  addGiftWrapClick(event) {
    event.preventDefault();
    const product_checked = this.querySelector('input[type="radio"]:checked');
    if (product_checked) {
      const variant_id = this.querySelector(
        'input[type="radio"]:checked'
      ).value;
      const body = JSON.stringify({
        id: Number(variant_id),
        quantity: 1,
        sections: this.cart
          .getSectionsToRender()
          .map((section) => section.section),
        sections_url: window.location.pathname,
      });
      this.cartActionId.classList.add("loading");
      fetch(`${routes.cart_add_url}`, {
        ...NextSkyTheme.fetchConfig(),
        ...{ body },
      })
        .then((response) => {
          return response.text();
        })
        .then((state) => {
          const parsedState = JSON.parse(state);

          this.cart.getSectionsToRender().forEach((section, index) => {
            const sectionElement = section.selector
              ? document.querySelector(section.selector)
              : document.getElementById(section.id);
            if (!sectionElement) {
              return;
            }
            if (index === 2) {
              const progress_message = this.getSectionDOM(
                parsedState.sections[section.id],
                ".progress-bar-message"
              );
              const progress = this.getSectionDOM(
                parsedState.sections[section.id],
                ".progress"
              );
              if (sectionElement.querySelector(".progress-bar-message")) {
                sectionElement.querySelector(
                  ".progress-bar-message"
                ).innerHTML = progress_message.innerHTML;
              }
              if (sectionElement.querySelector(".progress")) {
                sectionElement.querySelector(".progress").style.width =
                  progress.style.width;
              }
            } else {
              sectionElement.innerHTML = this.cart.getSectionInnerHTML(
                parsedState.sections[section.id],
                section.selector
              );
            }

            if (index === 1) {
              const nav_bar_id = document.querySelector("#cart-icon-bubble");
              if (
                nav_bar_id &&
                nav_bar_id.querySelector(".cart-count") &&
                sectionElement.querySelector(".cart-count")
              ) {
                nav_bar_id.querySelector(".cart-count").innerHTML =
                  sectionElement.querySelector(".cart-count").innerHTML;
              }
            }
          });
        })
        .catch(() => {
          const errors =
            document.getElementById("cart-errors") ||
            document.getElementById("CartDrawer-CartErrors");
          if (!errors) return;
          errors.textContent = window.cartStrings.error;
        })
        .finally(() => {
          this.cartActionId.classList.remove("loading");
          this.handleGiftWrapToggle();
        });
    }
  }

  handleGiftWrapToggle() {
    if (this.classList.contains("open")) {
      this.classList.remove("open");
      Motion.animate(this.cartContentAddons, { height: 0 }, { duration: 0.3 });
    } else {
      this.classList.add("open");
      Motion.animate(
        this.cartContentAddons,
        { height: "auto" },
        { duration: 0.3 }
      );
    }
  }

  getSectionDOM(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }
}

if (!customElements.get("cart-gift-wrap-element")) {
  customElements.define("cart-gift-wrap-element", CartGiftWrap);
}
