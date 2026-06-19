(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");
    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("open");
      });
    }

    document.querySelectorAll("img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("image-hidden");
      });
    });

    var slider = document.querySelector("[data-hero-slider]");
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var current = 0;
      var show = function (index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === current);
        });
      };
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });
      window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    var query = new URLSearchParams(window.location.search).get("q") || "";
    document.querySelectorAll("[data-sync-query]").forEach(function (input) {
      input.value = query;
    });

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll(".js-filter"));
    var sortInputs = Array.prototype.slice.call(document.querySelectorAll(".js-sort"));
    var targets = Array.prototype.slice.call(document.querySelectorAll(".filter-target"));

    function applyFilter() {
      var term = normalize(filterInputs.map(function (input) {
        return input.value;
      }).filter(Boolean).join(" "));
      var sortValue = sortInputs[0] ? sortInputs[0].value : "year-desc";

      targets.forEach(function (target) {
        var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute("data-search") || card.textContent);
          card.classList.toggle("hidden-card", term && haystack.indexOf(term) === -1);
        });
        cards.sort(function (a, b) {
          if (sortValue === "year-asc") {
            return (Number(a.getAttribute("data-year")) || 0) - (Number(b.getAttribute("data-year")) || 0);
          }
          if (sortValue === "title-asc") {
            return String(a.getAttribute("data-title") || "").localeCompare(String(b.getAttribute("data-title") || ""), "zh-Hans-CN");
          }
          return (Number(b.getAttribute("data-year")) || 0) - (Number(a.getAttribute("data-year")) || 0);
        });
        cards.forEach(function (card) {
          target.appendChild(card);
        });
      });
    }

    filterInputs.forEach(function (input) {
      input.addEventListener("input", applyFilter);
    });
    sortInputs.forEach(function (input) {
      input.addEventListener("change", applyFilter);
    });
    if (query) {
      applyFilter();
    }
  });
})();
