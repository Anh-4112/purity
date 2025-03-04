class LocalizationForm extends HTMLElement {
  constructor() {
    super();
    this.elements = {
      input: this.querySelector(
        'input[name="language_code"], input[name="country_code"]'
      ),
      button: this.querySelector("button"),
      panel: this.querySelector("ul"),
      panelWrapper: this.querySelector(".disclosure__list-wrapper"),
    };
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    if (isSafari) {
      this.elements.button.addEventListener("blur", this.closeSelector.bind(this));
      this.elements.button.addEventListener("mousedown", this.openSelector.bind(this));
    } else {
      this.elements.button.addEventListener("click", this.openSelector.bind(this));
      this.elements.button.addEventListener("focusout", this.closeSelector.bind(this));
    }
    this.addEventListener("keyup", this.onContainerKeyUp.bind(this));
    this.querySelectorAll("a").forEach((item) =>
      item.addEventListener("click", this.onItemClick.bind(this))
    );
    this.onBodyClick = this.handleBodyClick.bind(this);
  }

  handleBodyClick(evt) {
    const target = evt.target;
    if (target != this && !target.closest("localization-form")) {
      this.hidePanel();
    }
  }

  hidePanel() {
    document.body.removeEventListener("click", this.onBodyClick);
    this.elements.button.setAttribute('aria-expanded', 'false');
    this.elements.button.classList.remove("opened");
    this.elements.panelWrapper.setAttribute('hidden', true);
  }

  onContainerKeyUp(event) {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    if(this.elements.button.getAttribute('aria-expanded') == 'false') return;

    this.hidePanel();
    event.stopPropagation();
    this.elements.button.focus();
  }

  onItemClick(event) {
    event.preventDefault();
    const form = this.querySelector("form");
    this.elements.input.value = event.currentTarget.dataset.value;
    if (form) form.submit();
  }

  openSelector() {
    if (this.elements.button.classList.contains("opened")) {
      this.hidePanel();
    } else {
      document.body.addEventListener("click", this.onBodyClick);
      this.elements.button.setAttribute(
        'aria-expanded',
        (this.elements.button.getAttribute('aria-expanded') === 'false').toString()
      );
      this.elements.button.focus();
      this.elements.panelWrapper.toggleAttribute('hidden');
      for (var item of document.querySelectorAll(".button-localization")) {
        item.classList.remove("opened");
      }
      requestAnimationFrame(() => {
        this.elements.button.classList.add("opened");
      });
    }
  }

  closeSelector(event) {
    const shouldClose =
      event.relatedTarget && event.relatedTarget.nodeName === "BUTTON";
    if (event.relatedTarget === null || shouldClose) {
      this.hidePanel();
    }
  }
}
customElements.define("localization-form", LocalizationForm);
