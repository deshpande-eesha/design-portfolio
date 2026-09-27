#!/usr/bin/env python3
"""Generate project pages 02–06 from Google Sites content."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PROJECTS = ROOT / "projects"
CONTENT = Path(__file__).resolve().parent / "content"

FOOTER = """
  <footer class="site-footer">
    <div class="site-footer-inner">
      <p class="site-footer-brand">Eesha Explores</p>
      <nav class="site-footer-nav" aria-label="Footer">
        <a href="../index.html">Home</a>
        <a href="../about.html">About</a>
        <a href="../projects.html">Projects</a>
        <a href="../contact.html">Contact</a>
      </nav>
      <p class="site-footer-copy">© 2026 Eesha Deshpande · Pune, India</p>
    </div>
  </footer>"""


def meta_strip(items):
    cells = "".join(
        f'<div class="meta-item"><p class="meta-label">{k}</p><p class="meta-value">{v}</p></div>'
        for k, v in items
    )
    return f'<div class="meta-strip">{cells}</div>'


def img_block(label):
    return f'<div class="case-media-block placeholder"><span class="placeholder-label">{label}</span></div>'


def gallery_stack(prefix, count, video_at=None, video_id=None):
    parts = []
    for i in range(1, count + 1):
        if video_at == i and video_id:
            parts.append(
                f'<div class="case-video-embed"><iframe src="https://www.youtube.com/embed/{video_id}" title="Project video" allowfullscreen loading="lazy"></iframe></div>'
            )
        parts.append(img_block(f"{prefix}-{i:02d}.jpg"))
    return "\n".join(parts)


def render_case_page(title, hero_html, body_html, prev_link, next_link):
    hero_block = f"""
      <article class="case-hero-card">
{hero_html}
      </article>""" if hero_html.strip() else ""

    body = f"""    <div class="case-shell">
{hero_block}
      <div class="case-body-layout">
        <aside class="case-index" data-case-index aria-label="On this page"></aside>
        <div class="case-body-card">
          <div class="case-main">
{body_html}
            <nav class="project-footer-nav">
              <a href="{prev_link}">← Previous</a>
              <a href="{next_link}">Next →</a>
            </nav>
          </div>
        </div>
      </div>
    </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{title} — Eesha Deshpande</title>
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../css/styles.css">
</head>
<body class="site-page">
  <div class="grid-bg" aria-hidden="true"></div>
  <a class="skip-link" href="#main">Skip to main content</a>
  <div class="site-chrome-wrap">
    <div class="site-chrome" id="main-nav">
      <ul class="nav-links" id="site-nav" data-nav>
        <li><a href="../index.html">Home</a></li>
        <li><a href="../about.html">About</a></li>
        <li><a href="../projects.html" class="current">Projects</a></li>
        <li><a href="../contact.html">Contact</a></li>
      </ul>
      <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav">Menu</button>
    </div>
  </div>
  <main id="main" class="page-content case-page">
{body}
  </main>
{FOOTER}
  <script src="../js/main.js"></script>
  <script src="../js/project-nav.js"></script>
</body>
</html>
"""


# ── Project 02: Care Companion ──
ccp_hero = """        <p class="case-lead">Care Companion Program mobile app to track caregiver sessions for Government Healthcare Workers across India, Nepal, Bangladesh and Indonesia</p>
        <h2 class="case-hero-kicker">Care Companion Program's Mobile App</h2>
        <p class="case-hero-subtitle">Streamlines caregiver training in hospitals across India, Nepal, Bangladesh and Indonesia, enabling nurses, supervisors and implementation teams to manage, track and monitor caregiver sessions</p>
        """ + meta_strip([
    ("Role", "Product Designer"),
    ("Duration", "September '24 - March '25"),
    ("Tools", "Figma, Mira, Google Docs"),
    ("Collaborators", "from Product and Tech team"),
]) + """
        <p class="case-mission">Noora Health's mission is to - improve health outcomes by training family caregivers to support their loved ones, turning hospital spaces into classrooms</p>"""

ccp_sections = (CONTENT / "ccp_sections.html").read_text() + (CONTENT / "ccp_sections_part2.html").read_text()

(PROJECTS / "project-02-care-companion.html").write_text(
    render_case_page("Care Companion Program", ccp_hero, ccp_sections, "project-01-procore.html", "project-03-individual-development-plan.html")
)

# ── Project 03: IDP ──
idp_hero = """        <p class="case-lead">Personalized roadmap that helps individuals set goals and outline steps to improve their skills and achieve their career objectives</p>
        """ + meta_strip([
    ("Role", "Product Designer"),
    ("Duration", "4 months"),
    ("Tools", "Figma, Miro, Google Docs and Sheets"),
    ("Collaborators", "from Product and Tech team"),
])

idp_sections = (CONTENT / "idp_sections.html").read_text()

(PROJECTS / "project-03-individual-development-plan.html").write_text(
    render_case_page("Individual Development Plan", idp_hero, idp_sections, "project-02-care-companion.html", "project-05-fly-you-girl.html")
)

# Noora Design System lives at projects/noora-design-system.html and is authored
# by hand, not generated here — it is prose + selected figures, not an image stack.

# Fly You Girl and Empathi are authored by hand from the Google Sites copy
# (projects/project-05-fly-you-girl.html, projects/project-06-autism-support.html).

print("Generated projects 02, 03")
