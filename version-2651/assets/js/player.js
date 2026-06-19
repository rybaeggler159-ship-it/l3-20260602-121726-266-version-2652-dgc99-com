import { H as Hls } from "./hls.js";

function ready(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function setStatus(shell, message) {
  var status = shell.querySelector("[data-player-status]");

  if (status) {
    status.textContent = message;
  }
}

function initializePlayer(video) {
  var shell = video.closest(".player-shell");
  var source = video.dataset.src;

  if (!shell || !source) {
    return;
  }

  if (video.dataset.hlsReady === "true") {
    return;
  }

  video.dataset.hlsReady = "true";

  if (Hls && Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: false
    });

    hls.loadSource(source);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(shell, "播放源加载完成，可开始播放");
    });

    hls.on(Hls.Events.ERROR, function (event, data) {
      if (!data || !data.fatal) {
        return;
      }

      setStatus(shell, "播放源暂时无法加载，正在尝试恢复");

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        hls.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        hls.recoverMediaError();
      } else {
        hls.destroy();
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    setStatus(shell, "浏览器原生 HLS 播放已启用");
  } else {
    setStatus(shell, "当前浏览器不支持 HLS 播放，请更换现代浏览器");
  }
}

function setupPlayer(video) {
  var shell = video.closest(".player-shell");
  var button = shell ? shell.querySelector("[data-player-start]") : null;

  initializePlayer(video);

  if (button) {
    button.addEventListener("click", function () {
      initializePlayer(video);
      video.play().then(function () {
        shell.classList.add("is-playing");
      }).catch(function () {
        setStatus(shell, "浏览器阻止自动播放，请再次点击播放器控制栏");
      });
    });
  }

  video.addEventListener("play", function () {
    if (shell) {
      shell.classList.add("is-playing");
    }
  });

  video.addEventListener("pause", function () {
    if (shell) {
      shell.classList.remove("is-playing");
    }
  });
}

ready(function () {
  document.querySelectorAll(".hls-player").forEach(setupPlayer);
});
