# Gulu City Barbershop — website

A single-page, dependency-free site: plain HTML + CSS + vanilla JS.
Open `index.html`, or serve the folder:

```bash
cd gulu-city-barbershop
python3 -m http.server 8080     # then visit http://localhost:8080
```

## Files

| File | What it is |
|---|---|
| `index.html` | Structure, all copy, SEO meta, JSON-LD, inline SVG icon set |
| `style.css` | Design system (tokens at the top), layout, motion, responsive |
| `script.js` | **All business data lives here**, plus every interaction |
| `logo.png` | Your crest (also used as favicon and the header/footer mark) |
| `img/*.jpg` | Four gallery photos — replace with real shop pictures |

## The one place to change prices

`script.js` → the `SERVICES` array near the top. That array is the **single source
of truth**: the price cards, the category counts, *and* the booking dropdown are all
generated from it, so a price can never disagree between two parts of the site again.

```js
{ id: "haircut", name: "Haircut", desc: "Clean and stylish cut…",
  price: 7000, mins: 30, icon: "i-cut", cat: "cut" },
```

- `price: 7000` → prints as `UGX 7,000`; use `price: null` for "Ask price"
- `cat` must be one of `cut | colour | style | care` (the filter chips)
- `icon` must be an id in the SVG sprite at the top of `index.html` (`i-cut`, `i-beard`,
  `i-kid`, `i-dye`, `i-brush`, `i-curl`, `i-drop`, `i-flask`, `i-sparkle`, `i-ruler`,
  `i-comb`, `i-chair`, `i-clock`, `i-shield`, `i-star`)

Also update `Business → hasOfferCatalog` in the JSON-LD block of `index.html` so Google
sees the same numbers.

### Other quick edits (all in `script.js`, `BUSINESS` object)

```js
phoneDisplay / phoneRaw / whatsapp : "256774550630"
email, address, maps
tz: "Africa/Kampala"   open: 7.5   close: 21.5   // 7:30 AM – 9:30 PM
```

`open`/`close` are decimal hours and drive the **live “Open now / Closed” pill**, the
`Closes 9:30 PM` message, the highlighted row in the hours table, and the time-field
limits in the booking form. `REVIEWS`, `WHY`, `NAIL` and the gallery captions are the
other arrays you may want to edit.

## What it does

- **Live open/closed status** calculated in `Africa/Kampala` for any visitor, anywhere
  (green “Open now”, amber “Closing soon” inside the last hour, red “Closed” with the
  next opening time). Refreshes every 60 s.
- **Filter chips + live search** over the 10 services; tapping a card pre-selects that
  service in the booking form and scrolls you there.
- **Booking → WhatsApp**: validates name/phone/service/date/time (rejects past dates and
  times outside 7:30–21:30), shows a live preview of the message, then opens
  `wa.me/256774550630` with it pre-typed.
- **Reviews carousel** with dots, arrows, swipe, keyboard arrows and pause-on-hover.
- **Scroll reveal** on every section, animated stat counters, sticky glass header with
  scroll-spy underlining the current section, and a gold progress bar at the very top.
- **Pointer-follow light** on the hero, 3D tilt + gold spotlight on service cards.
- Mobile: full-screen menu drawer, floating WhatsApp bubble, back-to-top.
- Respects `prefers-reduced-motion`, has a skip link, `aria` labels, focus rings, and a
  `<noscript>` price list so the shop still reads correctly with JavaScript off.

## Design notes

- Type pairing: **Cinzel** (display serif — echoes the gold lettering in your logo),
  **Bebas Neue** (eyebrows, labels, the “BARBERSHOP” line), **Manrope** (body).
  Loaded from Google Fonts with local fallbacks (Georgia / Impact / system-ui), so the
  layout still holds if the webfonts fail to load.
- Palette comes from the crest: black `#08080a`, gold `#d4af37`, ribbon red `#b3121f`,
  cream `#f7f2e6`. All in `:root` at the top of `style.css`.
- The barber-pole stripe is used as a motif: the animated rule at the top of the shop
  card, the dividers, and the drawer.
- Section rhythm is one system: eyebrow → `h2` → lead, always centred; cards are
  left-aligned text with the price on the baseline at the bottom, so numbers line up in
  every grid.

## Deploying

Any static host works — GitHub Pages, Netlify, Cloudflare Pages, Vercel, or your
cPanel/hosting `public_html`. Upload the whole folder and open `index.html`; no build
step. Then:

1. Put your real domain in the `<link rel="canonical">` tag (currently a placeholder).
2. Claim the **Google Business Profile** for Labwor Street — the JSON-LD
   (`BarberShop` schema with `openingHoursSpecification` and the price list) helps it match.
3. Replace the four `img/*.jpg` files with real photos (same filenames = nothing else to
   change), and shoot them landscape/portrait so the 2×2 mosaic stays balanced.

## Testing

`../.testenv/test.js` runs the real `script.js` against the real `index.html` (34
assertions: rendering, search, filters, card→form wiring, validation, the exact WhatsApp
payload, status pill, carousel, drawer). `../.testenv/shot.js` renders it in headless
Chrome at 10 widths and fails on console errors or horizontal overflow.

```bash
cd ../.testenv && npm i jsdom puppeteer && node test.js && node shot.js
```
