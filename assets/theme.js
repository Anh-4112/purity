import { SlideSection } from "module-slide";
import * as AddToCart from "module-addToCart";
import * as global from "global";

const delegate = new global.eventDelegate();

class BackToTop extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.backToTop.bind(this), false);
  }

  connectedCallback() {
    window.addEventListener("scroll", this.updateScrollPercentage.bind(this));
  }

  backToTop() {
    if (document.documentElement.scrollTop > 0 || document.body.scrollTop > 0) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }

  updateScrollPercentage() {
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight;
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const clientHeight =
      document.documentElement.clientHeight || document.body.clientHeight;
    const scrollPercentage = (scrollTop / (scrollHeight - clientHeight)) * 100;
    this.style.setProperty(
      "--scroll-percentage",
      scrollPercentage.toFixed(2) + "%"
    );
    if (scrollTop > 200) {
      this.classList.add("show");
    } else {
      this.classList.remove("show");
    }
  }
}
customElements.define("back-to-top", BackToTop);

class ToggleMenu extends HTMLElement {
  constructor() {
    super();
    this.container = this.closest(".header__inner");
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
  }
  onClick(e) {
    e.preventDefault();
    const menu_drawer = this.closest(".header-wrapper").querySelector(
      "template.menu-drawer"
    );
    if (menu_drawer) {
      const content = document.createElement("div");
      content.appendChild(
        menu_drawer.content.firstElementChild.cloneNode(true)
      );
      global.body.appendChild(content.querySelector("menu-drawer"));
    }
    setTimeout(
      () =>
        global.eventModal(document.querySelector("menu-drawer"), "open", true),
      100
    );
  }
}
customElements.define("toggle-menu", ToggleMenu);

class ModalOverlay extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.parentElement.addEventListener(
      "keyup",
      (event) => event.code.toUpperCase() === "ESCAPE" && this.onClick()
    );
    this.addEventListener("click", this.onClick.bind(this), false);
  }
  onClick(e) {
    global.eventModal(this, "close");
  }
}
customElements.define("modal-overlay", ModalOverlay);

class ButtonCloseModel extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
  }
  onClick(e) {
    global.eventModal(this, "close");
    const details = this.closest(".details-header-menu");
    if (details) {
      details.classList.remove("detail-open"),
        this.removeAttribute("open"),
        this.firstElementChild.removeAttribute("open"),
        this.lastElementChild.removeAttribute("open");
    }
  }
}
customElements.define("button-close-model", ButtonCloseModel, {
  extends: "button",
});

