import { initSlide } from "module-slide";
import { LazyLoadEventHover, LazyLoader } from "module-lazyLoad";
import { CustomElement } from "module-safariElementPatch";
import "module-addToCart";
import "module-variantSwatch";
import * as NextSkyTheme from "global";

LazyLoadEventHover.run();
new LazyLoader(".image-lazy-load");
new NextSkyTheme.FSProgressBar("free-ship-progress-bar");

document.addEventListener("shopify:section:load", function () {
  new LazyLoader(".image-lazy-load");
  new NextSkyTheme.FSProgressBar("free-ship-progress-bar");
});

try {
  document.querySelector(":focus-visible");
} catch (e) {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = [
    "ARROWUP",
    "ARROWDOWN",
    "ARROWLEFT",
    "ARROWRIGHT",
    "TAB",
    "ENTER",
    "SPACE",
    "ESCAPE",
    "HOME",
    "END",
    "PAGEUP",
    "PAGEDOWN",
  ];
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener("keydown", (event) => {
    if (navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener("mousedown", () => {
    mouseClick = true;
  });

  window.addEventListener(
    "focus",
    () => {
      if (currentFocusedElement)
        currentFocusedElement.classList.remove("focused");

      if (mouseClick) return;

      currentFocusedElement = document.activeElement;
      currentFocusedElement.classList.add("focused");
    },
    true
  );
}

var Shopify = Shopify || {};
if (typeof window.Shopify == "undefined") {
  window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
  return function () {
    return fn.apply(scope, arguments);
  };
};

Shopify.setSelectorByValue = function (selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function (target, eventName, callback) {
  target.addEventListener
    ? target.addEventListener(eventName, callback, false)
    : target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
  options = options || {};
  var method = options["method"] || "post";
  var params = options["parameters"] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for (var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
  country_domid,
  province_domid,
  options
) {
  this.countryEl = document.getElementById(country_domid);
  this.provinceEl = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(
    options["hideElement"] || province_domid
  );

  Shopify.addListener(
    this.countryEl,
    "change",
    Shopify.bind(this.countryHandler, this)
  );

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function () {
    var value = this.countryEl.getAttribute("data-default");
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function () {
    var value = this.provinceEl.getAttribute("data-default");
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function () {
    var opt = this.countryEl.options[this.countryEl.selectedIndex];
    var raw = opt.getAttribute("data-provinces");
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = "none";
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement("option");
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function (selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function (selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement("option");
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  },
};

class PageLoader extends HTMLElement {
  constructor() {
    super(),
      window.addEventListener(
        "DOMContentLoaded",
        this.onDOMContentLoaded.bind(this),
        false
      );
  }

  onDOMContentLoaded() {
    Motion.animate(this, { opacity: 0 }, { duration: 1 }).finished.then(() => {
      this.classList.add("hidden");
    });
  }
}
customElements.define("page-loader", PageLoader);

class BackToTop extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.backToTop.bind(this), false);
    this.addEventListener("keyup", (event) => {
      if (event.code.toUpperCase() === "ENTER") {
        this.backToTop();
      }
    });
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
      this.blur();
      setTimeout(() => {
        const skipLink = document.querySelector(".skip-to-content-link");
        skipLink.focus();
      }, 500);
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

class SiteHeader extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  get dataStickyType() {
    return this.hasAttribute("data-sticky-type")
      ? this.getAttribute("data-sticky-type")
      : "none";
  }
  get heightAnnouncementBar() {
    return document.querySelector(".section-announcement-bar")
      ? Math.round(
          document.querySelector(".section-announcement-bar").clientHeight
        )
      : 0;
  }

  init() {
    this.check = 0;
    requestAnimationFrame(() => {
      NextSkyTheme.body.style.setProperty(
        "--header-height",
        Math.round(this.clientHeight) + "px"
      );
    });
    this.onStickyHeader();
  }

  onStickyHeader() {
    if (this.dataStickyType != "none") {
      if (this.dataStickyType === "on-scroll-up") {
        this.closest(".site-header").classList.add("scroll-up");
      }
      if (this.dataStickyType === "always") {
        this.closest(".site-header").classList.add("header-sticky");
      }
      window.addEventListener("scroll", () => {
        this.stickyFunction();
      });
    }
  }

  stickyFunction() {
    let headerHeight =
      this.heightAnnouncementBar + Math.round(this.clientHeight);
    let header = this.closest(".site-header");
    let positionScrollY = window.scrollY;
    if (header) {
      if (this.dataStickyType === "always") {
        if (positionScrollY > headerHeight) {
          header.classList.add("section-header-sticky", "animate");
        } else {
          header.classList.remove("section-header-sticky", "animate");
        }
      } else {
        if (positionScrollY > 0) {
          if (positionScrollY > headerHeight) {
            header.classList.add("scr-pass-header");
            if (positionScrollY > this.check) {
              header.classList.add("header-sticky-hidden");
            } else {
              header.classList.remove("header-sticky-hidden");
              header.classList.add("animate");
            }
            header.classList.add("section-header-sticky");
            this.check = positionScrollY;
          } else {
            header.classList.remove("scr-pass-header");
            this.check = 0;
          }
        } else {
          header.classList.remove(
            "header-sticky-hidden",
            "section-header-sticky",
            "animate"
          );
        }
      }
    }
  }
}
customElements.define("site-header", SiteHeader, {
  extends: "header",
});
CustomElement.observeAndPatchCustomElements({
  "site-header": {
    tagElement: "header",
    classElement: SiteHeader,
  },
});

class LazyLoadingImg extends HTMLImageElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (this.media) {
      window.addEventListener("resize", this.lazyLoading.bind(this));
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (
            mutation.attributeName.includes("src") ||
            mutation.attributeName.includes("srcset")
          ) {
            this.lazyLoading();
          }
        });
      });

      observer.observe(this, { attributes: true });
      this.lazyLoading();
    }
  }

  get media() {
    return this.closest(".image__media") || this.closest(".image-picture");
  }

  lazyLoading() {
    if (this.complete || this.classList.contains("loaded")) return;
    this.media.classList.add("loading_img");
    this.addEventListener("load", this.onImageLoad.bind(this));
  }

  onImageLoad() {
    this.classList.add("loaded");
    this.media.classList.remove("loading_img");
  }
}
customElements.define("lazy-loading-img", LazyLoadingImg, { extends: "img" });
CustomElement.observeAndPatchCustomElements({
  "lazy-loading-img": {
    tagElement: "img",
    classElement: LazyLoadingImg,
  },
});

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
      NextSkyTheme.body.appendChild(content.querySelector("menu-drawer"));
    }
    setTimeout(
      () =>
        NextSkyTheme.eventModal(
          document.querySelector("menu-drawer"),
          "open",
          true
        ),
      100
    );
    new LazyLoader(".image-lazy-load");
    CustomElement.observeAndPatchCustomElements({
      "button-close-model": {
        tagElement: "button",
        classElement: ButtonCloseModel,
      },
      "details-mega-menu": {
        tagElement: "details",
        classElement: DetailsMegaMenu,
      },
      "submenu-details": {
        tagElement: "details",
        classElement: SubMenuDetails,
      },
    });
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
    NextSkyTheme.eventModal(this, "close");
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
    NextSkyTheme.eventModal(this, "close");
  }
}
customElements.define("button-close-model", ButtonCloseModel, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "button-close-model": {
    tagElement: "button",
    classElement: ButtonCloseModel,
  },
});

