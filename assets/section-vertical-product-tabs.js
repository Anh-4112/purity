class ProductTabs extends HTMLElement {
    constructor() {
        super();
        this._selectedTab = null;
        this._tabs = null;
        this._tabContents = null;
        this._openAccordions = new Set();

        if (Shopify && Shopify.designMode) {
            this.addEventListener("shopify:block:select", (event) => {
                const targetBlock = event.target.closest("[data-block-id]");
                if (targetBlock) {
                    this.setTab(targetBlock.dataset.blockId, true);
                }
            });
        }
        this.handleResize = this.handleResize.bind(this);
    }

    static get observedAttributes() {
        return ["selected-tab"];
    }

    get selectedTab() {
        return this.getAttribute("selected-tab") || "";
    }

    set selectedTab(blockId) {
        if (blockId && this.getAttribute("selected-tab") !== blockId) {
            this.setAttribute("selected-tab", blockId);
        }
    }

    get tabs() {
        return (
            this._tabs ||
            Array.from(this.querySelectorAll(".product-tabs__header-item"))
        );
    }

    get tabContents() {
        return (
            this._tabContents ||
            Array.from(this.querySelectorAll(".product-tabs__content-item"))
        );
    }

    connectedCallback() {
        setTimeout(() => {
            this.init();
        }, 10);

        window.addEventListener("resize", this.handleResize);
    }

    handleResize() {
        const activeTab = this.querySelector(".product-tabs__header-item.active");
    }

    init() {
        this._tabs = Array.from(
            this.querySelectorAll(".product-tabs__header-item")
        );
        this._tabContents = Array.from(
            this.querySelectorAll(".product-tabs__content-item")
        );
        if (!this._tabs.length || !this._tabContents.length) return;
        const initialTab = this._tabs[0];
        this.selectedTab = initialTab.dataset.blockId;
        this.setupEventListeners();
        this.updateTabDisplay(this.selectedTab, false);
        setTimeout(() => {
            this.initContentSwipers();
        }, 10);
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
                        }
                    }
                }
            });
        });
    }

    closeAllAccordions() {
        this._tabs.forEach((tab) => {
            const description = tab.querySelector(
                ".product-tabs__header-description"
            );
            const mobileDescription = this.querySelector(
                ".product-tabs__header-description-mobile"
            );
            if (description && tab.classList.contains("accordion-open")) {
                tab.classList.remove("accordion-open");
                description.classList.remove("is-open");
                if (typeof Motion !== "undefined") {
                    Motion.animate(
                        description,
                        {
                            opacity: [1, 0],
                            height: 0,
                        },
                        { duration: 0.2 }
                    );

                    if (mobileDescription) {
                        Motion.animate(
                            mobileDescription,
                            {
                                opacity: [1, 0],
                            },
                            {
                                duration: 0.2,
                            }
                        );
                    }
                } else {
                    description.style.height = "0";
                }
            }
        });
        this._openAccordions.clear();
    }

    toggleAccordion(tab, forceOpen = false) {
        const description = tab.querySelector(".product-tabs__header-description");
        if (!description || description.textContent.trim().length === 0) return;

        const isOpen = tab.classList.contains("accordion-open");
        const mobileDescription = this.querySelector(
            ".product-tabs__header-description-mobile"
        );

        if (!isOpen || forceOpen) {
            tab.classList.add("accordion-open");
            description.classList.add("is-open");
            if (mobileDescription) {
                mobileDescription.innerHTML = description.innerHTML;
            }
            if (typeof Motion !== "undefined") {
                Motion.animate(
                    description,
                    {
                        opacity: [0, 1],
                        height: "auto",
                    },
                    { duration: 0.2 }
                );
                if (mobileDescription) {
                    Motion.animate(
                        mobileDescription,
                        {
                            opacity: [0, 1],
                        },
                        {
                            duration: 0.2,
                        }
                    );
                }
            } else {
                description.style.height = "auto";
            }
            this._openAccordions.add(tab.dataset.blockId);
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === "selected-tab" && oldValue !== newValue && oldValue !== null) {
            this.updateTabDisplay(newValue, true);
        }
    }

    updateTabDisplay(blockId, animate = true) {
        if (this._isAnimating) return;
        this._isAnimating = true;
        if (animate) {
            this.closeAllAccordions();
        }
        let activeTab = null;
        const slideSectionHeader = this.querySelector('.product-tabs__header-image-mobile');
        this.tabs.forEach((tab) => {
            const isSelected = tab.dataset.blockId === blockId;
            tab.classList.toggle("selected", isSelected);
            tab.classList.toggle("active", isSelected);
            tab.setAttribute("aria-selected", isSelected ? "true" : "false");
            if (isSelected) {
                activeTab = tab;
                const description = tab.querySelector(
                    ".product-tabs__header-description"
                );
                if (description && description.textContent.trim().length > 0) {
                    this.toggleAccordion(tab, true);
                }
                const position = tab.dataset.position;
                if (slideSectionHeader) {
                    slideSectionHeader.swiper.slideToLoop(position - 1, 300, true);
                }
            }
        });

        const oldContent = this.querySelector(".product-tabs__content-item.active");
        const newContent = this.querySelector(
            `.product-tabs__content-item[data-block-id="${blockId}"]`
        );

        if (!newContent) {
            this._isAnimating = false;
            return;
        }

        const initContentSwiper = () => {
            if (newContent) {
                const contentSlideSection = newContent.querySelector('slide-section');
                if (contentSlideSection && contentSlideSection.swiper) {
                    try {
                        if (contentSlideSection.swiper.initialized) {
                            contentSlideSection.swiper.update();
                        }
                        
                        setTimeout(() => {
                            if (contentSlideSection.swiper && contentSlideSection.swiper.initialized) {
                                contentSlideSection.swiper.update();
                            }
                        }, 10);
                    } catch(e) {
                    }
                }
            }
        };

        if (animate && typeof Motion !== "undefined" && oldContent !== newContent) {
            this.transition(oldContent, newContent).finally(() => {
                this._isAnimating = false;
                initContentSwiper();
            });
        } else {
            this.tabContents.forEach((content) => {
                content.classList.remove("active");
                content.classList.add("hidden");
            });

            newContent.classList.add("active");
            newContent.classList.remove("hidden");
            this._isAnimating = false;
            initContentSwiper();
        }

        this.dispatchEvent(
            new CustomEvent("tabChanged", {
                detail: { blockId },
                bubbles: true,
            })
        );
    }

    initContentSwipers() {
        this.tabContents.forEach(content => {
            const slideSection = content.querySelector('slide-section');
            if (slideSection && slideSection.swiper) {
                if (slideSection.swiper.initialized) {
                    slideSection.swiper.update();
                }
            }
        });
    }

    async transition(fromPanel, toPanel) {
        if (!fromPanel || !toPanel) return;
        if (fromPanel) {
            try {
                await Motion.animate(
                    fromPanel,
                    {
                        opacity: [1, 0],
                        y: [0, 15],
                    },
                    {
                        duration: 0.2,
                    }
                ).finished;
            } catch (e) {
                console.error("Animation error:", e);
            }
            fromPanel.classList.remove("active");
            fromPanel.classList.add("hidden");
        }
        toPanel.classList.add("active");
        toPanel.classList.remove("hidden");
        try {
            Motion.animate(
                toPanel,
                {
                    opacity: [0, 1],
                    y: [15, 0],
                },
                {
                    duration: 0.2,
                }
            );
        } catch (e) {
            console.error("Animation error:", e);
        }
      toPanel.querySelector("motion-items-effect")?.animateItems();
    }

    disconnectedCallback() {
        if (this._tabs) {
            this._tabs.forEach((tab) => {
                tab.removeEventListener("click", null);
            });
        }
        
        window.removeEventListener("resize", this.handleResize);
    }
}
if (!customElements.get("product-tabs")) {
    customElements.define("product-tabs", ProductTabs);
}

