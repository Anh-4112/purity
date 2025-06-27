function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}
function validateRequiredInputs(container = document) {
  const requiredInputs = container.querySelectorAll(`
    input[required][type="text"],
    input[required][type="email"], 
    input[required][type="password"]:not(.no-js-validation),
    input[required][type="tel"],
    textarea[required]
  `);

  let isValid = true;
  const inputGroups = {
    text: [],
    email: [],
    tel: [],
    password: [],
    textarea: [],
  };

  requiredInputs.forEach((input) => {
    const type =
      input.tagName.toLowerCase() === "textarea" ? "textarea" : input.type;
    if (inputGroups[type]) {
      inputGroups[type].push(input);
    }
  });

  Object.keys(inputGroups).forEach((type) => {
    inputGroups[type].forEach((input) => {
      const inputIsValid = validateInputByType(input, type);
      if (!inputIsValid) {
        isValid = false;
      }
    });
  });

  return isValid;
}

function validateInputByType(input, type) {
  removeErrorMessage(input);

  let isValid = true;
  let errorMessage = "";

  if (input.value.trim()) {
    switch (type) {
      case "email":
        if (!isValidEmail(input.value)) {
          isValid = false;
          errorMessage = window.validate.emailRegex;
        }
        break;
      case "password":
        if (input.value.length < 6) {
          isValid = false;
          errorMessage = window.validate.password_invalid;
        }
        break;
      case "tel":
        if (!isValidPhone(input.value)) {
          isValid = false;
          errorMessage =
            window.validate.phone_invalid;
        }
        break;
      case "text":
      case "textarea":
        if (input.value.trim().length < 2) {
          isValid = false;
          errorMessage = window.validate.min_length;
        }
        break;
    }

    if (!isValid) {
      showErrorMessage(input, errorMessage);
    }
  } else if (input.hasAttribute("required")) {
    isValid = false;
  }

  return isValid;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone) {
  const phoneRegex = /^[0-9\-]*$/;
  if (!phoneRegex.test(phone)) {
    return false;
  }
  const digitCount = phone.replace(/\-/g, '').length;
  return digitCount >= 8;
}

function showErrorMessage(input, message) {
  const errorElement = document.createElement("p");
  errorElement.className = "error error-custom";
  errorElement.textContent = message;
  errorElement.setAttribute(
    "data-error-for",
    input.name || input.id || "input"
  );

  if (input.classList.contains("js-custom-input")) {
    const form = input.closest("form");
    if (form) {
      form.appendChild(errorElement, form.firstChild);
    } else {
      input.parentNode.insertBefore(errorElement, input.nextSibling);
    }
  } else {
    input.parentNode.insertBefore(errorElement, input.nextSibling);
  }

  input.classList.add("error-input");
}

function removeErrorMessage(input) {
  let existingError;

  if (input.classList.contains("js-custom-input")) {
    const form = input.closest("form");
    if (form) {
      existingError = form.querySelector(
        '.error[data-error-for="' + (input.name || input.id || "input") + '"]'
      );
    }
  } else {
    existingError = input.parentNode.querySelector(
      '.error[data-error-for="' + (input.name || input.id || "input") + '"]'
    );
  }

  if (existingError) {
    existingError.remove();
  }

  input.classList.remove("error-input");
}

document.addEventListener(
  "input",
  debounce(function (e) {
    const input = e.target;
    const supportedTypes = ["text", "email", "password", "tel"];
    const isTextarea = input.tagName.toLowerCase() === "textarea";

    if (
      input.hasAttribute("required") &&
      (supportedTypes.includes(input.type) || isTextarea) &&
      !input.classList.contains("no-js-validation")
    ) {
      const type = isTextarea ? "textarea" : input.type;
      validateInputByType(input, type);
    }
  }, 300),
  true
);

document.addEventListener(
  "focus",
  function (e) {
    const input = e.target;
    if (input.classList.contains("error-input")) {
      removeErrorMessage(input);
    }
  },
  true
);