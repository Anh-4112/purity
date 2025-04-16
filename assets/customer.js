const selectors = {
  customerAddresses: '[data-customer-addresses]',
  addressCountrySelect: '[data-address-country-select]',
  addressContainer: '[data-address]',
  toggleAddressButton: 'button[aria-expanded]',
  cancelAddressButton: 'button[type="reset"]',
  deleteAddressButton: 'button[data-confirm-message]',
};

const attributes = {
  expanded: 'aria-expanded',
  confirmMessage: 'data-confirm-message',
};

class CustomerAddresses {
  constructor() {
    this.elements = this._getElements();
    if (Object.keys(this.elements).length === 0) return;
    this._setupCountries();
    this._setupEventListeners();
  }

  _getElements() {
    const container = document.querySelector(selectors.customerAddresses);
    return container
      ? {
          container,
          addressContainer: container.querySelector(selectors.addressContainer),
          toggleButtons: document.querySelectorAll(selectors.toggleAddressButton),
          cancelButtons: container.querySelectorAll(selectors.cancelAddressButton),
          deleteButtons: container.querySelectorAll(selectors.deleteAddressButton),
          countrySelects: container.querySelectorAll(selectors.addressCountrySelect),
        }
      : {};
  }

  _setupCountries() {
    if (Shopify && Shopify.CountryProvinceSelector) {
      // eslint-disable-next-line no-new
      new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
        hideElement: 'AddressProvinceContainerNew',
      });
      this.elements.countrySelects.forEach((select) => {
        const formId = select.dataset.formId;
        // eslint-disable-next-line no-new
        new Shopify.CountryProvinceSelector(`AddressCountry_${formId}`, `AddressProvince_${formId}`, {
          hideElement: `AddressProvinceContainer_${formId}`,
        });
      });
    }
  }

  _setupEventListeners() {
    this.elements.toggleButtons.forEach((element) => {
      element.addEventListener('click', this._handleAddEditButtonClick);
    });
    this.elements.cancelButtons.forEach((element) => {
      element.addEventListener('click', this._handleCancelButtonClick);
    });
    this.elements.deleteButtons.forEach((element) => {
      element.addEventListener('click', this._handleDeleteButtonClick);
    });
  }

  _toggleExpanded(target) {
    target.setAttribute(attributes.expanded, (target.getAttribute(attributes.expanded) === 'false').toString());
  }

  _handleAddEditButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget);
  };

  _handleCancelButtonClick = ({ currentTarget }) => {
    this._toggleExpanded(currentTarget.closest(selectors.addressContainer).querySelector(`[${attributes.expanded}]`));
  };

  _handleDeleteButtonClick = ({ currentTarget }) => {
    if (confirm(currentTarget.getAttribute(attributes.confirmMessage))) {
      Shopify.postLink(currentTarget.dataset.target, {
        parameters: { _method: 'delete' },
      });
    }
  };
}

class ShowPassWord extends HTMLElement {
  constructor() {
    super();
    this.input = null;
    this.iconHide = null;
    this.iconView = null;
    this.onClick = this.onClick.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
  }

  connectedCallback() {
    this.input = this.closest('.field')?.querySelector('input');
    this.iconHide = this.querySelector('.icon-hide');
    this.iconView = this.querySelector('.icon-view');

    this.setAttribute('role', 'button');
    this.setAttribute('tabindex', '0');
    this.setAttribute('aria-pressed', 'false');

    this.addEventListener('click', this.onClick);
    this.addEventListener('keydown', this.onKeyDown);
  }

  onClick() {
    if (!this.input) return;
    const isVisible = this.input.type === 'text';
    this.input.type = isVisible ? 'password' : 'text';
    this.classList.toggle('text', !isVisible);
    this.setAttribute('aria-pressed', String(!isVisible));
    if (this.iconHide && this.iconView) {
      this.iconHide.classList.toggle('hidden', !isVisible);
      this.iconView.classList.toggle('hidden', isVisible);
    }
  }

  onKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.onClick();
    }
  }
}

customElements.define('show-pass-word', ShowPassWord);
