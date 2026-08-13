# Charis Missionary Church

Official website for Charis Missionary Church (Pretoria, South Africa) — a family of believers dedicated to spreading the Gospel, strengthening lives, and transforming communities through God's grace.

Live site: https://charismissionary.org

## Overview

A static, mobile-friendly website built with plain HTML, CSS, and JavaScript. No build step, no framework, no dependencies to install — just open the pages or serve the folder with any static file server.

## Pages

| Page | Description |
| --- | --- |
| `index.html` | Home page |
| `pages/Live.html` | Live stream |
| `pages/events.html` | Upcoming events |
| `pages/Our Journey.html` | Church history and journey |
| `pages/Youth.html` | Youth ministry |
| `pages/prayer-ministry.html` | Prayer ministry |
| `pages/Contact Us.html` | Contact information |
| `pages/online-giving.html` | Online giving / tithes & offerings |
| `pages/Partnership.html` | Partnership program |
| `pages/Prayer request.html` | Submit a prayer request |
| `pages/counselling.html` | Counselling services |
| `pages/Service Time.html` | Service schedules |
| `pages/our-mission.html` | Mission, vision and values |
| `pages/leadership.html` | Church leadership |
| `pages/apostle.html` | Apostle profile |
| `pages/digital-library.html` | Digital library of resources |
| `pages/Game.html` | Interactive game |
| `pages/admin.html` | Admin (not indexed by search engines) |

## Project structure

```
.
├── assets/
│   ├── css/style.css   # Global styles
│   └── js/main.js      # Global scripts
├── components/          # Reusable HTML snippets (header, footer, forms, etc.)
├── images/              # Page images
├── pages/               # All pages except the home page
├── index.html           # Home page (site entry point)
└── README.md
```

## Run locally

Option A — any static file server, e.g. Python:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

Option B — VS Code Live Server extension, or just double-click `index.html`.

## Deployment

This is a static site, so it can be hosted on any static host. The SEO files are already in place:

- `robots.txt` — blocks indexing of `pages/admin.html`, points to the sitemap
- `sitemap.xml` — lists all public pages for search engines

## Editing

- Most pages live in `pages/` and are self-contained HTML files. They share components in `components/` (header, footer, forms) — if you change a component, update each page that embeds it.
- Pages in `pages/` link to assets with a `../` prefix (e.g. `../assets/css/style.css`) and to each other by file name (e.g. `events.html`). The shared header/footer use `{{asset}}` and `{{page}}` template placeholders set via `data-asset` / `data-page` on the include element:
  - `index.html`: `data-asset="" data-page="pages/"`
  - pages in `pages/`: `data-asset="../" data-page=""`
- Add a new page by copying an existing one, updating the `<title>` and meta description, and adding it to `sitemap.xml` and the navigation.
- Image assets live in `images/` (referenced as `../images/...` from pages).
