import * as NextSkyTheme from "global";
class ButtonBoughtTogetherMobile extends HTMLElement {
  constructor() {
    super();
    this.boughtTogetherList = null;
    this.boughtTogetherParent = null;
    this.init();
  }

  init() {
    this.addEventListener("click", this.handleClick.bind(this));
    this.handleResponsive();
    window.addEventListener("resize", this.handleResponsive.bind(this));
  }

  handleResponsive() {
    const isMobile = window.innerWidth <= 767;
    const boughtTogetherList = document.querySelector(".bought-together-list");

    if (isMobile) {
      if (boughtTogetherList && !this.boughtTogetherList) {
        this.boughtTogetherList = boughtTogetherList.cloneNode(true);
        this.boughtTogetherParent = boughtTogetherList.parentNode;
        boughtTogetherList.remove();
        const drawerBody =
          this.closest("section").querySelector(".drawer__body");
        if (drawerBody) {
          drawerBody.prepend(this.boughtTogetherList.cloneNode(true));
        }
      }
    } else {
      if (this.boughtTogetherList && this.boughtTogetherParent) {
        const drawerBody =
          this.closest("section").querySelector(".drawer__body");
        if (drawerBody) {
          const drawerBoughtList = drawerBody.querySelector(
            ".bought-together-list"
          );
          if (drawerBoughtList) {
            drawerBoughtList.remove();
          }
        }
        if (!document.querySelector(".bought-together-list")) {
          this.boughtTogetherParent.appendChild(this.boughtTogetherList);
          this.boughtTogetherList = null;
          this.boughtTogetherParent = null;
        }
      }

      if (document.querySelector("bought-together-popup.active")) {
        NextSkyTheme.eventModal(
          this.closest("section").querySelector("bought-together-popup"),
          "close",
          false
        );
      }
    }
  }

  handleClick(event) {
    event.preventDefault();
    const section = this.closest("section").querySelector(
      "bought-together-popup"
    );
    setTimeout(() => NextSkyTheme.eventModal(section, "open", false), 100);
    NextSkyTheme.global.rootToFocus = this;
  }
}

customElements.define(
  "button-bought-together-mobile",
  ButtonBoughtTogetherMobile
);
