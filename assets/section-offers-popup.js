import * as NextSkyTheme from "global";
import { LazyLoader } from "module-lazyLoad";

class ScrollOffer extends HTMLElement {
  constructor() {
    super();
    this.isVisible = false;
    this.observer = null;
    this.scrollThreshold = 300;
    this.initialized = false;
    this.cookieName = "scroll_offer_hidden";
    this.sectionId = this.dataset.sectionId;
    this.isPopupOpen = false;
    this.initMobile();
  }

  connectedCallback() {
    this.addEventListener("click", this.initPopup.bind(this), false);
    this.addEventListener("keydown", this.handleKeydown.bind(this), false);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initialize());
    } else {
      this.initialize();
    }

    if (window.Shopify && window.Shopify.designMode) {
      const _self = this;
      document.addEventListener("shopify:section:select", (event) => {
        _self.actionDesignMode(event);
      });
      document.addEventListener("shopify:section:deselect", () => {
        _self.closePopup();
      });
    } else {
      const rootElement = document.documentElement;
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === "class") {
            const isModalOpen = rootElement.classList.contains(
              "open-modal-offer-popup"
            );
            this.isPopupOpen = isModalOpen;

            if (isModalOpen) {
              this.hide();
              if (this._scrollHandler) {
                window.removeEventListener(
                  "scroll",
                  this.handleScroll.bind(this)
                );
              }
            } else {
              if (this._scrollHandler) {
                window.addEventListener("scroll", this.handleScroll.bind(this));
              }
              this.handleScroll();
            }
          }
        });
      });

      observer.observe(rootElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  actionDesignMode(event) {
    const _self = this;
    const currentTarget = event.target;
    if (
      JSON.parse(currentTarget.dataset.shopifyEditorSection).id ===
      this.sectionId
    ) {
      _self.initPopup();
    } else {
      _self.closePopup();
    }
  }

  initPopup() {
    const offerWrapper = document.querySelector("offer-popup");
    if (window.Shopify && window.Shopify.designMode) {
      NextSkyTheme.eventModal(offerWrapper, "close", false);
    }
    NextSkyTheme.eventModal(offerWrapper, "open", false);
    document.documentElement.classList.add("open-modal-offer-popup");
    NextSkyTheme.global.rootToFocus = this;
    new LazyLoader(".image-lazy-load");
  }

  closePopup() {
    const offerWrapper = document.querySelector("offer-popup");
    NextSkyTheme.eventModal(offerWrapper, "close", false);
    this.isPopupOpen = false;
    this.handleScroll();
  }

  initMobile() {
    const mediaQuery = window.matchMedia("(max-width: 767.98px)");
    const _self = this;
    const handleMediaQueryChange = (mediaQuery) => {
      if (mediaQuery.matches) {
        _self.mobileAppend();
      }
    };
    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
  }

  mobileAppend() {
    const mobileNavigationBar = document.querySelector("mobile-navigation-bar");
    if (!mobileNavigationBar) {
      return;
    }
    const mobileNavigationBarContent = mobileNavigationBar.querySelector(
      ".mobile-navigation-bar__content"
    );
    const existingOfferMobile =
      mobileNavigationBarContent.querySelector(".offer-mobile");
    if (existingOfferMobile) {
      return;
    }
    const contentAppend = document.createElement("li");
    contentAppend.classList.add("flex-1", "offer-mobile");
    contentAppend.innerHTML = `
      <div class="mobile_icon pointer inline-flex column content-center heading-color gap-3">
<svg width="20" height="20" fill="none"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3.326 12.217 2.059 10.95a1.338 1.338 0 0 1 0-1.883L3.326 7.8c.217-.216.392-.641.392-.941V5.067c0-.733.6-1.333 1.333-1.333h1.792c.3 0 .725-.175.941-.392l1.267-1.267a1.338 1.338 0 0 1 1.883 0l1.267 1.267c.217.217.642.392.942.392h1.791c.734 0 1.334.6 1.334 1.333V6.86c0 .3.175.725.391.941l1.267 1.267a1.338 1.338 0 0 1 0 1.883l-1.267 1.267c-.216.217-.391.642-.391.942v1.791c0 .734-.6 1.334-1.334 1.334h-1.791c-.3 0-.725.175-.942.392l-1.267 1.266a1.338 1.338 0 0 1-1.883 0l-1.267-1.267a1.537 1.537 0 0 0-.941-.391H5.05c-.733 0-1.333-.6-1.333-1.334V13.16c0-.309-.175-.734-.392-.942ZM7.5 12.5l5-5"/><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.08 12.083h.008M7.912 7.917h.008"/></svg>
        ${window.content.offer.title}
      </div>
    `;
    const lastChild = mobileNavigationBarContent.lastElementChild;
    if (lastChild) {
      mobileNavigationBarContent.insertBefore(contentAppend, lastChild);
    } else {
      mobileNavigationBarContent.appendChild(contentAppend);
    }
    contentAppend.addEventListener("click", this.initPopup.bind(this), false);
  }

  handleKeydown(event) {
    if (event.key === "Enter" && !event.target.closest("icon-close-offer")) {
      event.preventDefault();
      this.initPopup();
    }
  }

  initialize() {
    if (this.initialized) return;
    this.initialized = true;

    if (this.checkIfHidden()) {
      this.style.display = "none";
      return;
    }

    const closeButton = this.querySelector("icon-close-offer");
    if (closeButton) {
      closeButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.hideAndSetCookie();
      });
      closeButton.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.stopPropagation();
          this.hideAndSetCookie();
        }
      });
    }

    this.style.opacity = "0";
    this.style.transform = "translateX(-100%)";
    this.style.transition = "opacity 0.2s ease, transform 0.2s ease";

    window.addEventListener("scroll", this.handleScroll.bind(this));
    this.handleScroll();
  }

  checkIfHidden() {
    return NextSkyTheme.getCookie(this.cookieName) === "true";
  }

  hideAndSetCookie() {
    this.hide();
    NextSkyTheme.setCookie(this.cookieName, "true", 1);
    setTimeout(() => {
      this.style.display = "none";
    }, 300);
  }

  handleScroll() {
    if (this.checkIfHidden() || this.isPopupOpen) return;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > this.scrollThreshold && !this.isVisible) {
      this.show();
    } else if (scrollTop <= this.scrollThreshold && this.isVisible) {
      this.hide();
    }
  }

  show() {
    if (this.checkIfHidden()) return;
    this.isVisible = true;
    this.classList.add("active");
    if (typeof Motion !== "undefined") {
      Motion.animate(
        this,
        {
          opacity: [0, 1],
          x: ["-100%", "0%"],
        },
        {
          duration: 0.2,
          easing: "cubic-bezier(0.16, 1, 0.2, 1)",
        }
      );
    } else {
      this.style.opacity = "1";
      this.style.transform = "translateX(0)";
    }
  }

  hide() {
    this.isVisible = false;
    this.classList.remove("active");
    if (typeof Motion !== "undefined") {
      Motion.animate(
        this,
        {
          opacity: [1, 0],
          x: ["0%", "-100%"],
        },
        {
          duration: 0.2,
          easing: "cubic-bezier(0.16, 1, 0.2, 1)",
        }
      );
    } else {
      this.style.opacity = "0";
      this.style.transform = "translateX(-100%)";
    }
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.handleScroll);
    const closeButton = this.querySelector("icon-close-offer");
    if (closeButton) {
      closeButton.removeEventListener("click", this.hideAndSetCookie);
    }
  }
}

customElements.define("scroll-offer", ScrollOffer);
