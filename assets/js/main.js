(() => {
  const BOOKING_URLS = {
    jaipur: "https://live.ipms247.com/booking/book-rooms-indisoulhospitalityworkspvtltdhammockhostels",
    mumbai: "https://live.ipms247.com/booking/book-rooms-hammockhostels",
  };

  const applyBookingLink = (el, url) => {
    el.setAttribute("href", url);
    el.setAttribute("target", "_blank");
    el.setAttribute("rel", "noopener noreferrer");
  };

  document.querySelectorAll("[data-book-jaipur]").forEach((el) => {
    applyBookingLink(el, BOOKING_URLS.jaipur);
  });

  document.querySelectorAll("[data-book-mumbai]").forEach((el) => {
    applyBookingLink(el, BOOKING_URLS.mumbai);
  });

  // Mark active nav link based on current path.
  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const href = (a.getAttribute("href") || "").toLowerCase();
    if (href === path) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });

  // Dynamic current year in footer copyright.
  const currentYear = String(new Date().getFullYear());
  document.querySelectorAll("[data-current-year]").forEach((el) => {
    el.textContent = currentYear;
  });

  // Sticky mobile booking CTAs (Jaipur + Mumbai).
  const mobileViewport = window.matchMedia("(max-width: 991.98px)");
  if (mobileViewport.matches) {
    const mobileBar = document.createElement("div");
    mobileBar.className = "mobile-book-cta-bar";
    mobileBar.setAttribute("role", "group");
    mobileBar.setAttribute("aria-label", "Book your stay");

    const jaipurBtn = document.createElement("a");
    jaipurBtn.className = "btn btn-primary flex-fill";
    jaipurBtn.setAttribute("data-book-jaipur", "");
    jaipurBtn.textContent = "Book Jaipur";

    const mumbaiBtn = document.createElement("a");
    mumbaiBtn.className = "btn btn-outline-primary flex-fill";
    mumbaiBtn.setAttribute("data-book-mumbai", "");
    mumbaiBtn.textContent = "Book Mumbai";

    mobileBar.append(jaipurBtn, mumbaiBtn);
    document.body.appendChild(mobileBar);
    applyBookingLink(jaipurBtn, BOOKING_URLS.jaipur);
    applyBookingLink(mumbaiBtn, BOOKING_URLS.mumbai);
  }

  // Reveal-on-scroll animations for key layout blocks.
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!prefersReducedMotion) {
    const revealTargets = Array.from(
      document.querySelectorAll(
        ".section-heading, .hero-card, .hero-media, .card-soft, .icon-tile, .gcell, .cta-band"
      )
    ).filter((el) => {
      if (el.closest("[data-room-slider]")) return false;
      // Tall policy cards rarely satisfy IntersectionObserver on mobile (content stays opacity: 0).
      if (el.closest(".hero-inner")) return false;
      if (el.querySelector(".policy-content")) return false;
      return true;
    });

    revealTargets.forEach((el, idx) => {
      el.classList.add("reveal");
      el.style.setProperty("--reveal-delay", `${(idx % 6) * 70}ms`);
    });

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealTargets.forEach((el) => observer.observe(el));
  }

  // Hero slideshow: fade carousel with reduced-motion support.
  document.querySelectorAll("[data-hero-carousel]").forEach((heroCarouselEl) => {
    if (!window.bootstrap?.Carousel) return;
    const heroCarousel = window.bootstrap.Carousel.getOrCreateInstance(heroCarouselEl, {
      interval: prefersReducedMotion ? false : 5000,
      ride: prefersReducedMotion ? false : "carousel",
      pause: "hover",
      touch: true,
    });
    if (prefersReducedMotion) {
      heroCarousel.pause();
    }
  });

  const formatReviewCount = (count) => Number(count).toLocaleString("en-US");

  const buildRatingItem = (platform) => {
    const article = document.createElement("article");
    article.className = "rating-item";
    const scoreText = `${platform.score}/${platform.scale}`;
    const countText = `${formatReviewCount(platform.reviewCount)} ${platform.reviewLabel}`;
    article.innerHTML = `<img loading="lazy" decoding="async" src="${platform.logo}" alt="${platform.name}" /><p><strong>${scoreText}</strong> · ${countText}</p>`;
    return article;
  };

  const initRatingSlider = (track) => {
    if (!track || !track.children.length) return;

    const ratingSlider = track.closest("[data-rating-slider]");
    if (!ratingSlider) return;

    const baseItems = Array.from(track.children).map((node) => node.cloneNode(true));
      let currentIndex = 0;
      let timer = null;
      let pause = false;

      const visibleCount = () => {
        if (window.innerWidth < 576) return 1;
        if (window.innerWidth < 992) return 2;
        return 4;
      };

      const getStepWidth = () => {
        const first = track.querySelector(".rating-item");
        if (!first) return 0;
        const gap = parseFloat(getComputedStyle(track).gap || "0");
        return first.getBoundingClientRect().width + gap;
      };

      const render = () => {
        const visible = visibleCount();
        track.innerHTML = "";
        baseItems.forEach((item) => track.appendChild(item.cloneNode(true)));
        baseItems.slice(0, visible).forEach((item) => track.appendChild(item.cloneNode(true)));
        currentIndex = 0;
        track.style.transition = "none";
        track.style.transform = "translateX(0px)";
      };

      const moveNext = () => {
        if (pause) return;
        const step = getStepWidth();
        if (!step) return;
        currentIndex += 1;
        track.style.transition = "transform .55s ease";
        track.style.transform = `translateX(${-currentIndex * step}px)`;

        if (currentIndex >= baseItems.length) {
          window.setTimeout(() => {
            currentIndex = 0;
            track.style.transition = "none";
            track.style.transform = "translateX(0px)";
          }, 570);
        }
      };

      const start = () => {
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(moveNext, 2400);
      };

      render();
      start();
      window.addEventListener("resize", () => {
        render();
        start();
      });
      ratingSlider.addEventListener("mouseenter", () => {
        pause = true;
      });
      ratingSlider.addEventListener("mouseleave", () => {
        pause = false;
      });
  };

  const initRatingsFromJson = async () => {
    const ratingSlider = document.querySelector("[data-rating-slider]");
    const track = ratingSlider?.querySelector(".rating-track");
    if (!track) return;

    let data;
    try {
      const response = await fetch("assets/data/ratings.json");
      if (!response.ok) return;
      data = await response.json();
    } catch {
      return;
    }

    const platforms = (data.platforms || []).filter((platform) => platform.enabled !== false);
    const platformById = Object.fromEntries(platforms.map((platform) => [platform.id, platform]));

    const heroBadge = document.querySelector("[data-rating-hero]");
    if (heroBadge && data.heroHighlight) {
      const highlightPlatform = platformById[data.heroHighlight.platformId];
      const score = highlightPlatform?.score ?? "";
      heroBadge.textContent = (data.heroHighlight.label || "").replace("{score}", String(score));
    }

    track.innerHTML = "";
    platforms.forEach((platform) => {
      track.appendChild(buildRatingItem(platform));
    });

    initRatingSlider(track);
  };

  initRatingsFromJson();

  // Room slider (index page): show 3 room cards and slide one-by-one.
  const roomSlider = document.querySelector("[data-room-slider]");
  if (roomSlider) {
    const track = roomSlider.querySelector(".room-track");
    if (track) {
      const baseItems = Array.from(track.children).map((node) => node.cloneNode(true));
      let currentIndex = 0;
      let timer = null;
      let pause = false;

      const visibleCount = () => {
        if (window.innerWidth < 576) return 1;
        if (window.innerWidth < 992) return 2;
        return 3;
      };

      const getStepWidth = () => {
        const first = track.querySelector(".room-slide");
        if (!first) return 0;
        const gap = parseFloat(getComputedStyle(track).gap || "0");
        return first.getBoundingClientRect().width + gap;
      };

      const render = () => {
        const visible = visibleCount();
        track.innerHTML = "";
        baseItems.forEach((item) => track.appendChild(item.cloneNode(true)));
        baseItems.slice(0, visible).forEach((item) => track.appendChild(item.cloneNode(true)));
        currentIndex = 0;
        track.style.transition = "none";
        track.style.transform = "translateX(0px)";
      };

      const moveNext = () => {
        if (pause) return;
        const step = getStepWidth();
        if (!step) return;
        currentIndex += 1;
        track.style.transition = "transform .55s ease";
        track.style.transform = `translateX(${-currentIndex * step}px)`;

        if (currentIndex >= baseItems.length) {
          window.setTimeout(() => {
            currentIndex = 0;
            track.style.transition = "none";
            track.style.transform = "translateX(0px)";
          }, 570);
        }
      };

      const start = () => {
        if (prefersReducedMotion) return;
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(moveNext, 3200);
      };

      const initRoomSlider = () => {
        render();
        start();
      };

      requestAnimationFrame(() => requestAnimationFrame(initRoomSlider));
      window.addEventListener("resize", () => {
        initRoomSlider();
      });
      roomSlider.addEventListener("mouseenter", () => {
        pause = true;
      });
      roomSlider.addEventListener("mouseleave", () => {
        pause = false;
      });
    }
  }

  // Testimonial slider (index page): show 3 cards and slide one-by-one.
  const testimonialSlider = document.querySelector("[data-testimonial-slider]");
  if (testimonialSlider) {
    const track = testimonialSlider.querySelector(".testimonial-track");
    if (track) {
      const baseItems = Array.from(track.children).map((node) => node.cloneNode(true));
      let currentIndex = 0;
      let timer = null;
      let pause = false;

      const visibleCount = () => {
        if (window.innerWidth < 576) return 1;
        if (window.innerWidth < 992) return 2;
        return 3;
      };

      const getStepWidth = () => {
        const first = track.querySelector(".testimonial-slide");
        if (!first) return 0;
        const gap = parseFloat(getComputedStyle(track).gap || "0");
        return first.getBoundingClientRect().width + gap;
      };

      const render = () => {
        const visible = visibleCount();
        track.innerHTML = "";
        baseItems.forEach((item) => track.appendChild(item.cloneNode(true)));
        baseItems.slice(0, visible).forEach((item) => track.appendChild(item.cloneNode(true)));
        currentIndex = 0;
        track.style.transition = "none";
        track.style.transform = "translateX(0px)";
      };

      const moveNext = () => {
        if (pause) return;
        const step = getStepWidth();
        if (!step) return;
        currentIndex += 1;
        track.style.transition = "transform .55s ease";
        track.style.transform = `translateX(${-currentIndex * step}px)`;

        if (currentIndex >= baseItems.length) {
          window.setTimeout(() => {
            currentIndex = 0;
            track.style.transition = "none";
            track.style.transform = "translateX(0px)";
          }, 570);
        }
      };

      const start = () => {
        if (prefersReducedMotion) return;
        if (timer) window.clearInterval(timer);
        timer = window.setInterval(moveNext, 3200);
      };

      const initTestimonialSlider = () => {
        render();
        start();
      };

      requestAnimationFrame(() => requestAnimationFrame(initTestimonialSlider));
      window.addEventListener("resize", () => {
        initTestimonialSlider();
      });
      testimonialSlider.addEventListener("mouseenter", () => {
        pause = true;
      });
      testimonialSlider.addEventListener("mouseleave", () => {
        pause = false;
      });
    }
  }

  // Shared gallery lightbox for home + gallery pages.
  const galleryLinks = Array.from(document.querySelectorAll("[data-gallery-item]"));
  if (galleryLinks.length) {
    const groups = galleryLinks.reduce((acc, el) => {
      const key = el.getAttribute("data-gallery-group") || "default";
      acc[key] = acc[key] || [];
      acc[key].push(el);
      return acc;
    }, {});

    const lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
      <div class="gallery-lightbox-inner" role="dialog" aria-modal="true" aria-label="Image gallery preview">
        <button class="gallery-lightbox-close" type="button" aria-label="Close gallery"><i class="bi bi-x-lg"></i></button>
        <button class="gallery-lightbox-prev" type="button" aria-label="Previous image"><i class="bi bi-chevron-left"></i></button>
        <img class="gallery-lightbox-image" src="" alt="" />
        <button class="gallery-lightbox-next" type="button" aria-label="Next image"><i class="bi bi-chevron-right"></i></button>
        <p class="gallery-lightbox-caption"></p>
      </div>
    `;
    document.body.appendChild(lightbox);

    const imgEl = lightbox.querySelector(".gallery-lightbox-image");
    const captionEl = lightbox.querySelector(".gallery-lightbox-caption");
    const btnClose = lightbox.querySelector(".gallery-lightbox-close");
    const btnPrev = lightbox.querySelector(".gallery-lightbox-prev");
    const btnNext = lightbox.querySelector(".gallery-lightbox-next");

    let activeGroup = [];
    let activeIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    const update = () => {
      if (!activeGroup.length) return;
      const item = activeGroup[activeIndex];
      imgEl.src = item.getAttribute("href") || "";
      imgEl.alt = item.getAttribute("data-gallery-alt") || item.querySelector("img")?.alt || "Gallery image";
      captionEl.textContent = `${activeIndex + 1} / ${activeGroup.length}`;
    };

    const animateSwap = (direction) => {
      const outClass = direction === "next" ? "slide-out-next" : "slide-out-prev";
      const inClass = direction === "next" ? "slide-in-next" : "slide-in-prev";
      imgEl.classList.add("is-transitioning", outClass);
      window.setTimeout(() => {
        imgEl.classList.remove(outClass);
        update();
        imgEl.classList.add(inClass);
        window.setTimeout(() => {
          imgEl.classList.remove(inClass, "is-transitioning");
        }, 220);
      }, 180);
    };

    const open = (group, index) => {
      activeGroup = group;
      activeIndex = index;
      update();
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    };

    const close = () => {
      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    };

    const next = () => {
      if (!activeGroup.length) return;
      activeIndex = (activeIndex + 1) % activeGroup.length;
      animateSwap("next");
    };

    const prev = () => {
      if (!activeGroup.length) return;
      activeIndex = (activeIndex - 1 + activeGroup.length) % activeGroup.length;
      animateSwap("prev");
    };

    galleryLinks.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        const groupName = link.getAttribute("data-gallery-group") || "default";
        const group = groups[groupName] || [];
        const index = group.indexOf(link);
        open(group, index >= 0 ? index : 0);
      });
    });

    btnClose.addEventListener("click", close);
    btnPrev.addEventListener("click", prev);
    btnNext.addEventListener("click", next);
    lightbox.addEventListener("click", (event) => {
      const clickedImage = event.target.closest(".gallery-lightbox-image");
      const clickedControl = event.target.closest(
        ".gallery-lightbox-prev, .gallery-lightbox-next, .gallery-lightbox-close"
      );
      if (!clickedImage && !clickedControl) close();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("is-open")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    });

    // Mobile swipe navigation for lightbox images.
    lightbox.addEventListener(
      "touchstart",
      (event) => {
        const t = event.changedTouches?.[0];
        if (!t) return;
        touchStartX = t.clientX;
        touchStartY = t.clientY;
      },
      { passive: true }
    );

    lightbox.addEventListener(
      "touchend",
      (event) => {
        if (!lightbox.classList.contains("is-open")) return;
        const t = event.changedTouches?.[0];
        if (!t) return;
        const dx = t.clientX - touchStartX;
        const dy = t.clientY - touchStartY;

        // Only treat mostly-horizontal gestures as slide navigation.
        if (Math.abs(dx) < 45 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
        if (dx < 0) next();
        else prev();
      },
      { passive: true }
    );
  }
})();

