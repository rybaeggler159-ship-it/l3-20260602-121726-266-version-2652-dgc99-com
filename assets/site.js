(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileMenu() {
    var button = qs('[data-mobile-menu-button]');
    var menu = qs('[data-mobile-menu]');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
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
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
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

  function initCardFilter() {
    var input = qs('[data-card-filter]');
    if (!input) {
      return;
    }
    var cards = qsa('[data-card="movie"]');
    var count = qs('[data-filter-count]');

    function update() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags')
        ].join(' ').toLowerCase();
        var matched = !value || haystack.indexOf(value) !== -1;
        card.classList.toggle('hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = String(visible);
      }
    }

    input.addEventListener('input', update);
    update();
  }

  function initPlayer() {
    var shell = qs('[data-player]');
    if (!shell) {
      return;
    }
    var video = qs('video', shell);
    var button = qs('[data-play-button]', shell);
    var source = shell.getAttribute('data-src');
    if (!video || !button || !source) {
      return;
    }

    function bindSource() {
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hls.loadSource(source);
        hls.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        video.src = source;
      }
    }

    button.addEventListener('click', function () {
      if (!video.getAttribute('src') && !(window.Hls && video.hlsBound)) {
        bindSource();
        video.hlsBound = true;
      }
      shell.classList.add('is-playing');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    });
  }

  function initSearchPage() {
    var resultRoot = qs('[data-search-results]');
    if (!resultRoot || !window.MOVIE_DATA) {
      return;
    }
    var keyword = qs('[data-search-keyword]');
    var region = qs('[data-search-region]');
    var year = qs('[data-search-year]');
    var tag = qs('[data-search-tag]');
    var status = qs('[data-search-status]');
    var params = new URLSearchParams(window.location.search);

    if (keyword && params.get('q')) {
      keyword.value = params.get('q');
    }

    function option(value) {
      var element = document.createElement('option');
      element.value = value;
      element.textContent = value;
      return element;
    }

    function unique(values) {
      return Array.from(new Set(values.filter(Boolean))).sort();
    }

    unique(window.MOVIE_DATA.map(function (movie) { return movie.region; })).forEach(function (value) {
      region.appendChild(option(value));
    });

    unique(window.MOVIE_DATA.map(function (movie) { return String(movie.year); })).sort(function (a, b) {
      return Number(b) - Number(a);
    }).forEach(function (value) {
      year.appendChild(option(value));
    });

    unique(window.MOVIE_DATA.flatMap(function (movie) { return movie.tags; })).slice(0, 120).forEach(function (value) {
      tag.appendChild(option(value));
    });

    function card(movie) {
      var tags = movie.tags.slice(0, 2).map(function (item) {
        return '<span class="tag tag-amber">' + escapeHtml(item) + '</span>';
      }).join('');
      return [
        '<article class="movie-card movie-card-medium">',
        '  <a href="./' + movie.file + '" class="movie-card-link" aria-label="查看 ' + escapeHtml(movie.title) + '">',
        '    <div class="movie-cover-wrap">',
        '      <img src="./' + movie.cover + '.jpg" alt="' + escapeHtml(movie.title) + '" class="movie-cover" loading="lazy">',
        '      <div class="movie-cover-mask"></div>',
        '      <div class="movie-cover-meta"><span>' + movie.year + '</span><span>·</span><span>' + escapeHtml(movie.region) + '</span></div>',
        '    </div>',
        '    <div class="movie-card-body">',
        '      <h3>' + escapeHtml(movie.title) + '</h3>',
        '      <p>' + escapeHtml(movie.oneLine) + '</p>',
        '      <div class="movie-card-foot"><span class="tag tag-stone">' + escapeHtml(movie.type) + '</span><span class="tag-group">' + tags + '</span></div>',
        '    </div>',
        '  </a>',
        '</article>'
      ].join('');
    }

    function escapeHtml(value) {
      return String(value).replace(/[&<>"']/g, function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[char];
      });
    }

    function update() {
      var q = keyword.value.trim().toLowerCase();
      var r = region.value;
      var y = year.value;
      var t = tag.value;
      var results = window.MOVIE_DATA.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine, movie.tags.join(' ')].join(' ').toLowerCase();
        return (!q || text.indexOf(q) !== -1) &&
          (!r || movie.region === r) &&
          (!y || String(movie.year) === y) &&
          (!t || movie.tags.indexOf(t) !== -1);
      });
      status.textContent = '共找到 ' + results.length + ' 部影片，当前显示前 ' + Math.min(results.length, 120) + ' 部。';
      resultRoot.innerHTML = results.slice(0, 120).map(card).join('') || '<div class="text-card"><h2>未找到相关内容</h2><p>可以更换关键词、地区、年份或标签后重新筛选。</p></div>';
    }

    [keyword, region, year, tag].forEach(function (element) {
      element.addEventListener('input', update);
      element.addEventListener('change', update);
    });
    update();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initCardFilter();
    initPlayer();
    initSearchPage();
  });
})();
