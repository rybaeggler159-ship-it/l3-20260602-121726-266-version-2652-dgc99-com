(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
        } else {
            document.addEventListener("DOMContentLoaded", fn);
        }
    }

    ready(function () {
        var navToggle = document.querySelector("[data-nav-toggle]");
        var mainNav = document.querySelector("[data-main-nav]");
        if (navToggle && mainNav) {
            navToggle.addEventListener("click", function () {
                mainNav.classList.toggle("is-open");
            });
        }

        var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
        if (slides.length) {
            var active = 0;
            var show = function (index) {
                active = index;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle("is-active", i === active);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle("is-active", i === active);
                });
            };
            dots.forEach(function (dot, i) {
                dot.addEventListener("click", function () {
                    show(i);
                });
            });
            window.setInterval(function () {
                show((active + 1) % slides.length);
            }, 5200);
        }

        var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-search-input]"));
        inputs.forEach(function (input) {
            var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card-list] .movie-card"));
            var empty = document.querySelector("[data-empty-state]");
            if (!cards.length) {
                return;
            }
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
                    var matched = !keyword || haystack.indexOf(keyword) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.style.display = visible ? "none" : "block";
                }
            });
        });
    });
}());
