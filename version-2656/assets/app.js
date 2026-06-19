(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');

  if (menuButton && nav) {
    menuButton.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;

    var setHero = function (index) {
      activeIndex = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var nextIndex = Number(dot.getAttribute('data-hero-dot')) || 0;
        setHero(nextIndex);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        setHero((activeIndex + 1) % slides.length);
      }, 5600);
    }
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-local-search]'));

  searchInputs.forEach(function (input) {
    var scope = document.querySelector('[data-search-scope]');

    if (!scope) {
      return;
    }

    var items = Array.prototype.slice.call(scope.children);

    input.addEventListener('input', function () {
      var value = input.value.trim().toLowerCase();

      items.forEach(function (item) {
        var content = [
          item.getAttribute('data-title') || '',
          item.getAttribute('data-region') || '',
          item.getAttribute('data-genre') || '',
          item.getAttribute('data-year') || '',
          item.textContent || ''
        ].join(' ').toLowerCase();

        item.classList.toggle('is-hidden-by-search', value && content.indexOf(value) === -1);
      });
    });
  });

  Array.prototype.slice.call(document.querySelectorAll('[data-clear-search]')).forEach(function (button) {
    button.addEventListener('click', function () {
      var form = button.closest('form');
      var input = form ? form.querySelector('[data-local-search]') : null;

      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input'));
      }
    });
  });

  var video = document.getElementById('mainVideo');
  var playButton = document.querySelector('[data-play-video]');

  if (video && playButton) {
    var streamUrl = playButton.getAttribute('data-stream-url') || '';
    var card = playButton.closest('.player-card');

    if (streamUrl && window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        maxBufferLength: 30,
        enableWorker: true
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else if (streamUrl && video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }

    var startVideo = function () {
      var playPromise = video.play();

      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(function () {
          if (card) {
            card.classList.add('is-playing');
          }
        }).catch(function () {
          if (card) {
            card.classList.remove('is-playing');
          }
        });
      } else if (card) {
        card.classList.add('is-playing');
      }
    };

    playButton.addEventListener('click', startVideo);

    video.addEventListener('play', function () {
      if (card) {
        card.classList.add('is-playing');
      }
    });

    video.addEventListener('pause', function () {
      if (card) {
        card.classList.remove('is-playing');
      }
    });
  }
}());
