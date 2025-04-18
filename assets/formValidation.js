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
        errorElement.textContent = errorMessage;
        input.classList.add(this.options.errorClass);
        isValid = false;
      } else {
        errorElement.textContent = "";
        input.classList.remove(this.options.errorClass);
      }
    }

    return isValid;
  }

  getOrCreateErrorEl(input) {
    let errorEl = input.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("form-error-message")) {
      errorEl = document.createElement("div");
      errorEl.className = "form-error-message text-sm text-red-500 mt-5 fs-13";
      input.parentNode.insertBefore(errorEl, input.nextSibling);
    }
    return errorEl;
  }
}

export function setupFormValidation({
  formSelector,
  fields,
  buttonSelector = 'button[type="submit"]',
}) {
  const form = document.querySelector(formSelector);
  if (!form) return;

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
      ".hidden-on-load transition-short"
    );

    submitButton?.classList.add("loading");
    spinner?.classList.remove("opacity-0", "pointer-none");
    text?.classList.add("opacity-0");
  });
}
