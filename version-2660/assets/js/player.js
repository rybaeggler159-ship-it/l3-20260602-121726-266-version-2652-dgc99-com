import { H as Hls } from "./hls.js";

export function initPlayer(streamUrl) {
  var player = document.querySelector("[data-player]");
  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var layer = player.querySelector("[data-player-layer]");
  var button = player.querySelector("[data-player-button]");
  var message = player.querySelector("[data-player-message]");
  var hls = null;
  var attached = false;

  function showMessage(text) {
    if (message) {
      message.textContent = text;
    }
  }

  function hideLayer() {
    if (layer) {
      layer.classList.add("is-hidden");
    }
  }

  function attachStream() {
    if (attached || !video) {
      return Promise.resolve();
    }
    attached = true;
    video.controls = true;
    video.playsInline = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return Promise.resolve();
    }

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        showMessage("播放暂时不可用，请稍后重试");
      });
      return new Promise(function (resolve) {
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }

    showMessage("播放暂时不可用，请稍后重试");
    return Promise.resolve();
  }

  function start() {
    attachStream().then(function () {
      hideLayer();
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          showMessage("点击画面即可继续播放");
          if (layer) {
            layer.classList.remove("is-hidden");
          }
        });
      }
    });
  }

  if (button) {
    button.addEventListener("click", start);
  }
  if (layer) {
    layer.addEventListener("click", function (event) {
      if (event.target === layer) {
        start();
      }
    });
  }
  if (video) {
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
  }
  window.addEventListener("pagehide", function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