const megaMenuCount = new WeakMap();
class DetailsMegaMenu extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = false),
      (this.contentElement = false),
      (this._open = false),
      (this.header = false),
      this.init();
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

  get dropdownsAnimation() {
    return this.header.hasAttribute("data-dropdowns-animation")
      ? this.header.getAttribute("data-dropdowns-animation")
      : "fade-in";
  }

  get menuTrigger() {
    return this.header.hasAttribute("data-menu-trigger") &&
      window.innerWidth >= 1025
      ? this.header.getAttribute("data-menu-trigger")
      : "click";
  }

  init() {
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

  onSummaryClicked(event) {
    event.preventDefault(),
      this.menuTrigger === "hover" &&
      this.summaryElement.hasAttribute("data-href") &&
      this.summaryElement.getAttribute("data-href").length > 0 &&
      (event.pointerType || this._open === true)
        ? (window.location.href = this.summaryElement.getAttribute("data-href"))
        : (this.open = !this.open);
  }
  async transition(value) {
    const body = document.body;

    if (value) {
      megaMenuCount.set(
        DetailsMegaMenu,
        megaMenuCount.get(DetailsMegaMenu) + 1
      );
      this.setAttribute("open", "");
      this.summaryElement.setAttribute("open", "");
      document.addEventListener("click", this.detectClickOutsideListener);
      document.addEventListener("keydown", this.detectEscKeyboardListener);
      document.addEventListener("focusout", this.detectFocusOutListener);
      this.classList.add("detail-open");
      body.classList.add("dropdown-open");

      if (
        this.dropdownsAnimation === "fade-in-down" &&
        window.innerWidth >= 1025
      ) {
        this.contentElement.setAttribute("open", "");
        this.contentElement.classList.add("expanding");
        await this.fadeInDown();
        this.contentElement.classList.remove("expanding");
      } else {
        setTimeout(() => this.contentElement.setAttribute("open", ""), 100);
      }
    } else {
      megaMenuCount.set(
        DetailsMegaMenu,
        megaMenuCount.get(DetailsMegaMenu) - 1
      );
      this.summaryElement.removeAttribute("open");
      this.contentElement.removeAttribute("open");
      document.removeEventListener("click", this.detectClickOutsideListener);
      document.removeEventListener("keydown", this.detectEscKeyboardListener);
      document.removeEventListener("focusout", this.detectFocusOutListener);
      this.classList.remove("detail-open");
      body.classList.remove("dropdown-open");

      if (
        this.dropdownsAnimation === "fade-in-down" &&
        window.innerWidth >= 1025
      ) {
        this.contentElement.classList.add("expanding");
        await this.fadeInUp();
        this.contentElement.classList.remove("expanding");
        if (!this.open) this.removeAttribute("open");
      } else {
        setTimeout(() => {
          if (!this.open) this.removeAttribute("open");
        }, 300);
      }
    }
  }
  detectClickOutside(event) {
    !this.contains(event.target) &&
      !(event.target.closest("details") instanceof DetailsMegaMenu) &&
      (this.open = !1);
  }
  detectEscKeyboard(event) {
    if (event.code === "Escape") {
      const targetMenu = event.target.closest("details[open]");
      targetMenu &&
        ((targetMenu.open = !1),
        targetMenu.firstElementChild.focus({ focusVisible: true }));
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
  fadeInDown() {
    Motion.animate(
      this.contentElement,
      {
        opacity: [0, 1],
        visibility: "visible",
      },
      {
        duration: 0.4,
        easing: [0.7, 0, 0.2, 1],
        delay: 0.1,
      }
    );
    const translateY = "-105%";
    return Motion.animate(
      this.contentElement.firstElementChild,
      {
        transform: [`translateY(${translateY})`, "translateY(0)"],
      },
      {
        duration: 0.4,
        easing: [0.7, 0, 0.2, 1],
      }
    ).finished;
  }
  fadeInUp() {
    Motion.animate(
      this.contentElement,
      {
        opacity: 0,
        visibility: "hidden",
      },
      {
        duration: 0.3,
        easing: [0.7, 0, 0.2, 1],
      }
    );
    const translateY = "-105%";
    return Motion.animate(
      this.contentElement.firstElementChild,
      {
        transform: `translateY(${translateY})`,
      },
      {
        duration: 0.4,
        easing: [0.7, 0, 0.2, 1],
      }
    ).finished;
  }
}
customElements.define("details-mega-menu", DetailsMegaMenu, {
  extends: "details",
}),
  megaMenuCount.set(DetailsMegaMenu, 0);
CustomElement.observeAndPatchCustomElements({
  "details-mega-menu": {
    tagElement: "details",
    classElement: DetailsMegaMenu,
  },
});

class SubMenuDetails extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = false),
      (this.contentElement = false),
      (this._open = false),
      (this.content = false),
      this.init();
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

  init() {
    this.summaryElement = this.firstElementChild;
    this.contentElement = this.lastElementChild;
    this._open = this.hasAttribute("open");
    this.content =
      this.closest(".menu-link").querySelector(".sub-children-menu");
    this.summaryElement.addEventListener(
      "click",
      this.onSummaryClicked.bind(this)
    );
    if (window.innerWidth < 1025) {
      this.initialize();
    } else {
      (this.detectHoverListener = this.detectHover.bind(this)),
        this.addEventListener(
          "mouseenter",
          this.detectHoverListener.bind(this)
        ),
        this.addEventListener(
          "mouseleave",
          this.detectHoverListener.bind(this)
        );
    }
  }

  onSummaryClicked(event) {
    event.preventDefault(),
      window.innerWidth >= 1025 &&
      this.hasAttribute("data-href") &&
      this.getAttribute("data-href").length > 0 &&
      (event.pointerType || this._open === true)
        ? (window.location.href = this.getAttribute("data-href"))
        : (this.open = !this.open);
  }

  async initialize() {
    if (this.content) {
      Motion.animate(
        this.content,
        this._open ? { height: "auto" } : { height: 0 },
        { duration: 0 }
      );
    }
  }

  detectHover(event) {
    event.type === "mouseenter" ? (this.open = !0) : (this.open = !1);
  }

  async transition(value) {
    return value
      ? (window.innerWidth < 1025
          ? Motion.animate(
              this.content,
              true ? { height: "auto" } : { height: 0 },
              { duration: 0.25 }
            )
          : this.closest("ul")
              .querySelectorAll("details")
              .forEach((details) => {
                details.removeAttribute("open");
                details._open = false;
              }),
        this.setAttribute("open", ""),
        (this._open = true))
      : (window.innerWidth < 1025
          ? Motion.animate(
              this.content,
              false ? { height: "auto" } : { height: 0 },
              { duration: 0.25 }
            )
          : "",
        this.removeAttribute("open"));
  }
}
customElements.define("submenu-details", SubMenuDetails, {
  extends: "details",
});
CustomElement.observeAndPatchCustomElements({
  "submenu-details": {
    tagElement: "details",
    classElement: SubMenuDetails,
  },
});

