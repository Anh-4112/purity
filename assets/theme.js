import { initSlide, SlideSection } from "module-slide";
import { LazyLoadEventHover, LazyLoader } from "module-lazyLoad";
import { CustomElement } from "module-safariElementPatch";
import { ProductForm } from "module-addToCart";
import * as NextSkyTheme from "global";

LazyLoadEventHover.run();
new LazyLoader(".image-lazy-load");

document.addEventListener("shopify:section:load", function () {
  new LazyLoader(".image-lazy-load");
});

const delegate = new NextSkyTheme.eventDelegate();

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

Shopify.formatMoney = function (cents, format) {
  if (typeof cents == "string") {
    cents = cents.replace(".", "");
  }
  var value = "";
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = format || this.money_format;
  function defaultOption(opt, def) {
    return typeof opt == "undefined" ? def : opt;
  }

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultOption(precision, 2);
    thousands = defaultOption(thousands, ",");
    decimal = defaultOption(decimal, ".");

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split("."),
      dollars = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands),
      cents = parts[1] ? decimal + parts[1] : "";

    return dollars + cents;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
  }
  return formatString.replace(placeholderRegex, value);
};

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

  get dataStickyMobile() {
    return this.hasAttribute("data-sticky-mobile")
      ? this.getAttribute("data-sticky-mobile")
      : "false";
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
      if (this.dataStickyMobile == "false" && window.innerWidth < 1025) {
        return;
      }
      if (this.dataStickyType === "on-scroll-up") {
        this.classList.add("scroll-up");
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
          header.classList.add("section-header-sticky");
        } else {
          header.classList.remove("section-header-sticky");
        }
      } else {
        if (positionScrollY > 0) {
          if (positionScrollY > headerHeight) {
            header.classList.add("scr-pass-header");
            if (positionScrollY > this.check) {
              header.classList.add("header-sticky-hidden");
            } else {
              header.classList.remove("header-sticky-hidden");
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
            "section-header-sticky"
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
    return value
      ? (megaMenuCount.set(
          DetailsMegaMenu,
          megaMenuCount.get(DetailsMegaMenu) + 1
        ),
        this.setAttribute("open", ""),
        this.summaryElement.setAttribute("open", ""),
        document.addEventListener("click", this.detectClickOutsideListener),
        document.addEventListener("keydown", this.detectEscKeyboardListener),
        document.addEventListener("focusout", this.detectFocusOutListener),
        this.classList.add("detail-open"),
        this.dropdownsAnimation == "fade-in-down" && window.innerWidth >= 1025
          ? (this.contentElement.setAttribute("open", ""),
            this.contentElement.classList.add("expanding"),
            await this.fadeInDown(),
            this.contentElement.classList.remove("expanding"))
          : setTimeout(() => this.contentElement.setAttribute("open", ""), 100))
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
        this.dropdownsAnimation == "fade-in-down" && window.innerWidth >= 1025
          ? (this.contentElement.classList.add("expanding"),
            await this.fadeInUp(),
            this.contentElement.classList.remove("expanding"),
            this.open || this.removeAttribute("open"))
          : setTimeout(() => this.open || this.removeAttribute("open"), 300));
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
    (this.summaryElement = this.firstElementChild),
      (this.contentElement = this.lastElementChild),
      (this._open = this.hasAttribute("open")),
      (this.content =
        this.closest(".menu-link").querySelector(".sub-children-menu")),
      this.summaryElement.addEventListener(
        "click",
        this.onSummaryClicked.bind(this)
      );
    this.initialize();
  }

  onSummaryClicked(event) {
    event.preventDefault();
    this.open = !this.open;
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
    if (this.content) {
      Motion.animate(
        this.content,
        this._open ? { height: "auto" } : { height: 0 },
        { duration: 0 }
      );
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
    }
  }

  loadContent() {
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
      poster.addEventListener("click", this.loadContent.bind(this));
    }
  }
}
customElements.define("video-product-gallery", VideoProductGallery);

class VideoLocalLightbox extends VideoLocal {
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
customElements.define("video-local-lightbox", VideoLocalLightbox);

class VariantInput extends HTMLElement {
  constructor() {
    super(),
      (this.show_more = this.querySelector(".number-showmore")),
      (this.size_chart = this.querySelector(".open-size-chart")),
      (this.event_target = null),
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
  }

  get sectionId() {
    return this.hasAttribute("data-section-id")
      ? this.getAttribute("data-section-id")
      : this.getAttribute("data-section-id");
  }

  get blockId() {
    return this.hasAttribute("data-block-id")
      ? this.getAttribute("data-block-id")
      : this.getAttribute("data-block-id");
  }

