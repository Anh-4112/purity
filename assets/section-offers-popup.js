import * as NextSkyTheme from "global";
import { SlideSection } from "module-slide";
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
    const slideSection = document.querySelector("offer-slide");
    const drawerContent = document.querySelector(".drawer__content");
    this.initMobile(slideSection, drawerContent);
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
    }
  }

  actionDesignMode(event) {
    const _self = this;
    const currentTarget = event.target;
    const offerWrapper = document.querySelector("offer-popup");
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
    NextSkyTheme.global.rootToFocus = this;
    new LazyLoader(".image-lazy-load");
  }

  closePopup() {
    const offerWrapper = document.querySelector("offer-popup");
    NextSkyTheme.eventModal(offerWrapper, "close", false);
  }

  initMobile(slide, drawerContent) {
    const mediaQuery = window.matchMedia("(max-width: 767.98px)");
    const dataAppend = slide.querySelectorAll(
      ".swiper-slide .block__image-with-text-offer"
    );
    const _self = this;
    const offerMobile = document.querySelector(".offer-content__mobile");
    const handleMediaQueryChange = (mediaQuery) => {
      if (mediaQuery.matches) {
        dataAppend.forEach((item) => {
          const clone = item.cloneNode(true);
          offerMobile.appendChild(clone);
        });
        drawerContent.classList.add("overflow-y-auto", "custom-scrollbar");
        _self.mobileAppend();
      } else {
        offerMobile.innerHTML = "";
        drawerContent.classList.remove("overflow-y-auto", "custom-scrollbar");
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
      <div class="mobile_icon inline-flex column content-center heading-color gap-3">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.9889 14.6624L2.46891 13.1424C1.84891 12.5224 1.84891 11.5024 2.46891 10.8824L3.9889 9.36234C4.2489 9.10234 4.4589 8.59233 4.4589 8.23233V6.08231C4.4589 5.20231 5.1789 4.48233 6.0589 4.48233H8.2089C8.5689 4.48233 9.0789 4.27236 9.3389 4.01236L10.8589 2.49234C11.4789 1.87234 12.4989 1.87234 13.1189 2.49234L14.6389 4.01236C14.8989 4.27236 15.4089 4.48233 15.7689 4.48233H17.9189C18.7989 4.48233 19.5189 5.20231 19.5189 6.08231V8.23233C19.5189 8.59233 19.7289 9.10234 19.9889 9.36234L21.5089 10.8824C22.1289 11.5024 22.1289 12.5224 21.5089 13.1424L19.9889 14.6624C19.7289 14.9224 19.5189 15.4324 19.5189 15.7924V17.9423C19.5189 18.8223 18.7989 19.5424 17.9189 19.5424H15.7689C15.4089 19.5424 14.8989 19.7524 14.6389 20.0124L13.1189 21.5324C12.4989 22.1524 11.4789 22.1524 10.8589 21.5324L9.3389 20.0124C9.0789 19.7524 8.5689 19.5424 8.2089 19.5424H6.0589C5.1789 19.5424 4.4589 18.8223 4.4589 17.9423V15.7924C4.4589 15.4224 4.2489 14.9124 3.9889 14.6624Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 15.002L15 9.00195" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14.4945 14.502H14.5035" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9.49451 9.50195H9.50349" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
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
    if (event.key === "Enter") {
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
    if (this.checkIfHidden()) return;
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

class OfferSlide extends SlideSection {
  constructor() {
    super();
  }

  init() {
    let width = window.innerWidth;
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      if (newWidth <= 1024 && width > 1024) {
        this.actionOnMobile();
      }
      if (newWidth > 1024 && width <= 1024) {
        this.actionOutMobile();
      }
      width = newWidth;
    });
    if (width <= 1024) {
      this.actionOnMobile();
    } else {
      this.actionOutMobile();
    }
  }

  actionOnMobile() {
    this.initSlideMediaGallery("OfferSlide");
    this.style.maxHeight = "auto";
    this.style.minHeight = "auto";
  }

  actionOutMobile() {
    this.initSlideMediaGallery("OfferSlide");
    this.style.maxHeight = this.closest(".drawer__body").offsetHeight + "px";
    this.style.minHeight = "100vh";
  }
}
customElements.define("offer-slide", OfferSlide);