class CollapsibleRowDetails extends HTMLDetailsElement {
  constructor() {
    super(),
      (this.summaryElement = null),
      (this.contentElement = null),
      (this._open = false),
      (this._hiddenMobile = false),
      (this.content = null),
      this.init();
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

  init() {
    this.summaryElement = this.firstElementChild;
    this.contentElement = this.lastElementChild;
    this._open = this.hasAttribute("open");
    this._hiddenMobile = this.hasAttribute("hidden-mobile");
    this.content = this.querySelector(".collapsible-row__content");
    this.summaryElement.addEventListener(
      "click",
      this.onSummaryClicked.bind(this)
    );
    this.initialize();
  }

  onSummaryClicked(event) {
    event.preventDefault(), (this.open = !this.open);
  }

  async initialize() {
    if (this._hiddenMobile && window.innerWidth <= 767) {
      this.removeAttribute("open"), this.classList.remove("detail-open");
      this._open = false;
      if (this.content) {
        Motion.animate(this.content, { height: 0 }, { duration: 0 });
      }
    } else {
      if (this.content) {
        Motion.animate(
          this.content,
          this._open ? { height: "auto" } : { height: 0 },
          { duration: 0 }
        );
      }
    }
  }

  async transition(value) {
    if (!this.content) {
      return;
    }
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
CustomElement.observeAndPatchCustomElements({
  "collapsible-row": {
    tagElement: "details",
    classElement: CollapsibleRowDetails,
  },
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
        new LazyLoader(".image-lazy-load");
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
      rootMargin: "0px 0px 100px 0px",
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
    this.quantityUpdateUnsubscriber = NextSkyTheme.subscribe(
      NextSkyTheme.PUB_SUB_EVENTS.quantityUpdate,
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

    const main_product = this.closest(".sec__main-product");
    if (main_product) {
      main_product.querySelector("quantity-input input").value =
        this.input.value;
      const sticky = main_product.querySelector(".sticky-add-cart");
      if (sticky) {
        sticky.querySelector("quantity-input input").value = this.input.value;
      }
    }

    this.updateTotalPrice(this.input.value, main_product);
  }

  updateTotalPrice(previousValue, mainProduct) {
    const form = this.closest("form");
    if (!form) return;
    const priceElement = form.querySelector(".total-price__detail");
    if (!priceElement) return;
    const dataTotalPrice = priceElement?.getAttribute("data-total-price");
    const totalPrice = Number(dataTotalPrice) * Number(previousValue);
    const sticky = form.classList.contains("form-sticky-add-cart");
    const mainProductPriceElement = mainProduct?.querySelector(
      ".product-detail__buy-buttons .total-price__detail"
    );
    if (sticky && mainProductPriceElement) {
      mainProductPriceElement.textContent = NextSkyTheme.formatMoney(
        totalPrice,
        themeGlobalVariables.settings.money_format
      );
    }
    priceElement.textContent = NextSkyTheme.formatMoney(
      totalPrice,
      themeGlobalVariables.settings.money_format
    );
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
    const main_product = this.closest(".sec__main-product");
    if (main_product) {
      main_product.querySelector("quantity-input input").value =
        this.input.value;
      const sticky = main_product.querySelector(".sticky-add-cart");
      if (sticky) {
        sticky.querySelector("quantity-input input").value = this.input.value;
      }
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

  loadContentVideo(_this) {
    if (!_this.getAttribute("loaded") && _this.querySelector("template")) {
      const content = document.createElement("div");
      content.appendChild(
        _this
          .querySelector("template")
          .content.firstElementChild.cloneNode(true)
      );
      _this.setAttribute("loaded", true);
      const video = content.querySelector("video")
        ? content.querySelector("video")
        : content.querySelector("iframe");
      const deferredElement = _this.appendChild(video);
      const alt = deferredElement.getAttribute("alt");
      const img = deferredElement.querySelector("img");
      if (alt && img) {
        img.setAttribute("alt", alt);
      }
      _this.thumb = _this.querySelector(".video-thumbnail");
      if (_this.thumb) {
        _this.thumb.remove();
      }
      if (
        deferredElement.nodeName == "VIDEO" &&
        deferredElement.getAttribute("autoplay")
      ) {
        deferredElement.play();
      }
      if (this.querySelector(".play-button")) {
        this.querySelector(".play-button").addEventListener(
          "click",
          this.clickPlayVideo.bind(this),
          false
        );
      }
    }
  }

  loadContent(event) {
    if (event) {
      event.currentTarget.classList.add("active");
    }
    const _this = this;
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(_this);
      this.loadContentVideo(_this);
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

  clickPlayVideo(event) {
    event.preventDefault();
    event.stopPropagation();
    if (this.querySelector("video").paused) {
      this.querySelector("video").play();
      this.querySelector(".play-button").classList.add("active");
    } else {
      this.querySelector("video").pause();
      this.querySelector(".play-button").classList.remove("active");
    }
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

class VideoProduct extends VideoLocal {
  constructor() {
    super();
    this.init();
  }
  init() {
    setTimeout(() => {
      this.loadContent();
    }, 100);
  }
}
customElements.define("video-product", VideoProduct);

class VideoLocalScroll extends VideoLocal {
  constructor() {
    super();
    this.init();
    this.isScrollInitialized = false;
  }

  init() {
    if (window.Shopify && window.Shopify.designMode) {
      this.loadContentVideo(this);
    } else {
      if (!this.isScrollInitialized) {
        this.isScrollInitialized = true;
        window.addEventListener("scroll", this.checkScroll.bind(this), {
          passive: true,
        });
      }
    }
  }

  checkScroll() {
    if (window.scrollY > 10) {
      this.loadContentVideo(this);
      window.removeEventListener("scroll", this.checkScroll);
    }
  }
}

customElements.define("video-local-scroll", VideoLocalScroll);

class VideoProductGallery extends VideoLocal {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (this.hasAttribute("auto-play")) {
      setTimeout(() => {
        this.loadContent();
      }, 100);
    } else {
      const poster = this.querySelector("button");
      if (!poster) return;
      poster.addEventListener("click", () => {
        NextSkyTheme.pauseAllMedia(this.closest("media-gallery"));
        this.loadContent();
      });
    }
  }
}
customElements.define("video-product-gallery", VideoProductGallery);

class AnnouncementBar extends HTMLElement {
  constructor() {
    super();
    this.animationDuration = 300;
    this.isAnimating = false;
    this.animationFrame = null;
  }

  connectedCallback() {
    requestAnimationFrame(() => this.init());
  }

  init() {
    this._naturalHeight = this.offsetHeight || 0;
    document.body.style.setProperty("--height-bar", `${this._naturalHeight}px`);
    this.closeButton = this.querySelector(".announcement-bar__close");
    this.parentSection = this.closest(".section-announcement-bar");
    if (!this.closeButton || !this.parentSection) return;
    if (this.closeButton) {
      this.closeButton.addEventListener("click", this.onCloseClick.bind(this));
      this.closeButton.addEventListener("keydown", this.onKeyDown.bind(this));
    }
  }

  onKeyDown(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      this.onCloseClick(event);
    }
  }

  onCloseClick(event) {
    event.preventDefault();
    if (this.isAnimating) return;
    this.isAnimating = true;
    if (!this._naturalHeight || this._naturalHeight <= 0) {
      this._naturalHeight = this.offsetHeight;
    }
    this.parentSection.classList.add("announcement-closing");
    const startHeight = this._naturalHeight;
    const startTime = performance.now();
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / this.animationDuration, 1);
      const eased = this.easeOutCubic(progress);
      const currentHeight = startHeight * (1 - eased);
      const currentOpacity = 1 - eased;
      this.parentSection.style.height = `${currentHeight}px`;
      this.parentSection.style.opacity = String(currentOpacity);
      this.classList.add("d-none");
      document.body.style.removeProperty("--height-bar");
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.finishClosingAnimation();
      }
    };
    this.animationFrame = requestAnimationFrame(animate);
  }

  finishClosingAnimation() {
    this.parentSection.style.height = "0px";
    this.parentSection.style.opacity = "0";
    this.parentSection.classList.remove("announcement-closing");
    this.parentSection.classList.add("announcement-closed");
    NextSkyTheme.setCookie("announcement_closed", "true", 1);
    this.isAnimating = false;
  }

  easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
  }

  disconnectedCallback() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    if (this.closeButton) {
      this.closeButton.removeEventListener("click", this.onCloseClick);
      this.closeButton.removeEventListener("keydown", this.onKeyDown);
    }
  }
}
customElements.define("announcement-bar", AnnouncementBar);

class CartEstimate extends HTMLElement {
  constructor() {
    super();
    this.addonsUpdate();
  }

  get actionEstimate() {
    return this.querySelector(".addon-actions .estimate") || null;
  }

  get cartToggleAddons() {
    return this.querySelector(".toggle-addons") || null;
  }

  get cartActionAddons() {
    return document.querySelector(".drawer__cart-shipping") || null;
  }

  connectedCallback() {
    if (this.actionEstimate) {
      this.actionEstimate.addEventListener(
        "click",
        this.handleEstimateSave.bind(this)
      );
    }

    if (this.cartActionAddons) {
      this.cartActionAddons.addEventListener(
        "click",
        this.handleEstimateToggle.bind(this)
      );
    }

    if (this.cartToggleAddons) {
      this.cartToggleAddons.addEventListener(
        "click",
        this.handleEstimateToggle.bind(this)
      );
    }
  }

  handleEstimateSave(event) {
    event.preventDefault();
    const address = {
      zip: this.querySelector("#AddressZip").value || "",
      country: this.querySelector("#address_country").value || "",
      province: this.querySelector("#address_province").value || "",
    };
    this.fetchShippingRates(address);
  }

  fetchShippingRates(address) {
    const { zip, country, province } = address;
    const url = `${window.Shopify.routes.root}cart/shipping_rates.json?shipping_address%5Bzip%5D=${zip}&shipping_address%5Bcountry%5D=${country}&shipping_address%5Bprovince%5D=${province}`;
    this.actionEstimate.classList.add("loading");
    fetch(url)
      .then((response) => response.json())
      .then((data) => this.updateShippingMessage(data, address))
      .catch((error) => console.error("Error fetching shipping rates:", error));
  }

  updateShippingMessage(data, address) {
    const message = this.querySelector(".addon-message");
    message.innerHTML = "";

    if (data && data.shipping_rates) {
      if (data?.shipping_rates?.length) {
        this.showShippingSuccess(message, data.shipping_rates, address);
      } else {
        this.showShippingWarning(message);
      }
    } else {
      this.showShippingError(message, data);
    }
    this.actionEstimate.classList.remove("loading");
  }

  showShippingSuccess(message, rates, address) {
    message.classList.remove("error", "warning");
    message.classList.add("success");

    const addressText = window.cartStrings?.shipping_rate.replace(
      "{{address}}",
      `${address.zip}, ${address.country} ${address.province}`
    );
    message.innerHTML = `<p>${addressText}</p>`;

    rates.forEach((rate) => {
      message.innerHTML += `<p>${rate.name}: ${NextSkyTheme.formatMoney(
        rate.price,
        themeGlobalVariables.settings.money_format
      )}</p>`;
    });
  }

  showShippingWarning(message) {
    message.classList.remove("error", "success");
    message.classList.add("warning");
    message.innerHTML = `<p>${window.cartStrings?.no_shipping}</p>`;
  }

  showShippingError(message, errors) {
    message.classList.remove("success", "warning");
    message.classList.add("error");
    message.innerHTML = Object.values(errors)
      .map((error) => `<p>${error[0]}</p>`)
      .join("");
  }

  addonsUpdate() {
    const country = this.querySelector("#address_country");
    const province = this.querySelector("#address_province");
    if (country && province) {
      new Shopify.CountryProvinceSelector(
        "address_country",
        "address_province",
        {
          hideElement: "address_province_container",
        }
      );
    }
  }

  handleEstimateToggle(event) {
    event.preventDefault();
    if (this.classList.contains("open")) {
      this.classList.remove("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-shipping")
          .classList.remove("active");
      }
      this.cartActionAddons.focus();
    } else {
      this.classList.add("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-shipping")
          .classList.add("active");
        this.cartToggleAddons.focus();
      }
    }
  }
}
if (!customElements.get("cart-estimate-element")) {
  customElements.define("cart-estimate-element", CartEstimate);
}

