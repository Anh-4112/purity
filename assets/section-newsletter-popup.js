import { LazyLoader } from "module-lazyLoad";
import * as NextSkyTheme from "global";
class NewsletterPopup extends HTMLElement {
  constructor() {
    super();
    this.enable = this.dataset.enable;
    this.initialized = false;
    this.sectionId = this.dataset.sectionId;
    this.scrollTriggered = false;
    this.spaceScroll = 60;
  }

  connectedCallback() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.init());
    } else {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => this.init());
      } else {
        setTimeout(() => this.init(), 100);
      }
    }
  }

  init() {
    if (window.Shopify && window.Shopify.designMode) {
      const _self = this;
      document.addEventListener("shopify:section:select", (event) => {
        _self.actionDesignMode(event);
      });
      document.addEventListener("shopify:section:load", (event) => {
        _self.createPopup();
      });
      document.addEventListener("shopify:section:deselect", () => {
        _self.closePopup();
      });
    }
    if (this.initialized) return;
    this.initialized = true;

    const urlChecked = NextSkyTheme.checkUrlParameters();
    if (urlChecked) {
      return;
    }
    const getCookie = NextSkyTheme.getCookie("newsletter_popup");
    if (
      (this.enable === "show-on-homepage" || this.enable === "show-all-page") &&
      getCookie === null
    ) {
      this.initScrollTrigger();
    }
  }

  initScrollTrigger() {
    const _self = this;
    const scrollHandler = () => {
      if (_self.scrollTriggered) return;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      const scrollPercentage = (scrollTop / documentHeight) * 100;
      if (scrollPercentage >= _self.spaceScroll) {
        _self.scrollTriggered = true;
        window.removeEventListener("scroll", scrollHandler);
        const activeModal = NextSkyTheme.root.classList.contains("open-modal");
        if (!activeModal) {
          _self.createPopup();
        }
      }
    };

    window.addEventListener("scroll", scrollHandler, { passive: true });
  }

  actionDesignMode(event) {
    const _self = this;
    const currentTarget = event.target;
    const wrapper = document.querySelector("newsletter-modal-popup");
    const template = currentTarget.querySelector("newsletter-modal-popup");
    if (
      JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
      this.sectionId
    ) {
      if (!wrapper.classList.contains("active")) {
        _self.createPopup(template);
      }
    } else {
      if (wrapper.classList.contains("active")) {
        _self.closePopup();
      }
    }
  }

  createPopup(templateDesignMode) {
    let template;
    if (window.Shopify && window.Shopify.designMode) {
      const existingPopup = document.querySelector("newsletter-modal-popup");
      if (existingPopup.classList.contains("active")) {
        NextSkyTheme.eventModal(existingPopup, "close", false);
      }
    }
    if (window.Shopify && window.Shopify.designMode) {
      template = templateDesignMode;
    } else {
      template = this.querySelector("newsletter-modal-popup");
    }
    if (!template) return;
    NextSkyTheme.eventModal(template, "open", false, null, true);
    NextSkyTheme.global.rootToFocus = template;
    new LazyLoader(".image-lazy-load");
    this.initNotShow(template);
  }

  closePopup() {
    const wrapper = document.querySelector("newsletter-modal-popup");
    if (wrapper.classList.contains("active")) {
      NextSkyTheme.eventModal(wrapper, "close", false);
    }
  }

  initNotShow(modal) {
    const notShowCheckbox = modal?.querySelector(".newsletter-action");
    if (!notShowCheckbox || notShowCheckbox.type !== "checkbox") return;
    const _self = this;

    notShowCheckbox.addEventListener("change", () => {
      _self.eventNotShow(notShowCheckbox);
    });
  }

  eventNotShow(checkbox) {
    if (checkbox.checked) {
      NextSkyTheme.setCookie("newsletter_popup", "true", 1);
    } else {
      NextSkyTheme.deleteCookie("newsletter_popup");
    }
  }
}
customElements.define("newsletter-popup", NewsletterPopup);

class ButtonCopyDiscount extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
  }
  onClick() {
    const url = this.getAttribute("data-href");
    navigator.clipboard.writeText(url);
    const text = this.getAttribute("data-text");
    this.textContent = text;
    const clipboardText = this.getAttribute("data-clipboard-text");
    setTimeout(() => {
      this.textContent = clipboardText;
    }, 1000);
  }
}
customElements.define("button-copy-discount", ButtonCopyDiscount, {
  extends: "button",
});
