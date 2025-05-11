
class SpinningTextElement extends HTMLElement {
  connectedCallback() {
    this.render();
    this.observe();
  }

  render() {
    const rawText = this.dataset.text || '';
    const speed = this.dataset.speed || 8;
    const direction = this.dataset.direction || 'normal';
    const uppercase = this.dataset.uppercase === 'true';
    let trimmedText = rawText.trim();
    let size = trimmedText.length;
    if (size == 0) return;
    while (trimmedText.length < 15) {
      trimmedText += ' • ' + trimmedText;
    }
    const unit = trimmedText + ' • ';
    const displayText = ((unit + unit));
    const finalText = uppercase ? displayText.toUpperCase() : displayText;

    const circle = this.querySelector('.spinning-text__circle');
    const content = this.querySelector('.spinning-text__content');
    if (!circle || !content) return;

    const measure = document.createElement('span');
    measure.style.visibility = 'hidden';
    measure.style.position = 'absolute';
    measure.style.whiteSpace = 'nowrap';
    measure.textContent = finalText;
    document.body.appendChild(measure);

    const circumference = measure.offsetWidth*2;
    document.body.removeChild(measure);

    const radius = circumference / (2 * Math.PI) - 27.5;
    const diameter = Math.ceil(radius * 2);

    this.style.width = `${diameter}px`;
    this.style.height = `${diameter}px`;
    circle.style.width = '100%';
    circle.style.height = '100%';

    circle.style.animation = `spinning-text__rotate ${speed}s linear infinite`;
    circle.style.animationDirection = direction;

    content.innerHTML = '';
    const chars = finalText.split('');
    chars.forEach((char, i) => {
      const span = document.createElement('span');
      span.textContent = char;
      span.style.position = 'absolute';
      span.style.left = '50%';
      span.style.transformOrigin = `0 ${radius}px`;
      span.style.transform = `rotate(${(i * 360) / chars.length}deg)`;
      content.appendChild(span);
    });
  }

  observe() {
    const observer = new MutationObserver(() => this.render());
    observer.observe(this, { attributes: true });
  }
}

customElements.define('spinning-text', SpinningTextElement);

window.SpinningTextComponent = {
  load: () => {
    document.querySelectorAll('spinning-text').forEach(el => el.load?.());
  },
};
