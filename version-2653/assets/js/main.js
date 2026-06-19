(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = selectAll('[data-hero-slide]', hero);
    var dots = selectAll('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    selectAll('[data-filter-panel]').forEach(function (panel) {
      var input = panel.querySelector('[data-search-input]');
      var clear = panel.querySelector('[data-clear-filter]');
      var chips = selectAll('[data-filter-value]', panel);
      var scope = panel.closest('main') || document;
      var cards = selectAll('[data-movie-card]', scope);
      var empty = scope.querySelector('[data-no-result]');
      var activeChip = '';

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = (card.getAttribute('data-search') || '').toLowerCase();
          var textMatch = !query || haystack.indexOf(query) !== -1;
          var chipMatch = !activeChip || haystack.indexOf(activeChip.toLowerCase()) !== -1;
          var ok = textMatch && chipMatch;
          card.style.display = ok ? '' : 'none';
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      if (input) {
        input.addEventListener('input', apply);
      }
      if (clear) {
        clear.addEventListener('click', function () {
          if (input) {
            input.value = '';
          }
          activeChip = '';
          chips.forEach(function (chip) {
            chip.classList.remove('is-active');
          });
          apply();
        });
      }
      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var value = chip.getAttribute('data-filter-value') || '';
          if (activeChip === value) {
            activeChip = '';
            chip.classList.remove('is-active');
          } else {
            activeChip = value;
            chips.forEach(function (item) {
              item.classList.remove('is-active');
            });
            chip.classList.add('is-active');
          }
          apply();
        });
      });
      apply();
    });
  }

  function initSearchQuery() {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');
    if (!q) {
      return;
    }
    selectAll('[data-search-input]').forEach(function (input) {
      if (!input.value) {
        input.value = q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  }

  window.initVideoPlayer = function (videoId, overlayId, streamUrl) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    if (!video || !overlay || !streamUrl) {
      return;
    }
    var attached = false;
    var hls = null;

    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      attached = true;
    }

    function start() {
      attach();
      overlay.classList.add('is-hidden');
      video.setAttribute('controls', 'controls');
      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === 'function') {
        playRequest.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initHero();
    initFilters();
    initSearchQuery();
  });
})();