const megaMenuCount = new WeakMap();
class DetailsMegaMenu extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = this.firstElementChild),
      (this.contentElement = this.lastElementChild),
      (this._open = this.hasAttribute("open")),
      (this.header = document.querySelector("header")),
      this.summaryElement.addEventListener(
        "click",
        this.onSummaryClicked.bind(this)
      ),
      (this.detectClickOutsideListener = this.detectClickOutside.bind(this)),
      (this.detectEscKeyboardListener = this.detectEscKeyboard.bind(this)),
      (this.detectFocusOutListener = this.detectFocusOut.bind(this)),
      (this.detectHoverListener = this.detectHover.bind(this)),
      this.addEventListener("mouseenter", this.detectHoverListener.bind(this)),
      this.addEventListener("mouseleave", this.detectHoverListener.bind(this));
    if (this.querySelector(".back-menu")) {
      this.querySelector(".back-menu").addEventListener(
        "click",
        this.onSummaryClicked.bind(this)
      );
    }
  }
  set open(value) {
    value !== this._open &&
      ((this._open = value),
      this.isConnected
        ? this.transition(value)
        : value
        ? this.setAttribute("open", "")
        : this.removeAttribute("open"));
  }
  get open() {
    return this._open;
  }
  get menuTrigger() {
    return this.header.hasAttribute("data-menu-trigger")
      ? this.header.getAttribute("data-menu-trigger")
      : "click";
  }
  onSummaryClicked(event) {
    event.preventDefault(),
      this.menuTrigger === "hover" &&
      this.summaryElement.hasAttribute("data-href") &&
      this.summaryElement.getAttribute("data-href").length > 0
        ? (window.location.href = this.summaryElement.getAttribute("data-href"))
        : (this.open = !this.open);
  }
  async transition(value) {
    return value
      ? (megaMenuCount.set(
          DetailsMegaMenu,
          megaMenuCount.get(DetailsMegaMenu) + 1
        ),
        this.setAttribute("open", ""),
        this.summaryElement.setAttribute("open", ""),
        setTimeout(() => this.contentElement.setAttribute("open", ""), 100),
        document.addEventListener("click", this.detectClickOutsideListener),
        document.addEventListener("keydown", this.detectEscKeyboardListener),
        document.addEventListener("focusout", this.detectFocusOutListener),
        this.classList.add("detail-open"))
      : (megaMenuCount.set(
          DetailsMegaMenu,
          megaMenuCount.get(DetailsMegaMenu) - 1
        ),
        this.summaryElement.removeAttribute("open"),
        this.contentElement.removeAttribute("open"),
        document.removeEventListener("click", this.detectClickOutsideListener),
        document.removeEventListener("keydown", this.detectEscKeyboardListener),
        document.removeEventListener("focusout", this.detectFocusOutListener),
        this.classList.remove("detail-open"),
        this.open || setTimeout(() => this.removeAttribute("open"), 400));
  }
  detectClickOutside(event) {
    !this.contains(event.target) &&
      !(event.target.closest("details") instanceof DetailsMegaMenu) &&
      (this.open = !1);
  }
  detectEscKeyboard(event) {
    if (event.code === "Escape") {
      const targetMenu = event.target.closest("details[open]");
      targetMenu && (targetMenu.open = !1);
    }
  }
  detectFocusOut(event) {
    event.relatedTarget &&
      !this.contains(event.relatedTarget) &&
      (this.open = !1);
  }
  detectHover(event) {
    this.menuTrigger !== "hover" ||
      (event.type === "mouseenter" ? (this.open = !0) : (this.open = !1));
  }
}
customElements.define("details-mega-menu", DetailsMegaMenu, {
  extends: "details",
}),
  megaMenuCount.set(DetailsMegaMenu, 0);

class SubMenuDetails extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = this.firstElementChild),
      (this.contentElement = this.lastElementChild),
      (this._open = this.hasAttribute("open")),
      (this.content =
        this.closest(".menu-link").querySelector(".sub-children-menu")),
      this.summaryElement.addEventListener(
        "click",
        this.onSummaryClicked.bind(this)
      );
  }

  get open() {
    return this._open;
  }

  set open(value) {
    value !== this._open &&
      ((this._open = value),
      this.isConnected
        ? this.transition(value)
        : value
        ? this.setAttribute("open", "")
        : this.removeAttribute("open"));
  }

  onSummaryClicked(event) {
    event.preventDefault(),
      !event.target.closest(".toggle-menu") &&
      this.summaryElement.hasAttribute("data-href") &&
      this.summaryElement.getAttribute("data-href").length > 0
        ? (window.location.href = this.summaryElement.getAttribute("data-href"))
        : (this.open = !this.open);
  }

  async transition(value) {
    return value
      ? (Motion.animate(
          this.content,
          true ? { height: "auto" } : { height: 0 },
          { duration: 0.25 }
        ),
        this.setAttribute("open", ""))
      : (Motion.animate(
          this.content,
          false ? { height: "auto" } : { height: 0 },
          { duration: 0.25 }
        ),
        this.removeAttribute("open"));
  }
}
customElements.define("submenu-details", SubMenuDetails, {
  extends: "details",
});

class CollapsibleRowDetails extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = this.firstElementChild),
      (this.contentElement = this.lastElementChild),
      (this._open = this.hasAttribute("open")),
      (this.content = this.querySelector(".collapsible-row__content")),
      this.summaryElement.addEventListener(
        "click",
        this.onSummaryClicked.bind(this)
      );
  }

  get open() {
    return this._open;
  }

  set open(value) {
    value !== this._open &&
      ((this._open = value),
      this.isConnected
        ? this.transition(value)
        : value
        ? this.setAttribute("open", "")
        : this.removeAttribute("open"));
  }

  onSummaryClicked(event) {
    event.preventDefault(), (this.open = !this.open);
  }

  async transition(value) {
    return value
      ? (Motion.animate(
          this.content,
          true ? { height: "auto" } : { height: 0 },
          { duration: 0.3 }
        ),
        this.classList.add("detail-open"),
        this.setAttribute("open", ""))
      : (Motion.animate(
          this.content,
          false ? { height: "auto" } : { height: 0 },
          { duration: 0.3 }
        ),
        this.classList.remove("detail-open"),
        this.open || setTimeout(() => this.removeAttribute("open"), 300));
  }
}
customElements.define("collapsible-row", CollapsibleRowDetails, {
  extends: "details",
});

