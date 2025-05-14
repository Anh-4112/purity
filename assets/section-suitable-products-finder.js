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
        this._spacingHeader = parseInt(this.dataset.spacing);
        this._tabRange = this.querySelector("input[type=range]");
        this._tabButtons = this.querySelectorAll(
          ".product-tabs__header-item-js"
        );
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
        }

        window.addEventListener("resize", this.handleResize, { passive: true });

        this._tabRange.addEventListener("input", (e) => {
          const tabNumber = parseInt(e.target.value);
          e.target.setAttribute("value", tabNumber);
          const tabId = this.querySelector(`[data-tab-id=tab-${tabNumber}]`);
          const blockId = tabId.dataset.blockId;
          this.updateTabDisplay(blockId, true);
        });
        this._tabRange.addEventListener(
          "input",
          this.positionThumbExactly.bind(this)
        );
        this._tabRange.addEventListener(
          "change",
          this.positionThumbExactly.bind(this)
        );
        this.fineTuneSliderPositions();
        this.enableTrackClickNavigation();
      }

      fineTuneSliderPositions() {
        const isMobile = window.innerWidth < 767.98;
        const marginRight = this._spacingHeader;
        const numTabs = this._tabButtons.length;
        const tabHeaderWidth = this._tabHeaderContent.offsetWidth;
        let tabCenters = [];
        if (isMobile) {
          const tabWidths = Array.from(this._tabButtons).map(
            (button) => button.offsetWidth
          );
          const totalTabWidth = tabWidths.reduce(
            (sum, width) => sum + width,
            0
          );
          const remainingSpace = tabHeaderWidth - totalTabWidth;
          const gapBetweenTabs =
            numTabs > 1 ? remainingSpace / (numTabs - 1) : 0;
          let currentPosition = tabWidths[0] / 2;
          tabCenters.push(currentPosition);
          for (let i = 1; i < numTabs; i++) {
            currentPosition +=
              tabWidths[i - 1] / 2 + gapBetweenTabs + tabWidths[i] / 2;
            tabCenters.push(currentPosition);
          }
        } else {
          const totalMarginSpace = marginRight * (numTabs - 1);
          const tabWidth =
            (tabHeaderWidth - totalMarginSpace) / numTabs;
          let currentPosition = tabWidth / 2;
          const thumbWidth = parseInt(this._sizeDot);
          this._rangeSlider.style.setProperty(
            "--progress-width",
            `${currentPosition - thumbWidth / 2}px`
          );
          for (let i = 0; i < numTabs; i++) {
            tabCenters.push(currentPosition);
            currentPosition += tabWidth;
            if (i < numTabs - 1) {
              currentPosition += marginRight;
            }
          }
        }
        window.tabCenters = tabCenters;
      }

      positionThumbExactly() {
        const tabNumber = parseInt(this._tabRange.value);
        const index = tabNumber - 1;
        if (window.tabCenters && window.tabCenters[index]) {
          const exactPosition = window.tabCenters[index];
          const thumbWidth = parseInt(this._sizeDot);
          this._rangeSlider.style.setProperty(
            "--progress-width",
            `${exactPosition - thumbWidth / 2}px`
          );
        }
      }

      handleResize() {
        super.handleResize();
        this.fineTuneSliderPositions();
        this.positionThumbExactly();
      }

      updateTabDisplay(blockId, animate = true) {
        super.updateTabDisplay(blockId, animate);
        const activeTab = this.querySelector(
          `.product-tabs__header-item-js[data-block-id=${blockId}]`
        );
        const tabNumber = activeTab.dataset.position;
        this._tabRange.value = tabNumber;
        this._tabRange.setAttribute("value", tabNumber);
        this.positionThumbExactly(tabNumber);
      }

      enableTrackClickNavigation() {
        this._rangeSlider.addEventListener("click", (e) => {
          if (e.target === this._tabRange) {
            const sliderRect = this._tabRange.getBoundingClientRect();
            const clickX = e.clientX;

            let relativePos = (clickX - sliderRect.left) / sliderRect.width;
            relativePos = Math.max(0, Math.min(relativePos, 1));

            const tabCenters = window.tabCenters || [];
            if (tabCenters.length === 0) return;

            const relativeCenters = tabCenters.map(
              (center) => center / sliderRect.width
            );

            let closestTabIndex = 0;
            let minDistance = Math.abs(relativeCenters[0] - relativePos);

            for (let i = 1; i < relativeCenters.length; i++) {
              const distance = Math.abs(relativeCenters[i] - relativePos);
              if (distance < minDistance) {
                minDistance = distance;
                closestTabIndex = i;
              }
            }

            const newTabValue = closestTabIndex + 1;
            this._tabRange.value = newTabValue;
            this._tabRange.setAttribute("value", newTabValue);
            const tabId = this.querySelector(
              `[data-tab-id=tab-${newTabValue}]`
            );
            const blockId = tabId.dataset.blockId;
            this.updateTabDisplay(blockId, true);
            this.positionThumbExactly();
          }
        });
      }
    }
  );
}
