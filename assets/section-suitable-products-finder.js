import { ProductTabs } from "vertical-product-tabs";
if (!customElements.get("suitable-finder")) {
  customElements.define(
    "suitable-finder",
    class SuitableFinder extends ProductTabs {
      constructor() {
        super();
        this._dot = this.querySelector(".product-tabs__dot");
        this._rangeSlider = this.querySelector("range-slider");
        this._sizeDot = this.dataset.sizeDot;
        this._isMobile =
          "ontouchstart" in window || navigator.maxTouchPoints > 0;
        this._isDragging = false;
        this._isManuallyDragging = false;

        this.handleDotMouseDown = this.handleDotMouseDown.bind(this);
        this.handleDotMouseMove = this.handleDotMouseMove.bind(this);
        this.handleDotMouseUp = this.handleDotMouseUp.bind(this);
        this.handleDotTouchStart = this.handleDotTouchStart.bind(this);
        this.handleDotTouchMove = this.handleDotTouchMove.bind(this);
        this.handleDotTouchEnd = this.handleDotTouchEnd.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this._isInitialized = false;
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", () =>
            super.connectedCallback()
          );
        }
      }

      connectedCallback() {
        super.connectedCallback();
        this._tabHeaderContent = this.querySelector(
          ".product-tabs__header-content"
        );
        if (this._dot && this._rangeSlider) {
          const offsetWidth = this._tabHeaderContent.offsetWidth;
          this._rangeSlider.style.setProperty(
            "--width-range-slider",
            offsetWidth + "px"
          );

          requestAnimationFrame(() => {
            this.setupDraggableDot();
            const activeTab = this.querySelector(
              ".product-tabs__header-item.active"
            );
            if (activeTab) {
              this.updateDotPosition(activeTab, false);

              requestAnimationFrame(() => {
                if (this._dot) {
                  this._isInitialized = true;
                }
              });
            }
          });
        }

        window.addEventListener("resize", this.handleResize, { passive: true });
      }

      setupEventListeners() {
        this._tabs.forEach((tab) => {
          tab.addEventListener("click", (event) => {
            if (event.target.closest(".product-tabs__header-description")) {
              return;
            }
            const description = tab.querySelector(
              ".product-tabs__header-description"
            );
            if (
              tab.classList.contains("active") &&
              description &&
              description.textContent.trim().length > 0
            ) {
              this.toggleAccordion(tab);
            } else {
              const blockId = tab.dataset.blockId;
              if (blockId !== this.selectedTab) {
                this.selectedTab = blockId;
                if (this._rangeSlider) {
                  this.updateDotPosition(tab, this._isInitialized);
                }
              }
            }
          });

          tab.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              const description = tab.querySelector(
                ".product-tabs__header-description"
              );
              if (
                tab.classList.contains("active") &&
                description &&
                description.textContent.trim().length > 0
              ) {
                this.toggleAccordion(tab);
              } else {
                const blockId = tab.dataset.blockId;
                if (blockId !== this.selectedTab) {
                  this.selectedTab = blockId;
                  if (this._rangeSlider) {
                    this.updateDotPosition(tab, true);
                  }
                }
              }
            }
          });
        });
      }

      setupDraggableDot() {
        if (!this._dot) return;
        this._dot.style.cursor = "grab";
        this._dot.addEventListener("mousedown", this.handleDotMouseDown);
        this._dot.addEventListener("touchstart", this.handleDotTouchStart, {
          passive: false,
        });
        this.calculateTabPositions();
      }

      calculateTabPositions() {
        this._tabPositions = [];
        if (!this._rangeSlider) return;
        const rangeSliderRect = this._rangeSlider.getBoundingClientRect();

        this.tabs.forEach((tab) => {
          const tabRect = tab.getBoundingClientRect();
          const tabCenter =
            tabRect.left + tabRect.width / 2 - rangeSliderRect.left;
          this._tabPositions.push({
            tab: tab,
            position: tabCenter,
            blockId: tab.dataset.blockId,
          });
        });
      }

      handleDotMouseDown(event) {
        event.preventDefault();
        this._isDragging = true;
        this._isManuallyDragging = true;
        this._dot.style.cursor = "grabbing";
        this._dot.style.transition = "none";
        document.addEventListener("mousemove", this.handleDotMouseMove);
        document.addEventListener("mouseup", this.handleDotMouseUp);

        this._startPosition = event.clientX;

        const computedLeft = window.getComputedStyle(this._dot).left;
        this._currentPosition = parseInt(computedLeft) || 0;

        this.calculateTabPositions();
      }

      handleDotMouseMove(event) {
        if (!this._isDragging) return;
        console.log("event :>> ", event);
        if (this._animationFrameId) {
          cancelAnimationFrame(this._animationFrameId);
        }

        this._animationFrameId = requestAnimationFrame(() => {
          const rangeSliderRect = this._rangeSlider.getBoundingClientRect();
          const dotWidth = parseInt(this._sizeDot || 26, 10);

          let newPosition =
            this._currentPosition + (event.clientX - this._startPosition);

          newPosition = Math.max(
            0,
            Math.min(rangeSliderRect.width - dotWidth, newPosition)
          );

          this._rangeSlider.style.setProperty(
            "--progress-width",
            `${newPosition}px`
          );

          const dotCenter = newPosition + dotWidth / 2;
          this.activateTabWhileDragging(dotCenter);
        });
      }

      activateTabWhileDragging(position) {
        if (!this._tabPositions.length) return;

        let closestTab = null;
        let minDistance = Infinity;

        this._tabPositions.forEach((item) => {
          const distance = Math.abs(item.position - position);
          if (distance < minDistance) {
            minDistance = distance;
            closestTab = item;
          }
        });

        this._tabs.forEach((tab) => {
          tab.classList.remove("hovered");
        });

        if (closestTab) {
          closestTab.tab.classList.add("hovered");

          if (this.selectedTab !== closestTab.blockId) {
            this.selectedTab = closestTab.blockId;
            this._lastActivatedTab = closestTab.blockId;
          }
        }
      }

      handleDotMouseUp() {
        if (!this._isDragging) return;

        this._isDragging = false;
        this._dot.style.cursor = "grab";

        document.removeEventListener("mousemove", this.handleDotMouseMove);
        document.removeEventListener("mouseup", this.handleDotMouseUp);

        setTimeout(() => {
          this._isManuallyDragging = false;
        }, 50);

        const activeTab = this.querySelector(
          ".product-tabs__header-item.active"
        );
        if (activeTab) {
          this.updateDotPosition(activeTab, false);
        }
      }

      handleDotTouchStart(event) {
        if (event.touches.length !== 1) return;

        event.preventDefault();
        this._isDragging = true;
        this._isManuallyDragging = true;
        this._dot.style.transition = "none";
        document.addEventListener("touchmove", this.handleDotTouchMove, {
          passive: false,
        });
        document.addEventListener("touchend", this.handleDotTouchEnd);

        this._startPosition = event.touches[0].clientX;

        const computedLeft = window.getComputedStyle(this._dot).left;
        this._currentPosition = parseInt(computedLeft) || 0;

        this.calculateTabPositions();
      }

      handleDotTouchMove(event) {
        if (!this._isDragging || event.touches.length !== 1) return;

        event.preventDefault();

        if (this._animationFrameId) {
          cancelAnimationFrame(this._animationFrameId);
        }

        this._animationFrameId = requestAnimationFrame(() => {
          const rangeSliderRect = this._rangeSlider.getBoundingClientRect();
          const dotWidth = parseInt(this._sizeDot || 26, 10);

          let newPosition =
            this._currentPosition +
            (event.touches[0].clientX - this._startPosition);

          newPosition = Math.max(
            0,
            Math.min(rangeSliderRect.width - dotWidth, newPosition)
          );

          this._rangeSlider.style.setProperty(
            "--progress-width",
            `${newPosition}px`
          );

          const dotCenter = newPosition + dotWidth / 2;
          this.activateTabWhileDragging(dotCenter);
        });
      }

      handleDotTouchEnd(event) {
        if (!this._isDragging) return;

        this._isDragging = false;

        document.removeEventListener("touchmove", this.handleDotTouchMove);
        document.removeEventListener("touchend", this.handleDotTouchEnd);

        setTimeout(() => {
          this._isManuallyDragging = false;
        }, 50);

        const activeTab = this.querySelector(
          ".product-tabs__header-item.active"
        );
        if (activeTab) {
          this.updateDotPosition(activeTab, false);
        }
      }

      handleResize() {
        super.handleResize();
        this.tabContents.forEach((content) => {
          if (content.classList.contains("active")) {
            const slideSection = content.querySelector("slide-section");
            if (
              slideSection &&
              slideSection.swiper &&
              slideSection.swiper.initialized
            ) {
              slideSection.swiper.update();
            }
          }
        });

        if (!this._rangeSlider) return;

        if (
          this._rangeSlider.offsetParent === null ||
          !this.isInViewport(this._rangeSlider)
        ) {
          return;
        }

        this.calculateTabPositions();

        const activeTab = this.querySelector(
          ".product-tabs__header-item.active"
        );
        if (activeTab) {
          this.updateDotPosition(activeTab, false);
        }
      }

      isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
          rect.top <=
            (window.innerHeight || document.documentElement.clientHeight) &&
          rect.bottom >= 0
        );
      }

      updateDotPosition(activeTab, animate = true) {
        if (this._isManuallyDragging) return;
        if (!this._dot || !activeTab || !this._rangeSlider) return;

        let targetTab = activeTab;
        if (!activeTab.classList.contains("product-tabs__header-item-js")) {
          const jsTab =
            activeTab.querySelector(".product-tabs__header-item-js.active") ||
            this.querySelector(".product-tabs__header-item-js.active");
          if (jsTab) {
            targetTab = jsTab;
          }
        }

        const dotWidth = parseInt(this._sizeDot || 26, 10);
        const rangeSliderRect = this._rangeSlider.getBoundingClientRect();
        const tabRect = targetTab.getBoundingClientRect();
        const tabCenter = tabRect.left + tabRect.width / 2;
        const relativeCenterX = tabCenter - rangeSliderRect.left;
        const adjustedPosition = relativeCenterX - dotWidth / 2;
        this, (this._dot.style.transition = "all 0.3s ease");
        this._rangeSlider.style.setProperty(
          "--progress-width",
          `${adjustedPosition}px`
        );

        if (!animate || !this._isInitialized) {
          if (!animate) {
            void this._dot.offsetWidth;
          }
        }
      }

      updateTabDisplay(blockId, animate = true) {
        super.updateTabDisplay(blockId, animate);

        if (this._rangeSlider && !this._isManuallyDragging) {
          const activeTab = this.querySelector(
            ".product-tabs__header-item.active"
          );
          if (activeTab) {
            this.updateDotPosition(activeTab, this._isInitialized && animate);
          }
        }
      }

      disconnectedCallback() {
        super.disconnectedCallback();

        if (this._animationFrameId) {
          cancelAnimationFrame(this._animationFrameId);
        }

        if (this._dot) {
          this._dot.removeEventListener("mousedown", this.handleDotMouseDown);
          this._dot.removeEventListener("touchstart", this.handleDotTouchStart);
        }

        document.removeEventListener("mousemove", this.handleDotMouseMove);
        document.removeEventListener("mouseup", this.handleDotMouseUp);
        document.removeEventListener("touchmove", this.handleDotTouchMove);
        document.removeEventListener("touchend", this.handleDotTouchEnd);

        window.removeEventListener("resize", this.handleResize, {
          passive: true,
        });
        window.removeEventListener(
          "scroll",
          this.calculateTabPositions.bind(this)
        );
      }
    }
  );
}
