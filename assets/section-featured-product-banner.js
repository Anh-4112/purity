class MediaEffect extends HTMLElement {
  constructor() {
    super();
    this.mousePosition = { x: 0, y: 0 };
    this.isHovering = false;
    this.elements = Array.from(this.querySelectorAll(".media-effect__item"));
    this.container = this.closest(".section-featured-product-banner") || this;
    this.bounds = null;
    this.speedFactors = [0.04, 0.06, 0.08, 0.1];
    this.initialized = false;
    this.isVisible = false;
    this.autoAnimateTimeout = null;
    this.lastAutoAnimateTime = 0;

    this.pointerX = null;
    this.pointerY = null;
    this.initialPositions = [];
  }

  connectedCallback() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.initialize());
    } else {
      this.initialize();
    }
  }

  initialize() {
    if (this.initialized) return;

    if (!this.elements.length) {
      this.elements = Array.from(this.querySelectorAll(".media-effect__item"));
    }

    if (this.elements.length === 0) return;
    if (
      typeof Motion !== "undefined" &&
      typeof Motion.motionValue === "function"
    ) {
      this.setupMotionValues();
    }
    this.setupElementStyles();
    this.setupInitialPositions();
    this.container.addEventListener("mouseenter", this.onMouseEnter.bind(this));
    this.container.addEventListener("mouseleave", this.onMouseLeave.bind(this));
    this.container.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.setupScrollObserver();
    this.initialized = true;
  }

  setupMotionValues() {
    this.pointerX = Motion.motionValue(0);
    this.pointerY = Motion.motionValue(0);
    this.pointerX.on("change", () => this.scheduleSpringAnimation());
    this.pointerY.on("change", () => this.scheduleSpringAnimation());
  }

  setupInitialPositions() {
    this.initialPositions = this.elements.map((element) => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    });
  }

  scheduleSpringAnimation() {
    if (!this.isHovering) return;
    if (typeof Motion !== "undefined" && Motion.frame) {
      Motion.frame.postRender(() => this.applySpringAnimation());
    } else {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
      }
      this.animationId = requestAnimationFrame(() =>
        this.applySpringAnimation()
      );
    }
  }

  applySpringAnimation() {
    if (!this.isHovering || !this.pointerX || !this.pointerY) return;

    const mouseX = this.pointerX.get();
    const mouseY = this.pointerY.get();

    this.bounds = this.container.getBoundingClientRect();
    const centerX = this.bounds.left + this.bounds.width / 2;
    const centerY = this.bounds.top + this.bounds.height / 2;

    const relativeX = (mouseX - centerX) / (this.bounds.width / 2);
    const relativeY = (mouseY - centerY) / (this.bounds.height / 2);

    this.elements.forEach((element, index) => {
      if (!element.dataset.factorRandomX) {
        element.dataset.factorRandomX = (0.7 + Math.random() * 0.6).toFixed(2);
        element.dataset.factorRandomY = (0.7 + Math.random() * 0.6).toFixed(2);
        element.dataset.offsetX = (Math.random() * 20 - 10).toFixed(1);
        element.dataset.offsetY = (Math.random() * 20 - 10).toFixed(1);
        element.dataset.angleOffset = (Math.random() * 0.4 - 0.2).toFixed(2);
      }

      const speedFactor =
        parseFloat(element.dataset.speedFactor) ||
        this.speedFactors[index % this.speedFactors.length];
      const factorRandomX = parseFloat(element.dataset.factorRandomX);
      const factorRandomY = parseFloat(element.dataset.factorRandomY);
      const offsetX = parseFloat(element.dataset.offsetX);
      const offsetY = parseFloat(element.dataset.offsetY);
      const angleOffset = parseFloat(element.dataset.angleOffset);

      const rotatedX =
        relativeX * Math.cos(angleOffset) - relativeY * Math.sin(angleOffset);
      const rotatedY =
        relativeX * Math.sin(angleOffset) + relativeY * Math.cos(angleOffset);

      const targetX =
        rotatedX * speedFactor * this.bounds.width * factorRandomX + offsetX;
      const targetY =
        rotatedY * speedFactor * this.bounds.height * factorRandomY + offsetY;

      if (
        typeof Motion !== "undefined" &&
        typeof Motion.animate === "function"
      ) {
        Motion.animate(
          element,
          {
            x: targetX,
            y: targetY,
          },
          {
            type: "spring",
            stiffness: 100 + (index % 3) * 30,
            damping: 15 + (index % 2) * 5,
            restSpeed: 0.001,
          }
        );
      } else {
        element.style.transform = `translate(${targetX}px, ${targetY}px)`;
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
        if (entry.isIntersecting) {
          this.isVisible = true;
          this.playEntranceAnimation();
          this.startRandomMovement();
        } else {
          this.isVisible = false;
          this.stopRandomMovement();
        }
      });
    }, options);

    observer.observe(this.container);
  }

  playEntranceAnimation() {
    this.elements.forEach((element, index) => {
      const delay = index * 0.1;
      Motion.animate(
        element,
        {
          opacity: [0, 1],
          y: [20, 0],
          scale: [0.95, 1],
        },
        {
          duration: 0.6,
          delay: delay,
          easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        }
      );
    });
  }

  startRandomMovement() {
    if (!this.isVisible) return;

    setTimeout(() => {
      this.triggerRandomMovement();
    }, this.elements.length * 100 + 500);
  }

  stopRandomMovement() {
    if (this.autoAnimateTimeout) {
      clearTimeout(this.autoAnimateTimeout);
      this.autoAnimateTimeout = null;
    }

    this.elements.forEach((element) => {
      Motion.animate(
        element,
        {
          x: 0,
          y: 0,
        },
        {
          duration: 0.3,
          easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
        }
      );
    });
  }

  triggerRandomMovement() {
    if (!this.isVisible || this.isHovering) return;

    const now = Date.now();
    if (now - this.lastAutoAnimateTime < 1500) {
      this.scheduleNextRandomMovement();
      return;
    }

    this.lastAutoAnimateTime = now;

    const randomX = Math.random() * 1.2 - 0.6;
    const randomY = Math.random() * 1.2 - 0.6;

    this.elements.forEach((element, index) => {
      if (!element.dataset.factorRandomX) {
        element.dataset.factorRandomX = (0.8 + Math.random() * 0.4).toFixed(2);
        element.dataset.factorRandomY = (0.8 + Math.random() * 0.4).toFixed(2);
        element.dataset.offsetX = (Math.random() * 10 - 5).toFixed(1);
        element.dataset.offsetY = (Math.random() * 10 - 5).toFixed(1);
        element.dataset.angleOffset = (Math.random() * 0.2 - 0.1).toFixed(2);
      }

      const speedFactor = parseFloat(element.dataset.speedFactor) || 0.03;
      const factorRandomX = parseFloat(element.dataset.factorRandomX);
      const factorRandomY = parseFloat(element.dataset.factorRandomY);
      const angleOffset = parseFloat(element.dataset.angleOffset);

      const softnessFactor = 0.8;

      const rotatedX =
        randomX * Math.cos(angleOffset) - randomY * Math.sin(angleOffset);
      const rotatedY =
        randomX * Math.sin(angleOffset) + randomY * Math.cos(angleOffset);

      const moveX =
        rotatedX *
        speedFactor *
        this.container.offsetWidth *
        0.3 *
        factorRandomX *
        softnessFactor;
      const moveY =
        rotatedY *
        speedFactor *
        this.container.offsetHeight *
        0.3 *
        factorRandomY *
        softnessFactor;

      Motion.animate(
        element,
        {
          x: moveX,
          y: moveY,
        },
        {
          type: "spring",
          stiffness: 25 + Math.random() * 15,
          damping: 15 + Math.random() * 10,
          duration: 2 + Math.random() * 1,
          restDelta: 0.001,
          restSpeed: 0.001,
        }
      );
    });

    this.scheduleNextRandomMovement();
  }

  scheduleNextRandomMovement() {
    const nextDelay = 3000 + Math.random() * 4000;

    if (this.autoAnimateTimeout) {
      clearTimeout(this.autoAnimateTimeout);
    }

    this.autoAnimateTimeout = setTimeout(() => {
      this.triggerRandomMovement();
    }, nextDelay);
  }

  setupElementStyles() {
    this.elements.forEach((element, index) => {
      const position = window.getComputedStyle(element).position;
      if (position === "static") {
        element.style.position = "relative";
      }

      if (typeof Motion === "undefined") {
        element.style.transition = "transform 0.8s ease-out";
      }

      element.style.opacity = "0";
      element.dataset.speedFactor =
        this.speedFactors[index % this.speedFactors.length];

      element.removeAttribute("data-factor-random-x");
      element.removeAttribute("data-factor-random-y");
      element.removeAttribute("data-offset-x");
      element.removeAttribute("data-offset-y");
      element.removeAttribute("data-angle-offset");
    });
  }

  onMouseEnter(event) {
    this.isHovering = true;
    this.bounds = this.container.getBoundingClientRect();

    this.updateMousePosition(event);

    if (this.autoAnimateTimeout) {
      clearTimeout(this.autoAnimateTimeout);
      this.autoAnimateTimeout = null;
    }
  }

  onMouseLeave() {
    this.isHovering = false;

    this.elements.forEach((element) => {
      Motion.animate(
        element,
        {
          x: 0,
          y: 0,
        },
        {
          type: "spring",
          stiffness: 200,
          damping: 20,
        }
      );
    });

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    if (this.isVisible) {
      this.scheduleNextRandomMovement();
    }
  }

  onMouseMove(event) {
    this.updateMousePosition(event);

    if (this.pointerX && this.pointerY) {
      this.pointerX.set(event.clientX);
      this.pointerY.set(event.clientY);
    } else {
      this.startAnimation();
    }
  }

  updateMousePosition(event) {
    const rect = this.bounds || this.container.getBoundingClientRect();
    this.mousePosition = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  startAnimation() {
    if (!this.isHovering || (this.pointerX && this.pointerY)) return;

    const centerX = this.bounds.width / 2;
    const centerY = this.bounds.height / 2;

    const relativeX = (this.mousePosition.x - centerX) / centerX;
    const relativeY = (this.mousePosition.y - centerY) / centerY;

    this.elements.forEach((element, index) => {
      const speedFactor = parseFloat(element.dataset.speedFactor) || 0.04;
      const moveX = relativeX * speedFactor * this.bounds.width;
      const moveY = relativeY * speedFactor * this.bounds.height;

      element.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });

    this.animationId = requestAnimationFrame(this.startAnimation.bind(this));
  }

  disconnectedCallback() {
    if (this.container) {
      this.container.removeEventListener("mouseenter", this.onMouseEnter);
      this.container.removeEventListener("mouseleave", this.onMouseLeave);
      this.container.removeEventListener("mousemove", this.onMouseMove);
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }

    if (this.autoAnimateTimeout) {
      clearTimeout(this.autoAnimateTimeout);
    }

    if (this.pointerX) {
      this.pointerX.clearListeners();
    }

    if (this.pointerY) {
      this.pointerY.clearListeners();
    }
  }
}

customElements.define("media-effect", MediaEffect);

class ContentEffect extends HTMLElement {
  constructor() {
    super();
    this.infoElements = this.querySelectorAll(".block__information_text");
    this.initialized = false;
    this.isVisible = false;
  }

  connectedCallback() {
    const mediaQuery = window.matchMedia("(max-width: 1024.98px)");
    const handleMediaQueryChange = (mediaQuery) => {
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
        this.querySelectorAll(".information-text__content").forEach((element) => {
          if (element.classList.contains("cloned-content")) {
            element.remove();
          }
        });
        this.classList.add("block");
        this.classList.remove("flex");
      }
    };
    handleMediaQueryChange(mediaQuery);
    mediaQuery.addEventListener("change", handleMediaQueryChange);
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
          const originalElement = contentElements[i % contentElements.length];
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
    }
  }
}

customElements.define("content-effect", ContentEffect);