class RecentlyViewedProducts extends HTMLElement {
  constructor() {
    super();
  }
  init() {
    this.connectedCallback();
  }
  initData() {
    const savedProductsArr = JSON.parse(
      localStorage.getItem("recently-viewed-products")
    );
    this.getStoredProducts(savedProductsArr);
  }
  getStoredProducts(arr) {
    const limit = this.dataset?.limit;
    if (limit) {
      let query = "";
      var productAjaxURL = "";
      if (arr && arr.length > 0) {
        const sortedIds = arr.slice();
        const idsToUse = sortedIds.slice(0, limit);
        query = idsToUse.join("%20OR%20id:");
        productAjaxURL = `&q=id:${query}`;
      }
    }
    fetch(`${this.dataset.url}${productAjaxURL}`)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement("div");
        html.innerHTML = text;
        const recentlyViewedProducts = html.querySelector(
          "recently-viewed-products"
        );
        if (
          recentlyViewedProducts &&
          recentlyViewedProducts.innerHTML.trim().length
        ) {
          this.innerHTML = recentlyViewedProducts.innerHTML;
        }
      })
      .finally(() => {})
      .catch((e) => {
        console.error(e);
      });
  }
  connectedCallback() {
    const _this = this;
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      _this.initData();
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 400px 0px",
    }).observe(this);
  }
}
customElements.define("recently-viewed-products", RecentlyViewedProducts);

class ProgressBar extends HTMLElement {
  constructor() {
    super();
    const orders = this.dataset.order;
    this.init(orders);
  }
  init(orders) {
    const min = Number(this.dataset.feAmount);
    const threshold = Number(this.dataset.threshold);
    if (threshold > orders) {
      this.classList.add("notify");
    } else {
      this.classList.remove("notify");
    }
    if (!min) return;
    if (!orders) return;
    const order = Number(orders);
    if (!order) return;
    if ((order / min) * 100 > 100) {
      this.setProgressBar(100);
    } else {
      this.setProgressBar((order / min) * 100);
    }
  }
  setProgressBar(progress) {
    const p = this.querySelector(".progress");
    if (!p) return;
    const p_bar = p.closest(".progress-bar");
    p.style.width = progress + "%";
    if (!p_bar) return;
    if (progress <= 0) {
      p_bar.classList.add("d-none");
    } else {
      p_bar.classList.remove("d-none");
    }
  }
}
customElements.define("progress-bar", ProgressBar);

class InventoryProgressBar extends ProgressBar {
  constructor() {
    super();
    const orders = this.dataset.order;
    const available = this.dataset.available;
    this.init(orders, available);
  }
  init(orders, available) {
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      const min = Number(this.dataset.feAmount);
      const threshold = Number(this.dataset.threshold);
      if (threshold > orders) {
        if (orders > 0) {
          this.classList.add("notify", "low_stock");
          this.classList.remove("instock", "pre_order", "outstock");
        } else {
          if (available == false || available == "false") {
            this.classList.add("notify", "outstock");
            this.classList.remove("instock", "pre_order", "low_stock");
          } else {
            this.classList.remove("notify", "instock", "low_stock", "outstock");
            this.classList.add("pre_order");
          }
        }
      } else {
        this.classList.remove("notify", "pre_order", "low_stock", "outstock");
        this.classList.add("instock");
      }
      if (!min) return;
      if (orders === undefined) return;
      const order = Number(orders);
      if (order === undefined) return;
      if ((order / min) * 100 > 100) {
        this.setProgressBar(100);
      } else {
        this.setProgressBar((order / min) * 100);
      }
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 400px 0px",
    }).observe(this);
  }
}
customElements.define("inventory-progress-bar", InventoryProgressBar);

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector("input");
    this.changeEvent = new Event("change", { bubbles: true });
    this.input.addEventListener("change", this.onInputChange.bind(this));
    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  quantityUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.validateQtyRules();
    this.quantityUpdateUnsubscriber = global.subscribe(
      global.PUB_SUB_EVENTS.quantityUpdate,
      this.validateQtyRules.bind(this)
    );
  }

  disconnectedCallback() {
    if (this.quantityUpdateUnsubscriber) {
      this.quantityUpdateUnsubscriber();
    }
  }

  onInputChange() {
    this.validateQtyRules();
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === "plus" ||
    event.target.closest("button").name === "plus"
      ? this.input.stepUp()
      : this.input.stepDown();
    if (previousValue !== this.input.value)
      this.input.dispatchEvent(this.changeEvent);
  }

  validateQtyRules() {
    const value = parseInt(this.input.value);
    if (this.input.min) {
      const min = parseInt(this.input.min);
      const buttonMinus = this.querySelector(".quantity__button[name='minus']");
      buttonMinus.classList.toggle("disabled", value <= min);
    }
    if (this.input.max) {
      const max = parseInt(this.input.max);
      const buttonPlus = this.querySelector(".quantity__button[name='plus']");
      buttonPlus.classList.toggle("disabled", value >= max);
    }
  }
}

