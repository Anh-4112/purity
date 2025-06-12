export var root = document.getElementsByTagName("html")[0];
export var body = document.getElementsByTagName("body")[0];
export const global = {
  rootToFocus: null,
};

export function formatMoney(cents, format) {
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
}

let subscribers = {};

export function subscribe(eventName, callback) {
  if (subscribers[eventName] === undefined) {
    subscribers[eventName] = [];
  }

  subscribers[eventName] = [...subscribers[eventName], callback];

  return function unsubscribe() {
    subscribers[eventName] = subscribers[eventName].filter((cb) => {
      return cb !== callback;
    });
  };
}

export function publish(eventName, data) {
  if (subscribers[eventName]) {
    subscribers[eventName].forEach((callback) => {
      callback(data);
    });
  }
}

export function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

export var parser = new DOMParser();

export var ON_CHANGE_DEBOUNCE_TIMER = 300;

export var PUB_SUB_EVENTS = {
  cartUpdate: "cart-update",
  quantityUpdate: "quantity-update",
  variantChange: "variant-change",
};

export function pauseAllMedia(element) {
  element.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  element.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  element.querySelectorAll('video').forEach((video) => video.pause());
  element.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

const trapFocusHandlers = {};
export function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function () {
    document.removeEventListener("keydown", trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function (event) {
    if (event.code.toUpperCase() !== "TAB") return;
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first?.focus();
    }
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last?.focus();
    }
  };

  document.addEventListener("focusout", trapFocusHandlers.focusout);
  document.addEventListener("focusin", trapFocusHandlers.focusin);

  elementToFocus.focus();

  if (
    elementToFocus.tagName === "INPUT" &&
    ["search", "text", "email", "url"].includes(elementToFocus.type) &&
    elementToFocus.value
  ) {
    elementToFocus.setSelectionRange(0, elementToFocus.value.length);
  }
}

export function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener("focusin", trapFocusHandlers.focusin);
  document.removeEventListener("focusout", trapFocusHandlers.focusout);
  document.removeEventListener("keydown", trapFocusHandlers.keydown);
  if (elementToFocus) elementToFocus.focus();
}

var getScrollBarWidth = (function () {
  return {
    init: function () {
      var scrollDiv = document.createElement("div");
      scrollDiv.style.width = "100px";
      scrollDiv.style.height = "100px";
      scrollDiv.style.overflow = "scroll";
      scrollDiv.style.position = "absolute";
      scrollDiv.style.top = "-9999px";
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    },
  };
})();

export async function eventModal(
  element,
  event,
  removeElementAfter = false,
  actionModal = null,
  actionMobile = false
) {
  if (event == "open") {
    root.classList.add("open-modal");
    element.classList.remove("content-hidden");
    element.classList.add("active");
    if (removeElementAfter) {
      element.classList.add("remove-after");
    }
    if (actionModal == "delay" && element.querySelector(".model_media")) {
      element.classList.add("delay");
      setTimeout(() => {
        element.querySelector(".model_media").classList.add("open");
      }, 350);
    }
    if (actionMobile) {
      if (actionMobile) {
        const modalBody = element.querySelector(".modal-body");
        if (modalBody && !modalBody.querySelector("draggable-modal")) {
          const draggableModal = document.createElement("draggable-modal");
          draggableModal.classList.add(
            "block",
            "hidden-1025",
            "relative",
            "pointer"
          );
          modalBody.prepend(draggableModal);
        }
      }
    }
    root.style.setProperty("padding-right", getScrollBarWidth.init() + "px");
    const elementFocus =
      element.querySelector(".modal-inner") ||
      element.querySelector(".modal-focus");
    trapFocus(elementFocus);
  } else {
    const active_modal = document.querySelectorAll(".active-modal-js.active");
    const modal_element = element.classList.contains("active-modal-js")
      ? element
      : element.closest(".active-modal-js");
    const focus_item = modal_element.hasAttribute("data-focus-item")
      ? modal_element.getAttribute("data-focus-item")
      : "";
    const modalDrawer = modal_element.hasAttribute("drawer");
    if (modal_element.classList.contains("delay")) {
      if (modal_element.querySelector(".model_media")) {
        await setTimeout(() => {
          modal_element.classList.remove("active", "delay");
          if (active_modal.length <= 1) {
            removeModalAction(modal_element);
          }
        }, 350);
        modal_element.querySelector(".model_media").classList.remove("open");
      } else {
        modal_element.classList.remove("active", "delay");
        removeModalAction(modal_element);
      }
    } else {
      modal_element.classList.remove("active");
    }
    if (modal_element.classList.contains("remove-after")) {
      await setTimeout(() => {
        if (focus_item && focus_item == "FacetsDrawer") {
          document
            .getElementById(focus_item)
            .parentNode.insertBefore(
              modal_element,
              modal_element.parentNode.nextElementSibling
            );
          modal_element.classList.remove("remove-after");
        } else {
          modal_element.remove();
        }
      }, 600);
    }
    if (modalDrawer) {
      setTimeout(() => {
        if (!modal_element.classList.contains("active")) {
          modal_element.classList.add("content-hidden");
        }
      }, 1000);
    }
    if (!modal_element.classList.contains("delay")) {
      if (active_modal.length <= 1) {
        removeModalAction(modal_element);
      }
    }
    removeTrapFocus(global.rootToFocus);
    global.rootToFocus = null;
  }
}

