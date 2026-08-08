(function () {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const mainNav = document.getElementById("main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  if (mainNav) {
    window.addEventListener(
      "scroll",
      () => mainNav.classList.toggle("scrolled", window.scrollY > 8),
      { passive: true }
    );
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  document.querySelectorAll(".experience-item").forEach((item) => {
    const trigger = item.querySelector(".experience-trigger");
    const panel = item.querySelector(".experience-panel");
    if (!trigger || !panel) return;

    trigger.addEventListener("click", () => {
      const isOpen = trigger.getAttribute("aria-expanded") === "true";

      document.querySelectorAll(".experience-trigger").forEach((otherTrigger) => {
        otherTrigger.setAttribute("aria-expanded", "false");
      });
      document.querySelectorAll(".experience-panel").forEach((otherPanel) => {
        otherPanel.hidden = true;
      });

      if (!isOpen) {
        trigger.setAttribute("aria-expanded", "true");
        panel.hidden = false;
      }
    });
  });

  const canvas = document.getElementById("doodle-canvas");
  const clearBtn = document.getElementById("doodle-clear");
  if (!canvas || !clearBtn) return;

  const ctx = canvas.getContext("2d");
  let drawing = false;
  let lastX = 0;
  let lastY = 0;

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * window.devicePixelRatio);
    canvas.height = Math.floor(rect.height * window.devicePixelRatio);
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 2.5;
  }

  function getPoint(event) {
    const rect = canvas.getBoundingClientRect();
    if (event.touches && event.touches[0]) {
      return {
        x: event.touches[0].clientX - rect.left,
        y: event.touches[0].clientY - rect.top,
      };
    }
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function startDraw(event) {
    drawing = true;
    const point = getPoint(event);
    lastX = point.x;
    lastY = point.y;
    event.preventDefault();
  }

  function draw(event) {
    if (!drawing) return;
    const point = getPoint(event);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastX = point.x;
    lastY = point.y;
    event.preventDefault();
  }

  function stopDraw() {
    drawing = false;
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", stopDraw);
  canvas.addEventListener("mouseleave", stopDraw);
  canvas.addEventListener("touchstart", startDraw, { passive: false });
  canvas.addEventListener("touchmove", draw, { passive: false });
  canvas.addEventListener("touchend", stopDraw);
  clearBtn.addEventListener("click", clearCanvas);
})();
