(function () {
    var navToggle = document.querySelector(".nav-toggle");
    var siteNav = document.querySelector(".site-nav");

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", function () {
            var opened = siteNav.classList.toggle("is-open");
            navToggle.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var slider = document.querySelector("[data-hero-slider]");

    if (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide-dot]"));
        var current = 0;
        var timer = null;

        var showSlide = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        };

        var startTimer = function () {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]"));
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll("[data-filter-select]"));
    var movieCards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    var normalize = function (value) {
        return String(value || "").toLowerCase().trim();
    };

    var applyFilters = function () {
        var query = normalize(filterInputs.map(function (input) {
            return input.value;
        }).join(" "));

        var selectValues = filterSelects.map(function (select) {
            return {
                key: select.getAttribute("data-filter-select"),
                value: normalize(select.value)
            };
        }).filter(function (item) {
            return item.value;
        });

        movieCards.forEach(function (card) {
            var haystack = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags")
            ].join(" "));

            var matchesQuery = !query || haystack.indexOf(query) !== -1;
            var matchesSelects = selectValues.every(function (item) {
                return normalize(card.getAttribute("data-" + item.key)) === item.value;
            });

            card.classList.toggle("is-hidden", !(matchesQuery && matchesSelects));
        });
    };

    filterInputs.forEach(function (input) {
        input.addEventListener("input", applyFilters);
    });

    filterSelects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
    });
})();
