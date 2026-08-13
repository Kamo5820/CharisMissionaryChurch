# Charis Missionary Church

Official website for Charis Missionary Church (Pretoria, South Africa) — a family of believers dedicated to spreading the Gospel, strengthening lives, and transforming communities through God's grace.

Live site: https://charismissionary.org

## Overview

A static, mobile-friendly website built with plain HTML, CSS, and JavaScript. No build step, no framework, no dependencies to install — just open the pages or serve the folder with any static file server.

## Pages

| Page | Description |
| --- | --- |
| `index.html` | Home page |
| `Live.html` | Live stream |
| `events.html` | Upcoming events |
| `Our Journey.html` | Church history and journey |
| `Youth.html` | Youth ministry |
| `prayer-ministry.html` | Prayer ministry |
| `Contact Us.html` | Contact information |
| `online-giving.html` | Online giving / tithes & offerings |
| `Partnership.html` | Partnership program |
| `Prayer request.html` | Submit a prayer request |
| `counselling.html` | Counselling services |
| `Service Time.html` | Service schedules |
| `our-mission.html` | Mission, vision and values |
| `leadership.html` | Church leadership |
| `apostle.html` | Apostle profile |
| `digital-library.html` | Digital library of resources |
| `Game.html` | Interactive game |
| `admin.html` | Admin (not indexed by search engines) |

## Project structure

```
.
├── assets/
│   ├── css/style.css   # Global styles
│   └── js/main.js      # Global scripts
├── components/          # Reusable HTML snippets (header, footer, forms, etc.)
├── images/              # Page images
├── index.html           # Home page
└── *.html               # Individual pages (see table above)
```

## Run locally

Option A — any static file server, e.g. Python:

```bash
python3 -m http.server 8000
```

Then open http://localhost:8000

Option B — VS Code Live Server extension, or just double-click `index.html`.

## Deployment

This is a static site, so it can be hosted on any static host (GitHub Pages, Netlify, Vercel, or a traditional web host). The production domain is `charismissionary.org` and SEO files are already in place:

- `robots.txt` — blocks indexing of `admin.html`, points to the sitemap
- `sitemap.xml` — lists all public pages for search engines

## Editing

- Most pages are self-contained HTML files. Some share components in `components/` (header, footer, forms) — if you change a component, update each page that embeds it.
- Add a new page by copying an existing one, updating the `<title>` and meta description, and adding it to `sitemap.xml` and the navigation.
- Image assets are served relative to the project root (e.g. `logo.jpg`).
