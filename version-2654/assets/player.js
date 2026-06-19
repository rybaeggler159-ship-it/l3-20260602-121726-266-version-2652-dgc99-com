(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    document.querySelectorAll("[data-player]").forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      if (!video || !button) {
        return;
      }

      var stream = video.getAttribute("data-stream");
      var hlsInstance = null;
      var attached = false;

      function attach() {
        return new Promise(function (resolve) {
          if (attached || !stream) {
            resolve();
            return;
          }

          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              attached = true;
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function () {
              if (!attached) {
                video.src = stream;
                attached = true;
                resolve();
              }
            });
            return;
          }

          if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = stream;
            attached = true;
            resolve();
            return;
          }

          video.src = stream;
          attached = true;
          resolve();
        });
      }

      function play() {
        attach().then(function () {
          player.classList.add("is-playing");
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              player.classList.remove("is-playing");
            });
          }
        });
      }

      button.addEventListener("click", play);
      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  });
})();
