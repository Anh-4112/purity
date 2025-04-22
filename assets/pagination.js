let parser = new DOMParser();
class PaginateLoadmore extends HTMLElement {
  constructor() {
    super();
    this.initLoadMore();
  }
  initLoadMore() {
    this.querySelectorAll(".actions-load-more").forEach((loadMore) => {
      var _this = this;
      if (loadMore.classList.contains("infinit-scrolling")) {
        var observer = new IntersectionObserver(
          function (entries) {
            entries.forEach((entry) => {
              if (entry.intersectionRatio === 1) {
                _this.loadMorePosts(loadMore);
              }
            });
          },
          { threshold: 1.0 }
        );
        observer.observe(loadMore);
      } else {
        loadMore.addEventListener(
          "click",
          (event) => {
            event.preventDefault();
            const target = event.currentTarget;
            _this.loadMorePosts(target);
          },
          false
        );
      }
    });
  }
  loadMorePosts(target) {
    const loadMore_url = target.getAttribute("href");
    const _this = this;
    _this.toggleLoading(target, true);
    fetch(`${loadMore_url}`)
      .then((response) => {
        if (!response.ok) {
          var error = new Error(response.status);
          throw error;
        }
        return response.text();
      })
      .then((responseText) => {
        const resultNodes = parser.parseFromString(responseText, "text/html");
        const resultNodesHtml = resultNodes.querySelectorAll(
          "#main-items .item-load"
        );
        resultNodesHtml.forEach((prodNode) =>
          document
            .getElementById("section__content-items")
            .appendChild(prodNode)
        );
        const load_more = resultNodes.querySelector(".actions-load-more");
        document.querySelector(".load-more-amount").innerHTML =
          resultNodes.querySelector(".load-more-amount").textContent;
        if (load_more) {
          target.setAttribute("href", load_more.getAttribute("href"));
        } else {
          target.remove();
        }
        _this.toggleLoading(target, false);
      })
      .catch((error) => {
        throw error;
      });
  }
  toggleLoading(event, loading) {
    if (event) {
      const method = loading ? "add" : "remove";
      event.classList[method]("loading");
    }
  }
}

customElements.define("loadmore-button", PaginateLoadmore);
