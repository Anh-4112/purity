import * as NextSkyTheme from "global";
import { LazyLoader } from "module-lazyLoad";

export class ProductForm extends HTMLElement {
  constructor() {
    super();
    this.form = this.querySelector("form");
    this.cart =
      document.querySelector("cart-drawer") ||
      document.querySelector("main-cart");
    this.quickView = document.querySelector("quickview-drawer");
    this.boughtTogether = document.querySelector("bought-together-popup");
    this.shopifyShopableVideo = document.querySelector(".modal-shopable-video");
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

  get addActionAddCartDesktop() {
    return this.cart && this.cart.hasAttribute("data-action-add-cart-desktop")
      ? this.cart.getAttribute("data-action-add-cart-desktop")
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
      NextSkyTheme.global.rootToFocus = this.submitButton;
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
        } else if (window.innerWidth > 767) {
          if (
            !this.cart ||
            this.addActionAddCartDesktop == "page" ||
            document.body.classList.contains("template-cart")
          ) {
            window.location = window.routes.cart_url;
            return;
          }
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
          let submitButton = this.submitButton;
          if (this.submitButton.closest("cart-drawer")) {
            submitButton = this.cart.querySelector(".drawer__footer-bottom");
          }
          this.cart.renderContents(response);
          const actionMobile =
            themeGlobalVariables.settings.actionAddCartMobile;
          let getCookieCartMessage = true;
          if (actionMobile == "cart_message") {
            getCookieCartMessage = NextSkyTheme.getCookie("cart_message");
            if (!getCookieCartMessage) {
              NextSkyTheme.setCookie("cart_message", "true", 1);
            }
          }
          if (
            window.innerWidth > 767 ||
            actionMobile == "mini_cart" ||
            !getCookieCartMessage
          ) {
            NextSkyTheme.eventModal(this.cart, "open", false, "delay");
            if (document.querySelector("quickview-drawer.active")) {
              NextSkyTheme.eventModal(this.quickView, "close", false);
            }
            if (document.querySelector(".modal-shopable-video.active")) {
              NextSkyTheme.eventModal(
                this.shopifyShopableVideo,
                "close",
                false
              );
            }
            if (document.querySelector("bought-together-popup.active")) {
              NextSkyTheme.eventModal(this.boughtTogether, "close", false);
              const itemChecked = this.boughtTogether.querySelectorAll(
                ".bought-together-checkbox[type='checkbox']"
              );
              itemChecked.forEach((item) => {
                item.checked = true;
              });
              this.recalculateBoughtTogetherTotal();
            }
          } else {
            NextSkyTheme.notifier.showElement(
              window.cartStrings.addSuccessMobile,
              submitButton,
              "success",
              2500
            );
          }
        } else {
          window.location = window.routes.cart_url;
          return;
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        new NextSkyTheme.FSProgressBar("free-ship-progress-bar");
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
        if (parsedState.errors) {
          const lineItemError =
            document.getElementById(`CartItem-${line}`) ||
            document.getElementById(`CartDrawer-Item-${line}`);
          const quantity__input =
            lineItemError.querySelector(".quantity__input");
          if (quantity__input) {
            quantity__input.value =
              quantity__input.getAttribute("data-cart-quantity");
          }
          NextSkyTheme.notifier.show(parsedState.errors, "error", 3000);
          return;
        }
        if (this.cart.classList.contains("cart-drawer")) {
          this.updateCartDrawer(parsedState);
        } else if (this.cart.classList.contains("main-cart")) {
          this.updateMainCart(parsedState);
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
        new NextSkyTheme.FSProgressBar("free-ship-progress-bar");
        this.addLoading(line, false);
        const lineItem =
          document.getElementById(`CartItem-${line}`) ||
          document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          lineItem.querySelector(`[name="${name}"]`).focus();
        }
      });
  }

  updateCartDrawer(parsedState) {
    const cartDrawerEmpty = this.getSectionDOM(
      parsedState.sections[this.cart.sectionId],
      ".drawer__inner-empty"
    );
    if (cartDrawerEmpty) {
      const drawerBody = this.getSectionDOM(
        parsedState.sections[this.cart.sectionId],
        ".drawer__body"
      );
      this.cart.querySelector(".drawer__body").innerHTML = drawerBody.innerHTML;

      const sectionElement = document.getElementById("cart-icon-bubble");
      if (sectionElement) {
        sectionElement.innerHTML = this.cart.getSectionInnerHTML(
          parsedState.sections["cart-icon-bubble"]
        );
        this.cart.updateCartIcon(sectionElement);
      }
      new LazyLoader(".image-lazy-load");
      NextSkyTheme.trapFocus(this.cart);
    } else {
      this.getSectionsToRender().forEach((section, index) => {
        const sectionElement = section.selector
          ? document.querySelector(section.selector)
          : document.getElementById(section.id);
        if (!sectionElement) {
          return;
        }
        if (index === 1) {
          const nav_bar_id = document.querySelector("#cart-icon-bubble");
          if (
            nav_bar_id &&
            nav_bar_id.querySelector(".cart-count") &&
            sectionElement.querySelector(".cart-count")
          ) {
            nav_bar_id.querySelector(".cart-count").innerHTML =
              this.getSectionDOM(
                parsedState.sections[section.id],
                ".cart-count"
              ).innerHTML;
          }
          const nav_bar_mobile_id = document.querySelector(
            "#cart-icon-bubble-mobile"
          );
          if (
            nav_bar_mobile_id &&
            nav_bar_mobile_id.querySelector(".cart-count") &&
            sectionElement.querySelector(".cart-count")
          ) {
            nav_bar_mobile_id.querySelector(".cart-count").innerHTML =
              this.getSectionDOM(
                parsedState.sections[section.id],
                ".cart-count"
              ).innerHTML;
          }
        } else if (index === 2) {
          const progress = this.getSectionDOM(
            parsedState.sections[section.id],
            ".progress"
          );
          if (sectionElement.querySelector(".progress")) {
            sectionElement
              .querySelector(".progress")
              .setAttribute(
                "data-total-order",
                progress.getAttribute("data-total-order")
              );
          }
          const recommendations = this.cart.getSectionInnerHTML(
            parsedState.sections[section.id],
            ".drawer__cart-recommendations"
          );
          if (document.querySelector(".drawer__cart-recommendations")) {
            document.querySelector(".drawer__cart-recommendations").innerHTML =
              recommendations;
          }
        } else {
          sectionElement.innerHTML = this.cart.getSectionInnerHTML(
            parsedState.sections[section.id],
            section.selector
          );
        }
      });
    }
  }

  updateMainCart(parsedState) {
    const cartDrawerEmpty = this.getSectionDOM(
      parsedState.sections[this.cart.sectionId],
      ".is-empty"
    );
    if (cartDrawerEmpty) {
      const drawerBody = this.getSectionDOM(
        parsedState.sections[this.cart.sectionId],
        ".main-cart__wrapper"
      );
      this.cart.closest(".main-cart__wrapper").innerHTML = drawerBody.innerHTML;
      new LazyLoader(".image-lazy-load");
    } else {
      this.getSectionsToRender().forEach((section, index) => {
        const sectionElement = section.selector
          ? document.querySelector(section.selector)
          : document.getElementById(section.id);
        if (!sectionElement) {
          return;
        }
        if (index === 1) {
          const nav_bar_id = document.getElementById("cart-icon-bubble");
          if (nav_bar_id && nav_bar_id.querySelector(".cart-count")) {
            nav_bar_id.querySelector(".cart-count").innerHTML =
              this.getSectionDOM(
                parsedState.sections[section.id],
                ".cart-count"
              ).innerHTML;
          }
          const nav_bar_mobile_id = document.getElementById(
            "cart-icon-bubble-mobile"
          );
          if (
            nav_bar_mobile_id &&
            nav_bar_mobile_id.querySelector(".cart-count")
          ) {
            nav_bar_mobile_id.querySelector(".cart-count").innerHTML =
              this.getSectionDOM(
                parsedState.sections[section.id],
                ".cart-count"
              ).innerHTML;
          }
        } else if (index === 2) {
          const progress = this.getSectionDOM(
            parsedState.sections[section.id],
            ".progress"
          );
          if (sectionElement.querySelector(".progress")) {
            sectionElement
              .querySelector(".progress")
              .setAttribute(
                "data-total-order",
                progress.getAttribute("data-total-order")
              );
          }
        } else {
          sectionElement.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.id],
            section.selector
          );
        }
      });
    }
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  getSectionDOM(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }

  addLoading(line, action = false) {
    const cartDrawerItemElements =
      this.cart.querySelector(`#CartDrawer-Item-${line}`) ||
      this.cart.querySelector(`#CartItem-${line}`);
    if (cartDrawerItemElements) {
      if (action) {
        cartDrawerItemElements.classList.add("loading");
      } else {
        cartDrawerItemElements.classList.remove("loading");
      }
    }
  }

  recalculateBoughtTogetherTotal() {
    if (!this.boughtTogether) return;
    const currentSection = this.boughtTogether;
    let total_price = Number(currentSection.getAttribute("data-price"));
    currentSection
      .querySelectorAll(".bought-together-checkbox[type='checkbox']")
      .forEach((item) => {
        const product = item.closest(".product__item-js");
        const variant_select = product.querySelector(
          "variant-swatch-select select"
        );
        const productId = item.value;
        let value_option = "";
        if (variant_select) {
          value_option = variant_select.value;
        }
        let price = item.getAttribute("data-price");
        if (variant_select) {
          price =
            variant_select.options[variant_select.selectedIndex].getAttribute(
              "data-price"
            );
        }
        const variant = currentSection.querySelector(
          `[product-id="${productId}"]`
        );
        if (item.checked) {
          total_price = total_price + Number(price);
          if (value_option) {
            variant.querySelector(`input[name="items[][id]"]`).value =
              value_option;
          }
          variant.querySelectorAll("input").forEach((input) => {
            input.disabled = false;
          });
        }
      });
    currentSection.querySelector(
      ".bought-together-products-form .total-price .price"
    ).innerHTML = NextSkyTheme.formatMoney(
      total_price,
      cartStrings.money_format
    );

    const totalElementMobile = document.querySelector(
      "button-bought-together-mobile .total-price .price"
    );
    if (totalElementMobile) {
      totalElementMobile.innerHTML = NextSkyTheme.formatMoney(
        total_price,
        cartStrings.money_format
      );
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

class MainCartRemoveButton extends ProductForm {
  constructor() {
    super();
    this.addEventListener("click", (event) => {
      event.preventDefault();
      this.updateQuantity(this.dataset.index, 0);
    });
  }

  get sectionId() {
    return this.closest(".main-cart").getAttribute("data-section-id");
  }

  getSectionsToRender() {
    return [
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".main-cart-items",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".free-shipping-bar",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".cart-info .totals",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".cart-recommendations",
      },
    ];
  }
}
if (!customElements.get("main-cart-remove-button")) {
  customElements.define("main-cart-remove-button", MainCartRemoveButton);
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

class MainCartItems extends ProductForm {
  constructor() {
    super();
    const debouncedOnChange = NextSkyTheme.debounce((event) => {
      this.onChange(event);
    }, 300);
    this.addEventListener("change", debouncedOnChange.bind(this));
  }

  get sectionId() {
    return this.closest(".main-cart").getAttribute("data-section-id");
  }

  getSectionsToRender() {
    return [
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".main-cart-items",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".free-shipping-bar",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".cart-info .totals",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".cart-recommendations",
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
if (!customElements.get("main-cart-items")) {
  customElements.define("main-cart-items", MainCartItems);
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
    return document.querySelector("cart-drawer")
      ? document.querySelector("cart-drawer")
      : document.querySelector("main-cart");
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
            if (index === 1) {
              const nav_bar_id = document.querySelector("#cart-icon-bubble");
              if (nav_bar_id && nav_bar_id.querySelector(".cart-count")) {
                nav_bar_id.querySelector(".cart-count").innerHTML =
                  this.getSectionDOM(
                    parsedState.sections[section.id],
                    ".cart-count"
                  ).innerHTML;
              }

              const nav_bar_mobile_id = document.querySelector(
                "#cart-icon-bubble-mobile"
              );
              if (
                nav_bar_mobile_id &&
                nav_bar_mobile_id.querySelector(".cart-count")
              ) {
                nav_bar_mobile_id.querySelector(".cart-count").innerHTML =
                  this.getSectionDOM(
                    parsedState.sections[section.id],
                    ".cart-count"
                  ).innerHTML;
              }
            } else if (
              index === 2 &&
              sectionElement.querySelector(".progress")
            ) {
              const progress = this.getSectionDOM(
                parsedState.sections[section.id],
                ".progress"
              );
              sectionElement
                .querySelector(".progress")
                .setAttribute(
                  "data-total-order",
                  progress.getAttribute("data-total-order")
                );
            } else {
              sectionElement.innerHTML = this.getSectionInnerHTML(
                parsedState.sections[section.id],
                section.selector
              );
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
          new NextSkyTheme.FSProgressBar("free-ship-progress-bar");
          this.cartActionId.classList.remove("loading");
          this.handleGiftWrapToggle();
        });
    }
  }

  handleGiftWrapToggle() {
    if (this.cartContentAddons) {
      if (this.classList.contains("open")) {
        this.classList.remove("open");
        Motion.animate(
          this.cartContentAddons,
          { height: 0 },
          { duration: 0.3 }
        );
      } else {
        this.classList.add("open");
        Motion.animate(
          this.cartContentAddons,
          { height: "auto" },
          { duration: 0.3 }
        );
      }
    }
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
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

class CartDiscountElement extends HTMLElement {
  constructor() {
    super();
    this.cart =
      document.querySelector("cart-drawer") ||
      document.querySelector("main-cart");
  }

  get cartActionId() {
    return this.querySelector(".apply-discount") || null;
  }

  get cartActionAddons() {
    return this.querySelector(".toggle-addons") || null;
  }

  get cartContentAddons() {
    return this.querySelector(".cart-addons-content");
  }

  connectedCallback() {
    if (this.cartActionAddons) {
      this.cartActionAddons.addEventListener(
        "click",
        this.handleDiscountToggle.bind(this)
      );
    }

    if (this.cartActionId) {
      this.cartActionId.addEventListener(
        "click",
        this.applyDiscount.bind(this)
      );
    }

    this.initializeDiscountCodesStyling();
  }

  initializeDiscountCodesStyling() {
    this.updateDiscountCodesStyling();
  }

  applyDiscount(event) {
    event.preventDefault();
    this.cartActionId.classList.add("loading");
    const discountCode = this.querySelector(".cart-discount");
    const discountCodeValue = discountCode.value;
    const notificationContainer =
      this.closest(".notification-wrapper") ||
      document.querySelector(".notification-wrapper");

    if (!discountCodeValue) {
      NextSkyTheme.notifierInline.show(
        message.discount.error,
        "error",
        notificationContainer
      );
      this.cartActionId.classList.remove("loading");
      return;
    }
    const existingDiscounts = this.existingDiscounts();
    const body = JSON.stringify({
      discount: [...existingDiscounts, discountCodeValue].join(","),
      sections: this.cart.dataset.sectionId,
    });
    fetch(`${routes?.cart_update_url}`, {
      ...NextSkyTheme.fetchConfig(),
      ...{ body },
    })
      .then((response) => response.json())
      .then((response) => {
        if (
          response.discount_codes.find((discount) => {
            return (
              discount.code === discountCodeValue &&
              discount.applicable === false
            );
          })
        ) {
          discountCode.value = "";
          NextSkyTheme.notifierInline.show(
            message.discount.discount_code_error,
            "error",
            notificationContainer
          );
          return;
        }
        const newHtml = response.sections[this.cart.dataset.sectionId];
        this.renderContent(newHtml);
        NextSkyTheme.notifierInline.show(
          message.discount.success,
          "success",
          notificationContainer
        );
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.cartActionId.classList.remove("loading");
      });
  }

  renderContent(newHtml) {
    const parsedHtml = new DOMParser().parseFromString(newHtml, "text/html");
    const updateContent = (blockClass) => {
      const source = parsedHtml.querySelector(`.${blockClass}`);
      const destination = this.cart.querySelector(`.${blockClass}`);
      if (source && destination) {
        destination.innerHTML = source.innerHTML;

        if (blockClass === "cart-discount__codes") {
          this.updateDiscountCodesStyling();
        }
      }
    };

    const blocksToUpdate = [
      "cart-discount__codes",
      "drawer__footer-bottom-total",
      "main-cart-totals",
      "cart-content-items",
    ];
    blocksToUpdate.forEach(updateContent);
  }

  updateDiscountCodesStyling() {
    const discountCodesElement = this.cart.querySelector(
      ".cart-discount__codes"
    );
    const discountCodesElementDrawer = this.cart.querySelector(
      ".cart-drawer .cart-discount__codes"
    );
    const cartAddonsContentInner = this.cart.querySelector(
      ".cart-drawer .cart-addons-content-inner"
    );

    if (discountCodesElement) {
      const discountPills = discountCodesElement.querySelectorAll(
        ".cart-discount__pill"
      );
      if (discountPills.length > 0) {
        discountCodesElement.classList.add(
          "mt-10",
          "flex",
          "gap-8",
          "row-gap-8",
          "wrap"
        );
        if (discountCodesElementDrawer) {
          discountCodesElementDrawer.classList.add("mb-20");
        }
        if (cartAddonsContentInner) {
          cartAddonsContentInner.classList.remove("mb-20");
        }
      } else {
        discountCodesElement.classList.remove(
          "mt-10",
          "flex",
          "gap-8",
          "row-gap-8",
          "wrap"
        );
        if (discountCodesElementDrawer) {
          discountCodesElementDrawer.classList.remove("mb-20");
        }
        if (cartAddonsContentInner) {
          cartAddonsContentInner.classList.add("mb-20");
        }
      }
    }
  }

  existingDiscounts() {
    const discountCodes = [];
    const discountPills = this.querySelectorAll(".cart-discount__pill");
    for (const pill of discountPills) {
      if (
        pill instanceof HTMLLIElement &&
        typeof pill.dataset.discountCode === "string"
      ) {
        discountCodes.push(pill.dataset.discountCode);
      }
    }
    return discountCodes;
  }

  handleDiscountToggle() {
    if (this.cartContentAddons) {
      if (this.classList.contains("open")) {
        this.classList.remove("open");
        Motion.animate(
          this.cartContentAddons,
          { height: 0 },
          { duration: 0.3 }
        );
      } else {
        this.classList.add("open");
        Motion.animate(
          this.cartContentAddons,
          { height: "auto" },
          { duration: 0.3 }
        );
      }
    }
  }
}
if (!customElements.get("cart-discount-element")) {
  customElements.define("cart-discount-element", CartDiscountElement);
}

class RemoveDiscount extends CartDiscountElement {
  constructor() {
    super();
    this.addEventListener("click", (event) => {
      event.preventDefault();
      this.removeDiscount();
    });
  }

  removeDiscount() {
    this.classList.add("loading");
    const pill = this.closest(".cart-discount__pill");
    const discountCode = pill.dataset.discountCode;
    const existingDiscounts = this.closest(
      "cart-discount-element"
    ).existingDiscounts();
    const index = existingDiscounts.indexOf(discountCode);
    if (index === -1) return;

    existingDiscounts.splice(index, 1);
    const body = JSON.stringify({
      discount: [...existingDiscounts].join(","),
      sections: this.cart.dataset.sectionId,
    });
    fetch(`${routes?.cart_update_url}`, {
      ...NextSkyTheme.fetchConfig(),
      ...{ body },
    })
      .then((response) => response.json())
      .then((response) => {
        const newHtml = response.sections[this.cart.dataset.sectionId];
        this.renderContent(newHtml);
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        this.classList.remove("loading");
      });
  }
}
if (!customElements.get("remove-discount")) {
  customElements.define("remove-discount", RemoveDiscount);
}

class CartDrawer extends HTMLElement {
  constructor() {
    super();
  }

  get cartActionId() {
    return document.getElementById("cart-icon-bubble") || null;
  }

  get sectionId() {
    return this.hasAttribute("data-section-id")
      ? this.getAttribute("data-section-id")
      : this.getAttribute("data-section-id");
  }

  get formAction() {
    return Array.from(this.querySelectorAll("form .btn"));
  }

  get cartViewId() {
    return document.getElementById("cart-icon-bubble") || null;
  }

  get openCartMobile() {
    return this.hasAttribute("data-open-cart-mobile")
      ? this.getAttribute("data-open-cart-mobile")
      : "popup";
  }

  connectedCallback() {
    const triggers = [
      document.getElementById("cart-icon-bubble"),
      document.getElementById("cart-icon-bubble-mobile"),
    ];

    triggers.forEach((trigger) => {
      if (trigger) {
        trigger.addEventListener("click", (event) =>
          this.onShowCartDrawer(event, trigger)
        );
      }
    });

    this.formAction.forEach((action) => {
      action.addEventListener("click", (event) => {
        action.classList.add("loading");
      });
    });
    if (this.openCartMobile == "popup") {
      this.innerWidth();
    }
  }

  innerWidth() {
    let width = window.innerWidth;
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      if (newWidth <= 767 && width > 767) {
        this.actionOnMobile();
      }
      if (newWidth > 767 && width <= 767) {
        this.actionOutMobile();
      }
      width = newWidth;
    });
    if (width <= 767) {
      this.actionOnMobile();
    } else {
      this.actionOutMobile();
    }
  }

  actionOnMobile() {
    const modal_inner = this.querySelector(".modal-inner");
    modal_inner.classList.add("modal-draggable");
    modal_inner.classList.remove("draw-mb", "drawer-right-mb");
  }
  actionOutMobile() {
    const modal_inner = this.querySelector(".modal-inner");
    modal_inner.classList.remove("modal-draggable");
    modal_inner.classList.add("draw-mb", "drawer-right-mb");
  }

  getSectionsToRender() {
    return [
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".drawer__header-cart",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".free-shipping-bar",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".cart-drawer__form",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".drawer__footer-bottom-total",
      },
    ];
  }

  renderContents(parsedState) {
    if (this.querySelector(".drawer__inner-empty")) {
      const drawerBody = this.getSectionDOM(
        parsedState.sections[this.sectionId],
        ".drawer__body"
      );
      this.querySelector(".drawer__body").innerHTML = drawerBody.innerHTML;

      const sectionElement = document.getElementById("cart-icon-bubble");
      if (sectionElement) {
        sectionElement.innerHTML = this.getSectionInnerHTML(
          parsedState.sections["cart-icon-bubble"]
        );
        this.updateCartIcon(sectionElement);
      }
      return;
    } else {
      this.getSectionsToRender().forEach((section, index) => {
        const sectionElement = section.selector
          ? document.querySelector(section.selector)
          : document.getElementById(section.id);
        if (!sectionElement) {
          return;
        }
        sectionElement.innerHTML = this.getSectionInnerHTML(
          parsedState.sections[section.id],
          section.selector
        );
        if (index === 1) {
          this.updateCartIcon(sectionElement);
        }
        if (index === 2) {
          const progress = this.getSectionDOM(
            parsedState.sections[section.id],
            ".progress"
          );
          if (sectionElement.querySelector(".progress")) {
            sectionElement
              .querySelector(".progress")
              .setAttribute(
                "data-total-order",
                progress.getAttribute("data-total-order")
              );
          }
        }
        if (index === 3) {
          const recommendations = this.getSectionInnerHTML(
            parsedState.sections[section.id],
            ".drawer__cart-recommendations"
          );
          if (document.querySelector(".drawer__cart-recommendations")) {
            document.querySelector(".drawer__cart-recommendations").innerHTML =
              recommendations;
          }
        }
      });
    }
  }

  updateCartIcon(sectionElement) {
    const nav_bar_id = document.querySelector("#cart-icon-bubble");
    if (
      nav_bar_id &&
      nav_bar_id.querySelector(".cart-count") &&
      sectionElement.querySelector(".cart-count")
    ) {
      nav_bar_id.querySelector(".cart-count").innerHTML =
        sectionElement.querySelector(".cart-count").innerHTML;
    }

    const nav_bar_mobile_id = document.querySelector(
      "#cart-icon-bubble-mobile"
    );
    if (
      nav_bar_mobile_id &&
      nav_bar_mobile_id.querySelector(".cart-count") &&
      sectionElement.querySelector(".cart-count")
    ) {
      nav_bar_mobile_id.querySelector(".cart-count").innerHTML =
        sectionElement.querySelector(".cart-count").innerHTML;
    }
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  getSectionDOM(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }

  onShowCartDrawer(event, triggerEl) {
    event.preventDefault();
    NextSkyTheme.eventModal(this, "open", false, "delay");
    NextSkyTheme.global.rootToFocus = triggerEl || this.cartActionId;
  }
}
customElements.define("cart-drawer", CartDrawer);

class MainCart extends HTMLElement {
  constructor() {
    super();
  }

  get sectionId() {
    return this.getAttribute("data-section-id");
  }

  getSectionsToRender() {
    return [
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".main-cart-items",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".free-shipping-bar",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".cart-info .totals",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".cart-recommendations",
      },
    ];
  }
}
customElements.define("main-cart", MainCart);
