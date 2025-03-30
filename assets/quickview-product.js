import * as global from "global";

class ButtonQuickView extends HTMLButtonElement {
  constructor() {
    super();
    this.init();
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
    fetch(this.dataset.url)
      .then((response) => response.text())
      .then((text) => {
        const html = global.parser.parseFromString(text, "text/html");
        document.querySelector(".quickview-product").innerHTML =
          html.querySelector(".quickview-product").innerHTML;
      })
      .finally(() => {
        this.classList.remove("loading");
        this.removeAttribute("aria-disabled");
        global.eventModal(document.querySelector("quickview-drawer"), "open");
      })
      .catch((e) => {
        console.error(e);
      });
  }
}
customElements.define("button-quick-view", ButtonQuickView, {
  extends: "button",
});
