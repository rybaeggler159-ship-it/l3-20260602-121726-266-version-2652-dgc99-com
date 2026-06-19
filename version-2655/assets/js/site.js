const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

const escapeHtml = (value) => String(value || "")
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

const initNavigation = () => {
  const header = document.querySelector(".site-header");
  const button = document.querySelector(".menu-button");

  if (!header || !button) {
    return;
  }

  button.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
  });
};

const initImageFallback = () => {
  document.querySelectorAll("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("is-missing");
    });
  });
};

const initFilters = () => {
  document.querySelectorAll("[data-filter-panel]").forEach((panel) => {
    const buttons = panel.querySelectorAll("[data-filter-button]");
    const grid = panel.parentElement.querySelector("[data-card-grid]");

    if (!grid) {
      return;
    }

    const cards = Array.from(grid.querySelectorAll("[data-card]"));

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        buttons.forEach((item) => item.classList.remove("is-active"));
        button.classList.add("is-active");

        const filter = button.getAttribute("data-filter-button");
        cards.forEach((card) => {
          const type = card.getAttribute("data-type");
          const visible = filter === "all" || type === filter;
          card.classList.toggle("is-hidden-card", !visible);
        });
      });
    });
  });
};

const movieCardTemplate = (movie) => `
  <a class="movie-card" href="./${escapeHtml(movie.url)}" data-card>
    <span class="poster-frame">
      <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
      <span class="movie-badge">${escapeHtml(movie.year)}</span>
      <span class="card-play">▶</span>
    </span>
    <span class="movie-card-body">
      <strong>${escapeHtml(movie.title)}</strong>
      <span class="movie-meta">${escapeHtml(movie.meta)}</span>
      <span class="movie-genre">${escapeHtml(movie.genre)}</span>
      <span class="movie-line">${escapeHtml(movie.oneLine)}</span>
    </span>
  </a>
`;

const initSearch = () => {
  const form = document.querySelector("[data-search-form]");
  const section = document.querySelector("[data-search-section]");
  const results = document.querySelector("[data-search-results]");
  const title = document.querySelector("[data-search-title]");
  const meta = document.querySelector("[data-search-meta]");

  if (!form || !section || !results) {
    return;
  }

  if (!window.SEARCH_MOVIES) {
    window.addEventListener("searchDataReady", initSearch, { once: true });
    return;
  }

  if (form.dataset.searchReady === "true") {
    return;
  }

  form.dataset.searchReady = "true";

  const input = form.querySelector("input[name='q']");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  if (initialQuery) {
    input.value = initialQuery;
  }

  const render = (query) => {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      section.hidden = true;
      results.innerHTML = "";
      return;
    }

    const matched = window.SEARCH_MOVIES
      .filter((movie) => movie.searchText.includes(normalized))
      .slice(0, 80);

    section.hidden = false;
    title.textContent = `“${query}” 搜索结果`;
    meta.textContent = matched.length > 0 ? "点击影片卡片进入详情页观看。" : "换一个关键词试试。";
    results.innerHTML = matched.map(movieCardTemplate).join("");
    initImageFallback();
  };

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = input.value.trim();
    const url = new URL(window.location.href);
    url.searchParams.set("q", query);
    window.history.replaceState({}, "", url);
    render(query);
  });

  if (initialQuery) {
    render(initialQuery);
  }
};

export const setupMoviePlayer = async (source) => {
  const video = document.querySelector(".movie-video");
  const cover = document.querySelector(".player-cover");
  const trigger = document.querySelector(".play-trigger");

  if (!video || !source) {
    return;
  }

  let loaded = false;
  let hlsInstance = null;

  const loadVideo = async () => {
    if (loaded) {
      return;
    }

    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      return;
    }

    const module = await import("./hls.js");
    const Hls = module.H;

    if (Hls && Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  };

  const playVideo = async () => {
    await loadVideo();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    video.controls = true;

    try {
      await video.play();
    } catch (error) {
      if (hlsInstance && typeof hlsInstance.once === "function" && hlsInstance.constructor && hlsInstance.constructor.Events) {
        hlsInstance.once(hlsInstance.constructor.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {});
        });
      }
    }
  };

  if (trigger) {
    trigger.addEventListener("click", playVideo);
  }

  if (cover && cover !== trigger) {
    cover.addEventListener("click", playVideo);
  }

  video.addEventListener("click", () => {
    if (video.paused) {
      playVideo();
    }
  });
};

ready(() => {
  initNavigation();
  initImageFallback();
  initFilters();
  initSearch();
});