function removeModalAction(modal_element) {
  root.classList.remove("open-modal");
  root.classList.remove("open-modal-shopable-video");
  root.classList.remove("open-modal-offer-popup");
  root.style.removeProperty("padding-right");
  modal_element
    .querySelectorAll("button")
    .forEach((button) => button.classList.remove("active"));
  modal_element
    .querySelectorAll(".drawer-bottom")
    .forEach((addon) => addon.classList.remove("open"));
}

export class eventDelegate {
  constructor() {
    this.events = [];
  }

  on(eventType, selector, handler) {
    this.events.push({ eventType, selector, handler });
    document.addEventListener(eventType, (event) => {
      this.handleEvent(event, selector, handler);
    });
  }

  handleEvent(event, selector, handler) {
    if (event.target.matches(selector)) {
      handler.call(this, event);
    }
  }
}

export function fetchConfig(type = "json") {
  return {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: `application/${type}`,
    },
  };
}

export function getCookie(name) {
  const nameString = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(";");

  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i].trim();
    if (cookie.indexOf(nameString) === 0) {
      return cookie.substring(nameString.length, cookie.length);
    }
  }

  return null;
}

export function setCookie(name, value, days = 30, path = "/") {
  const expirationDate = new Date();
  expirationDate.setTime(expirationDate.getTime() + days * 24 * 60 * 60 * 1000);

  const cookieValue =
    encodeURIComponent(value) +
    "; expires=" +
    expirationDate.toUTCString() +
    "; path=" +
    path;

  document.cookie = name + "=" + cookieValue;
}

export function createMediaImageElement(
  media,
  availableWidths = [],
  additionalAttributes = {}
) {
  const {
    width: imageWidth,
    height: imageHeight,
    src: imageSrc,
  } = media.preview_image;
  const imageElement = new Image(imageWidth, imageHeight);
  Object.entries(additionalAttributes).forEach(
    ([attributeName, attributeValue]) => {
      imageElement.setAttribute(attributeName, attributeValue);
    }
  );
  imageElement.alt = media.alt;
  imageElement.src = resolveImageUrl(imageSrc, imageWidth);
  imageElement.srcset = createResponsiveSrcset(
    media.preview_image,
    availableWidths
  );

  return imageElement;
}

function createResponsiveSrcset(image, availableWidths = []) {
  const imageUrl = new URL(
    image.src.startsWith("//") ? `https:${image.src}` : image.src
  );
  const maxWidth = image.width;

  return availableWidths
    .filter((width) => width <= maxWidth)
    .map((width) => {
      imageUrl.searchParams.set("width", width.toString());
      return `${imageUrl.href} ${width}w`;
    })
    .join(", ");
}

function resolveImageUrl(src, width) {
  return new URL(
    src.startsWith("//")
      ? `https:${src}&width=${width}`
      : `${src}&width=${width}`
  ).href;
}

class AlertNotify {
  constructor() {
    this.container = document.getElementById("notification-container");
    if (!this.container) {
      this.container = document.createElement("div");
      this.container.id = "notification-container";
      document.body.appendChild(this.container);
    }
  }

