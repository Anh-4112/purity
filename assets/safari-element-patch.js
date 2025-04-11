class CustomElementPatcher {
  constructor() {}

  patchCustomElement(tagElement, defineElement, classElement) {
    const selector = `${tagElement}[is="${defineElement}"]`;
    document.querySelectorAll(selector).forEach((el) => {
      if (!(el instanceof classElement)) {
        Object.setPrototypeOf(el, classElement.prototype);
        if (typeof el.init === "function") {
          el.init();
        }
      }
    });
  }
  patchAllCustomElements(elements = {}) {
    Object.entries(elements).forEach(
      ([defineElement, { tagElement, classElement }]) => {
        this.patchCustomElement(tagElement, defineElement, classElement);
      }
    );
  }
}
export const CustomElement = new CustomElementPatcher();
