import * as NextSkyTheme from "global";
class ScrollOffer extends HTMLElement {
  constructor() {
    super();
    this.isVisible = false;
    this.observer = null;
    this.scrollThreshold = 300;
    this.initialized = false;
    this.cookieName = "scroll_offer_hidden";
  }

  connectedCallback() {
    this.addEventListener("click", this.initPopup.bind(this), false);
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initPopup() {
    const offerWrapper = document.querySelector("offer-popup");
    const slideSection = offerWrapper.querySelector("slide-section");
    NextSkyTheme.eventModal(offerWrapper, "open", false);
    slideSection.swiper.update();
    const _self = this;
    _self.initMobile(slideSection);
  }

  initMobile(slide) {
    const mediaQuery = window.matchMedia("(max-width: 767.98px)");
    const dataAppend = slide.querySelectorAll(".swiper-slide .block__image-with-text-offer");
    const offerMobile = document.querySelector(".offer-content__mobile");
    const handleMediaQueryChange = (mediaQuery) => {
      if (mediaQuery.matches) {
        dataAppend.forEach((item) => {
          const clone = item.cloneNode(true);
          offerMobile.appendChild(clone);
        });
      } else {
        offerMobile.innerHTML = "";
      }
    };
    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
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
