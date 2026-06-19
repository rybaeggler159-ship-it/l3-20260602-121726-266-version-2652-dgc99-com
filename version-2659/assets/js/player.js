function initMoviePlayer(source, videoId, overlayId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var hls = null;

    if (!video) {
        return;
    }

    var bindSource = function () {
        if (video.dataset.ready === "true") {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(source);
            hls.attachMedia(video);
        } else {
            video.src = source;
        }

        video.dataset.ready = "true";
    };

    var startPlay = function () {
        bindSource();

        if (overlay) {
            overlay.classList.add("is-hidden");
        }

        var playTask = video.play();

        if (playTask && typeof playTask.catch === "function") {
            playTask.catch(function () {
                video.setAttribute("controls", "controls");
            });
        }
    };

    if (overlay) {
        overlay.addEventListener("click", startPlay);
    }

    video.addEventListener("click", function () {
        if (video.paused) {
            startPlay();
        }
    });

    video.addEventListener("play", function () {
        if (overlay) {
            overlay.classList.add("is-hidden");
        }
    });

    window.addEventListener("beforeunload", function () {
        if (hls) {
            hls.destroy();
        }
    });
}
