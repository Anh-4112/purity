class CountdownTimer extends HTMLElement {
  constructor() {
    super();
    this.countdownBtn = this.closest("div")?.querySelector(
      "div.countdown-btn a"
    );
    this.init();
  }
  init() {
    const cddl = this.dataset?.deadline;
    const customeTimeOutMessage = this.dataset?.message;
    let timeLeft = {};
    if (cddl) {
      let isoDate = "";
      if (this.isISODate(cddl)) {
        isoDate = cddl;
        this.mainFunction(isoDate, customeTimeOutMessage);
      } else {
        if (this.isValidDate(cddl)) {
          const dateParts = cddl.split("-");
          isoDate =
            dateParts[2] +
            "-" +
            dateParts[0].padStart(2, "0") +
            "-" +
            dateParts[1].padStart(2, "0") +
            "T00:00:00Z";
          this.mainFunction(isoDate, customeTimeOutMessage);
        } else {
          if (customeTimeOutMessage) {
            this.innerHTML = this.appendChildHtmlTimeOut(
              customeTimeOutMessage
            ).innerHTML;
          } else {
            this.innerHTML = this.appendChildHtml().innerHTML;
            timeLeft = {
              days_timer: 0,
              hours_timer: 0,
              minutes_timer: 0,
              seconds_timer: 0,
            };
            Object.entries(timeLeft).forEach(([key, value]) => {
              this.querySelector("." + key).innerHTML = value
                .toString()
                .padStart(2, "0");
            });
          }
          this.countdownBtn?.setAttribute("aria-disabled", true);
        }
      }
    } else {
      if (customeTimeOutMessage) {
        this.innerHTML = this.appendChildHtmlTimeOut(
          customeTimeOutMessage
        ).innerHTML;
      } else {
        this.innerHTML = this.appendChildHtml().innerHTML;
        timeLeft = {
          days_timer: 0,
          hours_timer: 0,
          minutes_timer: 0,
          seconds_timer: 0,
        };
        Object.entries(timeLeft).forEach(([key, value]) => {
          this.querySelector("." + key).innerHTML = value
            .toString()
            .padStart(2, "0");
        });
      }
      this.countdownBtn?.setAttribute("aria-disabled", true);
    }
  }

  mainFunction(isoDate, customeTimeOutMessage) {
    let timeLeft = {};
    if (Date.parse(isoDate)) {
      const deadline = new Date(isoDate);
      const calculateTimeLeft = () => {
        let difference = +deadline - +new Date();
        if (difference > 0) {
          this.innerHTML = this.appendChildHtml().innerHTML;
          timeLeft = {
            days_timer: Math.floor(difference / (1000 * 60 * 60 * 24)),
            hours_timer: Math.floor((difference / (1000 * 60 * 60)) % 24),
            minutes_timer: Math.floor((difference / 1000 / 60) % 60),
            seconds_timer: Math.floor((difference / 1000) % 60),
          };
        } else {
          if (customeTimeOutMessage) {
            this.innerHTML = this.appendChildHtmlTimeOut(
              customeTimeOutMessage
            ).innerHTML;
          } else {
            this.innerHTML = this.appendChildHtml().innerHTML;
            difference = 0;
            timeLeft = {
              days_timer: Math.floor(difference / (1000 * 60 * 60 * 24)),
              hours_timer: Math.floor((difference / (1000 * 60 * 60)) % 24),
              minutes_timer: Math.floor((difference / 1000 / 60) % 60),
              seconds_timer: Math.floor((difference / 1000) % 60),
            };
          }
          this.countdownBtn?.setAttribute("aria-disabled", true);
        }
        return timeLeft;
      };
      const updateCountdown = () => {
        const t = calculateTimeLeft();
        Object.entries(t).forEach(([key, value]) => {
          this.querySelector("." + key).innerHTML = value
            .toString()
            .padStart(2, "0");
        });
      };
      setInterval(updateCountdown, 1000);
    } else {
      if (customeTimeOutMessage) {
        this.innerHTML = this.appendChildHtmlTimeOut(
          customeTimeOutMessage
        ).innerHTML;
      } else {
        this.innerHTML = this.appendChildHtml().innerHTML;
        timeLeft = {
          days_timer: 0,
          hours_timer: 0,
          minutes_timer: 0,
          seconds_timer: 0,
        };
        Object.entries(timeLeft).forEach(([key, value]) => {
          this.querySelector("." + key).innerHTML = value
            .toString()
            .padStart(2, "0");
        });
      }
      this.countdownBtn?.setAttribute("aria-disabled", true);
    }
  }

  appendChildHtml() {
    const days = this.dataset?.days;
    const hours = this.dataset?.hours;
    const mins = this.dataset?.mins;
    const secs = this.dataset?.secs;
    const container = document.createElement("div");
    container.innerHTML = `<div class="countdown-container lh-normal min-w-custom p-custom flex column bg-custom rounded-5 relative content-center"><span class="days_timer countdown-item heading_weight fs-custom"></span><span class="fs-13 timer-announcementbar-text">${
      days ? days : "days"
    }</span></div><div class="countdown-container lh-normal min-w-custom p-custom flex column bg-custom rounded-5 relative content-center"><span class="hours_timer countdown-item heading_weight fs-custom"></span><span class="fs-13 timer-announcementbar-text">${
      hours ? hours : "hours"
    }</span></div><div class="countdown-container lh-normal min-w-custom p-custom flex column bg-custom rounded-5 relative content-center"><span class="minutes_timer countdown-item heading_weight fs-custom"></span><span class="fs-13 timer-announcementbar-text">${
      mins ? mins : "mins"
    }</span></div><div class="countdown-container lh-normal min-w-custom p-custom flex column bg-custom rounded-5 relative content-center"><span class="seconds_timer countdown-item heading_weight fs-custom"></span><span class="fs-13 timer-announcementbar-text">${
      secs ? secs : "secs"
    }</span></div>`;
    return container;
  }

  appendChildHtmlTimeOut(customeTimeOutMessage) {
    const container = document.createElement("div");
    container.innerHTML = `<span class="timeout">${customeTimeOutMessage}</span>`;
    return container;
  }

  isISODate(dateString) {
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/;
    return isoRegex.test(dateString);
  }

  isValidDate(dateString) {
    var regex = /^\d{2}-\d{2}-\d{4}$/;
    if (regex.test(dateString)) {
      return true;
    } else {
      return false;
    }
  }
}
if (!customElements.get("countdown-timer")) {
  customElements.define("countdown-timer", CountdownTimer);
}
