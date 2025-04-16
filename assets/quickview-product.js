import * as NextSkyTheme from "global";
import { LazyLoader } from "module-lazyLoad";
import { CustomElement } from "module-safariElementPatch";

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
      : document
          .querySelector("quickview-drawer")
          .getAttribute("data-section-id");
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

  onClick(e) {
    e.preventDefault();
    if (this.dataset.url) {
      this.setAttribute("aria-disabled", true);
      this.classList.add("loading");
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
      .finally(() => {
        this.classList.remove("loading");
        this.removeAttribute("aria-disabled");
        NextSkyTheme.eventModal(
          document.querySelector("quickview-drawer"),
          "open",
          false,
          "delay"
        );
        new LazyLoader(".image-lazy-load");
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