class SuitableFinder extends ProductTabs {
    constructor() {
        super();
        this._dot = this.querySelector(".product-tabs__dot");
        this._rangeSlider = this.querySelector("range-slider");
        this._sizeDot = this.dataset.sizeDot;
        this._isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        this._isDragging = false;
        
        this.handleDotMouseDown = this.handleDotMouseDown.bind(this);
        this.handleDotMouseMove = this.handleDotMouseMove.bind(this);
        this.handleDotMouseUp = this.handleDotMouseUp.bind(this);
        this.handleDotTouchStart = this.handleDotTouchStart.bind(this);
        this.handleDotTouchMove = this.handleDotTouchMove.bind(this);
        this.handleDotTouchEnd = this.handleDotTouchEnd.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this._isInitialized = false;
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", () => super.connectedCallback());
          }
    }
    
    connectedCallback() {
        super.connectedCallback();
        
        if (this._dot && this._rangeSlider) {
            const offsetWidth = this._tabHeaderContent.offsetWidth;
            this._rangeSlider.style.setProperty(
              "--width-range-slider",
              offsetWidth + "px"
            );
            this._dot.style.transition = "none";
            
            requestAnimationFrame(() => {
                this.setupDraggableDot();
                const activeTab = this.querySelector(".product-tabs__header-item.active");
                if (activeTab) {
                    this.updateDotPosition(activeTab, false);
                    
                    requestAnimationFrame(() => {
                        if (this._dot) {
                            this._dot.style.transition = "left 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)";
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
            const tabCenter = tabRect.left + tabRect.width / 2 - rangeSliderRect.left;
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

        if (this._animationFrameId) {
            cancelAnimationFrame(this._animationFrameId);
        }
        
        this._animationFrameId = requestAnimationFrame(() => {
            const rangeSliderRect = this._rangeSlider.getBoundingClientRect();
            const dotWidth = parseInt(this._sizeDot || 26, 10);

            let newPosition = this._currentPosition + (event.clientX - this._startPosition);

            newPosition = Math.max(
                0,
                Math.min(rangeSliderRect.width - dotWidth, newPosition)
            );

            this._dot.style.left = `${newPosition}px`;

            const dotCenter = newPosition + dotWidth / 2;
            this.activateTabWhileDragging(dotCenter);
        });
    }
    
    activateTabWhileDragging(position) {
        if (!this._tabPositions.length) return;

        let closestTab = null;
        let minDistance = Infinity;
        let activationThreshold = 30;

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

    handleDotMouseUp(event) {
        if (!this._isDragging) return;

        this._isDragging = false;
        this._dot.style.cursor = "grab";
        this._dot.style.transition = "left 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)";

        document.removeEventListener("mousemove", this.handleDotMouseMove);
        document.removeEventListener("mouseup", this.handleDotMouseUp);

        const activeTab = this.querySelector(".product-tabs__header-item.active");
        if (activeTab) {
            this.updateDotPosition(activeTab, false);
        }
    }

    handleDotTouchStart(event) {
        if (event.touches.length !== 1) return;

        event.preventDefault();
        this._isDragging = true;
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

            let newPosition = this._currentPosition + (event.touches[0].clientX - this._startPosition);

            newPosition = Math.max(0, Math.min(rangeSliderRect.width - dotWidth, newPosition));

            this._dot.style.left = `${newPosition}px`;

            const dotCenter = newPosition + dotWidth / 2;
            this.activateTabWhileDragging(dotCenter);
        });
    }

    handleDotTouchEnd(event) {
        if (!this._isDragging) return;

        this._isDragging = false;
        this._dot.style.transition = "left 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)";

        document.removeEventListener("touchmove", this.handleDotTouchMove);
        document.removeEventListener("touchend", this.handleDotTouchEnd);

        const activeTab = this.querySelector(".product-tabs__header-item.active");
        if (activeTab) {
            this.updateDotPosition(activeTab, false);
        }
    }

    handleResize() {
        super.handleResize();
        this.tabContents.forEach(content => {
            if (content.classList.contains('active')) {
                const slideSection = content.querySelector('slide-section');
                if (slideSection && slideSection.swiper && slideSection.swiper.initialized) {
                    slideSection.swiper.update();
                }
            }
        });
        
        if (!this._rangeSlider) return;

        if (this._rangeSlider.offsetParent === null || !this.isInViewport(this._rangeSlider)) {
            return;
        }

        this.calculateTabPositions();

        const activeTab = this.querySelector(".product-tabs__header-item.active");
        if (activeTab) {
            this.updateDotPosition(activeTab, false);
        }
    }
    
    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.bottom >= 0
        );
    }
    
    updateDotPosition(activeTab, animate = true) {
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
        
        this._rangeSlider.style.setProperty(
            "--progress-width",
            `${adjustedPosition}px`
        );

        if (!animate || !this._isInitialized) {
            this._dot.style.transition = "none";
            this._dot.style.left = `${adjustedPosition}px`;
            
            if (!animate) {
                void this._dot.offsetWidth;
            }
        } else {
            this._dot.style.transition = "left 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)";
            this._dot.style.left = `${adjustedPosition}px`;
        }
    }
    
    updateTabDisplay(blockId, animate = true) {
        super.updateTabDisplay(blockId, animate);
        
        if (this._rangeSlider) {
            const activeTab = this.querySelector(".product-tabs__header-item.active");
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
        
        window.removeEventListener("resize", this.handleResize, { passive: true });
        window.removeEventListener("scroll", this.calculateTabPositions.bind(this));
    }
}
if (!customElements.get("suitable-finder")) {
    customElements.define("suitable-finder", SuitableFinder);
}