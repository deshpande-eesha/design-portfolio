/**
 * Case-study sidebar: auto-builds index from section headings, highlights on scroll.
 */
(function () {
  const indexAside = document.querySelector("[data-case-index]");
  if (!indexAside) return;

  let nav = indexAside.querySelector("nav");
  if (!nav) {
    nav = document.createElement("nav");
    nav.setAttribute("aria-label", "On this page");
    indexAside.appendChild(nav);
  }

  indexAside.querySelector(".case-index-label")?.remove();

  const scope =
    document.querySelector(".case-main") ||
    document.querySelector(".procore-panel") ||
    document.querySelector(".case-content-panel");

  if (!scope) return;

  const seen = new Set();
  const items = [];

  function addItem(id, label) {
    if (!id || seen.has(id)) return;
    seen.add(id);
    items.push({ id, label });
  }

  const nodes = [
    ...scope.querySelectorAll(".case-section[id]"),
    ...scope.querySelectorAll("h2.section-heading[id]"),
  ].sort((a, b) => {
    if (a === b) return 0;
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });

  nodes.forEach((node) => {
    if (node.classList.contains("case-section")) {
      if (node.hasAttribute("data-skip-index")) return;
      const heading = node.querySelector("h2, h3, .section-heading");
      if (heading) {
        addItem(node.id, heading.getAttribute("data-index") || heading.textContent.trim());
      }
    } else {
      if (node.hasAttribute("data-skip-index") || node.closest("[data-skip-index]")) return;
      addItem(node.id, node.getAttribute("data-index") || node.textContent.trim());
    }
  });

  if (!items.length) {
    indexAside.hidden = true;
    return;
  }

  indexAside.hidden = false;
  nav.innerHTML = "";
  const links = items
    .map(({ id, label }) => {
      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = label;
      nav.appendChild(a);
      const el = document.getElementById(id);
      return el ? { link: a, el } : null;
    })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(({ link }) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(visible.target.id);
    },
    { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.25, 0.5, 1] }
  );

  links.forEach(({ el, link }) => {
    observer.observe(el);
    link.addEventListener("click", (e) => {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(el.id);
    });
  });

  setActive(items[0].id);
})();