class CartNote extends HTMLElement {
  constructor() {
    super();
  }

  get cartActionId() {
    return this.querySelector(".apply-note") || null;
  }

  get cartToggleAddons() {
    return this.querySelector(".toggle-addons") || null;
  }

  get cartActionAddons() {
    return document.querySelector(".drawer__cart-note") || null;
  }

  connectedCallback() {
    if (this.cartActionId) {
      this.cartActionId.addEventListener(
        "click",
        this.handleNoteSave.bind(this)
      );
    }

    if (this.cartActionAddons) {
      this.cartActionAddons.addEventListener(
        "click",
        this.handleNoteToggle.bind(this)
      );
    }

    if (this.cartToggleAddons) {
      this.cartToggleAddons.addEventListener(
        "click",
        this.handleNoteToggle.bind(this)
      );
    }
  }

  handleNoteSave() {
    this.cartActionId.classList.add("loading");
    this.noteUpdate();
  }

  handleNoteToggle(event) {
    event.preventDefault();
    if (this.classList.contains("open")) {
      this.classList.remove("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-note")
          .classList.remove("active");
      }
      this.cartActionAddons.focus();
    } else {
      this.classList.add("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-note")
          .classList.add("active");
        this.cartToggleAddons.focus();
      }
    }
  }

  noteUpdate() {
    const body = JSON.stringify({
      note: this.querySelector(".cart-note").value,
    });
    fetch(`${routes?.cart_update_url}`, {
      ...NextSkyTheme.fetchConfig(),
      ...{ body },
    }).finally(() => {
      this.cartActionId.classList.remove("loading");
      this.classList.remove("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-note")
          .classList.remove("active");
      }
    });
  }
}

if (!customElements.get("cart-note-element")) {
  customElements.define("cart-note-element", CartNote);
}

class MainCartNote extends CartNote {
  constructor() {
    super();
  }

  connectedCallback() {
    this.querySelector(".cart-note").addEventListener(
      "change",
      this.noteUpdate.bind(this)
    );
  }
}

if (!customElements.get("main-cart-note")) {
  customElements.define("main-cart-note", MainCartNote);
}

class MiniCartUpSell extends HTMLElement {
  constructor() {
    super();
  }

  get type() {
    return this.getAttribute("data-type");
  }

  connectedCallback() {
    if (this.type == "auto") {
      fetch(this.dataset.url)
        .then((response) => response.text())
        .then((text) => {
          const html = document.createElement("div");
          html.innerHTML = text;
          const recommendations = html.querySelector(".swiper-wrapper");
          if (!recommendations) {
            if (this.closest(".drawer__cart-recommendations")) {
              this.closest(".drawer__cart-recommendations").classList.add(
                "hidden"
              );
            } else {
              this.classList.add("hidden");
            }
          }
          if (recommendations && recommendations.childElementCount == 0) {
            if (this.closest(".drawer__cart-recommendations")) {
              this.closest(".drawer__cart-recommendations").classList.add(
                "hidden"
              );
            } else {
              this.classList.add("hidden");
            }
          }
          if (
            recommendations &&
            recommendations.innerHTML.trim().length &&
            recommendations.childElementCount > 0
          ) {
            this.querySelector(".swiper-wrapper").innerHTML =
              recommendations.innerHTML;
            if (this.closest(".drawer__cart-recommendations")) {
              this.closest(".drawer__cart-recommendations").classList.remove(
                "hidden"
              );
            } else {
              this.classList.remove("hidden");
            }
          }
        })
        .finally(() => {})
        .catch((e) => {
          console.error(e);
        });
    } else {
      const recommendations = this.querySelector(".swiper-wrapper");
      if (!recommendations) {
        if (this.closest(".drawer__cart-recommendations")) {
          this.closest(".drawer__cart-recommendations").classList.add("hidden");
        } else {
          this.classList.add("hidden");
        }
      }
      if (recommendations && recommendations.childElementCount == 0) {
        if (this.closest(".drawer__cart-recommendations")) {
          this.closest(".drawer__cart-recommendations").classList.add("hidden");
        } else {
          this.classList.add("hidden");
        }
      }
      if (
        recommendations &&
        recommendations.innerHTML.trim().length &&
        recommendations.childElementCount > 0
      ) {
        this.querySelector(".swiper-wrapper").innerHTML =
          recommendations.innerHTML;
        if (this.closest(".drawer__cart-recommendations")) {
          this.closest(".drawer__cart-recommendations").classList.remove(
            "hidden"
          );
        } else {
          this.classList.remove("hidden");
        }
      }
    }
  }
}
customElements.define("mini-cart-recommendations", MiniCartUpSell);

class CarouselMobile extends HTMLElement {
  constructor() {
    super();
    this.enable = this.dataset.enableCarouselMobile == "true";
    this.isMulticontent = this.dataset.multicontent == "true";
    this.showPagination = this.dataset.showPagination == "true";
    this.bundle = this.dataset.bundle == "true";
    this.swiperSlideInnerHtml = this.innerHTML;
    this.initCarousel();
  }

  initCarousel() {
    if (this.enable) {
      let width = window.innerWidth;
      window.addEventListener("resize", () => {
        const newWidth = window.innerWidth;
        if (newWidth <= 767 && width > 767) {
          this.actionOnMobile();
        }
        if (newWidth > 767 && width <= 767) {
          this.actionOutMobile();
        }
        width = newWidth;
      });
      if (width <= 767) {
        this.actionOnMobile();
      } else {
        this.actionOutMobile();
      }
    }
  }

  actionOnMobile() {
    this.classList.add("swiper");
    this.classList.remove(
      "grid-cols",
      "grid",
      "flex",
      "column",
      "flex-md-row",
      "wrap",
      "cols"
    );
    const html = this.swiperSlideInnerHtml.replaceAll(
      "switch-slide__mobile",
      "swiper-slide"
    );
    const wrapper = `<div class='swiper-wrapper custom-padding-carousel-mobile'>${html}</div>${
      this.showPagination
        ? '<div class="swiper-pagination" style="--swiper-pagination-bottom: 0"></div>'
        : ""
    }`;
    this.innerHTML = wrapper;
    initSlide(this);
    new LazyLoader(".image-lazy-load");
  }

  actionOutMobile() {
    new LazyLoader(".image-lazy-load");
    this.classList.remove("swiper");
    this.innerHTML = this.swiperSlideInnerHtml;
    if (this.bundle) {
      this.className = "";
      setTimeout(() => {
        this.classList.remove("swiper-backface-hidden");
      }, 100);
      return;
    }
    if (this.isMulticontent) {
      this.classList.add("flex", "column", "flex-md-row", "wrap", "cols");
      this.classList.remove("grid", "grid-cols");
    } else {
      this.classList.add("grid", "grid-cols");
      this.classList.remove("flex", "column", "flex-md-row", "wrap", "cols");
    }
  }
}
customElements.define("carousel-mobile", CarouselMobile);

class NavBar extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    document.body.classList.add("mobile-sticky-bar-enabled");
  }
  connectedCallback() {
    window.addEventListener(
      "scroll",
      this.updateScrollNavigationbar.bind(this)
    );
  }
  updateScrollNavigationbar() {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;
    const siteHeader = document.querySelector(".site-header");
    if (scrollTop > 200) {
      if (
        siteHeader &&
        siteHeader.classList.contains("animate") &&
        siteHeader.classList.contains("header-sticky-hidden")
      ) {
        this.classList.add("show");
      } else if (
        siteHeader &&
        siteHeader.classList.contains("animate") &&
        !siteHeader.classList.contains("header-sticky-hidden")
      ) {
        this.classList.remove("show");
      } else if (!siteHeader) {
        this.classList.add("show");
      } else {
        this.classList.add("show");
      }
    } else {
      this.classList.remove("show");
    }
  }
}
customElements.define("mobile-navigation-bar", NavBar);

