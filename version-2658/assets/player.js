(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector(".play-trigger");
        var stream = player.getAttribute("data-stream");
        var loaded = false;

        var start = function () {
            if (!video || !stream) {
                return;
            }
            player.classList.add("is-playing");
            if (!loaded) {
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                    loaded = true;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls();
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    loaded = true;
                } else {
                    video.src = stream;
                    loaded = true;
                }
            }
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        };

        if (button) {
            button.addEventListener("click", start);
        }
        if (video) {
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
        }
    });
}());