  get productUrl() {
    return this.hasAttribute("data-product-url")
      ? this.getAttribute("data-product-url")
      : this.getAttribute("data-product-url");
  }

  connectedCallback() {
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
    this.querySelectorAll('.product-card-swatch-js [type="radio"]').forEach(
      (input) => {
        input.addEventListener("change", this.onSwatchChanged.bind(this));
      }
    );

    this.querySelectorAll('.product-card-variant-js [type="radio"]').forEach(
      (input) => {
        input.addEventListener("change", this.onVariantChange.bind(this));
      }
    );
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

      if (target.hasAttribute("data-value-media")) {
        const newMedia = JSON.parse(target.getAttribute("data-value-media"));
        const currentImage =
          this.closest(".product__item-js").querySelector(".featured-image");
        const newImage = this.createResponsiveImage(
          newMedia,
          currentImage.className,
          currentImage.sizes
        );

        const secondaryImage = this.closest(".product__item-js").querySelector(
          ".product__hover-img"
        );
        if (secondaryImage) {
          secondaryImage.classList.remove("hidden");
        }

        if (currentImage.src !== newImage.src) {
          await Motion.animate(
            currentImage,
            { opacity: [1, 0] },
            { duration: 0.1, easing: "ease-in", fill: "forwards" }
          ).finished;
          await new Promise((resolve) =>
            newImage.complete ? resolve() : (newImage.onload = resolve)
          );
          currentImage.replaceWith(newImage);
          Motion.animate(
            newImage,
            { opacity: [0, 1] },
            { duration: 0.1, easing: "ease-in" }
          );
        }
      }
    }
  }

  async onVariantChange(event) {
    event.preventDefault();
    this.event_target = event.target;
    const selectedValues = Array.from(
      this.querySelectorAll('input[type="radio"]:checked')
    ).map((radio) => radio.value);
    const requestUrl = this.createRequestUrl(this.productUrl, selectedValues);
    this.fetchProductInfo({
      requestUrl,
      onSuccess: this.updateProductInfo,
    });
  }

  createRequestUrl(baseUrl, optionValues) {
    const queryParams = [`section_id=${this.sectionId}`];
    if (optionValues.length > 0) {
      queryParams.push(`option_values=${optionValues.join(",")}`);
    }
    return `${baseUrl}?${queryParams.join("&")}`;
  }

  fetchProductInfo({ requestUrl, onSuccess }) {
    this.abortController?.abort();
    this.abortController = new AbortController();

    fetch(requestUrl, { signal: this.abortController.signal })
      .then((response) => response.text())
      .then((responseText) => {
        const parsedHTML = new DOMParser().parseFromString(
          responseText,
          "text/html"
        );
        onSuccess(parsedHTML, this.sectionId, this.event_target, this.blockId);
      })
      .catch((error) => console.error("Error:", error));
  }

  updateProductInfo(parsedHTML, sectionId, eventTarget, blockId) {
    const template = parsedHTML.querySelector("template");
    let queryParsed, queryDocument;
    if (template && blockId) {
      const content = document.createElement("div");
      content.appendChild(template.content.firstElementChild.cloneNode(true));
      queryParsed = content.querySelector(`#Product-${blockId}`);
      queryDocument = document.querySelector(`#Product-${blockId}`);
    } else {
      queryParsed = parsedHTML.getElementById(`Product-${sectionId}`);
      queryDocument = document.getElementById(`Product-${sectionId}`);
    }
    const updateContent = (blockClass) => {
      const source = queryParsed.querySelector(`.${blockClass}`);
      const destination = queryDocument.querySelector(`.${blockClass}`);
      if (source && destination) {
        destination.innerHTML = source.innerHTML;
        if (blockClass == "block-product__variant-picker") {
          destination
            .querySelector(`input[value="${eventTarget.value}"]:checked`)
            .focus({ focusVisible: true });
        }
      }
    };

    const blocksToUpdate = [
      "block__media-gallery",
      "block-product__badges",
      "block-product__price",
      "block-product__variant-picker",
      "block-product__inventory",
      "block-product__buttons",
      "block-product__pickup",
    ];
    blocksToUpdate.forEach(updateContent);
    new LazyLoader(".image-lazy-load");
  }