var BlsCustomer = (function () {
  return {
    init: function () {
      this.toggleForm(), this.deleteAddresses(), this.addAddresses();
    },
    toggleForm: function () {
      const e = document.querySelector(".add-address");
      const c = document.querySelector(".cancel-add");
      if (e !== null && c !== null) {
        e.addEventListener("click", () => {
          if (e.getAttribute("aria-expanded") === "false") {
            e.setAttribute("aria-expanded", "true");
            e.closest(".bls-customer__address").classList.add("active");
          } else {
            e.setAttribute("aria-expanded", "false");
            e.closest(".bls-customer__address").classList.remove("active");
          }
        });
        c.addEventListener("click", () => {
          if (
            c.closest(".bls-customer__address").classList.contains("active")
          ) {
            e.closest(".bls-customer__address").classList.remove("active");
            e.closest(".add-address").setAttribute("aria-expanded", "false");
          }
        });
      }
    },
    deleteAddresses: function () {
      const btn = document.querySelectorAll(".address-delete");
      btn.forEach((e) => {
        e.addEventListener("click", () => {
          const id = e?.dataset.formId;
          const msg = e?.dataset.confirmMessage;
          if (confirm(msg || "Are you sure you wish to delete this address?")) {
            Shopify.postLink("/account/addresses/" + id, {
              parameters: { _method: "delete" },
            });
          }
        });
      });
    },
    addAddresses: function () {
      if (Shopify && document.getElementById("AddressCountryNew")) {
        new Shopify.CountryProvinceSelector(
          "AddressCountryNew",
          "AddressProvinceNew",
          {
            hideElement: "AddressProvinceNewContainer",
          }
        );
      }
      const edit = document.querySelectorAll(".edit-country-option");
      edit.forEach((e) => {
        const formId = e?.dataset.formId;
        const editCountry = "AddressCountry_" + formId;
        const editProvince = "AddressProvince_" + formId;
        const editContainer = "AddressProvinceContainer_" + formId;
        new Shopify.CountryProvinceSelector(editCountry, editProvince, {
          hideElement: editContainer,
        });
      });
    },
  };
})();
BlsCustomer.init();
class ImageComparison extends HTMLElement {
  constructor() {
    super();
    this.container = this;
    this.slider = this.querySelector(".slider");
    this.overlay = this.querySelector(".image-after");
    this.x = 0;
    this.boundary = 300;
    this.mixClipPath;
    this.mixSliderColor;
    this.step = 50;
    this.elastic = 0.1;
    this.animated = false;
    this.observer = null;

    this.isHovering = false;

    this.init();
    this.setupDrag();
    this.slider.addEventListener("focus", () => {
      document.addEventListener("keydown", this.handleKeyDown.bind(this));
    });

    this.slider.addEventListener("blur", () => {
      document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    });

    window.addEventListener("resize", () => {
      this.init();
      this.moveSlider(Motion.clamp(-this.boundary, this.boundary, this.x));
    });
    this.setupIntersectionObserver();
  }

  updateSliderStatus() {
    const swiperContainer = this.closest("slide-section");
    if (!swiperContainer) return;

    const swiperInstance = swiperContainer.swiper;
    if (!swiperInstance) return;

    swiperInstance.allowTouchMove = !this.isHovering;

    if (this.isHovering) {
      swiperInstance.allowSlideNext = false;
      swiperInstance.allowSlidePrev = false;
    } else {
      swiperInstance.allowSlideNext = true;
      swiperInstance.allowSlidePrev = true;
    }
    swiperInstance.update();
  }

  init() {
    this.boundary = this.container.clientWidth / 2;

    this.mixClipPath = Motion.transform(
      [-this.boundary, this.boundary],
      ["inset(0% 0% 0% 0%)", "inset(0% 0% 0% 100%)"]
    );

    this.mixSliderColor = Motion.transform(
      [
        -this.boundary + 20,
        -this.boundary + 60,
        this.boundary - 60,
        this.boundary - 20,
      ],
      [
        "rgba(255, 255, 255, 0)",
        "rgba(255, 255, 255, 1)",
        "rgba(255, 255, 255, 1)",
        "rgba(255, 255, 255, 0)",
      ]
    );

    if (!this.animated) {
      const startPosition = -this.boundary + this.boundary * 0.2;
      this.moveSlider(startPosition);
    } else {
      this.moveSlider(0);
    }
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !this.animated) {
            this.runEntranceAnimation();
          }
        });
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.2,
      }
    );
    this.observer.observe(this);
  }

  runEntranceAnimation() {
    this.animated = true;
    const startPosition = -this.boundary + this.boundary * 0.2;
    Motion.animate(startPosition, 0, {
      onUpdate: (value) => this.moveSlider(value),
      type: "spring",
      stiffness: 80,
      damping: 20,
      duration: 0.8,
      delay: 0.2,
    });
  }

  moveSlider(newX) {
    this.x = newX;
    this.overlay.style.clipPath = this.mixClipPath(this.x);
    this.slider.style.transform = `translateX(${this.x}px)`;
    this.slider.style.backgroundColor = this.mixSliderColor(this.x);
  }

  handleKeyDown(event) {
    if (!this.slider.matches(":focus")) return;
    let moveBy = 0;

    if (event.key === "ArrowLeft") {
      moveBy = -this.step;
    } else if (event.key === "ArrowRight") {
      moveBy = this.step;
    } else {
      return;
    }

    Motion.animate(
      this.x,
      Motion.clamp(-this.boundary, this.boundary, this.x + moveBy),
      {
        onUpdate: (value) => this.moveSlider(value),
        type: "spring",
        stiffness: 900,
        damping: 40,
        velocity: moveBy * 10,
      }
    );
  }

  setupDrag() {
    let startX = 0;
    let newX = 0;
    const _this = this;
    function updateX() {
      _this.moveSlider(newX);
    }

    this.slider.addEventListener("pointerdown", (e) => {
      startX = this.x - e.clientX;
      document.body.style.cursor = "grabbing";
      this.slider.style.cursor = "grabbing";
      this.slider.classList.add("active");
      this.slider.setPointerCapture(e.pointerId);
      this.isHovering = true;
      this.updateSliderStatus();
    });

    this.slider.addEventListener("pointermove", (e) => {
      if (!this.slider.hasPointerCapture(e.pointerId)) return;
      newX = startX + e.clientX;
      if (newX < -this.boundary) {
        newX = -this.boundary + (newX + this.boundary) * this.elastic;
      } else if (newX > this.boundary) {
        newX = this.boundary + (newX - this.boundary) * this.elastic;
      }
      Motion.frame.render(updateX);
    });

    this.slider.addEventListener("pointerup", (e) => {
      if (!this.slider.hasPointerCapture(e.pointerId)) return;
      this.slider.releasePointerCapture(e.pointerId);
      document.body.style.cursor = "default";
      this.slider.style.cursor = "grab";
      this.slider.classList.remove("active");
      if (this.x < -this.boundary || this.x > this.boundary) {
        const targetX =
          this.x < -this.boundary ? -this.boundary : this.boundary;
        Motion.animate(this.x, targetX, {
          onUpdate: (value) => this.moveSlider(value),
          type: "spring",
          stiffness: 900,
          damping: 40,
        });
      }
      this.isHovering = false;
      this.updateSliderStatus();
    });
  }

  disconnectedCallback() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    window.removeEventListener("resize", this.init);
    document.removeEventListener("keydown", this.handleKeyDown);

    this.removeEventListener("mouseenter", null);
    this.removeEventListener("mouseleave", null);
    this.removeEventListener("touchstart", null);
    this.removeEventListener("touchend", null);
  }
}
customElements.define("image-comparison", ImageComparison);

class AskQuestion extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);

    const urlInfo = window.location.href;
    const newURL = location.href.split("?")[0];
    if (urlInfo.indexOf("contact_posted=true#ContactFormAsk") >= 1) {
      NextSkyTheme.notifier.show(message.ask_question.success, "success", 4000);
      window.history.pushState("object", document.title, newURL);
    }
  }
  onClick(e) {
    const ask_question = e.target
      .closest(".ask-question")
      .querySelector("template");
    if (ask_question) {
      const content = document.createElement("div");
      content.appendChild(
        ask_question.content.firstElementChild.cloneNode(true)
      );
      NextSkyTheme.body.appendChild(
        content.querySelector("ask-question-popup")
      );
    }
    setTimeout(
      () =>
        NextSkyTheme.eventModal(
          document.querySelector("ask-question-popup"),
          "open",
          true
        ),
      100
    );
    NextSkyTheme.global.rootToFocus = this;
  }
}
customElements.define("ask-question", AskQuestion, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "ask-question": {
    tagElement: "button",
    classElement: AskQuestion,
  },
});
class SocialShare extends HTMLElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.querySelectorAll(".blog-sharing .btn-sharing").forEach((share) => {
      share.addEventListener(
        "click",
        (event) => {
          event.preventDefault();
          const target = event.currentTarget;
          const social = target.getAttribute("data-social");
          const nameSocial = target.getAttribute("data-name");
          window.open(social, nameSocial, "height=500,width=500");
        },
        false
      );
    });
  }
}
customElements.define("social-share", SocialShare);

