if (!customElements.get("bundle-products")) {
  customElements.define(
    "bundle-products",
    class BundleProducts extends HTMLElement {
      constructor() {
        super();
        this.dot = this.querySelectorAll(".bundle-products-hotspot");
        this.item = this.querySelectorAll("bundle-item");
        this.sectionHeader = this.querySelector(".section-header");
        this.originalParent = this.sectionHeader
          ? this.sectionHeader.parentNode
          : null;
        this.originalNextSibling = this.sectionHeader
          ? this.sectionHeader.nextSibling
          : null;
        this.clonedHeader = null;
        this.carouselMobile = this.querySelector("carousel-mobile");

        if (this.dot.length < 1) return;
        const _this = this;

        this.handleResponsiveHeader();
        window.addEventListener("resize", () => {
          this.handleResponsiveHeader();
          this.handleResponsiveState();
          if (this.carouselMobile.swiper) {
            this.carouselMobile.swiper.on('slideChange', this.onSlideChange.bind(this));
          }
        });

        this.dot.forEach((e) => {
          e.addEventListener(
            "mouseenter",
            _this.onMouseoverPopup.bind(_this),
            false
          );
          e.addEventListener("mouseleave", _this.onMouseout.bind(_this), false);
          e.addEventListener(
            "focus",
            _this.onMouseoverPopup.bind(_this),
            false
          );
          e.addEventListener("blur", _this.onMouseout.bind(_this), false);
          e.addEventListener("click", _this.onClickDot.bind(_this), false);
        });
        this.item.forEach((e) => {
          e.addEventListener(
            "mouseenter",
            _this.onMouseoverItem.bind(_this),
            false
          );
          e.addEventListener("mouseleave", _this.onMouseout.bind(_this), false);
          e.addEventListener("focus", _this.onMouseoverItem.bind(_this), false);
          e.addEventListener("blur", _this.onMouseout.bind(_this), false);
        });
        this.initializeMobileDefault();
      }

      initializeMobileDefault() {
        if (window.innerWidth <= 767 && this.dot.length > 0) {
          const firstDot = this.dot[0];
          const firstPosition = firstDot.closest(".bundle-products-link").dataset.productPosition;
          this.removeActive();
          const firstItem = this.querySelector(
            `bundle-item[data-product-position="${firstPosition}"]`
          );
          if (firstItem) {
            firstDot.closest(".bundle-products-link").classList.add("active");
            firstItem.classList.add("active");
            this.classList.add("is-hover");
          }
        }
      }

      handleResponsiveState() {
        if (window.innerWidth <= 767) {
          this.initializeMobileDefault();
        } else {
          this.removeActive();
        }
      }

      handleResponsiveHeader() {
        if (!this.sectionHeader) return;

        if (window.innerWidth <= 1024) {
          if (!this.clonedHeader) {
            this.clonedHeader = this.sectionHeader.cloneNode(true);
            this.insertBefore(this.clonedHeader, this.firstChild);
            this.sectionHeader.remove();
          }
        } else {
          if (this.clonedHeader) {
            this.clonedHeader.remove();
            this.clonedHeader = null;
            if (this.originalNextSibling) {
              this.originalParent.insertBefore(
                this.sectionHeader,
                this.originalNextSibling
              );
            } else {
              this.originalParent.appendChild(this.sectionHeader);
            }
          }
        }
      }

      onMouseoverPopup(e) {
        const target = e.target;
        if (window.innerWidth >= 768) {
          const position = target.closest(".bundle-products-link").dataset
            .productPosition;
          this.removeActive();
          this.querySelector(
            "bundle-item[data-product-position='" + position + "']"
          ).classList.add("active");
          this.classList.add("is-hover");
          target.closest(".bundle-products-link").classList.add("active");
        }
      }

      onMouseoverItem(e) {
        const target = e.target;
        if (window.innerWidth >= 768) {
          const position =
            target.closest("bundle-item").dataset.productPosition;
          this.removeActive();
          this.querySelector(
            ".bundle-products-link[data-product-position='" + position + "']"
          ).classList.add("active");
          this.classList.add("is-hover");
          target.closest("bundle-item").classList.add("active");
        }
      }

      onMouseout() {
        if (window.innerWidth >= 768) {
          this.removeActive();
        }
      }

      removeActive() {
        if (this.dot.length < 1) return;
        this.dot.forEach((e) => {
          if (!e.closest(".bundle-products-link")) return;
          e.closest(".bundle-products-link").classList.remove("active");
        });
        this.item.forEach((e) => {
          e.classList.remove("active");
        });
        this.classList.remove("is-hover");
      }

      onClickDot(e) {
        if (window.innerWidth <= 767) {
          const target = e.target;
          const position = target.closest(".bundle-products-link").dataset
            .productPosition;
          this.removeActive();
          this.querySelector(
            "bundle-item[data-product-position='" + position + "']"
          ).classList.add("active");
          this.classList.add("is-hover");
          target.closest(".bundle-products-link").classList.add("active");

          if (this.carouselMobile && position) {
            const targetItem = this.querySelector(
              `bundle-item[data-product-position="${position}"]`
            );
            if (targetItem) {
              const allItems = this.querySelectorAll("bundle-item");
              const itemIndex = Array.from(allItems).indexOf(targetItem);
              this.slideToItem(itemIndex);
            }
          }
        }
      }

      slideToItem(index) {
        if (this.carouselMobile) {
          if (typeof this.carouselMobile.swiper.slideTo === "function") {
            this.carouselMobile.swiper.slideTo(index);
          } else {
            const slideEvent = new CustomEvent("slideTo", {
              detail: { index: index },
            });
            this.carouselMobile.dispatchEvent(slideEvent);
          }
        }
      }

      onSlideChange() {
        if (window.innerWidth <= 767) {
          const currentIndex = this.carouselMobile.swiper.activeIndex;
          const allItems = this.querySelectorAll("bundle-item");
          
          if (allItems[currentIndex]) {
            const position = allItems[currentIndex].dataset.productPosition;
            this.removeActive();
            
            const correspondingDot = this.querySelector(
              `.bundle-products-link[data-product-position="${position}"]`
            );
            const correspondingItem = this.querySelector(
              `bundle-item[data-product-position="${position}"]`
            );
            
            if (correspondingDot && correspondingItem) {
              correspondingDot.classList.add("active");
              correspondingItem.classList.add("active");
              this.classList.add("is-hover");
            }
          }
        }
      }
    }
  );
}
