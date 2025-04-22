class ShopableImage extends HTMLElement {
    constructor() {
      super();
      this.isActive = false;
      this.isAnimating = false;
      this.productInfo = null;
      this.animationDuration = 0.25;
      this.innerWidth = window.innerWidth;
      this.isMobile = this.innerWidth <= 767;
      this.handleDocumentClick = this.handleDocumentClick.bind(this);
      this.handleKeyDown = this.handleKeyDown.bind(this);
    }
  
    connectedCallback() {
      this.productInfo = this.querySelector('.group-lookbook__item-product');
      this.dotElement = this.querySelector('.icon-dot');
      this.productUrl = this.getAttribute('data-url');
  
      if (!this.productInfo || !this.dotElement) return;
  
      this.handleResize = this.handleResize.bind(this);
      window.addEventListener('resize', this.handleResize);
      document.addEventListener('click', this.handleDocumentClick);
      document.addEventListener('keydown', this.handleKeyDown);
      this.updateEventListeners();
    }
  
    handleDocumentClick(event) {
      if (this.isActive && !this.contains(event.target)) {
        this.hideProductInfo();
      }
    }
  
    handleKeyDown(event) {
      if (!this.isActive) return;
      
      if (event.key === 'Escape') {
        this.hideProductInfo();
        this.dotElement.focus();
      }
      
      if (event.key === 'Tab' && this.isActive && this.productInfo) {
        const focusableElements = this.productInfo.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        
        if (focusableElements.length > 0) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  
    handleResize() {
      this.innerWidth = window.innerWidth;
      const wasMobile = this.isMobile;
      this.isMobile = this.innerWidth <= 767;
      
      if (wasMobile !== this.isMobile) {
        this.updateEventListeners();
      }
    }
  
    updateEventListeners() {
      if (this.dotElement) {
        this.dotElement.removeEventListener('click', this.toggleProductInfo);
        this.dotElement.removeEventListener('click', this.handleMobileClick);
        this.dotElement.removeEventListener('keypress', this.handleKeyPress);
        this.dotElement.addEventListener('keypress', this.handleKeyPress.bind(this));
      }
  
      if (this.isMobile) {
        this.dotElement.addEventListener('click', this.handleMobileClick.bind(this));
      } else {
        this.dotElement.addEventListener('click', this.toggleProductInfo.bind(this));
      }
    }
  
    handleKeyPress(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        if (this.isMobile) {
          this.handleMobileClick(event);
        } else {
          this.toggleProductInfo(event);
        }
      }
    }
  
    handleMobileClick(event) {
      event.preventDefault();
      event.stopPropagation();
      
      if (this.productUrl) {
        window.location.href = this.productUrl;
      }
    }
  
    showProductInfo() {
      if (this.isMobile || this.isAnimating || this.isActive) return;
      
      this.closeAllOtherItems();
      this.isAnimating = true;
      this.classList.add('active');
      this.dotElement.classList.add('active');
      this.isAnimating = false;
      this.isActive = true;
    }
  
    closeAllOtherItems() {
      const allActiveImages = document.querySelectorAll('shopable-image.active');
      allActiveImages.forEach(item => {
        if (item !== this) {
          item.classList.remove('active');
          const itemDot = item.querySelector('.icon-dot');
          if (itemDot) itemDot.classList.remove('active');
          if (typeof item.isActive !== 'undefined') item.isActive = false;
          if (typeof item.isAnimating !== 'undefined') item.isAnimating = false;
        }
      });
    }
  
    hideProductInfo() {
      if (this.isMobile || this.isAnimating || !this.isActive) return;
      this.isAnimating = true;
      this.classList.remove('active');
      this.dotElement.classList.remove('active');
      this.isAnimating = false;
      this.isActive = false;
    }
  
    toggleProductInfo(event) {
      if (this.isMobile) return;
      
      event.preventDefault();
      event.stopPropagation();
      
      if (this.isActive) {
        this.hideProductInfo();
      } else {
        this.showProductInfo();
      }
    }
  
    disconnectedCallback() {
      window.removeEventListener('resize', this.handleResize);
      
      document.removeEventListener('click', this.handleDocumentClick);
      
      if (this.dotElement) {
        this.dotElement.removeEventListener('click', this.toggleProductInfo);
        this.dotElement.removeEventListener('click', this.handleMobileClick);
      }
    }
  }
  
  customElements.define('shopable-image', ShopableImage);