class LazyLoadTemplate extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    if (this.querySelector("template")) {
      const handleIntersection = async (entries, observer) => {
        if (!entries[0].isIntersecting) return;
        observer.unobserve(this);
        const content = document.createElement("div");
        content.appendChild(
          this.querySelector("template").content.firstElementChild.cloneNode(
            true
          )
        );
        const html = content.querySelector(".product__countdown")
          ? content.querySelector(".product__countdown")
          : content.querySelector(".product_scrolling");
        await import(importJs.countdownTimer);
        this.parentNode.insertBefore(html, this.nextSibling);
        this.remove();
      };
      new IntersectionObserver(handleIntersection.bind(this), {
        rootMargin: "0px 0px 200px 0px",
      }).observe(this);
    }
  }
}
customElements.define("lazy-load-template", LazyLoadTemplate);

class ScrollingEffect extends HTMLElement {
  constructor() {
    super(),
      this.contents.forEach((element) => {
        const content =
          element.querySelector(".block__heading") ||
          element.querySelector(".block__description") ||
          element.querySelector(".block__buttons");
        Motion.scroll(
          Motion.animate(content, {
            opacity: [0, 0, 1, 1, 1, 0, 0],
          }),
          {
            target: content,
            offsets: ["33vh", "66vh"],
          }
        );
      });
  }

  get contents() {
    return Array.from(this.children);
  }
}
customElements.define("scrolling-effect", ScrollingEffect);

class MotionEffect extends HTMLElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      (this.initAnimate(),
      Motion.inView(
        this,
        async () => {
          this.mediaElements &&
            (await NextSkyTheme.loadImages(this.mediaElements)),
            setTimeout(() => {
              this.initAnimateEffect();
            }, 100);
        },
        {
          margin: "0px 0px -30px 0px",
        }
      ));
  }

  get mediaElements() {
    return this.querySelectorAll("img, svg");
  }

  get animateEffect() {
    return this.dataset.animate || "fade-up";
  }

  get delay() {
    return parseInt(this.dataset.animateDelay || 0) / 1000;
  }

  get delayLoad() {
    return this.classList.contains("animate-delay");
  }

  get delayMedia() {
    return this.closest(".block__media-gallery")
      ? this.closest(".block__media-gallery").classList.contains("insert")
      : false;
  }

  initAnimate() {
    if (this.delayMedia || this.delayLoad) {
      return;
    }
    switch (this.animateEffect) {
      case "left-to-right":
        this.leftToRightInitial();
        break;
      case "fade-in":
        this.fadeInInitial();
        break;
      case "fade-up":
        this.fadeUpInitial();
        break;
      case "zoom-in":
        this.zoomInInitial();
        break;
      case "zoom-in-big":
        this.zoomInBigInitial();
        break;
      case "zoom-out":
        this.zoomOutInitial();
        break;
      case "zoom-out-small":
        this.zoomOutSmallInitial();
        break;
    }
  }

  leftToRightInitial() {
    Motion.animate(this, { opacity: 0 }, { duration: 0 });
  }

  fadeInInitial() {
    Motion.animate(this, { opacity: 0.01 }, { duration: 0 });
  }

  fadeUpInitial() {
    Motion.animate(
      this,
      { transform: "translateY(2.5rem)", opacity: 0.01 },
      { duration: 0 }
    );
  }

  zoomInInitial() {
    Motion.animate(this, { transform: "scale(0.8)" }, { duration: 0 });
  }

  zoomInBigInitial() {
    Motion.animate(this, { transform: "scale(0)" }, { duration: 0 });
  }

  zoomOutInitial() {
    Motion.animate(this, { transform: "scale(1.3)" }, { duration: 0 });
  }

  zoomOutSmallInitial() {
    Motion.animate(this, { transform: "scale(1.1)" }, { duration: 0 });
  }

  async initAnimateEffect() {
    if (this.delayMedia || this.delayLoad) {
      return;
    }
    switch (this.animateEffect) {
      case "left-to-right":
        this.leftToRight();
        break;
      case "fade-in":
        await this.fadeIn();
        break;
      case "fade-up":
        await this.fadeUp();
        break;
      case "zoom-in":
        await this.zoomIn();
        break;
      case "zoom-in-big":
        await this.zoomInBig();
        break;
      case "zoom-out":
        await this.zoomOut();
        break;
      case "zoom-out-small":
        await this.zoomOutSmall();
        break;
    }
  }

  async leftToRight() {
    await Motion.animate(this, { opacity: 1 }).finished;
    this.classList.add("show");
  }

  async fadeIn() {
    await Motion.animate(
      this,
      { opacity: 1 },
      {
        duration: 1.5,
        delay: this.delay,
        easing: [0, 0, 0.3, 1],
      }
    ).finished;
  }

  async fadeUp() {
    await Motion.animate(
      this,
      { transform: "translateY(0)", opacity: 1 },
      {
        duration: 0.5,
        delay: this.delay,
        easing: [0, 0, 0.3, 1],
      }
    ).finished;
  }

  async zoomIn() {
    await Motion.animate(
      this,
      { transform: "scale(1)" },
      {
        duration: 1.3,
        delay: this.delay,
        easing: [0, 0, 0.3, 1],
      }
    ).finished;
  }

  async zoomInBig() {
    await Motion.animate(
      this,
      { transform: "scale(1)" },
      {
        duration: 0.5,
        delay: this.delay,
        easing: [0, 0, 0.3, 1],
      }
    ).finished;
  }

  async zoomOut() {
    await Motion.animate(
      this,
      { transform: "scale(1)" },
      {
        duration: 1.5,
        delay: this.delay,
        easing: [0, 0, 0.3, 1],
      }
    ).finished;
  }

  async zoomOutSmall() {
    await Motion.animate(
      this,
      { transform: "scale(1)" },
      {
        duration: 0.65,
        delay: this.delay,
        easing: [0, 0, 0.3, 1],
      }
    ).finished;
  }
}
customElements.define("motion-effect", MotionEffect);

class StickySection extends HTMLElement {
  constructor() {
    super();
    this.container = {
      el: this,
      height: 0,
      top: 0,
      bottom: 0,
    };
    this.sections = Array.from(
      this.querySelectorAll(".blocks-group-parallax-image")
    );
    this.viewportTop = 0;
    this.activeIndex = 0;
    this.previousIndex = null;
    this.scrollValue = 0;
    this.boundOnScroll = this.onScroll.bind(this);
    this.lastScrollY = 0;
    this.scrollDirection = "down";
  }

  connectedCallback() {
    this.initContainer();
    this.handleSections();
    window.addEventListener("scroll", this.boundOnScroll);

    this.boundOnResize = this.onResize.bind(this);
    window.addEventListener("resize", this.boundOnResize);
    this.sections.forEach((section, i) => {
      const media = section.querySelector(".parallax-media");
      const content = section.querySelector(".parallax-content");

      if (media) {
        media.style.willChange = "transform, opacity";
      }

      if (content) {
        content.style.willChange = "transform, opacity";
      }

      if (i !== this.activeIndex) {
        section.style.setProperty("--stick-visibility", "0");
      } else {
        section.style.setProperty("--stick-visibility", "1");
      }
    });

    setTimeout(() => {
      this.onResize();
      this.handleSections();
    }, 500);
  }

  disconnectedCallback() {
    window.removeEventListener("scroll", this.boundOnScroll);
    window.removeEventListener("resize", this.boundOnResize);
  }

  onResize() {
    this.container.height = this.clientHeight;
    this.container.top = this.offsetTop;
    this.container.bottom = this.container.top + this.container.height;
    this.handleSections();
  }

  onScroll() {
    const currentScrollY = window.scrollY;
    this.scrollDirection = currentScrollY > this.lastScrollY ? "down" : "up";
    this.lastScrollY = currentScrollY;

    this.handleSections();
  }

  initContainer() {
    this.style.setProperty("--stick-items", `${this.sections.length + 1}00vh`);
  }

