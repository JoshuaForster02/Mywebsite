## Repo snapshot

- Type: Static, single-page/site collection (HTML + CSS, no server code).
- Purpose: Personal portfolio for Bewerbungen (German) with pages: `index.html`, `about.html`, `projects.html`, `research.html`, `contact.html`.
- Hosting target: GitHub Pages (branch `main`, root folder). See `README.md` for deploy notes.

## Big picture & architecture notes for an AI coder

- This is a purely static site. There is no JS framework, server, or build toolchain. Edits are file-based: update HTML/CSS and add assets under `images/`.
- The site uses progressive enhancement and responsive imagery via `<picture>` and `srcset` (examples in `index.html` and `projects.html`). If you add or regenerate images, update these tags accordingly.
- Contact form is a third-party integration (Formspree). The action URL is located in `contact.html` and currently set to `https://formspree.io/f/xqeajnve`.
- Styling is centralized in `style.css`. Prefer small, non-breaking CSS edits and preserve the monochrome variable palette (CSS variables near the top of the file).

## Important files to inspect before making edits (examples)

- `index.html` — hero, CTAs and `picture` usage for `images/hero.*`.
- `projects.html` — project cards and screenshot example (`images/medicus-1.*`).
- `contact.html` — contact form (action points to Formspree). Keep `id="contact-form"` for anchor links.
- `style.css` — global styles, color variables, accessibility helpers (focus-visible, reduced-motion, print rules).
- `README.md` — deployment and image guidance; use as source of truth for image naming conventions.
- `images/` — store hero, project screenshots, and generated WebP/@2x variants here. File naming: lowercase, hyphens, no spaces.

## Project-specific conventions & patterns

- Images: prefer WebP + JPEG fallbacks and provide @2x variants for HiDPI. Naming convention used in the HTML:
  - `images/hero.jpg`, `images/hero.webp`, `images/hero@2x.jpg`, `images/hero-2x.webp`
  - For projects: `images/medicus-1.jpg` etc.
- Accessibility: provide descriptive `alt` attributes for all images (example: `alt="Stimmungsbild: Berglandschaft"`).
- CV handling: Do not add a public CV PDF download. The site intentionally uses a CV-on-request flow: the CTA links to `contact.html#contact-form` and the form includes a checkbox `request_cv` to request the CV by email. Keep this behavior unless asked to change.
- No JS-heavy interactions — small inline scripts (smooth scroll to form) are acceptable; avoid adding large front-end frameworks.

## Developer workflows (what an AI agent should do / how to test)

- Quick local test (static server):
  - Run: `python3 -m http.server 8000` from repo root and open `http://localhost:8000` in a browser.
- Image processing: repository includes a helper script at `scripts/generate_images.py` (Pillow) to produce WebP and @2x variants from JPG/PNG. If you modify that script, run it in the repo virtualenv.
- Python virtualenv: the workspace has a configured venv under `.venv/`; use the environment Python when running `scripts/` tools.
- Formspree: to test the contact flow, submit the form via the UI — Formspree will send to the configured recipient or show a confirmation. The agent cannot validate private mailbox delivery; ask the repo owner to confirm the test.

## Integration points and external dependencies

- Formspree (`contact.html`) — changing the endpoint changes where messages are sent.
- Google Fonts (Inter) is loaded via link tags in each HTML head. Avoid removing the font link unless you change typography globally.
- Hosting: GitHub Pages — use branch `main` and root directory.

## Editing guidance and examples (concise)

- When adding an image asset:
  1. Put file in `images/` with lowercase hyphenated name.
  2. Generate WebP and @2x variants (`scripts/generate_images.py` or use external tooling).
  3. Update the `<picture>` tag in page HTML; prefer WebP source first, then an `<img>` fallback with `srcset="... 1x, ... 2x"`.

- When editing `style.css`:
  - Keep CSS variables intact (they define the monochrome look). Small tweaks to spacing/typography are fine. Big visual restyles should be discussed first.

- When editing `contact.html`:
  - Preserve the `id="contact-form"`, hidden `_subject` input (if present), and the `request_cv` checkbox. These are relied on by the UX for recruiter workflow.

## Image sizing & compression (practical)

- Recommended sizes (examples):
  - Hero / mood image: 1200×1200 (square) or 1200×800 (landscape). Generate an @1x JPEG/WebP and an @2x version for HiDPI.
  - Project screenshots: 1200×675 (16:9) or 900×600. Produce @1x and @2x.
- Quality targets:
  - WebP: quality 80–85 (good balance of size and fidelity).
  - JPEG fallback: quality 80–90.
- Filenames & srcset examples (what HTML should look like):
  - Picture tag with WebP first:
    ```html
    <picture>
      <source srcset="images/hero.webp 1x, images/hero-2x.webp 2x" type="image/webp">
      <img src="images/hero.jpg" srcset="images/hero.jpg 1x, images/hero@2x.jpg 2x" alt="Stimmungsbild" loading="eager" decoding="async">
    </picture>
    ```
- Use the provided script `scripts/generate_images.py` to auto-generate `*.webp`, `*-2x.webp`, and `*@2x.jpg` variants from existing JPG/PNG files. Run it from the repo root inside the virtualenv:
  ```bash
  # from repo root
  ./.venv/bin/python scripts/generate_images.py
  ```
- If an original uploaded image fails to open, the script will preserve it as `images/<name>.jpg.corrupt` and create a neutral placeholder. Keep backups of originals before bulk processing.

## What NOT to do (explicit)

- Do not add server-side code or rely on server runtimes — this repo is static and intended for GitHub Pages.
- Do not add a public downloadable CV file to the repo without confirming the owner's intent (privacy concern).

## If you need more info / common tasks

- To add a new project card: edit `projects.html`, add an `<article class="project">` block consistent with existing ones; include a `picture` tag and descriptive alt text.
- To add a new page: create a `.html` file using the same header/footer pattern as the other pages and link it from the nav in `header`.

---
If anything here is unclear or you want a stricter rule (for example, exact image sizes or compression settings), tell me which area to expand and I'll refine this file.