  show(message, type = "warning", duration = 3000) {
    const notification = document.createElement("div");
    notification.classList.add("notification", type);
    const icon = this.createIcon(type);
    const text = document.createElement("span");
    text.classList.add("error-message");
    text.innerHTML = message;
    notification.appendChild(icon.firstElementChild);
    notification.appendChild(text);
    this.container.appendChild(notification);

    setTimeout(() => {
      notification.classList.add("show");
    }, 10);

    setTimeout(() => {
      this.hide(notification);
    }, duration);
  }

  hide(notification) {
    notification.classList.remove("show");
    setTimeout(() => {
      this.container.removeChild(notification);
    }, 300);
  }

  createIcon(type) {
    const icon = document.createElement("span");
    switch (type) {
      case "success":
        icon.innerHTML =
          '<svg width="20" height="20" fill="none" class="flex-auto w-20"><use href="#icon-success"></use></svg>';
        break;
      case "error":
        icon.innerHTML =
          '<svg width="20" height="20" fill="none" class="flex-auto w-20"><use href="#icon-error"></use></svg>';
        break;
      case "warning":
        icon.innerHTML =
          '<svg width="20" height="20" fill="none" class="flex-auto w-20"><use href="#icon-info"></use></svg>';
        break;
      default:
        icon.innerHTML =
          '<svg width="20" height="20" fill="none" class="flex-auto w-20"><use href="#icon-success"></use></svg>';
    }
    return icon;
  }
}
export const notifier = new AlertNotify();
export const currency_rate = Shopify.currency.rate;

export class FSProgressBar {
  constructor(selector) {
    document
      .querySelectorAll(selector)
      .forEach((selector) => this.init(selector));
  }

  init(_this) {
    let progress = _this.querySelector(".progress");
    if (!progress) {
      progress = _this;
    }
    const rate = Number(Shopify.currency.rate);
    const min = progress?.dataset.feAmount
      ? Number(progress?.dataset.feAmount)
      : 0;
    if (!min || !rate) return;
    let orderTotal = progress?.dataset.totalOrder
      ? Number(progress?.dataset.totalOrder)
      : 0;
    const min_by_currency = min * rate * 100;
    if (orderTotal == 0) {
      this.setProgressBarTitle(_this, 0, min_by_currency);
    } else {
      orderTotal = orderTotal;
      if ((orderTotal / min_by_currency) * 100 > 100) {
        this.setProgressBar(_this, 100);
      } else {
        this.setProgressBar(_this, (orderTotal / min_by_currency) * 100);
      }
      this.setProgressBarTitle(_this, orderTotal, min_by_currency);
    }
  }

  setProgressBar(_this, progress) {
    _this
      .querySelector(".progress")
      .style.setProperty("--width", progress + "%");
  }

  setProgressBarTitle(_this, orderTotal = 0, min_by_currency = 0) {
    let emptyUnavailable = _this.dataset.emptyUnavailable;
    let feUnAvailable = _this.dataset.feUnavailable;
    const feAvailable = _this.dataset.feAvailable;
    if (orderTotal == 0 && emptyUnavailable) {
      _this.innerHTML = emptyUnavailable.replace(
        "[amount]",
        formatMoney(min_by_currency, themeGlobalVariables.settings.money_format)
      );
    } else {
      if (orderTotal >= min_by_currency) {
        _this.querySelector(".progress-bar-message").innerHTML = feAvailable;
        _this.classList.add("free-shipping");
      } else {
        _this.classList.remove("free-shipping");
        feUnAvailable = feUnAvailable.replace(
          "[amount]",
          '<span class="price">[amount]</strong>'
        );
        _this.querySelector(".progress-bar-message").innerHTML =
          feUnAvailable.replace(
            "[amount]",
            formatMoney(
              min_by_currency - orderTotal,
              themeGlobalVariables.settings.money_format
            )
          );
      }
    }
  }
}

export function loadImages(imageOrArray) {
  if (!imageOrArray) {
    return Promise.resolve();
  }
  const images =
    imageOrArray instanceof Element ? [imageOrArray] : Array.from(imageOrArray);
  if (images.length > 1) {
    return Promise.resolve();
  }
  return Promise.all(
    images.map((image) => {
      return new Promise((resolve) => {
        if (
          (image.tagName === "IMG" && image.complete) ||
          !image.offsetParent
        ) {
          resolve();
        } else {
          image.onload = () => {
            resolve();
          };
        }
      });
    })
  );
}
