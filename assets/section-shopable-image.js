import * as NextSkyTheme from "global";
class ShopableImage extends HTMLElement {
  constructor() {
    super();
    this.isActive = false;
    this.isAnimating = false;
    this.productInfo = null;
    this.animationDuration = 0.25;
    this.innerWidth = window.innerWidth;
    this.isMobile = this.innerWidth <= 767;
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
  }

  connectedCallback() {
    this.dotElement = this.querySelector(".icon-dot");
    this.productUrl = this.getAttribute("data-url");

    if (!this.dotElement) return;

    this.handleResize = this.handleResize.bind(this);
    window.addEventListener("resize", this.handleResize);
    document.addEventListener("click", this.handleDocumentClick);
    document.addEventListener("keydown", this.handleKeyDown);
    this.updateEventListeners();
  }

  handleDocumentClick(event) {
    if (this.isActive && !this.contains(event.target)) {
      this.hideProductInfo();
    }
  }

  handleKeyDown(event) {
    if (!this.isActive) return;

    if (event.key === "Escape") {
      this.hideProductInfo();
      this.dotElement.focus();
    }

    if (event.key === "Tab" && this.isActive) {
      const tooltip = document.querySelector(".product-tooltip");
      const focusableElements = tooltip.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }

  handleResize() {
    this.innerWidth = window.innerWidth;
    const wasMobile = this.isMobile;
    this.isMobile = this.innerWidth <= 767;

    if (wasMobile !== this.isMobile) {
      this.updateEventListeners();
    }
  }

  updateEventListeners() {
    if (this.dotElement) {
      this.dotElement.removeEventListener("click", this.toggleProductInfo);
      this.dotElement.removeEventListener("click", this.handleMobileClick);
      this.dotElement.removeEventListener("keypress", this.handleKeyPress);
      this.dotElement.addEventListener(
        "keypress",
        this.handleKeyPress.bind(this)
      );
    }

    if (this.isMobile) {
      this.dotElement.addEventListener(
        "click",
        this.handleMobileClick.bind(this)
      );
    } else {
      this.dotElement.addEventListener(
        "click",
        this.toggleProductInfo.bind(this)
      );
    }
  }

  handleKeyPress(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (this.isMobile) {
        this.handleMobileClick(event);
      } else {
        this.toggleProductInfo(event);
      }
    }
  }

  handleMobileClick(event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.productUrl) {
      window.location.href = this.productUrl;
    }
  }

  showProductInfo() {
    if (this.isMobile || this.isAnimating || this.isActive) return;

    this.closeAllOtherItems();
    this.isAnimating = true;
    this.classList.add("active");
    this.dotElement.classList.add("active");

    const template = this.querySelector("template");
    const content = document.createElement("div");
    content.className = "product-tooltip";
    content.appendChild(template.content.firstElementChild.cloneNode(true));

    content.style.opacity = "0";
    content.style.transform = "translateY(20px)";

    const tooltip = NextSkyTheme.body.appendChild(content);

    const triggerRect = this.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;

    tooltip.style.left =
      triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2 + "px";
    tooltip.style.top = triggerRect.bottom + 10 + window.scrollY + "px";

    tooltip.setAttribute("tabindex", "-1");

    setTimeout(() => {
      Motion.animate(
        tooltip,
        {
          opacity: 1,
          y: 0,
        },
        {
          duration: 0.3,
          easing: "ease-out",
          onComplete: () => {
            tooltip
              .querySelector(".group-lookbook__item-product")
              .classList.add("active");
            const focusableElements = tooltip.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
              focusableElements[0].focus();
            } else {
              tooltip.focus();
            }
          },
        }
      );
    }, 10);

    this.isAnimating = false;
    this.isActive = true;
  }
  v;

  closeAllOtherItems() {
    const allActiveImages = document.querySelectorAll("shopable-image.active");
    allActiveImages.forEach((item) => {
      if (item !== this) {
        item.classList.remove("active");
        const itemDot = item.querySelector(".icon-dot");
        if (itemDot) itemDot.classList.remove("active");
        if (typeof item.isActive !== "undefined") item.isActive = false;
        if (typeof item.isAnimating !== "undefined") item.isAnimating = false;
      }
    });
    const tooltip = document.querySelector(".product-tooltip");
    if (tooltip) {
      Motion.animate(
        tooltip,
        {
          opacity: 0,
          y: 20,
        },
        {
          duration: 0.3,
          easing: "ease-in",
          onComplete: () => {
            if (tooltip.parentNode) {
              tooltip.parentNode.removeChild(tooltip);
            }
          },
        }
      );
    }
  }

  hideProductInfo() {
    if (this.isMobile || this.isAnimating || !this.isActive) return;

    this.isAnimating = true;
    this.classList.remove("active");
    this.dotElement.classList.remove("active");

    const tooltip = document.querySelector(".product-tooltip");
    if (tooltip) {
      Motion.animate(
        tooltip,
        {
          opacity: 0,
          y: 20,
        },
        {
          duration: 0.3,
          easing: "ease-in",
          onComplete: () => {
            if (tooltip.parentNode) {
              tooltip.parentNode.removeChild(tooltip);
            }
          },
        }
      );
    }

    this.isAnimating = false;
    this.isActive = false;
  }

  toggleProductInfo(event) {
    if (this.isMobile) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.isActive) {
      this.hideProductInfo();
    } else {
      this.showProductInfo();
    }
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this.handleResize);

    document.removeEventListener("click", this.handleDocumentClick);

    if (this.dotElement) {
      this.dotElement.removeEventListener("click", this.toggleProductInfo);
      this.dotElement.removeEventListener("click", this.handleMobileClick);
    }
  }
}

customElements.define("shopable-image", ShopableImage);
