function throttle(func, delay) {
  let lastCall = 0;
  let timeout;
  return function (...args) {
    const now = Date.now();
    if (now - lastCall < delay) {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        lastCall = now;
        func.apply(this, args);
      }, delay - (now - lastCall));
    } else {
      lastCall = now;
      func.apply(this, args);
    }
  };
}


if (!customElements.get("content-effect")) {
  customElements.define(
    "content-effect",
    class ContentEffect extends HTMLElement {
      constructor() {
        super();
        this.infoElements = this.querySelectorAll(".block__information_text");
        this.initialized = false;
        this.isVisible = false;
      }

      connectedCallback() {
        if (Shopify.visualPreviewMode) {
          return;
        }
        const mediaQuery = window.matchMedia("(max-width: 1024.98px)");
        const handleMediaQueryChange = throttle((mediaQuery) => {
          if (mediaQuery.matches) {
            this.initializeMobile();
          } else {
            if (document.readyState === "loading") {
              document.addEventListener("DOMContentLoaded", () =>
                this.initialize()
              );
            } else {
              this.initialize();
            }
            this.querySelectorAll(".information-text__content").forEach(
              (element) => {
                if (element.classList.contains("cloned-content")) {
                  element.remove();
                }
              }
            );
            this.classList.add("block");
            this.classList.remove("flex");
          }
        }, 100);

        handleMediaQueryChange(mediaQuery);
        mediaQuery.addEventListener("change", () =>
          handleMediaQueryChange(mediaQuery)
        );
      }

      initialize() {
        if (this.initialized) return;
        if (this.infoElements.length === 0) return;

        this.setupInitialStates();
        this.setupScrollObserver();
        this.initialized = true;
      }

      initializeMobile() {
        if (this.infoElements.length === 0) return;
        const parentContainer = this;
        if (parentContainer) {
          const contentElements = this.querySelectorAll(
            ".information-text__content"
          );
          if (contentElements.length > 0) {
            for (let i = 0; i < 4; i++) {
              const originalElement =
                contentElements[i % contentElements.length];
              if (originalElement) {
                const clonedElement = originalElement.cloneNode(true);
                clonedElement.classList.add("cloned-content");
                clonedElement.dataset.cloneIndex = i;
                parentContainer.appendChild(clonedElement);
              }
            }
          }
          this.infoElements.forEach((element) => {
            element.style.opacity = "1";
            element.style.transform = "unset";
          });
          this.classList.remove("block");
          this.classList.add("flex");
        }
      }

      setupInitialStates() {
        this.infoElements.forEach((element) => {
          element.style.opacity = "0";
          if (typeof Motion === "undefined") {
            element.style.transition =
              "opacity 0.8s ease-out, transform 0.8s cubic-bezier(0.17, 0.67, 0.3, 1.33)";
          }
        });
      }

      setupScrollObserver() {
        const options = {
          root: null,
          rootMargin: "0px",
          threshold: 0.2,
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !this.isVisible) {
              this.isVisible = true;
              this.playEntranceAnimation();
            }
          });
        }, options);
        this.observer = observer;
        observer.observe(this);
      }

      playEntranceAnimation() {
        this.infoElements.forEach((element, index) => {
          const pairIndex = Math.floor(index / 2);
          const delay = pairIndex * 0.1;

          const isEven = index % 2 === 0;
          const startX = isEven ? -40 : 40;

          Motion.animate(
            element,
            {
              opacity: [0, 1],
              x: [0, startX],
            },
            {
              delay: delay,
              duration: 0.3,
              easing: "cubic-bezier(0.17, 0.67, 0.3, 1.33)",
              onComplete: () => {
                element.style.opacity = "1";
                element.style.transform = "translateX(0)";
              },
            }
          );
        });
      }

      disconnectedCallback() {
        if (this.observer) {
          this.observer.disconnect();
          this.observer = null;
        }
      }
    }
  );
}
