export var Shopify = Shopify || {};
export var root = document.getElementsByTagName("html")[0];
export var body = document.getElementsByTagName("body")[0];

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

export var parser = new DOMParser();

export var ON_CHANGE_DEBOUNCE_TIMER = 300;

export var PUB_SUB_EVENTS = {
  cartUpdate: "cart-update",
  quantityUpdate: "quantity-update",
  variantChange: "variant-change",
};

export function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== "ESCAPE") return;
  const element = event.target;
  console.log(element);
  eventModal(element, "close");
}

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}
var trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
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

function removeTrapFocus(elementToFocus = null) {
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

export function eventModal(
  element,
  event,
  removeElementAfter = false,
  actionModal = null
) {
  if (event == "open") {
    root.classList.add("open-modal");
    element.classList.add("active");
    if (removeElementAfter) {
      element.classList.add("remove-after");
    }
    if (actionModal == "delay") {
      setTimeout(() => {
        element.querySelector(".model_media").classList.add("open");
      }, 350);
    }
    root.style.setProperty("padding-right", getScrollBarWidth.init() + "px");
    trapFocus(element);
  } else {
    const active_modal = document.querySelectorAll(".active-modal-js.active");
    if (element.classList.contains("active-modal-js")) {
      element.classList.remove("active");
      element.querySelector(".model_media").classList.remove("open");
      if (element.classList.contains("remove-after")) {
        setTimeout(() => element.remove(), 600);
      }
    } else {
      if (element.closest(".active-modal-js").classList.contains("delay")) {
        element.closest(".active-modal-js").classList.remove("active");
        element
          .closest(".active-modal-js")
          .querySelector(".model_media")
          .classList.remove("open");
      } else {
        element.closest(".active-modal-js").classList.remove("active");
      }
      if (
        element.closest(".active-modal-js").classList.contains("remove-after")
      ) {
        setTimeout(() => element.closest(".active-modal-js").remove(), 600);
      }
    }
    if (active_modal.length == 1) {
      root.classList.remove("open-modal");
      root.style.removeProperty("padding-right");
      removeTrapFocus(element);
    }
  }
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
  const cookieArray = decodedCookie.split(';');
  
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
  expirationDate.setTime(expirationDate.getTime() + (days * 24 * 60 * 60 * 1000));
  
  const cookieValue = encodeURIComponent(value) + 
    "; expires=" + expirationDate.toUTCString() +
    "; path=" + path;
  
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
