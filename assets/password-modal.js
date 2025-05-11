import { LazyLoader } from "module-lazyLoad";
import * as NextSkyTheme from "global";

class NewsletterPopupPassword extends HTMLElement {
  constructor() {
    super();
    this.enable = this.dataset.enable;
    this.initialized = false;
    this.sectionId = this.dataset.sectionId;
    this.lastFocusedElement = null;
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

    const urlChecked = this.checkUrlParameters();
    if (urlChecked) {
      return;
    }
    const getCookie = NextSkyTheme.getCookie("newsletter_popup");
    if (
      (this.enable === "show-on-homepage" || this.enable === "show-all-page") &&
      getCookie === null
    ) {
      this.schedulePopupWithModalCheck();
    }

    const passwordHeading = this.querySelector(".password-modal__content-heading");
    if (passwordHeading) {
      passwordHeading.setAttribute("tabindex", "0"); 
      passwordHeading.addEventListener("click", () => {
        this.createPopup(); 
      });

      passwordHeading.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
          this.createPopup(); 
        }
      });
    }
  }

  schedulePopupWithModalCheck() {
    const popupDelay = 6000;
    setTimeout(() => {
      const activeModal = NextSkyTheme.root.classList.contains("open-modal");
      if (!activeModal) {
        this.createPopup();
      }
    }, popupDelay - 100);
  }

  actionDesignMode(event) {
    const _self = this;
    const currentTarget = event.target;
    const wrapper = document.querySelector("newsletter-modal-popup");
    const template = currentTarget.querySelector("template");
    if (
      JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
      this.sectionId
    ) {
      if (!wrapper) {
        _self.createPopup(template);
      }
    } else {
      if (wrapper) {
        _self.closePopup();
      }
    }
  }

  createPopup(templateDesignMode) {
    let template;
    let timeShowPopup = 0;
    if (window.Shopify && window.Shopify.designMode) {
      const existingPopup = document.querySelector("newsletter-modal-popup");
      if (existingPopup) {
        existingPopup.remove();
      }
    }
    if (window.Shopify && window.Shopify.designMode) {
      template = templateDesignMode;
      timeShowPopup = 0;
    } else {
      template = this.querySelector("template");
      timeShowPopup = 100;
    }
    if (!template) return;
    const content = document.createElement("div");
    content.appendChild(template.content.firstElementChild.cloneNode(true));
    const wrapper = NextSkyTheme.body.appendChild(
      content.querySelector("newsletter-modal-popup")
    );

    this.lastFocusedElement = document.activeElement;

    setTimeout(() => {
      NextSkyTheme.eventModal(wrapper, "open", true, null, true);
      NextSkyTheme.global.rootToFocus = wrapper;
      new LazyLoader(".image-lazy-load");
    }, timeShowPopup);
    const form = document.querySelector('.password-form-popup');
    const submitButton = form.querySelector('.password-button'); 
    const passwordInput = form.querySelector('#Password'); 
    if (!form || !submitButton || !passwordInput) {
      return;
    }

    const validatePassword = (value) => {
      return value.trim() === "" ? window.validate.password : '';
    };

    submitButton.addEventListener('click', function (e) {
      const errorMessage = validatePassword(passwordInput.value);

      if (errorMessage) {
        e.preventDefault();
        e.stopImmediatePropagation(); 

        showError(passwordInput, errorMessage);
        return false;
      }

      const spinner = submitButton?.querySelector(".icon-load");
      const text = submitButton?.querySelector(".hidden-on-load.transition-short");

      submitButton?.classList.add("loading");
      spinner?.classList.remove("opacity-0", "pointer-none");
      text?.classList.add("opacity-0");
    });

    function showError(input, message) {
      const parentElement = input.closest(".field.relative");

      let errorEl = parentElement.querySelector(".form-error-message");
      if (!errorEl) {
        errorEl = document.createElement("div");
        errorEl.className = "form-error-message warning mt-10 max-w-custom fs-small inline-flex align-center gap-10 w-full h-custom";
        errorEl.style.setProperty('--height', '5.6rem');
        parentElement.insertAdjacentElement('beforeend', errorEl);
      }

      errorEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 7.5V11.6667" stroke="#79571b" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.99962 17.8414H4.94962C2.05795 17.8414 0.849619 15.7747 2.24962 13.2497L4.84962 8.56641L7.29962 4.16641C8.78295 1.49141 11.2163 1.49141 12.6996 4.16641L15.1496 8.57474L17.7496 13.2581C19.1496 15.7831 17.933 17.8497 15.0496 17.8497H9.99962V17.8414Z" stroke="#79571b" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.99683 14.167H10.0043" stroke="#79571b" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>${message}</span>
      `;
      input.classList.add('input-error'); 
    }
    this.initNotShow(wrapper);
  }

  closePopup() {
    const wrapper = document.querySelector("newsletter-modal-popup");
    if (wrapper) {
      NextSkyTheme.eventModal(wrapper, "close", true);
      if (this.lastFocusedElement) {
        this.lastFocusedElement.focus();
      }
    }
  }

  checkUrlParameters() {
    const urlInfo = window.location.href;
    const newURL = location.href.split("?")[0];

    if (urlInfo.indexOf("customer_posted=true") >= 1) {
      NextSkyTheme.setCookie("newsletter_popup", "true", 1);
      NextSkyTheme.notifier.show(message.newsletter.success, "success", 4000);
      window.history.pushState("object", document.title, newURL);
      return true;
    }

    if (
      urlInfo.indexOf("contact%5Btags%5D=newsletter&form_type=customer") >= 1
    ) {
      NextSkyTheme.notifier.show(message.newsletter.error, "error", 4000);
      window.history.pushState("object", document.title, newURL);
      return false;
    }

    return false;
  }

  initNotShow(modal) {
    const notShow = modal?.querySelector(".newsletter-action");
    if (!notShow) return;
    const _self = this;

    notShow.addEventListener("click", () => {
        _self.eventNotShow(modal);
    });
    notShow.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        _self.eventNotShow(modal);
      }
    });
  }

  eventNotShow(modal) {
    NextSkyTheme.setCookie("newsletter_popup", "true", 1);
    NextSkyTheme.eventModal(modal, "close", true);
  }
}

customElements.define("newsletter-popup-password", NewsletterPopupPassword);

