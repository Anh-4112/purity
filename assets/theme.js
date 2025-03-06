import { initSlide } from './module_slide.js?v=1';

var Shopify = Shopify || {};
var root = document.getElementsByTagName("html")[0];
var body = document.getElementsByTagName("body")[0];


function eventModal(event){
  if (event == 'open') {
    root.classList.add("open-modal");
  } else {
    root.classList.remove("open-modal");
  }
}

class SlideSection extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const _this = this;
    if (document.body.classList.contains("index")) {
      let pos = window.pageYOffset;
      if (pos > 0 || document.body.classList.contains("swiper-lazy")) {
        initSlide(_this);
      } else {
        if (this.classList.contains("lazy-loading-swiper-before")) {
          initSlide(_this);
        } else {
          this.classList.add("lazy-loading-swiper-after");
        }
      }
    } else {
      initSlide(_this);
    }
  }
}
customElements.define("slide-section", SlideSection);

class ToggleMenu extends HTMLElement {
  constructor(){
    super();
    this.container = this.closest(".header__inner");
    this.init();
  }
  init(){
    this.addEventListener("click",  this.onClick.bind(this), false);
    this.container.addEventListener('keyup', (event) => event.code.toUpperCase() === 'ESCAPE' && this.close());
  }
  onClick(e){
    e.preventDefault();
    const menu_drawer = this.closest('.header-wrapper').querySelector("template.menu-drawer");
    if (menu_drawer) {
      const content = document.createElement("div");
      content.appendChild(
        menu_drawer.content.firstElementChild.cloneNode(true)
      );
      body.appendChild(content.querySelector("menu-drawer"));
      menu_drawer.remove();
    }
    eventModal('open');
  }
}
customElements.define('toggle-menu', ToggleMenu);

class ModalOverlay extends HTMLElement {
  constructor(){
    super();
    this.init();
  }
  init(){
    this.addEventListener("click",  this.onClick.bind(this), false);
  }
  onClick(e){
    eventModal('close');
  }
}
customElements.define('modal-overlay', ModalOverlay);

class MenuDrawer extends HTMLElement {
  constructor(){
    super();
    this.close = this.querySelector(".modal__close");
    this.init();
  }
  init(){
    this.close.addEventListener("click",  this.onClick.bind(this), false);
  }
  onClick(e){
    eventModal('close');
  }
}
customElements.define('menu-drawer', MenuDrawer);

const clearDropdownCount = new WeakMap;
class DetailsDropdown extends HTMLDetailsElement {
  constructor(){
    super();
    this.summaryElement = this.firstElementChild;
    this.contentElement = this.lastElementChild;
    this._open = this.hasAttribute("open");
    this.summaryElement.addEventListener("click", this.handleSummaryClick.bind(this));
  }

  handleSummaryClick(e){
    if (this._open){
      this.removeAttribute("open");
      this.summaryElement.removeAttribute("open");
      this.contentElement.removeAttribute("open");
    } else {
      this.summaryElement.setAttribute("open", "");
      this.contentElement.setAttribute("open", "");
    }
  }
}
customElements.define("details-dropdown", DetailsDropdown, {
  extends: "details"
}),
clearDropdownCount.set(DetailsDropdown, 0);