(function () {
  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setHeroSlide(root, index) {
    var slides = root.querySelectorAll("[data-hero-slide]");
    var dots = root.querySelectorAll("[data-hero-dot]");
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle("is-active", dotIndex === index);
    });
    root.setAttribute("data-current-slide", String(index));
  }

  function startHero(root) {
    var slides = root.querySelectorAll("[data-hero-slide]");
    var dots = root.querySelectorAll("[data-hero-dot]");
    if (slides.length < 2) {
      return;
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setHeroSlide(root, index);
      });
    });
    window.setInterval(function () {
      var current = Number(root.getAttribute("data-current-slide") || "0");
      var next = (current + 1) % slides.length;
      setHeroSlide(root, next);
    }, 5200);
  }

  function filterCards(input) {
    var selector =
      input.getAttribute("data-filter-target") || "[data-search-scope]";
    var scope = document.querySelector(selector) || document;
    var cards = scope.querySelectorAll("[data-search-text]");
    var empty = document.querySelector(
      input.getAttribute("data-empty-target") || "[data-empty-state]",
    );
    var query = normalize(input.value);
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute("data-search-text"));
      var matched = !query || text.indexOf(query) !== -1;
      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });
    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  function loadSearchQuery(input) {
    var params = new URLSearchParams(window.location.search);
    var value = params.get("q");
    if (value) {
      input.value = value;
      filterCards(input);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (menuButton && panel) {
      menuButton.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }

    document.querySelectorAll("[data-hero]").forEach(startHero);

    document.querySelectorAll("[data-search-input]").forEach(function (input) {
      loadSearchQuery(input);
      input.addEventListener("input", function () {
        filterCards(input);
      });
    });
  });
})();
