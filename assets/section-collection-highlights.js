class CollectionHover extends HTMLElement {
  constructor() {
    super();
    this.content = this.querySelector(".collection-list__content");
    this.imageHover = this.querySelector(".collection-list__image-hover");
    this.mousePosition = { x: 0, y: 0 };
    this.isHovering = false;
    this.bounds = null;
    this.imageVisible = false;
    this.animationId = null;
    this.cursorOffset = { x: 10, y: 10 };
  }

  connectedCallback() {
    if (!this.content || !this.imageHover) return;

    this.setupImageStyles();

    this.content.addEventListener("mouseenter", this.onMouseEnter.bind(this));
    this.content.addEventListener("mouseleave", this.onMouseLeave.bind(this));
    this.content.addEventListener("mousemove", this.onMouseMove.bind(this));

    const image = this.imageHover.querySelector("img");
    if (image && !image.complete) {
      image.addEventListener("load", () => {
        this.updateImageSize();
      });
    } else {
      this.updateImageSize();
    }
  }

  setupImageStyles() {
    if (!this.imageHover) return;

    this.imageHover.style.position = "fixed";
    this.imageHover.style.pointerEvents = "none";
    this.imageHover.style.zIndex = "100";
    this.imageHover.style.opacity = "0";
    this.imageHover.style.transform = "translate(-50%, -50%) scale(0.95)";
    this.imageHover.style.overflow = "hidden";

    this.imageHover.style.left = "-9999px";
    this.imageHover.style.top = "-9999px";

    this.imageHover.style.transition = "none";
  }

  updateImageSize() {
    const maxHeight = Math.min(300, window.innerHeight * 0.5);

    this.imageHover.style.width = `120px`;
    this.imageHover.style.height = "auto";
    this.imageHover.style.maxHeight = `${maxHeight}px`;
  }

  onMouseEnter(event) {
    this.isHovering = true;
    this.bounds = this.content.getBoundingClientRect();

    this.updateMousePosition(event);

    if (!this.imageVisible && this.imageHover) {
      this.positionImageAtCursor();
      setTimeout(() => {
        this.imageHover.style.transition =
          "opacity 0.1s ease, transform 0.1s ease";
      }, 10);

      this.imageVisible = true;

      if (typeof Motion !== "undefined") {
        Motion.animate(
          this.imageHover,
          {
            opacity: [0, 1],
            scale: [0.7, 1],
          },
          {
            duration: 0.3,
            easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          }
        );
      }

      this.animateImagePosition();
    }
  }

  positionImageAtCursor() {
    if (!this.mousePosition || !this.bounds) return;

    const x = this.mousePosition.x + this.cursorOffset.x;
    const y = this.mousePosition.y + this.cursorOffset.y;

    const centerX = this.bounds.left + this.bounds.width / 2;
    const centerY = this.bounds.top + this.bounds.height / 2;

    const pullFactor = 0.1;
    const finalX = x + (centerX - x) * pullFactor;
    const finalY = y + (centerY - y) * pullFactor;

    this.imageHover.style.left = `${finalX}px`;
    this.imageHover.style.top = `${finalY}px`;
  }

  onMouseLeave() {
    this.isHovering = false;

    if (this.imageVisible && this.imageHover) {
      this.imageVisible = false;

      if (typeof Motion !== "undefined") {
        Motion.animate(
          this.imageHover,
          {
            opacity: [1, 0],
            scale: [1, 0.7],
          },
          {
            duration: 0.3,
            easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          }
        );
      }

      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }

      setTimeout(() => {
        if (!this.isHovering) {
          this.imageHover.style.left = "-9999px";
          this.imageHover.style.top = "-9999px";
        }
      }, 300);
    }
  }

  onMouseMove(event) {
    if (this.isHovering) {
      this.updateMousePosition(event);
    }
  }

  updateMousePosition(event) {
    this.mousePosition = {
      x: event.clientX,
      y: event.clientY,
    };
  }

  animateImagePosition() {
    if (!this.isHovering || !this.imageVisible) {
      return;
    }

    const x = this.mousePosition.x + this.cursorOffset.x;
    const y = this.mousePosition.y + this.cursorOffset.y;

    const centerX = this.bounds.left + this.bounds.width / 2;
    const centerY = this.bounds.top + this.bounds.height / 2;

    const pullFactor = 0.1;
    const finalX = x + (centerX - x) * pullFactor;
    const finalY = y + (centerY - y) * pullFactor;

    this.imageHover.style.left = `${finalX}px`;
    this.imageHover.style.top = `${finalY}px`;

    const image = this.imageHover.querySelector("img");
    if (image) {
      const relX =
        (this.mousePosition.x - this.bounds.left) / this.bounds.width;
      const relY =
        (this.mousePosition.y - this.bounds.top) / this.bounds.height;

      const moveX = (relX - 0.5) * -6;
      const moveY = (relY - 0.5) * -6;

      image.style.transform = `translate(${moveX}%, ${moveY}%)`;
      image.style.transition = "transform 0.2s ease-out";
    }

    this.animationId = requestAnimationFrame(
      this.animateImagePosition.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.content) {
      this.content.removeEventListener("mouseenter", this.onMouseEnter);
      this.content.removeEventListener("mouseleave", this.onMouseLeave);
      this.content.removeEventListener("mousemove", this.onMouseMove);
    }

    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

customElements.define("collection-hover", CollectionHover);