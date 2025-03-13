import { initSlide } from './module_slide.js?v=123';

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
    this.initSlideSection(this);
  }

  init() {}
  initSlideSection() {
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

const megaMenuCount = new WeakMap;
class DetailsMegaMenu extends HTMLDetailsElement {
  constructor() {
    super(),
    this.summaryElement = this.firstElementChild,
    this.contentElement = this.lastElementChild,
    this._open = this.hasAttribute("open"),
    this.header = document.querySelector('header'),
    this.summaryElement.addEventListener("click", this.onSummaryClicked.bind(this)),
    this.detectClickOutsideListener = this.detectClickOutside.bind(this),
    this.detectEscKeyboardListener = this.detectEscKeyboard.bind(this),
    this.detectFocusOutListener = this.detectFocusOut.bind(this),
    this.detectHoverListener = this.detectHover.bind(this),
    this.addEventListener("mouseenter", this.detectHoverListener.bind(this)),
    this.addEventListener("mouseleave", this.detectHoverListener.bind(this))
  }
  set open(value) {
    value !== this._open && (this._open = value,
    this.isConnected ? this.transition(value) : value ? this.setAttribute("open", "") : this.removeAttribute("open"))
  }
  get open() {
    return this._open
  }
  get menuTrigger() {
    return this.header.hasAttribute("data-menu-trigger") ? this.header.getAttribute("data-menu-trigger") : "click"
  }
  onSummaryClicked(event) {
    event.preventDefault(),
    this.menuTrigger === "hover" && this.summaryElement.hasAttribute("data-href") && this.summaryElement.getAttribute("data-href").length > 0 ? window.location.href = this.summaryElement.getAttribute("data-href") : this.open = !this.open
  }
  async transition(value) {
    return value ? (megaMenuCount.set(DetailsMegaMenu, megaMenuCount.get(DetailsMegaMenu) + 1),
    this.setAttribute("open", ""),
    this.summaryElement.setAttribute("open", ""),
    setTimeout( () => this.contentElement.setAttribute("open", ""), 100),
    document.addEventListener("click", this.detectClickOutsideListener),
    document.addEventListener("keydown", this.detectEscKeyboardListener),
    document.addEventListener("focusout", this.detectFocusOutListener),
    this.classList.add("open-submenu")) : (megaMenuCount.set(DetailsMegaMenu, megaMenuCount.get(DetailsMegaMenu) - 1),
    this.summaryElement.removeAttribute("open"),
    this.contentElement.removeAttribute("open"),
    document.removeEventListener("click", this.detectClickOutsideListener),
    document.removeEventListener("keydown", this.detectEscKeyboardListener),
    document.removeEventListener("focusout", this.detectFocusOutListener),
    this.classList.remove("open-submenu"),
    this.open || setTimeout( () => this.removeAttribute("open"), 400)
  )}
  detectClickOutside(event) {
    !this.contains(event.target) && !(event.target.closest("details")instanceof DetailsMegaMenu) && (this.open = !1)
  }
  detectEscKeyboard(event) {
    if (event.code === "Escape") {
      const targetMenu = event.target.closest("details[open]");
      targetMenu && (targetMenu.open = !1)
    }
  }
  detectFocusOut(event) {
    event.relatedTarget && !this.contains(event.relatedTarget) && (this.open = !1)
  }
  detectHover(event) {
    this.menuTrigger !== "hover" || (event.type === "mouseenter" ? this.open = !0 : this.open = !1)
  }
}
customElements.define("details-mega-menu", DetailsMegaMenu, {
  extends: "details"
}),
megaMenuCount.set(DetailsMegaMenu, 0);
