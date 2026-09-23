# Titodevsec — portfolio

Static portfolio for Tito Oscar Mwaisengela, rebuilt in the style of dennissnellenberg.com.

## Stack

- Plain HTML + CSS, no build step.
- GSAP 3 + ScrollTrigger for every animation (magnetic buttons, reveals, marquee, curves).
- Lenis for smooth scrolling.
- Barba.js for the curved page-transition curtain (single-page-app style navigation).
- All libraries load from CDN (cdnjs / jsdelivr).

## Run it locally

Page transitions fetch the next page over HTTP, so open the site through a local server rather than by double-clicking `index.html`.
Opened from a `file://` URL the site still works, but links do normal page loads instead of the curtain transition.

```bash
npx serve .
```

or

```bash
python -m http.server 8080
```

Then open http://localhost:3000 (serve) or http://localhost:8080 (python).

`serve.json` turns off serve's "clean URLs" rewriting (which would redirect `work-detail.html?p=<slug>` to `/work-detail` and lose the slug), maps `/` to `index.html` explicitly, and maps the extension-less paths (`/work`, `/about`, …) back to their files so browsers that cached the old redirects still work. Restart `npx serve .` after changing it. Case links carry the slug in both the query and the hash for the same reason.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Home: hero with marquee, intro, recent work, contact call-to-action, footer |
| `work.html` | All projects with filters and list / grid view |
| `work-detail.html?p=<slug>` | Case page rendered from the project data |
| `about.html` | About, services, tech stack |
| `contact.html` | Contact form and details |
| `css/main.css` | All styles |
| `js/data.js` | **All content that changes**: profile, socials, projects, services, stack |
| `js/app.js` | Core: smooth scroll, preloader, transitions, header, menu, magnetic, reveals, preview modal |
| `js/pages.js` | Per-page logic (home, work, work-detail, about, contact) and start-up |
| `images/work/*.svg` | Placeholder project covers. Replace with real screenshots (any image format) |
| `admin/` | Old admin panel, untouched for now. Will be rebuilt against the new data model |
| `_old-site/` | The previous version of the site, kept for reference. Safe to delete |

## Editing content

Everything dynamic lives in `js/data.js`:

- `profile`: name, role lines, location, email, timezone, availability.
- `socials`: label + URL. Leave a URL empty to render the label without a link.
- `projects`: one object per project (`slug`, `title`, `category`, `services`, `tech`, `year`, `location`, `color`, `cover`, `images`, `description`, `live`, `github`). Order matters: the first four show on the home page and "next case" follows this order.
- `images` on a project is the case-page gallery, in order. Each item is `{ src, alt, caption }` for a picture or `{ type: 'video', src, poster }` for a muted looping video (`.mp4`/`.webm` files are detected automatically). The first item is full width, the next two sit side by side, then full width again, and so on. Leave the array empty to show only the cover.
- `services` and `stack`: the about page grids.

Page copy (headings, paragraphs) is in the HTML files.

## Images

- The hero figure is set by `profile.heroImage` in `js/data.js`. It must be a PNG cut-out with a transparent background (remove.bg does this in one click). `images/tito-hero.png` is a stock placeholder with a solid black background, so the setting is empty and the hero stays plain grey until you point it at your own cut-out.
- `images/profile.jpeg` is used for the about page photo, the avatar in the contact call-to-action and the contact page.

## Fonts

The original uses Neue Montreal (commercial). This build uses Inter from Google Fonts. If you buy Neue Montreal, add the `@font-face` rules to `css/main.css` and put `'Neue Montreal'` first in the `--font` variable.

## Next step: admin

The contact form posts to `SITE.api + '/contact'` when `SITE.api` is set in `js/data.js`; with no API it falls back to opening your email client. The project/data shape in `js/data.js` is the shape the admin API should return.
