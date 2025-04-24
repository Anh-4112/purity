
// password-modal.js
export const BlsPasswordPopup = {
  customClass: 'bls-password-modal',

  init() {
    this.handleCountdown();
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
  handleCountdown: function () {
    var second = 1000,
      minute = second * 60,
      hour = minute * 60,
      day = hour * 24;
    const timer = document.querySelectorAll(".bls__timer");
    if (timer) {
      timer.forEach((e) => {
        const { timer } = e?.dataset;
        const dateParts = timer.split("-");
        const isoDate =
          dateParts[2] +
          "-" +
          dateParts[0].padStart(2, "0") +
          "-" +
          dateParts[1].padStart(2, "0") +
          "T00:00:00Z";
        if (Date.parse(isoDate)) {
          var countDown = new Date(isoDate).getTime();
          if (countDown) {
            setInterval(function () {
              var now = new Date().getTime(),
                distance = countDown - now;
              if (countDown >= now) {
                e.querySelector(".js-timer-days").innerText =
                  Math.floor(distance / day) < 10
                    ? ("0" + Math.floor(distance / day)).slice(-2)
                    : Math.floor(distance / day);
                e.querySelector(".js-timer-hours").innerText = (
                  "0" + Math.floor((distance % day) / hour)
                ).slice(-2);
                e.querySelector(".js-timer-minutes").innerText = (
                  "0" + Math.floor((distance % hour) / minute)
                ).slice(-2);
                e.querySelector(".js-timer-seconds").innerText = (
                  "0" + Math.floor((distance % minute) / second)
                ).slice(-2);
              }
            }, second);
          }
        }
      });
    }
  },
};
