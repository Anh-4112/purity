export class LazyLoadEventHover {
  constructor(e) {
    (this.triggerEventsJs = e),
      (this.eventOptionsJs = { passive: !0 }),
      (this.userEventListenerJs = this.triggerListenerJs.bind(this)),
      (this.delayedScriptsJs = { normal: [], async: [], defer: [] });
  }
  triggerListenerJs() {
    this._removeUserInteractionListenerJs(this),
      "loading" === document.readyState
        ? document.addEventListener(
            "DOMContentLoaded",
            this._loadEverythingReadyNow.bind(this)
          )
        : this._loadEverythingReadyNow();
  }
  _removeUserInteractionListenerJs(e) {
    this.triggerEventsJs.forEach((t) =>
      window.removeEventListener(t, e.userEventListenerJs, e.eventOptionsJs)
    );
  }
  _addUserInteractionListenerJs(e) {
    this.triggerEventsJs.forEach((t) =>
      window.addEventListener(t, e.userEventListenerJs, e.eventOptionsJs)
    );
  }
  _preloadAllScriptsJs() {
    // this.initLazyLoadImage();
  }

  initLazyLoadImage() {
    const lazyImage = document.querySelectorAll(".image-lazy-load");
    lazyImage.forEach((entry) => {
      const imgElement = entry;
      const pictureElement = imgElement.closest("picture");
      if (pictureElement) {
        const sourceElement = pictureElement.querySelector("source");
        const imgSourceSrcset = sourceElement.dataset.srcset;
        if (imgSourceSrcset) {
          sourceElement.setAttribute("srcset", imgSourceSrcset);
          sourceElement.removeAttribute("data-srcset");
        }
      }
      const imgSrcset = imgElement.dataset.srcset;
      if (imgSrcset) {
        imgElement.setAttribute("srcset", imgSrcset);
        imgElement.removeAttribute("data-srcset");
        imgElement.classList.add("lazy-loaded");
      }
    });
  }

  async _loadEverythingReadyNow() {
    this._preloadAllScriptsJs(),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.normal),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.defer),
      await this._loadScriptsFromListJs(this.delayedScriptsJs.async),
      await this._triggerDOMContentLoadedJs(),
      await this._triggerWindowLoadJs(),
      window.dispatchEvent(new Event("nextskyspeed-allScriptsLoaded"));
  }
  async _loadScriptsFromListJs(e) {
    const t = e.shift();
    return t
      ? (await this._transformScript(t), this._loadScriptsFromListJs(e))
      : Promise.resolve();
  }
  async _transformScript(e) {
    return (
      await this._requestAnimFrame(),
      new Promise((t) => {
        const s = document.createElement("script");
        let n;
        [...e.attributes].forEach((e) => {
          let t = e.nodeName;
          "type" !== t &&
            ("data-nextskylazy-type" === t && ((t = "type"), (n = e.nodeValue)),
            s.setAttribute(t, e.nodeValue));
        }),
          e.hasAttribute("src")
            ? (s.addEventListener("load", t), s.addEventListener("error", t))
            : ((s.text = e.text), t()),
          e.parentNode.replaceChild(s, e);
      })
    );
  }
  async _triggerDOMContentLoadedJs() {
    (this.domReadyFired = !0),
      await this._requestAnimFrame(),
      document.dispatchEvent(new Event("nextskyspeed-DOMContentLoaded")),
      await this._requestAnimFrame(),
      window.dispatchEvent(new Event("nextskyspeed-DOMContentLoaded")),
      await this._requestAnimFrame(),
      document.dispatchEvent(new Event("nextskyspeed-readystatechange")),
      await this._requestAnimFrame(),
      document.nextskyonreadystatechange &&
        document.nextskyonreadystatechange();
  }
  async _triggerWindowLoadJs() {
    await this._requestAnimFrame(),
      window.dispatchEvent(new Event("nextskyspeed-load")),
      await this._requestAnimFrame(),
      window.nextskyonload && window.nextskyonload(),
      await this._requestAnimFrame(),
      window.dispatchEvent(new Event("nextskyspeed-pageshow")),
      await this._requestAnimFrame(),
      window.nextskyonpageshow && window.nextskyonpageshow();
  }
  async _requestAnimFrame() {
    return new Promise((e) => requestAnimationFrame(e));
  }
  static run() {
    const e = new LazyLoadEventHover([
      "keydown",
      "mousemove",
      "touchmove",
      "touchstart",
      "touchend",
      "wheel",
    ]);
    e._addUserInteractionListenerJs(e);
  }
}

export class LazyLoader {
  constructor(selector, rootMargin = "200px") {
    this.lazyImages = document.querySelectorAll(selector);
    this.rootMargin = rootMargin;
    this.observer = null;
    this.init();
  }

  init() {
    // this.createObserver();
    // this.observeImages();
    // this.addScrollListener();
  }

  createObserver() {
    this.observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const imgElement = entry.target;
            const pictureElement = imgElement.closest("picture");
            if (pictureElement) {
              const sourceElement = pictureElement.querySelector("source");
              const imgSourceSrcset = sourceElement.dataset.srcset;
              if (imgSourceSrcset) {
                sourceElement.setAttribute("srcset", imgSourceSrcset);
                sourceElement.removeAttribute("data-srcset");
              }
            }
            const imgSrcset = imgElement.dataset.srcset;
            if (imgSrcset) {
              imgElement.setAttribute("srcset", imgSrcset);
              imgElement.removeAttribute("data-srcset");
              imgElement.classList.remove("image-lazy-load");
              imgElement.classList.add("image-lazy-loaded");
            }
            observer.unobserve(imgElement);
          }
        });
      },
      {
        rootMargin: this.rootMargin,
      }
    );
  }

  observeImages() {
    this.lazyImages.forEach((imgElement) => {
      this.observer.observe(imgElement);
    });
  }

  addScrollListener() {
    window.addEventListener("scroll", () => {
      this.lazyImages.forEach((imgElement) => {
        const imgSrcset = imgElement.dataset.srcset;
        if (imgSrcset) {
          imgElement.setAttribute("srcset", imgSrcset);
          imgElement.removeAttribute("data-srcset");
          imgElement.classList.remove("image-lazy-load");
          imgElement.classList.add("image-lazy-loaded");
        }
      });
    });
  }
}