customElements.define("quantity-input", QuantityInput);

class VideoSection extends HTMLElement {
  constructor() {
    super();
    this.thumb = this.querySelector(".video-thumbnail");
    this.video_iframe = this.querySelector(".video-has-bg iframe");
    this.init();
  }

  init() {
    if (this.video_iframe) {
      this.video_iframe.addEventListener("load", () => {
        if (this.thumb) {
          this.thumb.remove();
        }
      });
    }
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      const videos = this.querySelectorAll("iframe");
      videos.forEach((video) => {
        const dataSrc = video.dataset.src;
        if (dataSrc) {
          video.src = dataSrc;
          video.removeAttribute("data-src");
        }
      });
    };
    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(this);
  }
}
customElements.define("video-section", VideoSection);
class VideoLocal extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    setTimeout(() => {
      this.loadContent();
    }, 100);
  }

  loadContent() {
    const _this = this;
    if (!this.getAttribute("loaded") && this.querySelector("template")) {
      const content = document.createElement("div");
      content.appendChild(
        this.querySelector("template").content.firstElementChild.cloneNode(true)
      );
      this.setAttribute("loaded", true);
      const deferredElement = this.appendChild(content.querySelector("video"));
      const alt = deferredElement.getAttribute("alt");
      const img = deferredElement.querySelector("img");
      if (alt && img) {
        img.setAttribute("alt", alt);
      }
      this.thumb = this.querySelector(".video-thumbnail");
      if (this.thumb) {
        this.thumb.remove();
      }
      if (
        deferredElement.nodeName == "VIDEO" &&
        deferredElement.getAttribute("autoplay")
      ) {
        deferredElement.play();
      }
    }

    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(_this);
      const videos = _this.querySelectorAll("video");
      videos.forEach((video) => {
        const dataSrc = video.dataset.src;
        if (dataSrc) {
          video.src = dataSrc;
          video.removeAttribute("data-src");
        }
      });
    };
    new IntersectionObserver(handleIntersection.bind(_this), {
      rootMargin: "0px 0px 200px 0px",
    }).observe(_this);
  }
}
customElements.define("video-local", VideoLocal);

class VideoLocalPlay extends VideoLocal {
  constructor() {
    super();
    this.init();
  }
  init() {
    const poster = this.querySelector("button");
    if (!poster) return;
    poster.addEventListener("click", this.loadContent.bind(this));
  }
}
customElements.define("video-local-play", VideoLocalPlay);

class VariantInput extends HTMLElement {
  constructor() {
    super(),
      (this.show_more = this.querySelector(".number-showmore")),
      (this.size_chart = this.querySelector(".open-size-chart")),
      (this.swatch = this.querySelector(
        ".product-card-swatch-js .variant-input"
      )),
      delegate.on(
        "click",
        '.product-card-swatch-js .variant-input [type="radio"]',
        this.onSwatchClick.bind(this)
      ),
      delegate.on(
        "keydown",
        '.product-card-swatch-js .variant-input [type="radio"]',
        function (event) {
          if (event.key === "Enter") {
            this.onSwatchClick(event);
          }
        }.bind(this)
      );
    this.init();
  }

