if (!customElements.get("section-selected")) {
  customElements.define(
    "section-selected",
    class SectionSelected extends HTMLElement {
      constructor() {
        super();
        this.titleSelect = this.querySelector(".title-select");
        this.titleSelectText = this.querySelector(".title-select__text");
        this.titleList = this.querySelector(".title-list");
        this.titleItems = this.querySelectorAll(".title-item");
        this.collectionSelect = this.querySelector(".collection-select");
        this.collectionSelectText = this.querySelector(
          ".collection-select__text"
        );
        this.titleGroups = this.querySelectorAll(".title-group");
        this.collectionList = this.querySelector(".collection-list");
        this.collectionItems = this.querySelectorAll(".collection-item");
        this.collectionGroups = this.querySelectorAll(".collection-group");

        this.firstButton = this.querySelector(".btn-change-url");

        this.init();
      }

      init() {
        this.setupAccessibility();

        // Set the first title-group as active by default on page load
        if (this.titleGroups.length > 0) {
          const firstTitleGroup = this.titleGroups[0];
          const firstTitleItem = firstTitleGroup.querySelector(".title-item");
          if (firstTitleItem) {
            firstTitleGroup.classList.add("active");
            this.selectTitle(firstTitleItem, true); // Pass true to indicate initial load
          }
        }

        if (this.titleSelectText) {
          this.titleSelectText.addEventListener("click", () =>
            this.handleTitleToggle()
          );
          this.titleSelectText.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this.handleTitleToggle();
            }
          });
        }

        if (this.collectionSelectText) {
          this.collectionSelectText.addEventListener("click", () =>
            this.handleCollectionToggle()
          );
          this.collectionSelectText.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this.handleCollectionToggle();
            }
          });
        }

        this.titleItems.forEach((item, index) => {
          item.setAttribute("tabindex", "0");
          item.setAttribute("id", `title-item-${index}`);

          item.addEventListener("click", () => this.selectTitle(item));
          item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this.selectTitle(item);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const nextItem = this.titleItems[index + 1] || this.titleItems[0];
              nextItem.focus();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const prevItem =
                this.titleItems[index - 1] ||
                this.titleItems[this.titleItems.length - 1];
              prevItem.focus();
            } else if (e.key === "Escape") {
              e.preventDefault();
              this.closeDropdown(this.titleList);
              this.titleSelectText.focus();
            }
          });
        });

        this.collectionItems.forEach((item, index) => {
          item.setAttribute("tabindex", "0");
          item.setAttribute("id", `collection-item-${index}`);

          item.addEventListener("click", () => this.selectCollection(item));
          item.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              this.selectCollection(item);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const visibleItems = Array.from(this.collectionItems).filter(
                (i) => i.closest(".collection-group").style.display !== "none"
              );
              const currentIndex = visibleItems.indexOf(item);
              const nextItem =
                visibleItems[currentIndex + 1] || visibleItems[0];
              nextItem.focus();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const visibleItems = Array.from(this.collectionItems).filter(
                (i) => i.closest(".collection-group").style.display !== "none"
              );
              const currentIndex = visibleItems.indexOf(item);
              const prevItem =
                visibleItems[currentIndex - 1] ||
                visibleItems[visibleItems.length - 1];
              prevItem.focus();
            } else if (e.key === "Escape") {
              e.preventDefault();
              this.closeDropdown(this.collectionList);
              this.collectionSelectText.focus();
            }
          });
        });

        document.addEventListener("click", (event) => {
          if (!event.target.closest("select-options")) {
            this.closeAllDropdowns();
          }
        });
        document.addEventListener("keydown", (event) => {
          if (event.key === "Escape") {
            this.closeAllDropdowns();
          }
        });
      }

      setupAccessibility() {
        if (this.titleSelect) {
          this.titleSelectText.setAttribute("tabindex", "0");
        }

        if (this.collectionSelect) {
          this.collectionSelectText.setAttribute("tabindex", "0");
        }
      }

      handleTitleToggle() {
        this.toggleDropdown(this.titleList);
        if (this.collectionList?.classList.contains("active")) {
          this.closeDropdown(this.collectionList);
        }
      }

      handleCollectionToggle() {
        this.toggleDropdown(this.collectionList);
        if (this.titleList?.classList.contains("active")) {
          this.closeDropdown(this.titleList);
        }
      }

      selectTitle(item) {
        const blockId = item.getAttribute("data-block-id");
        const title = item.textContent.trim();

        this.titleGroups.forEach((group) => {
          const groupItem = group.querySelector(".title-item");
          if (groupItem && groupItem.getAttribute("data-block-id") === blockId) {
            group.classList.add("active");
          } else {
            group.classList.remove("active");
          }
        });

        this.titleSelectText.textContent = title;
        this.titleSelectText.appendChild(this.createSvgIcon());
        this.collectionGroups.forEach((group) => {
          if (group.id === blockId) {
            group.style.display = "flex";
            const firstCollectionItem = group.querySelector(".collection-item");
            if (firstCollectionItem) {
              const collectionTitle = firstCollectionItem.textContent.trim();
              const collectionUrl =
                firstCollectionItem.getAttribute("data-url");

              this.collectionSelectText.textContent = collectionTitle;
              this.collectionSelectText.appendChild(this.createSvgIcon());
              this.collectionSelectText.setAttribute("data-url", collectionUrl);
              if (this.firstButton && collectionUrl) {
                this.firstButton.href = collectionUrl;
              }
            }
          } else {
            group.style.display = "none";
          }
        });

        this.closeDropdown(this.titleList);
        this.titleSelectText.focus();
      }

      createSvgIcon() {
        const svg = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        svg.setAttribute("width", "10");
        svg.setAttribute("height", "6");
        svg.setAttribute("viewBox", "0 0 10 6");
        svg.style.setProperty("--width", "1rem");
        svg.classList.add(
          "icon",
          "icon-down",
          "icon-rotate",
          "transition-drawer",
          "w-custom",
          "flex-auto"
        );
        const use = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "use"
        );
        use.setAttribute("href", "#icon-arrow-down");
        svg.appendChild(use);
        return svg;
      }

      selectCollection(item) {
        const title = item.textContent.trim();
        const url = item.getAttribute("data-url");

        this.collectionSelectText.textContent = title;
        this.collectionSelectText.appendChild(this.createSvgIcon());
        this.collectionSelectText.setAttribute("data-url", url);

        if (this.firstButton && url) {
          this.firstButton.href = url;
        }

        this.closeDropdown(this.collectionList);
        this.collectionSelectText.focus();
      }

      toggleDropdown(dropdown) {
        const isExpanded = dropdown?.classList.toggle("active");

        if (dropdown === this.titleList) {
          this.titleSelectText.setAttribute("aria-expanded", isExpanded);
          if (isExpanded) {
            setTimeout(() => {
              const firstItem = dropdown.querySelector(".title-item");
              if (firstItem) firstItem.focus();
            }, 100);
          }
        } else if (dropdown === this.collectionList) {
          this.collectionSelectText.setAttribute("aria-expanded", isExpanded);
          if (isExpanded) {
            setTimeout(() => {
              const visibleGroup = Array.from(this.collectionGroups).find(
                (g) => g.style.display !== "none"
              );
              if (visibleGroup) {
                const firstItem =
                  visibleGroup.querySelector(".collection-item");
                if (firstItem) firstItem.focus();
              }
            }, 100);
          }
        }
      }

      closeDropdown(dropdown) {
        if (!dropdown) return;
        dropdown.classList.remove("active");
        if (dropdown === this.titleList) {
          this.titleSelectText.setAttribute("aria-expanded", "false");
        } else if (dropdown === this.collectionList) {
          this.collectionSelectText.setAttribute("aria-expanded", "false");
        }
      }

      closeAllDropdowns() {
        this.closeDropdown(this.titleList);
        this.closeDropdown(this.collectionList);
      }
    }
  );
}
