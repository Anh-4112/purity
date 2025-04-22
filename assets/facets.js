import * as NextSkyTheme from "global";

class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = NextSkyTheme.debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    const facetForm = this.querySelector("form");
    if (facetForm) {
      facetForm.addEventListener("input", this.debouncedOnSubmit.bind(this));
    }
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state
        ? event.state.searchParams
        : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener("popstate", onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll(".js-facet-remove").forEach((element) => {
      element.classList.toggle("disabled", disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;
      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    event.target.closest("#ProductsGridContainer").classList.add("loading");
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [
          ...FacetFiltersForm.filterData,
          { html, url },
        ];
        const htmlRender = new DOMParser().parseFromString(html, "text/html");
        FacetFiltersForm.renderFilters(htmlRender, event);
        FacetFiltersForm.renderProductContainer(htmlRender);
        FacetFiltersForm.renderProductCount(htmlRender);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    event.target.closest("#ProductsGridContainer").classList.add("loading");
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    const htmlRender = new DOMParser().parseFromString(html, "text/html");
    FacetFiltersForm.renderFilters(htmlRender, event);
    FacetFiltersForm.renderProductContainer(htmlRender);
    FacetFiltersForm.renderProductCount(htmlRender);
  }

  static renderProductContainer(htmlRender) {
    const collectionEmpty = htmlRender.querySelector(
      ".collection__gird .collection--empty"
    );
    if (collectionEmpty) {
      document.getElementById("CollectionGird").innerHTML =
        htmlRender.getElementById("CollectionGird").innerHTML;
    } else {
      document.getElementById("CollectionGird").innerHTML =
        htmlRender.getElementById("CollectionGird").innerHTML;
    }
  }

  static renderProductCount(htmlRender) {
    const updateContent = (blockClass) => {
      const source = htmlRender.querySelector(`.${blockClass}`);
      const destination = document.querySelector(`.${blockClass}`);
      if (source && destination) {
        destination.innerHTML = source.innerHTML;
      }
    };

    const blocksToUpdate = ["collection-count", "facets-filters-active"];
    blocksToUpdate.forEach(updateContent);
  }

  static renderFilters(htmlRender, event) {
    const facetDetailsElements = htmlRender.querySelectorAll(
      "#FacetFiltersForm .js-filter, #FacetFiltersFormDrawer .js-filter"
    );
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest(".js-filter") : undefined;
      return jsFilter
        ? element.dataset.index === jsFilter.dataset.index
        : false;
    };
    const facetsToRender = Array.from(facetDetailsElements).filter(
      (element) => !matchesIndex(element)
    );

    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);
    facetsToRender.forEach((element) => {
      if (
        document.querySelector(
          `.js-filter[data-index="${element.dataset.index}"]`
        )
      ) {
        document.querySelector(
          `.js-filter[data-index="${element.dataset.index}"]`
        ).innerHTML = element.innerHTML;
      }
    });

    FacetFiltersForm.renderActiveFacets(htmlRender);

    if (countsToRender)
      FacetFiltersForm.renderCounts(
        countsToRender,
        event.target.closest(".js-filter")
      );
    event.target.closest("#ProductsGridContainer").classList.remove("loading");
  }

  static renderActiveFacets(html) {
    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderCounts(source, target) {
    const targetElement = target.querySelector(".facets__selected");
    const sourceElement = source.querySelector(".facets__selected");

    const targetElementAccessibility = target.querySelector(".facets__summary");
    const sourceElementAccessibility = source.querySelector(".facets__summary");

    if (sourceElement && targetElement) {
      target.querySelector(".facets__selected").outerHTML =
        source.querySelector(".facets__selected").outerHTML;
    }

    if (targetElementAccessibility && sourceElementAccessibility) {
      target.querySelector(".facets__summary").outerHTML =
        source.querySelector(".facets__summary").outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState(
      { searchParams },
      "",
      `${window.location.pathname}${searchParams && "?".concat(searchParams)}`
    );
  }

  static getSections() {
    return [
      {
        section: document.getElementById("product-grid").dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const searchParams = this.createSearchParams(event.target.closest("form"));
    this.onSubmitForm(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf("?") == -1
        ? ""
        : event.currentTarget.href.slice(
            event.currentTarget.href.indexOf("?") + 1
          );
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define("facet-filters-form", FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRangeDrag extends HTMLElement {
  constructor() {
    super();
    this.adjustToValidValues();
  }
  countPercentMin(value) {
    const rangemax = this.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let from = 0;
    if (value || rangemax !== 0) {
      from = (value / rangemax) * 100;
    }
    this.style.setProperty("--range-from", from + "%");
    if (Number(from) > Number(this.getValue("--range-to", this))) {
      this.style.setProperty("--range-to", from + "%");
    }
  }
  countPercentMax(value) {
    const rangemax = this.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let to = 0;
    if (value || rangemax !== 0) {
      to = (value / rangemax) * 100;
    }
    this.style.setProperty("--range-to", to + "%");
    if (Number(this.getValue("--range-from", this)) > Number(to)) {
      this.style.setProperty("--range-from", to + "%");
    }
  }
  getValue(value, priceDrag) {
    var computedStyle = getComputedStyle(priceDrag);
    var fromValue = computedStyle.getPropertyValue(value);
    return fromValue.replace("%", "");
  }

  adjustToValidValues() {
    const _this = this;
    var inputRange = this.querySelectorAll("input");
    var inputNum =
      this.closest("action-filter")?.querySelectorAll("price-range input");
    var rangeInput = inputRange[0];
    var rangeInput2 = inputRange[1];
    var minInput = inputNum[0];
    var maxInput = inputNum[1];

    rangeInput.addEventListener("input", function () {
      minInput.value = rangeInput.value;
      if (parseInt(minInput.value) > parseInt(maxInput.value)) {
        maxInput.value = Number(minInput.value);
        rangeInput2.value = Number(minInput.value);
      }
      _this.countPercentMin(Number(rangeInput.value));
    });

    rangeInput2.addEventListener("input", function () {
      maxInput.value =
        parseInt(rangeInput2.max) == rangeInput2.value
          ? Number(rangeInput2.max).toFixed(2)
          : rangeInput2.value;
      if (parseInt(maxInput.value) < parseInt(minInput.value)) {
        minInput.value = Number(maxInput.value);
        rangeInput.value = Number(maxInput.value);
      }
      if (parseInt(rangeInput2.max) == rangeInput2.value) {
        _this.countPercentMax(Number(rangeInput2.max));
      } else {
        _this.countPercentMax(Number(rangeInput2.value));
      }
    });
  }
}
customElements.define("price-range-drag", PriceRangeDrag);

class PriceRange extends PriceRangeDrag {
  constructor() {
    super();
    this.adjustToValidValues();
    this.priceDrag =
      this.closest("action-filter").querySelector("price-range-drag");
  }
  countPercentMin(value) {
    if (!this.priceDrag) return;
    const rangemax = this.priceDrag.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let from = 0;
    if (value || rangemax !== 0) {
      from = (value / rangemax) * 100;
    }
    this.priceDrag.style.setProperty("--range-from", from + "%");
    if (Number(from) > Number(this.getValue("--range-to", this.priceDrag))) {
      this.priceDrag.style.setProperty("--range-to", from + "%");
    }
  }
  countPercentMax(value) {
    if (!this.priceDrag) return;
    const rangemax = this.priceDrag.dataset?.rangeMax;
    if (!rangemax || rangemax === 0) return;
    let to = 0;
    if (value || rangemax !== 0) {
      to = (value / rangemax) * 100;
    }
    this.priceDrag.style.setProperty("--range-to", to + "%");
    if (Number(this.getValue("--range-from", this.priceDrag)) > Number(to)) {
      this.priceDrag.style.setProperty("--range-from", to + "%");
    }
  }
  adjustToValidValues() {
    const _this = this;
    var inputNum = this.querySelectorAll("input");
    var inputRange = this.closest("action-filter")?.querySelectorAll(
      "price-range-drag input"
    );
    var rangeInput = inputRange[0];
    var rangeInput2 = inputRange[1];
    var minInput = inputNum[0];
    var maxInput = inputNum[1];

    minInput.addEventListener("input", function () {
      if (minInput.value < Number(minInput.min) || minInput.value == "") {
        minInput.value = maxInput.min;
      }
      if (maxInput.value == "") {
        if (minInput.value > Number(maxInput.max)) {
          minInput.value = maxInput.max;
        }
      } else {
        if (minInput.value > Number(maxInput.value)) {
          minInput.value = maxInput.value;
        }
      }
      if (minInput.value != "") {
        rangeInput.value = minInput.value;
        _this.countPercentMin(Number(minInput.value));
      }
    });

    maxInput.addEventListener("input", function () {
      if (maxInput.value > Number(maxInput.max)) {
        maxInput.value = maxInput.max;
      }
      if (minInput.value == "") {
        if (maxInput.value < Number(minInput.min)) {
          maxInput.value = minInput.min;
        }
      } else {
        if (maxInput.value < Number(minInput.value)) {
          maxInput.value = minInput.value;
        }
      }
      if (maxInput.value != "") {
        rangeInput2.value =
          maxInput.value > maxInput.max
            ? Number(maxInput.max).toFixed(2)
            : maxInput.value;
        _this.countPercentMax(Number(maxInput.value));
      } else {
        rangeInput2.value = Number(maxInput.max).toFixed(2);
        _this.countPercentMax(Number(maxInput.max));
      }
    });
  }
}
customElements.define("price-range", PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector("a");
    facetLink.setAttribute("role", "button");
    facetLink.addEventListener("click", this.closeFilter.bind(this));
    facetLink.addEventListener("keyup", (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === "SPACE") this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    const form =
      this.closest("facet-filters-form") ||
      document.querySelector("facet-filters-form");
    form.onActiveFilterClick(event);
  }
}
customElements.define("facet-remove", FacetRemove);

class FacetApplyDrawer extends HTMLElement {
  constructor() {
    super();
    const _this = this;
    this.addEventListener("click", this.closeFilter.bind(this));
    this.addEventListener(
      "keypress",
      function (event) {
        if (event.key === "Enter") {
          _this.closeFilter.bind(_this)(event);
        }
      }.bind(_this),
      false
    );
  }

  closeFilter(event) {
    event.preventDefault();
    const drawer = this.closest("facet-drawer");
    if (drawer) {
      NextSkyTheme.eventModal(drawer, "close");
    }
  }
}
customElements.define("facet-apply-drawer", FacetApplyDrawer);

class SelectSorter extends HTMLElement {
  constructor() {
    super();
    this.addEventListener("click", this.activeFilterSort.bind(this), false);
    document.addEventListener("click", this.handleClickOutside.bind(this)),
      false;
  }
  activeFilterSort() {
    if (this.closest(".select-custom").classList.contains("active")) {
      this.closest(".select-custom").classList.remove("active");
    } else {
      this.closest(".select-custom").classList.add("active");
    }
  }
  handleClickOutside(event) {
    if (!event.target.closest(".facets-vertical-form")) {
      document.querySelectorAll(".facets-vertical-form").forEach((element) => {
        element.querySelector(".select-custom").classList.remove("active");
      });
    }
  }
}
customElements.define("select-sorter", SelectSorter);

class FilterSort extends FacetFiltersForm {
  constructor() {
    super();
    this.addEventListener("click", this.filterSort.bind(this), false);
  }
  filterSort() {
    const select = document.querySelector("select.facet-filters__select");
    const value = this.getAttribute("value");
    select.value = value;
    select.dispatchEvent(new Event("input", { bubbles: true }));
  }
}
customElements.define("filter-sort", FilterSort);

class FacetDrawer extends HTMLElement {
  constructor() {
    super();
    this.FacetsDrawer = document.getElementById("FacetsDrawer");
    this.FacetsDrawer.addEventListener(
      "click",
      this.openDrawer.bind(this),
      false
    );
  }

  openDrawer() {
    NextSkyTheme.body.appendChild(this);
    setTimeout(() => {
      this.FacetsDrawer.classList.add("active");
      const drawer = document.querySelector("facet-drawer");
      NextSkyTheme.eventModal(drawer, "open", true);
    }, 100);
  }
}
customElements.define("facet-drawer", FacetDrawer);

class LoadMoreProduct extends HTMLElement {
  constructor() {
    super();
    this.init();
  }

  init() {
    const _this = this;
    this.button = this.querySelector("button");
    if (!this.button) return;
    this.button.addEventListener("click", function () {
      _this.fetchData();
    });
  }

  fetchData() {
    const _this = this;
    const currentUrl = window.location.href;
    const param = window.location.search;
    let url = this.dataset.url;
    if (!url) return;
    if (param.length > 0) {
      url = currentUrl + url.replaceAll("?", "&");
    }
    this.button.classList.add("loading");
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        const htmlRender = new DOMParser().parseFromString(html, "text/html");
        const resultNodesHtml = htmlRender.querySelectorAll(
          "#product-grid .product-item"
        );
        resultNodesHtml.forEach((prodNode) =>
          document.querySelector("#product-grid").appendChild(prodNode)
        );
        document.querySelector(".paginate-progress").innerHTML =
          htmlRender.querySelector(".paginate-progress").innerHTML;
      })
      .finally(() => {
        if (window.SPR) {
          window.SPR.registerCallbacks();
          window.SPR.initRatingHandler();
          window.SPR.initDomEls();
          window.SPR.loadProducts();
          window.SPR.loadBadges();
        }
        _this.updateUrl(Number(this.dataset.url.replace("?page=", "")));
        this.button.classList.remove("loading");
      })
      .catch((e) => {
        console.error(e);
      });
  }

  updateUrl(e) {
    const all = this.dataset.allProducts;
    const limit = this.dataset.limit;
    if (all && limit && all > 0) {
      const times = ~~(all / limit);
      const remainder = all % limit;
      let pages = times;
      if (remainder > 0) {
        pages = times + 1;
      }
      if (e < pages) {
        this.dataset.url = "?page=" + ++e;
      } else {
        const btn = this.querySelector("button");
        if (btn) {
          btn.remove();
        }
      }
    }
  }
}
if (!customElements.get("loadmore-button")) {
  customElements.define("loadmore-button", LoadMoreProduct);
}

if (!customElements.get("loadmore-infinity")) {
  customElements.define(
    "loadmore-infinity",
    class LoadInfinity extends LoadMoreProduct {
      constructor() {
        super();
      }

      init() {
        this.scroll();
      }

      scroll() {
        const _this = this;
        this.btn = this.querySelector("button");
        if (!this.querySelector("button")) return;
        var isVisible = false;
        window.addEventListener("scroll", function () {
          var buttonRect = _this.btn.getBoundingClientRect();
          var viewportHeight = window.innerHeight;
          if (!isVisible && buttonRect.top <= viewportHeight) {
            isVisible = true;
            _this.fetchData();
          } else if (isVisible && buttonRect.top > viewportHeight) {
            isVisible = false;
          }
        });
      }
    }
  );
}