  handleSections() {
    this.viewportTop = window.scrollY;
    this.container.height = this.clientHeight;
    this.container.top = this.offsetTop;
    this.container.bottom = this.container.top + this.container.height;

    if (this.container.bottom <= this.viewportTop) {
      this.scrollValue = this.sections.length + 1;
    } else if (this.container.top >= this.viewportTop) {
      this.scrollValue = 0;
    } else {
      this.scrollValue = this.remapValue(
        this.viewportTop,
        this.container.top,
        this.container.bottom,
        0,
        this.sections.length + 1
      );
    }

    const previousActiveIndex = this.activeIndex;
    this.activeIndex =
      Math.floor(this.scrollValue) >= this.sections.length
        ? this.sections.length - 1
        : Math.floor(this.scrollValue);

    if (previousActiveIndex !== this.activeIndex) {
      this.animateSectionTransition(previousActiveIndex, this.activeIndex);
    }
  }

  animateSectionTransition(fromIndex, toIndex) {
    const isDesktop = window.innerWidth > 1025;
    if (fromIndex !== null && this.sections[fromIndex]) {
      const fromSection = this.sections[fromIndex];
      const fromMedia = fromSection.querySelector(".parallax-media");
      const fromContent = fromSection.querySelector(".parallax-content");

      fromSection.style.setProperty("--stick-visibility", "0");

      if (isDesktop) {
        if (fromMedia && typeof Motion !== "undefined") {
          Motion.animate(
            fromMedia,
            {
              opacity: [1, 0],
              scale: [1, this.scrollDirection === "down" ? 0.95 : 1.05],
              y: [0, this.scrollDirection === "down" ? "-10px" : "10px"],
            },
            {
              duration: 0.5,
              easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
            }
          );
        } else if (fromMedia) {
          fromMedia.style.opacity = "0";
        }

        if (fromContent && typeof Motion !== "undefined") {
          Motion.animate(
            fromContent,
            {
              opacity: [1, 0],
              y: [0, this.scrollDirection === "down" ? "-20px" : "20px"],
            },
            {
              duration: 0.5,
              easing: "cubic-bezier(0.4, 0.0, 0.2, 1)",
            }
          );
        } else if (fromContent) {
          fromContent.style.opacity = "0";
        }
      }
    }

    const toSection = this.sections[toIndex];
    if (toSection) {
      const toMedia = toSection.querySelector(".parallax-media");
      const toContent = toSection.querySelector(".parallax-content");

      toSection.style.setProperty("--stick-visibility", "1");

      if (isDesktop) {
        if (toMedia && typeof Motion !== "undefined") {
          Motion.animate(
            toMedia,
            {
              opacity: [0, 1],
              scale: [this.scrollDirection === "down" ? 1.05 : 0.95, 1],
              y: [this.scrollDirection === "down" ? "10px" : "-10px", 0],
            },
            {
              duration: 0.6,
              easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
            }
          );
        } else if (toMedia) {
          toMedia.style.opacity = "1";
        }

        if (toContent && typeof Motion !== "undefined") {
          Motion.animate(
            toContent,
            {
              opacity: [0, 1],
              y: [this.scrollDirection === "down" ? "20px" : "-20px", 0],
            },
            {
              duration: 0.6,
              delay: 0.1,
              easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
            }
          );
        } else if (toContent) {
          toContent.style.opacity = "1";
        }
      }
    }
  }

  remapValue(value, start1, end1, start2, end2) {
    const remapped =
      ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
    return remapped > 0 ? remapped : 0;
  }
}

if (!customElements.get("sticky-section")) {
  customElements.define("sticky-section", StickySection);
}

class MotionItemsEffect extends HTMLElement {
  constructor() {
    super();
    this.setupInitialAnimation();
    this.setupInViewEffect();
  }

  get allItems() {
    return this.querySelectorAll(".motion-item");
  }

  get visibleItems() {
    return this.querySelectorAll(".product-item:not([style])");
  }

  setupInitialAnimation() {
    Motion.animate(
      this.allItems,
      {
        transform: "translateY(4rem)",
        opacity: 0.01,
        visibility: "hidden",
      },
      {
        duration: 0,
      }
    );
  }

  setupInViewEffect() {
    Motion.inView(this, this.animateItems.bind(this), {
      margin: "0px 0px -50px 0px",
    });
  }

  animateItems() {
    Motion.animate(
      this.allItems,
      {
        transform: ["translateY(4rem)", "translateY(0)"],
        opacity: [0.01, 1],
        visibility: ["hidden", "visible"],
      },
      {
        duration: 0.3,
        delay: Motion.stagger(0.1),
        easing: [0, 0, 0.3, 1],
      }
    );
  }

  reloadAnimationEffect() {
    Motion.animate(
      this.visibleItems,
      {
        transform: ["translateY(4rem)", "translateY(0)"],
        opacity: [0.01, 1],
        visibility: ["hidden", "visible"],
      },
      {
        duration: 0.3,
        delay: Motion.stagger(0.1),
        easing: [0, 0, 0.3, 1],
      }
    );
  }
}
customElements.define("motion-items-effect", MotionItemsEffect);

class ButtonCopyLink extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }
  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
  }
  onClick() {
    const url = this.getAttribute("data-href");
    navigator.clipboard.writeText(url);
    NextSkyTheme.notifierInline.show(
      window.message.socialCopyLink.success,
      "success"
    );
  }
}
customElements.define("button-copy-link", ButtonCopyLink, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "button-copy-link": {
    tagElement: "button",
    classElement: ButtonCopyLink,
  },
});
class DraggableModal extends HTMLElement {
  constructor() {
    super();
    this.isDragging = false;
    this.startY = 0;
    this.currentY = 0;
    this.threshold = 100;

    this.startDrag = this.startDrag.bind(this);
    this.onDrag = this.onDrag.bind(this);
    this.endDrag = this.endDrag.bind(this);
  }

  connectedCallback() {
    this.modalElement = this.closest(".active-modal-js");
    if (!this.modalElement) return;
    if (window.innerWidth >= 1025) {
      return;
    }
    this.addEventListener("touchstart", this.startDrag, { passive: true });
    this.addEventListener("mousedown", this.startDrag);
    document.addEventListener("touchmove", this.onDrag, { passive: false });
    document.addEventListener("mousemove", this.onDrag);
    document.addEventListener("touchend", this.endDrag);
    document.addEventListener("mouseup", this.endDrag);
  }

  disconnectedCallback() {
    this.removeEventListener("touchstart", this.startDrag);
    this.removeEventListener("mousedown", this.startDrag);
    document.removeEventListener("touchmove", this.onDrag);
    document.removeEventListener("mousemove", this.onDrag);
    document.removeEventListener("touchend", this.endDrag);
    document.removeEventListener("mouseup", this.endDrag);
  }

  startDrag(e) {
    if (!this.modalElement) return;

    this.isDragging = true;
    this.startY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    this.currentY = this.startY;

    this.modalElement.classList.add("is-dragging");
    this.style.cursor = "grabbing";

    const modalBody = this.modalElement.querySelector(".modal-draggable");
    if (modalBody) {
      modalBody.style.transition = "none";
    }
  }

  onDrag(e) {
    if (!this.isDragging || !this.modalElement) return;

    e.preventDefault();

    this.currentY = e.type.includes("mouse") ? e.clientY : e.touches[0].clientY;
    const dragDistance = this.currentY - this.startY;

    if (dragDistance > 0) {
      const resistance = 0.4;
      const modalBody = this.modalElement.querySelector(".modal-draggable");

      if (modalBody) {
        modalBody.style.transform = `translateY(${
          dragDistance * resistance
        }px)`;
      }
    }
  }

  endDrag() {
    if (!this.isDragging || !this.modalElement) return;

    const dragDistance = this.currentY - this.startY;
    this.isDragging = false;
    this.style.cursor = "grab";
    this.modalElement.classList.remove("is-dragging");

    const modalBody = this.modalElement.querySelector(".modal-draggable");
    if (!modalBody) return;

    modalBody.style.transition = "transform 0.3s ease-out";

    if (dragDistance > this.threshold) {
      modalBody.style.transform = `translateY(100%)`;

      setTimeout(() => {
        if (typeof NextSkyTheme !== "undefined" && NextSkyTheme.eventModal) {
          NextSkyTheme.eventModal(this.modalElement, "close");
        }

        modalBody.style.transform = "";
        modalBody.style.transition = "";
      }, 300);
    } else {
      modalBody.style.transform = "";
      setTimeout(() => {
        modalBody.style.transition = "";
      }, 300);
    }
  }
}
customElements.define("draggable-modal", DraggableModal);

