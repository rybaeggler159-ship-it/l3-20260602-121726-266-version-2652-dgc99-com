(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function markBrokenImages() {
    document.querySelectorAll("img[data-title]").forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupCategoryFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-card-grid]");

    if (!panel || !grid) {
      return;
    }

    var search = panel.querySelector("[data-category-search]");
    var region = panel.querySelector("[data-region-filter]");
    var year = panel.querySelector("[data-year-filter]");
    var reset = panel.querySelector("[data-filter-reset]");
    var count = document.querySelector("[data-visible-count]");
    var empty = document.querySelector("[data-empty-state]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-movie-card]"));

    function matches(card, keyword, regionValue, yearValue) {
      var haystack = [
        card.dataset.title,
        card.dataset.region,
        card.dataset.year,
        card.dataset.genre,
        card.dataset.tags
      ].join(" ").toLowerCase();

      if (keyword && haystack.indexOf(keyword) === -1) {
        return false;
      }

      if (regionValue && card.dataset.region !== regionValue) {
        return false;
      }

      if (yearValue && card.dataset.year !== yearValue) {
        return false;
      }

      return true;
    }

    function apply() {
      var keyword = search ? search.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var yearValue = year ? year.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var shouldShow = matches(card, keyword, regionValue, yearValue);
        card.hidden = !shouldShow;
        if (shouldShow) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    [search, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    if (reset) {
      reset.addEventListener("click", function () {
        if (search) {
          search.value = "";
        }
        if (region) {
          region.value = "";
        }
        if (year) {
          year.value = "";
        }
        apply();
      });
    }

    apply();
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    var summary = document.querySelector("[data-search-summary]");
    var defaultBlock = document.querySelector("[data-search-default]");
    var pageInput = document.querySelector("[data-search-page-input]");

    if (!results || !window.MOVIE_SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();

    if (pageInput) {
      pageInput.value = query;
    }

    function cardTemplate(movie) {
      return [
        "<a class=\"movie-card\" href=\"" + movie.url + "\" data-movie-card>",
        "  <figure class=\"poster-frame\">",
        "    <span class=\"cover-fallback\">" + escapeHtml(movie.title.slice(0, 18)) + "</span>",
        "    <img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + " 海报\" data-title=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">",
        "    <span class=\"poster-badge\">" + escapeHtml(movie.genre.slice(0, 12)) + "</span>",
        "    <span class=\"poster-score\">" + escapeHtml(movie.score) + "</span>",
        "  </figure>",
        "  <div class=\"movie-card-body\">",
        "    <div class=\"movie-card-kicker\">" + escapeHtml(movie.category) + " · " + escapeHtml(movie.region) + "</div>",
        "    <h3>" + escapeHtml(movie.title) + "</h3>",
        "    <p>" + escapeHtml(movie.oneLine) + "</p>",
        "    <div class=\"movie-meta\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.type) + "</span></div>",
        "  </div>",
        "</a>"
      ].join("\n");
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function searchMovies(keyword) {
      var normalized = keyword.toLowerCase();

      if (!normalized) {
        return [];
      }

      return window.MOVIE_SEARCH_DATA.filter(function (movie) {
        return movie.searchText.indexOf(normalized) !== -1;
      }).slice(0, 120);
    }

    if (!query) {
      if (summary) {
        summary.textContent = "请输入关键词开始搜索。";
      }
      return;
    }

    var matched = searchMovies(query);
    results.innerHTML = matched.map(cardTemplate).join("\n");

    if (summary) {
      summary.textContent = "关键词“" + query + "”找到 " + matched.length + " 条结果。";
    }

    if (defaultBlock) {
      defaultBlock.hidden = matched.length > 0;
    }

    markBrokenImages();
  }

  ready(function () {
    markBrokenImages();
    setupMenu();
    setupHero();
    setupCategoryFilters();
    setupSearchPage();
  });
})();