  connectedCallback() {
    this.querySelectorAll('.product-card-swatch-js [type="radio"]').forEach(
      (input) => {
        input.addEventListener("change", this.onSwatchChanged.bind(this));
      }
    );
  }

  init() {
    if (this.show_more) {
      this.show_more.addEventListener(
        "click",
        this.onShowMoreClicked.bind(this)
      );
    }
    if (this.size_chart) {
      this.size_chart.addEventListener(
        "click",
        this.onShowSizeChartClicked.bind(this)
      );
    }
  }

  async onSwatchChanged(event) {
    event.preventDefault();
    const target = event.target;
    if (target.hasAttribute("value")) {
      this.querySelectorAll("li.variant-input").forEach((variant) => {
        variant.classList.remove("active");
      });
      target.closest(".variant-input").classList.add("active");
      this.querySelectorAll(".product-variants-option").forEach((v) => {
        v.classList.remove("active");
      });

      const newMedia = JSON.parse(target.getAttribute("data-value-media"));
      const currentImage =
        this.closest(".product__item-js").querySelector(".featured-image");
      const newImage = this.createResponsiveImage(
        newMedia,
        currentImage.className,
        currentImage.sizes
      );

      if (currentImage.src !== newImage.src) {
        await Motion.animate(
          currentImage,
          { opacity: [1, 0] },
          { duration: 0.15, easing: "ease-in", fill: "forwards" }
        ).finished;
        await new Promise((resolve) =>
          newImage.complete ? resolve() : (newImage.onload = resolve)
        );
        currentImage.replaceWith(newImage);
        Motion.animate(
          newImage,
          { opacity: [0, 1] },
          { duration: 0.15, easing: "ease-in" }
        );
      }
    }
  }

  createResponsiveImage(media, classNames, responsiveSizes) {
    return global.createMediaImageElement(
      media,
      [720, 660, 550, 480, 330, 240, 185],
      {
        class: classNames,
        sizes: responsiveSizes,
      }
    );
  }

  onSwatchClick(event) {
    const variant = event.target.closest(".variant-input");
    if (
      variant.querySelector('[type="radio"]').checked &&
      variant.classList.contains("active")
    ) {
      window.location.href = variant
        .querySelector('[type="radio"]')
        .getAttribute("data-href");
    }
  }

  onShowMoreClicked(event) {
    const swatch_hidden = event.target
      .closest(".swatch-color")
      .querySelectorAll("li.hidden");
    swatch_hidden.forEach((swatch) => {
      swatch.classList.remove("hidden");
    });
    this.show_more.closest("li").remove();
  }

  onShowSizeChartClicked(event) {
    event.preventDefault();
    const size_chart = event.target
      .closest(".product-variants-info")
      .querySelector("template");
    if (size_chart) {
      const content = document.createElement("div");
      content.appendChild(size_chart.content.firstElementChild.cloneNode(true));
      global.body.appendChild(content.querySelector("modal-popup"));
    }
    setTimeout(
      () =>
        global.eventModal(document.querySelector("modal-popup"), "open", true),
      100
    );
  }
}
customElements.define("variant-input", VariantInput);

class VariantsDropdown extends HTMLElement {
  constructor() {
    super(),
      (this.variants = this.closest(".product-variants-option")),
      this.init();
  }

  init() {
    if (this.variants) {
      this.variants
        .querySelector(".variants__option-dropdown")
        .addEventListener("click", this.onShowDropdownClicked.bind(this));
    }
    document.addEventListener("click", this.handleClickOutside.bind(this));
  }

  onShowDropdownClicked(event) {
    if (this.closest(".product-variants-option").classList.contains("active")) {
      this.closest(".product-variants-option").classList.remove("active");
    } else {
      this.closest(".product-variants-js")
        .querySelectorAll(".product-variants-option.active")
        .forEach((element) => {
          element.classList.remove("active");
        });
      this.closest(".product-variants-option").classList.add("active");
    }
  }

  handleClickOutside(event) {
    if (!event.target.closest(".product-variants-option")) {
      document
        .querySelectorAll(".product-variants-option.active")
        .forEach((element) => {
          element.classList.remove("active");
        });
    }
  }
}
customElements.define("variants-dropdown", VariantsDropdown);