class ButtonQuickView extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
  }

  get sectionId() {
    return document.querySelector("quickview-drawer")
      ? document
          .querySelector("quickview-drawer")
          .getAttribute("data-section-id")
      : null;
  }

  init() {
    this.addEventListener("click", this.onClick.bind(this), false);
    this.addEventListener(
      "keypress",
      function (event) {
        if (event.key === "Enter") {
          this.onClick.bind(this)(event);
        }
      }.bind(this),
      false
    );
  }

  async onClick(e) {
    e.preventDefault();
    if (this.dataset.url) {
      this.setAttribute("aria-disabled", true);
      this.classList.add("loading");
      if (!this.sectionId) {
        window.location.href = this.dataset.url;
        return;
      }
      await (import(importJs.mediaGallery), import(importJs.productModel));
      this.fetchUrl();
    }
  }

  fetchUrl() {
    fetch(`${this.dataset.url}?section_id=${this.sectionId}`)
      .then((response) => response.text())
      .then((text) => {
        const html = NextSkyTheme.parser.parseFromString(text, "text/html");
        document.querySelector(".quickview-product").innerHTML =
          html.querySelector(".quickview-product").innerHTML;
      })
      .finally(async () => {
        this.classList.remove("loading");
        this.removeAttribute("aria-disabled");
        const drawer = document.querySelector("quickview-drawer");
        NextSkyTheme.eventModal(drawer, "open", false, "delay", true);
        NextSkyTheme.global.rootToFocus = this;
        new LazyLoader(".image-lazy-load");
        await (import(importJs.mediaLightboxGallery),
        import(importJs.countdownTimer),
        import(importJs.recipientForm));
        drawer.querySelector(".modal-inner").scrollTop = 0;
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
customElements.define("button-quick-view", ButtonQuickView, {
  extends: "button",
});
CustomElement.observeAndPatchCustomElements({
  "button-quick-view": {
    tagElement: "button",
    classElement: ButtonQuickView,
  },
});

class SelectContact extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const text = this.getAttribute("text");
    if (text) {
      const options = text.split(",").map((item) => item.trim());
      const selectElement = this.closest(
        ".field-contact-subject"
      ).querySelector("select");
      options.forEach((optionText) => {
        const option = document.createElement("option");
        option.value = optionText.toLowerCase();
        option.textContent =
          optionText.charAt(0).toUpperCase() + optionText.slice(1);
        selectElement.appendChild(option);
      });
    }
  }
}
customElements.define("select-contact", SelectContact);

class GridCustom extends HTMLElement {
  constructor() {
    super();
    this.enableCarousel = this.dataset.actionMobile === "true";
    this.breakpoint = 767;
    this.swiperInstance = null;
    this.originalHTML = this.innerHTML;
    this.originalStyle = this.getAttribute("style") || "";
  }

  connectedCallback() {
    setTimeout(() => {
      this.init();
    }, 300);
  }

  init() {
    if (!this.enableCarousel) return;

    let width = window.innerWidth;

    if (width <= this.breakpoint) {
      this.actionOnMobile();
    } else {
      this.actionOutMobile();
    }

    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      if (newWidth <= this.breakpoint && width > this.breakpoint) {
        this.actionOnMobile();
      }
      if (newWidth > this.breakpoint && width <= this.breakpoint) {
        this.actionOutMobile();
      }
      width = newWidth;
    });
  }

  actionOnMobile() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }

    const currentStyle = this.getAttribute("style") || "";

    this.classList.add("swiper");
    this.classList.remove("grid", "grid-cols", "gap");

    const items = Array.from(this.children);
    const swiperWrapper = document.createElement("div");
    swiperWrapper.className = "swiper-wrapper";

    items.forEach((item) => {
      const slide = document.createElement("div");
      slide.className = "swiper-slide";
      slide.appendChild(item);
      swiperWrapper.appendChild(slide);
    });

    this.innerHTML = "";
    this.appendChild(swiperWrapper);

    if (currentStyle) {
      this.setAttribute("style", currentStyle);
    }

    const pagination = document.createElement("div");
    pagination.className = "swiper-pagination";
    pagination.style.setProperty("--swiper-pagination-bottom", "0");
    this.appendChild(pagination);

    this.initSwiper();
    new LazyLoader(".image-lazy-load");
  }

  actionOutMobile() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }

    this.classList.remove("swiper");
    this.classList.add("grid", "grid-cols", "gap");

    this.innerHTML = this.originalHTML;
    if (this.originalStyle) {
      this.setAttribute("style", this.originalStyle);
    }

    new LazyLoader(".image-lazy-load");
  }

  initSwiper() {
    this.swiperInstance = initSlide(this);
  }

  disconnectedCallback() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy(true, true);
      this.swiperInstance = null;
    }
  }
}

customElements.define("grid-custom", GridCustom);

class BeforeYouLeave extends HTMLElement {
  constructor() {
    super();
    this.delay = parseInt(this.dataset.timeDelay, 10);
    this.sectionId = this.dataset.sectionId;
    this.interactions = 0;
    this.popupTimeout = null;
    this.popupActive = false;

    this.interactionHandler = this.interactionHandler.bind(this);
    this.closeHandler = this.closeHandler.bind(this);

    setTimeout(() => this.init(), 10000);
  }

  init() {
    const sourceContent = document.getElementById(this.sectionId);
    if (!sourceContent) {
      console.error("Section content not found:", this.sectionId);
      return;
    }

    this.innerHTML = sourceContent.innerHTML;

    if (typeof BlsLazyloadImg !== "undefined") {
      BlsLazyloadImg.init();
    }

    this.initPopup();
  }

  initPopup() {
    this.interactions = 0;

    ["scroll", "click", "mousemove", "keydown"].forEach((evt) => {
      document.body.addEventListener(evt, this.interactionHandler);
    });

    this.popupTimeout = setTimeout(() => {
      if (this.interactions === 0 && !this.popupActive) {
        NextSkyTheme.eventModal(this, "open");
        this.popupActive = true;
        this.bindCouponCopy();
      } else {
        console.log("Popup cancelled due to interaction");
        this.cleanup();
        this.initPopup(); // Reset popup nếu người dùng có tương tác
      }
    }, (this.delay - 10) * 1000);

    this.addEventListener("click", this.closeHandler);
  }

  interactionHandler() {
    this.interactions++;
  }

  closeHandler(e) {
    if (
      e.target.closest(".close-before") ||
      e.target.matches(".modal-overlay")
    ) {
      clearTimeout(this.popupTimeout);
      NextSkyTheme.eventModal(this, "close");
      this.popupActive = false;
      this.cleanup();
      this.initPopup(); // Gọi lại popup sau khi đóng
    }
  }

  bindCouponCopy() {
    const discounts = this.querySelectorAll(".discount");
    discounts.forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        navigator.clipboard.writeText(el.dataset.code);
        el.classList.add("action-copy");
        setTimeout(() => el.classList.remove("action-copy"), 1500);
      });
    });
  }

  cleanup() {
    ["scroll", "click", "mousemove", "keydown"].forEach((evt) => {
      document.body.removeEventListener(evt, this.interactionHandler);
    });
    this.removeEventListener("click", this.closeHandler);
  }

  disconnectedCallback() {
    clearTimeout(this.popupTimeout);
    this.cleanup();
  }
}

customElements.define("before-you-leave", BeforeYouLeave);

class ShareButton extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.handleShare.bind(this));
  }

  handleShare() {
    const title = this.getAttribute("data-title") || document.title;
    const text = this.getAttribute("data-text") || "";
    const url = this.getAttribute("data-url") || window.location.href;

    if (navigator.share) {
      navigator.share({ title, text, url });
    } else {
      alert("Your browser doesn't support sharing.");
    }
  }
}
customElements.define("share-button", ShareButton);

class InnerTab extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll("button").forEach((button) =>
      button.addEventListener("click", this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    const currentTarget = event.currentTarget;
    if (currentTarget.classList.contains("active")) {
      return;
    }
    const id = currentTarget.getAttribute("data-id");
    const visibleItems = document.getElementById(id);
    this.querySelectorAll("button").forEach((button) =>
      button.classList.remove("active")
    );
    currentTarget.classList.add("active");
    this.closest(".content-tabs")
      .querySelectorAll(".tab-content")
      .forEach((result) => {
        if (result.id !== id) {
          result.classList.add("hidden");
          Motion.animate(
            result,
            {
              transform: "translateY(10px)",
              opacity: 0,
              visibility: "hidden",
            },
            {
              duration: 0,
            }
          );
        }
      });

    visibleItems.classList.remove("hidden");
    Motion.animate(
      visibleItems,
      {
        transform: ["translateY(10px)", "translateY(0)"],
        opacity: [0, 1],
        visibility: ["hidden", "visible"],
      },
      {
        duration: 0.5,
        delay: Motion.stagger(0.1),
        easing: [0, 0, 0.3, 1],
      }
    );
  }
}
customElements.define("inner-tab", InnerTab);