  createResponsiveImage(media, classNames, responsiveSizes) {
    return NextSkyTheme.createMediaImageElement(
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
      NextSkyTheme.body.appendChild(content.querySelector("size-chart-popup"));
    }
    setTimeout(
      () =>
        NextSkyTheme.eventModal(
          document.querySelector("size-chart-popup"),
          "open",
          true
        ),
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

class CartDrawer extends HTMLElement {
  constructor() {
    super();
  }

  get cartActionId() {
    return document.getElementById("cart-icon-bubble") || null;
  }

  get sectionId() {
    return this.hasAttribute("data-section-id")
      ? this.getAttribute("data-section-id")
      : this.getAttribute("data-section-id");
  }

  get formAction() {
    return Array.from(this.querySelectorAll("form .btn"));
  }

  get cartViewId() {
    return document.getElementById("cart-icon-bubble") || null;
  }

  connectedCallback() {
    if (this.cartActionId) {
      this.cartActionId.addEventListener(
        "click",
        this.onShowCartDrawer.bind(this)
      );
    }
    this.formAction.forEach((action) => {
      action.addEventListener("click", (event) => {
        action.classList.add("loading");
      });
    });
  }

  getSectionsToRender() {
    return [
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".drawer__header-cart",
      },
      {
        id: "cart-icon-bubble",
        section: "cart-icon-bubble",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".free-shipping-bar",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".cart-drawer__form",
      },
      {
        id: this.sectionId,
        section: this.sectionId,
        selector: ".drawer__footer-bottom-total",
      },
    ];
  }

  renderContents(parsedState) {
    if (this.querySelector(".drawer__inner-empty")) {
      const drawerBody = this.getSectionDOM(
        parsedState.sections[this.sectionId],
        ".drawer__body"
      );
      this.querySelector(".drawer__body").innerHTML = drawerBody.innerHTML;
      return;
    }

    this.getSectionsToRender().forEach((section, index) => {
      const sectionElement = section.selector
        ? document.querySelector(section.selector)
        : document.getElementById(section.id);
      if (!sectionElement) {
        return;
      }
      sectionElement.innerHTML = this.getSectionInnerHTML(
        parsedState.sections[section.id],
        section.selector
      );
      if (index === 1) {
        const nav_bar_id = document.querySelector("#cart-icon-bubble");
        if (
          nav_bar_id &&
          nav_bar_id.querySelector(".cart-count") &&
          sectionElement.querySelector(".cart-count")
        ) {
          nav_bar_id.querySelector(".cart-count").innerHTML =
            sectionElement.querySelector(".cart-count").innerHTML;
        }
      }
    });
  }

  getSectionInnerHTML(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector).innerHTML;
  }

  getSectionDOM(html, selector = ".shopify-section") {
    return new DOMParser()
      .parseFromString(html, "text/html")
      .querySelector(selector);
  }

  onShowCartDrawer(event) {
    event.preventDefault();
    NextSkyTheme.eventModal(this, "open", false, "delay");
  }
}
customElements.define("cart-drawer", CartDrawer);

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
      message.innerHTML += `<p>${rate.name}: ${Shopify.formatMoney(
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
    } else {
      this.classList.add("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-shipping")
          .classList.add("active");
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
    } else {
      this.classList.add("open");
      if (this.cartActionAddons) {
        this.cartActionAddons
          .closest(".drawer__cart-note")
          .classList.add("active");
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
            this.classList.add("hidden-cart-upsell");
          }
          if (recommendations && recommendations.innerHTML.trim().length) {
            this.querySelector(".swiper-wrapper").innerHTML =
              recommendations.innerHTML;
          }
          if (recommendations && recommendations.childElementCount == 0) {
            this.classList.add("hidden-cart-upsell");
          }
        })
        .finally(() => {})
        .catch((e) => {
          console.error(e);
        });
    }
  }
}
customElements.define("mini-cart-recommendations", MiniCartUpSell);

class CartUpSellProduct extends SlideSection {
  constructor() {
    super();
  }

  init() {
    let width = window.innerWidth;
    window.addEventListener("resize", () => {
      const newWidth = window.innerWidth;
      if (newWidth <= 1024 && width > 1024) {
        this.actionOnMobile();
      }
      if (newWidth > 1024 && width <= 1024) {
        this.actionOutMobile();
      }
      width = newWidth;
    });
    if (width <= 1024) {
      this.actionOnMobile();
    } else {
      this.actionOutMobile();
    }
  }

  actionOnMobile() {
    this.initSlideMediaGallery("CartUpSell");
    this.style.maxHeight = "auto";
  }

  actionOutMobile() {
    this.initSlideMediaGallery("CartUpSell");
    this.style.maxHeight =
      this.closest(".drawer__body").offsetHeight - 140 + "px";
  }
}
customElements.define("cart-upsell-product", CartUpSellProduct);

class ProductTabs extends HTMLElement {
  constructor() {
    super();
    this._selectedTab = null;
    this._tabs = null;
    this._tabContents = null;
    this._openAccordions = new Set();
    this._dot = this.querySelector(".product-tabs__dot");
    this._rangeSlider = this.querySelector("range-slider");
    this._sizeDot = this.dataset.sizeDot;

    if (Shopify && Shopify.designMode) {
      this.addEventListener("shopify:block:select", (event) => {
        const targetBlock = event.target.closest("[data-block-id]");
        if (targetBlock) {
          this.setTab(targetBlock.dataset.blockId, true);
        }
      });
    }
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
    setTimeout(() => this.init(), 10);
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

    if (animate) {
      if (typeof Motion !== "undefined") {
        Motion.animate(
          this._dot,
          { left: `${adjustedPosition}px` },
          { duration: 0.2, easing: "cubic-bezier(0.25, 0.1, 0.25, 1)" }
        );
      } else {
        this._dot.style.left = `${adjustedPosition}px`;
      }
    } else {
      this._dot.style.transition = "none";
      this._dot.style.left = `${adjustedPosition}px`;
      void this._dot.offsetWidth;
      this._dot.style.transition = "left 0.2s cubic-bezier(0.25, 0.1, 0.25, 1)";
    }
  }

  handleResize() {
    if (!this._rangeSlider) return;
    const activeTab = this.querySelector(".product-tabs__header-item.active");
    if (activeTab) {
      this.updateDotPosition(activeTab, false);
    }
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
              this.updateDotPosition(tab);
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
                this.updateDotPosition(tab);
              }
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
      }
    });

    if (this._rangeSlider && activeTab) {
      this.updateDotPosition(activeTab, animate);
    }

    const oldContent = this.querySelector(".product-tabs__content-item.active");
    const newContent = this.querySelector(
      `.product-tabs__content-item[data-block-id="${blockId}"]`
    );

    if (!newContent) {
      this._isAnimating = false;
      return;
    }

    if (animate && typeof Motion !== "undefined" && oldContent !== newContent) {
      this.transition(oldContent, newContent).finally(() => {
        this._isAnimating = false;
      });
    } else {
      this.tabContents.forEach((content) => {
        content.classList.remove("active");
        content.classList.add("hidden");
      });

      newContent.classList.add("active");
      newContent.classList.remove("hidden");
      this._isAnimating = false;
    }

    this.dispatchEvent(
      new CustomEvent("tabChanged", {
        detail: { blockId },
        bubbles: true,
      })
    );
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
            duration: 0.3,
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
          duration: 0.3,
        }
      );
    } catch (e) {
      console.error("Animation error:", e);
    }
  }

  disconnectedCallback() {
    if (this._tabs) {
      this._tabs.forEach((tab) => {
        tab.removeEventListener("click", null);
      });
    }
    if (this._rangeSlider) {
      window.removeEventListener("resize", this.handleResize);
    }
  }
}
customElements.define("product-tabs", ProductTabs);

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
    this.imageHover.style.display = "flex";
  }

  updateImageSize() {
    const maxWidth = Math.min(300, window.innerWidth * 0.5);
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
            scale: [0.9, 1],
          },
          {
            duration: 0.2,
            easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          }
        );
      } else {
        this.imageHover.style.opacity = "1";
        this.imageHover.style.transform = "translate(-50%, -50%) scale(1)";
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
            scale: [1, 0.9],
          },
          {
            duration: 0.2,
            easing: "cubic-bezier(0.25, 0.1, 0.25, 1)",
          }
        );
      } else {
        this.imageHover.style.opacity = "0";
        this.imageHover.style.transform = "translate(-50%, -50%) scale(0.95)";
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

class CarouselMobile extends HTMLElement {
  constructor() {
    super();
    this.enable = this.dataset.enableCarouselMobile == "true";
    this.isMulticontent = this.dataset.multicontent == "true";
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
    const wrapper = `<div class='swiper-wrapper custom-padding-carousel-mobile'>${html}</div><div class="swiper-pagination" style="--swiper-pagination-bottom: 0"></div>`;
    this.innerHTML = wrapper;
    initSlide(this);
  }

  actionOutMobile() {
    this.classList.remove("swiper");
    this.innerHTML = this.swiperSlideInnerHtml;

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
    if (scrollTop > 200) {
      this.classList.add("show");
    } else {
      this.classList.remove("show");
    }
  }
}
customElements.define("mobile-navigation-bar", NavBar);

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
    this.setupHoverTracking();
  }

  setupHoverTracking() {
    this.addEventListener("mouseenter", () => {
      this.isHovering = true;
      this.updateSliderStatus();
    });
    this.addEventListener("mouseleave", () => {
      this.isHovering = false;
      this.updateSliderStatus();
    });
    this.addEventListener("touchstart", () => {
      this.isHovering = true;
      this.updateSliderStatus();
    });
    this.addEventListener("touchend", () => {
      this.isHovering = false;
      this.updateSliderStatus();
    });
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
