(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 6200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
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

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function getParam(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name) || "";
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initFilters() {
    var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
    roots.forEach(function (root) {
      var input = root.querySelector("[data-filter-input]");
      var year = root.querySelector("[data-filter-year]");
      var region = root.querySelector("[data-filter-region]");
      var cards = Array.prototype.slice.call(root.querySelectorAll("[data-movie-card]"));
      var empty = root.querySelector("[data-empty-state]");

      function apply() {
        var keyword = normalize(input ? input.value : "");
        var yearValue = year ? year.value : "";
        var regionValue = region ? region.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = normalize([
            card.dataset.title,
            card.dataset.region,
            card.dataset.year,
            card.dataset.genre,
            card.dataset.tags
          ].join(" "));
          var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var okYear = !yearValue || String(card.dataset.year) === String(yearValue);
          var okRegion = !regionValue || String(card.dataset.region) === String(regionValue);
          var show = okKeyword && okYear && okRegion;
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });

        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      if (input) {
        var q = getParam("q");
        if (q) {
          input.value = q;
        }
        input.addEventListener("input", apply);
      }
      if (year) {
        year.addEventListener("change", apply);
      }
      if (region) {
        region.addEventListener("change", apply);
      }
      apply();
    });
  }

  function formatTime(value) {
    if (!Number.isFinite(value) || value < 0) {
      return "0:00";
    }
    var minutes = Math.floor(value / 60);
    var seconds = Math.floor(value % 60);
    return minutes + ":" + String(seconds).padStart(2, "0");
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var source = video ? video.getAttribute("data-m3u8") : "";
      var overlay = player.querySelector("[data-play-button]");
      var playToggle = player.querySelector("[data-toggle-play]");
      var muteToggle = player.querySelector("[data-toggle-muted]");
      var full = player.querySelector("[data-fullscreen]");
      var progress = player.querySelector("[data-progress]");
      var time = player.querySelector("[data-time]");
      var hls = null;
      var loaded = false;

      if (!video || !source) {
        return;
      }

      function load() {
        if (loaded) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              player.classList.add("player-error");
            }
          });
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          player.classList.add("player-error");
        }
      }

      function play() {
        load();
        var action = video.paused ? video.play() : video.pause();
        if (action && typeof action.catch === "function") {
          action.catch(function () {});
        }
      }

      function sync() {
        player.classList.toggle("playing", !video.paused);
        if (playToggle) {
          playToggle.textContent = video.paused ? "播放" : "暂停";
        }
        if (muteToggle) {
          muteToggle.textContent = video.muted ? "取消静音" : "静音";
        }
      }

      function updateProgress() {
        var duration = video.duration || 0;
        if (progress) {
          progress.max = duration || 0;
          progress.value = video.currentTime || 0;
        }
        if (time) {
          time.textContent = formatTime(video.currentTime) + " / " + formatTime(duration);
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (playToggle) {
        playToggle.addEventListener("click", play);
      }
      video.addEventListener("click", play);
      video.addEventListener("play", sync);
      video.addEventListener("pause", sync);
      video.addEventListener("loadedmetadata", updateProgress);
      video.addEventListener("timeupdate", updateProgress);

      if (progress) {
        progress.addEventListener("input", function () {
          load();
          video.currentTime = Number(progress.value || 0);
        });
      }

      if (muteToggle) {
        muteToggle.addEventListener("click", function () {
          video.muted = !video.muted;
          sync();
        });
      }

      if (full) {
        full.addEventListener("click", function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (player.requestFullscreen) {
            player.requestFullscreen();
          }
        });
      }

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
      sync();
      updateProgress();
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
