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

        this.handleResponsiveHeader();
        this.initEventListeners();
        
        const _this = this;
        window.addEventListener("resize", function() {
          _this.handleResponsiveHeader();
          _this.handleResponsiveState();
          setTimeout(() => {
            _this.refreshEventListeners();
          }, 100);
        });
        this.initializeMobileDefault();
      }

      initializeMobileDefault() {
        if (window.innerWidth <= 767 && this.dot.length > 0) {
          const firstDot = this.dot[0];
          const firstPosition = firstDot.closest(".bundle-products-link")
            .dataset.productPosition;
          this.removeActive();
          const firstItem = this.querySelector(
            `bundle-item[data-product-position="${firstPosition}"]`
          );
          if (firstItem) {
            firstDot.closest(".bundle-products-link").classList.add("active");
            firstItem.classList.add("active");
            this.classList.add("is-hover");
            
            if (this.carouselMobile.swiper && firstPosition) {
              const allItems = this.querySelectorAll("bundle-item");
              const itemIndex = Array.from(allItems).indexOf(firstItem);
              this.slideToItem(itemIndex);
            }
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
        if (window.innerWidth >= 768) {
          const target = e.currentTarget || e.target;
          
          const link = target.closest(".bundle-products-link");
          
          if (!link) return;
          
          const position = link.dataset.productPosition;
          
          if (!position) return;
          
          this.removeActive();
          const bundleItem = this.querySelector(
            `bundle-item[data-product-position="${position}"]`
          );
          
          if (bundleItem) {
            bundleItem.classList.add("active");
            this.classList.add("is-hover");
            link.classList.add("active");
          }
        }
      }

      onMouseoverItem(e) {
        if (window.innerWidth >= 768) {
          const target = e.currentTarget || e.target;
          const bundleItem = target.closest("bundle-item");
          
          if (!bundleItem) return;
          
          const position = bundleItem.dataset.productPosition;
          
          if (!position) return;
          
          this.removeActive();
          const link = this.querySelector(
            `.bundle-products-link[data-product-position="${position}"]`
          );
          
          if (link) {
            link.classList.add("active");
            this.classList.add("is-hover");
            bundleItem.classList.add("active");
          }
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
          const target = e.currentTarget;
          const link = target.closest(".bundle-products-link");
          if (!link) return;
          
          const position = link.dataset.productPosition;
          if (!position) return;
          
          this.removeActive();
          const bundleItem = this.querySelector(
            `bundle-item[data-product-position="${position}"]`
          );
          
          if (bundleItem) {
            bundleItem.classList.add("active");
            this.classList.add("is-hover");
            link.classList.add("active");

            if (this.carouselMobile) {
              const allItems = this.querySelectorAll("bundle-item");
              const itemIndex = Array.from(allItems).indexOf(bundleItem);
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

      initEventListeners() {
        const _this = this;
        
        this.removeEventListeners();
        
        this.dot.forEach((dot, index) => {
          dot.addEventListener("mouseenter", function(e) {
            _this.onMouseoverPopup(e);
          }, false);
          dot.addEventListener("mouseleave", function(e) {
            _this.onMouseout(e);
          }, false);
          dot.addEventListener("focus", function(e) {
            _this.onMouseoverPopup(e);
          }, false);
          dot.addEventListener("blur", function(e) {
            _this.onMouseout(e);
          }, false);
          dot.addEventListener("click", function(e) {
            _this.onClickDot(e);
          }, false);
        });
        
        this.item.forEach((item, index) => {
          item.addEventListener("mouseenter", function(e) {
            console.log('Item mouseenter triggered');
            _this.onMouseoverItem(e);
          }, false);
          item.addEventListener("mouseleave", function(e) {
            _this.onMouseout(e);
          }, false);
          item.addEventListener("focus", function(e) {
            _this.onMouseoverItem(e);
          }, false);
          item.addEventListener("blur", function(e) {
            _this.onMouseout(e);
          }, false);
        });

        if (this.carouselMobile && this.carouselMobile.swiper) {
          this.carouselMobile.swiper.on("slideChange", function() {
            _this.onSlideChange();
          });
        }
      }

      removeEventListeners() {
        this.dot.forEach((dot) => {
          const newDot = dot.cloneNode(true);
          dot.parentNode.replaceChild(newDot, dot);
        });
        
        this.item.forEach((item) => {
          const newItem = item.cloneNode(true);
          item.parentNode.replaceChild(newItem, item);
        });
        
        this.dot = this.querySelectorAll(".bundle-products-hotspot");
        this.item = this.querySelectorAll("bundle-item");
      }

      refreshEventListeners() {
        this.dot = this.querySelectorAll(".bundle-products-hotspot");
        this.item = this.querySelectorAll("bundle-item");
        this.initEventListeners();
      }
    }
  );
}
