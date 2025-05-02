
// password-modal.js
export const BlsPasswordPopup = {
  customClass: 'bls-password-modal',

  init() {
    this.showPassword();
  },

  showPassword() {
    const action = document.querySelector("#DialogHeading");
  
    if (action !== null) {
      action.addEventListener("click", (e) => {
        e.preventDefault();
        this.getContentPassword();
      });
  
      action.addEventListener("keydown", (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
          e.preventDefault();
          this.getContentPassword();
        }
      });
      action.setAttribute("tabindex", "0");
      action.setAttribute("role", "button");
    }
  },
  

  getContentPassword() {
    const rawContent = document.querySelector('.password-modal__content')?.innerHTML;
    if (!rawContent) return;

    const modal = new tingle.modal({
      footer: false,
      stickyFooter: false,
      closeMethods: ['overlay', 'button', 'escape'],
      cssClass: [this.customClass],
      onOpen: () => {
        modal.setContent(rawContent);

        setTimeout(() => {
          const form = document.querySelector('.tingle-modal form.password-form-popup');
          if (!form || form.dataset.validated === 'true') return;

          const i18nContainer = document.querySelector('password-modal');
          const i18n = {
            required: i18nContainer?.dataset.required || 'Password is required',
          };

          const validator = new FormValidator(form, {
            password: (value) =>
              !value
                ? i18n.required
                : '',
          });

          form.addEventListener('submit', (e) => {
            const isValid = validator.validate();
            if (!isValid) {
              e.preventDefault();
              e.stopImmediatePropagation();
              return false;
            }

            e.preventDefault();

            const submitButton = e.submitter || form.querySelector('button[type="submit"]');
            const spinner = submitButton?.querySelector('.icon-load');
            const text = submitButton?.querySelector('.hidden-on-load');

            submitButton?.classList.add('loading');
            spinner?.classList.remove('opacity-0', 'pointer-none');
            text?.classList.add('opacity-0');

            setTimeout(() => {
              form.submit(); 
            }, 100);
          });

          form.dataset.validated = 'true';
        }, 50);
      }
    });

    modal.open();
  },
};
