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
| `images/work/*.svg` | Drawn fallbacks for the sample projects. The sample covers and galleries are theme-matched photos hotlinked from Unsplash; each falls back to its SVG if the link fails. Replace both with real screenshots |
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

## Adding screenshots and a video to a real project (Moranai)

1. Put the files in the repo, e.g. `images/work/moranai-1.jpg`, `images/work/moranai-2.jpg`, `videos/moranai.mp4` (mp4 or webm, muted playback, keep it under ~10 MB).
2. In `js/data.js`, set the project's `cover` to the best screenshot and fill `images`:

```js
cover: 'images/work/moranai-1.jpg',
images: [
  { type: 'video', src: 'videos/moranai.mp4', poster: 'images/work/moranai-1.jpg' },
  { src: 'images/work/moranai-2.jpg', alt: 'Home page' },
  { src: 'images/work/moranai-3.jpg', alt: 'Services page' },
],
```

3. Fill in `tech`, `year` and `description`, then commit and push.

A project can also have a `video: { src, poster }` field. When it is set, the case page replaces the static laptop frame with a 3D laptop that lifts, turns and opens as the visitor scrolls, playing the video on its screen (muted, only while on screen). The laptop is rendered in WebGL with Three.js (`js/laptop3d.js`, loaded on demand from the CDN), modelled on the 13" MacBook Air M4 (real proportions in centimetres, notch, full keyboard, ports) with aluminium materials, studio reflections, a soft shadow and mouse parallax. Pick the colour with `laptop.finish` in `js/data.js` (silver, starlight, skyblue, midnight, spacegrey). The lid carries no logo on purpose (Apple's trademark); on browsers without WebGL, or when opened from a `file://` URL, a simpler CSS laptop takes its place automatically. Keep recordings short and compressed (a few MB): they are served straight from the repo.

Two Moran screenshots are listed but commented out in `js/data.js` because they show customer names, a phone number and admin email addresses. Blur those details, then remove the `//` to publish them.

## Images

- The hero figure is set by `profile.heroImage` in `js/data.js`. It must be a PNG cut-out with a transparent background (remove.bg does this in one click). `images/tito-hero.png` is a stock placeholder with a solid black background, so the setting is empty and the hero stays plain grey until you point it at your own cut-out.
- `images/profile.jpeg` is used for the about page photo, the avatar in the contact call-to-action and the contact page.

## Fonts

The original uses Neue Montreal (commercial). This build uses Inter from Google Fonts. If you buy Neue Montreal, add the `@font-face` rules to `css/main.css` and put `'Neue Montreal'` first in the `--font` variable.

## URLs

The public URLs have no `.html`: `/`, `/work`, `/about`, `/contact` and `/work/<slug>` for case pages. `.htaccess` rewrites them to the files (and redirects any old `.html` link to the clean form); `serve.json` does the same for local `npx serve`. Every page has `<base href="/">`, so the site must live at the root of the domain (not in a subfolder). Hosts without rewrite support, such as GitHub Pages, would only serve the `.html` URLs.

## Deploying (titodevsec.online on Hostinger)

The site is static: copy the files into `public_html` and it works.

1. In the file manager, delete everything currently in `public_html` (old site).
2. Upload the zip built by the PowerShell command in the notes (everything except `_old-site/`, `.claude/`, `.git/`, `admin/`), extract it in `public_html`, delete the zip.
3. `index.html`, `.htaccess`, `css/`, `js/`, `images/` must sit directly in `public_html`.
4. Make sure SSL is issued for the domain; `.htaccess` redirects to HTTPS.

Hostinger runs LiteSpeed, which honours `.htaccess`. On a plain Nginx server the equivalent is:

```nginx
root /var/www/titodevsec.online;
index index.html;
error_page 404 /404.html;
location = /work { try_files /work.html =404; }
location = /about { try_files /about.html =404; }
location = /contact { try_files /contact.html =404; }
location ~ ^/work/([A-Za-z0-9_-]+)/?$ { rewrite ^ /work-detail.html?p=$1 last; }
location ~* \.(png|jpe?g|webp|svg|mp4|webm)$ { expires 30d; }
location ~* \.(css|js)$ { expires 1h; }
gzip on; gzip_types text/css application/javascript image/svg+xml;
```

Issue an SSL certificate for the domain (Let's Encrypt in the panel) before going live: the fonts, GSAP, Lenis, Barba and Three.js all load over HTTPS and browsers block them on an HTTP page.

## Next step: admin

The contact form posts to `SITE.api + '/contact'` when `SITE.api` is set in `js/data.js`; with no API it falls back to opening your email client. The project/data shape in `js/data.js` is the shape the admin API should return.
