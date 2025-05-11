export class FormValidator {
  constructor(formElement, rules = {}, options = {}) {
    this.form = formElement;
    this.rules = rules;
    this.options = {
      errorClass: options.errorClass || "input-error",
      ...options,
    };

    this.bindEvents();
  }

  bindEvents() {
    this.form.addEventListener("submit", (e) => {
      if (!this.validate()) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
  }

  validate() {
    let isValid = true;

    for (const [fieldName, validateFn] of Object.entries(this.rules)) {
      const input = this.form.querySelector(`[name="${fieldName}"]`);
      if (!input) continue;

      const errorElement = this.getOrCreateErrorEl(input);
      const errorMessage = validateFn(input.value.trim());

      if (errorMessage) {
        errorElement.innerHTML = `${this.getSvgIcon()} <span>${errorMessage}</span>`;
        input.classList.add(this.options.errorClass);
        isValid = false;
      } else {
        errorElement.innerHTML = "";
        input.classList.remove(this.options.errorClass);

        if (!errorElement.innerHTML.trim()) {
          this.removeErrorElement(errorElement);
        }
      }
    }

    return isValid;
  }

  getOrCreateErrorEl(input) {
    const parentElement = input.closest(".field.relative");

    let errorEl = parentElement.querySelector(".form-error-message");
    if (!errorEl) {
      errorEl = document.createElement("div");
      errorEl.className =
        "form-error-message warning mt-10 max-w-custom fs-small inline-flex align-center gap-10 w-full h-custom";
      errorEl.style.setProperty("--height", "5.6rem");
      parentElement.insertAdjacentElement("beforeend", errorEl);
    }

    return errorEl;
  }

  getSvgIcon() {
    return `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 7.5V11.6667" stroke="#79571b" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.99962 17.8414H4.94962C2.05795 17.8414 0.849619 15.7747 2.24962 13.2497L4.84962 8.56641L7.29962 4.16641C8.78295 1.49141 11.2163 1.49141 12.6996 4.16641L15.1496 8.57474L17.7496 13.2581C19.1496 15.7831 17.933 17.8497 15.0496 17.8497H9.99962V17.8414Z" stroke="#79571b" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9.99683 14.167H10.0043" stroke="#79571b" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`;
  }

  removeErrorElement(errorEl) {
    if (errorEl) {
      errorEl.remove();
    }
  }
}

export function setupFormValidation({
  formSelector,
  fields,
  buttonSelector = 'button[type="submit"]',
}) {
  const forms = document.querySelectorAll(formSelector);
  if (!forms.length) return;

  forms.forEach((form) => {
    const validator = new FormValidator(form, fields, {
      errorClass: "input-error",
    });

    form.addEventListener("submit", (e) => {
      const isValid = validator.validate();
      if (!isValid) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
      }

      const submitButton = e.submitter || form.querySelector(buttonSelector);
      const spinner = submitButton?.querySelector(".icon-load");
      const text = submitButton?.querySelector(
        ".hidden-on-load.transition-short"
      );

      submitButton?.classList.add("loading");
      spinner?.classList.remove("opacity-0", "pointer-none");
      text?.classList.add("opacity-0");
    });
  });
}
