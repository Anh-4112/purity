import { SlideSection } from './module_slide.js?v=1234';

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

class RecentlyViewedProducts extends HTMLElement {
  constructor() {
    super();
  }
  init() {
    this.connectedCallback();
  }
  initData() {
    const savedProductsArr = JSON.parse(
      localStorage.getItem('recently-viewed-products')
    );
    this.getStoredProducts(savedProductsArr);
  }
  getStoredProducts(arr) {
    const limit = this.dataset?.limit;
    if (limit) {
      let query = '';
      var productAjaxURL = '';
      if (arr && arr.length > 0) {
        const sortedIds = arr.slice();
        const idsToUse = sortedIds.slice(0, limit);
        query = idsToUse.join('%20OR%20id:');
        productAjaxURL = `&q=id:${query}`;
      }
    }
    fetch(`${this.dataset.url}${productAjaxURL}`)
      .then((response) => response.text())
      .then((text) => {
        const html = document.createElement("div");
        html.innerHTML = text;
        const recentlyViewedProducts = html.querySelector("recently-viewed-products");
        if (recentlyViewedProducts && recentlyViewedProducts.innerHTML.trim().length) {
          this.innerHTML = recentlyViewedProducts.innerHTML;
        }
      })
      .finally(() => {})
      .catch((e) => {
        console.error(e);
      });
  }
  connectedCallback() {
    const __this = this;
    const handleIntersection = (entries, observer) => {
      if (!entries[0].isIntersecting) return;
      observer.unobserve(this);
      __this.initData();
    };

    new IntersectionObserver(handleIntersection.bind(this), {
      rootMargin: '0px 0px 400px 0px',
    }).observe(this);
  }
}
customElements.define('recently-viewed-products', RecentlyViewedProducts);

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
