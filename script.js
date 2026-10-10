/* =========================================================
   GULU CITY BARBERSHOP — interaction layer
   No dependencies. Everything degrades gracefully if JS
   is unavailable (the HTML already contains the content).
   ========================================================= */
(function () {
    "use strict";

    /* -------------------------------------------------
       1. BUSINESS CONFIG — single source of truth.
       Edit prices here and BOTH the price list and the
       booking dropdown update automatically.
       ------------------------------------------------- */
    var BUSINESS = {
        name: "Gulu City Barbershop",
        phoneDisplay: "+256 774 550 630",
        phoneRaw: "256774550630",
        whatsapp: "25774550630",
        email: "sammiegee884@gmail.com",
        address: "Labwor Street, Gulu City",
        addressLines: ["Next to Housing Finance Bank", "Opposite Abyssinia, near Lexus Vintage"],
        maps: "https://www.google.com/maps/search/?api=1&query=Labwor+Street+Gulu+City+Uganda",
        tz: "Africa/Kampala",
        open: 7.5,    /* 07:30 */
        close: 21.5   /* 21:30 — "7:30 AM – 9:30 PM", 7 days */
    };

    var CURRENCY = "UGX";

    /* id, name, description, price (null = ask at counter), minutes, icon, category */
    var SERVICES = [
        { id: "haircut",   name: "Haircut",                    desc: "Clean and stylish cut shaped to your head, finished with a sharp line.", price: 7000,  mins: 30, icon: "i-cut", cat: "cut" },
        { id: "beard",     name: "Beard Trim",                 desc: "Sharp beard trimming, edging and shaping with hot towel finish.",        price: 5000,  mins: 20, icon: "i-beard", cat: "cut" },
        { id: "kids",      name: "Kids Haircut",               desc: "Patient, quick and comfortable cuts for the little gentlemen.",          price: 5000,  mins: 25, icon: "i-kid", cat: "cut" },
        { id: "dye",       name: "Haircut + Dyeing",           desc: "Full haircut paired with professional, skin-safe colour.",               price: 15000, mins: 75, icon: "i-dye", cat: "colour" },
        { id: "tint",      name: "Haircut + Tinting",          desc: "Stylish cut with a soft, natural-looking tint on the tips.",             price: 22000, mins: 90, icon: "i-brush", cat: "colour" },
        { id: "curl",      name: "Haircut + Curl",             desc: "Fresh cut finished with defined, long-lasting curls.",                   price: 27000, mins: 105, icon: "i-curl", cat: "style" },
        { id: "facial",    name: "Face Scrubbing & Facial",    desc: "Refreshing facial treatment for clean, bright and healthy skin.",        price: 5000,  mins: 30, icon: "i-drop", cat: "care" },
        { id: "dyeonly",   name: "Hair Dyeing Only",           desc: "Even, full-coverage professional dyeing without a cut.",                price: 10000, mins: 50, icon: "i-flask", cat: "colour" },
        { id: "tintonly",  name: "Hair Tinting Only",          desc: "Subtle tint for a fresh, natural appearance.",                         price: 15000, mins: 55, icon: "i-sparkle", cat: "colour" },
        { id: "lining",    name: "Lining Only",                desc: "Crisp hairline and edging to keep the look sharp between cuts.",         price: 3000,  mins: 10, icon: "i-ruler", cat: "care" }
    ];

    var CATS = {
        all: "All services",
        cut: "Cuts & beard",
        colour: "Colour",
        style: "Styling",
        care: "Grooming & care",
        nails: "Nail parlour"
    };

    var NAIL = {
        simple: ["Manicure", "Pedicure", "Nail cleaning & shaping", "Nail polishing", "Gel polish"],
        full: ["Full manicure", "Full pedicure", "Gel manicure", "Gel pedicure", "Acrylic nails", "Nail extensions", "Nail art", "Nail repair"]
    };

    var REVIEWS = [
        { text: "Great haircut and very professional service. I will definitely come back!", who: "David", role: "Walk-in customer" },
        { text: "Clean place, friendly barbers and a fresh style every single time.", who: "Brian", role: "Regular at the shop" },
        { text: "One of the best barbershops in Gulu. Highly recommended!", who: "Michael", role: "Regular at the shop" },
        { cta: true, icon: "i-star", text: "Sat in the chair? Tell Gulu about it.", who: "Leave a review", role: "Add new quotes to the REVIEWS list in script.js" }
    ];

    var WHY = [
        { icon: "i-cut", title: "Professional barbers", text: "Trained, detail-obsessed barbers who measure twice and cut once — no guesswork, no ruined fades." },
        { icon: "i-shield", title: "Quality & hygiene", text: "Fresh blades, sanitised tools and a clean cape for every single client. Every time." },
        { icon: "i-chair", title: "Fresh styles", text: "Classic tapers, skin fades, curls, dye and tint — current looks that still suit you in six weeks." },
        { icon: "i-clock", title: "On your schedule", text: "Open seven days a week from 7:30 AM to 9:30 PM, with WhatsApp booking that actually holds your slot." }
    ];

    /* -------------------------------------------------
       2. HELPERS
       ------------------------------------------------- */
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function money(v) {
        return v === null ? "Ask price" : CURRENCY + " " + v.toLocaleString("en-UG");
    }
    function esc(str) {
        return String(str).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function fmtTime(h, m) {
        var suffix = h >= 12 ? "PM" : "AM";
        var hh = h % 12; if (hh === 0) hh = 12;
        return hh + ":" + pad(m) + " " + suffix;
    }

    /* -------------------------------------------------
       3. RENDER: services grid + nails
       ------------------------------------------------- */
    function renderServices() {
        var grid = $("#svc-grid");
        if (!grid) return;

        grid.innerHTML = SERVICES.map(function (s, i) {
            return '<article class="svc reveal" style="--d:' + (i % 4 * 0.06) + 's" data-cat="' + s.cat + '" data-id="' + s.id +
                '" data-name="' + esc(s.name) + '" tabindex="0" role="button" aria-label="Book ' + esc(s.name) + '">' +
                '<div class="svc-ico"><svg class="ic" aria-hidden="true"><use href="#' + s.icon + '"/></svg></div>' +
                "<h3>" + esc(s.name) + "</h3>" +
                "<p>" + esc(s.desc) + "</p>" +
                '<div class="svc-foot">' +
                '<span class="svc-price"><small>From</small>' + money(s.price) + "</span>" +
                '<span class="svc-time">' + s.mins + " min</span>" +
                "</div>" +
                '<span class="pick">Book →</span>' +
                "</article>";
        }).join("");

        var filters = $("#filters");
        if (filters) {
            var counts = { all: SERVICES.length + 2 };
            SERVICES.forEach(function (s) { counts[s.cat] = (counts[s.cat] || 0) + 1; });
            counts.nails = 2;
            filters.innerHTML = Object.keys(CATS).map(function (k, i) {
                return '<button class="chip" type="button" data-filter="' + k + '" aria-pressed="' + (i === 0) + '">' +
                    esc(CATS[k]) + '<span aria-hidden="true"> · ' + (counts[k] || 0) + "</span></button>";
            }).join("");
        }
    }

    function renderNails() {
        var wrap = $("#nail-cols");
        if (!wrap) return;
        wrap.innerHTML =
            '<div class="nail-col"><h4>Simple services</h4><ul>' +
            NAIL.simple.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") +
            "</ul></div>" +
            '<div class="nail-col"><h4>Full services</h4><ul>' +
            NAIL.full.map(function (n) { return "<li>" + esc(n) + "</li>"; }).join("") +
            "</ul></div>";
    }

    function renderWhy() {
        var grid = $("#why-grid");
        if (!grid) return;
        grid.innerHTML = WHY.map(function (w, i) {
            return '<div class="why-card reveal" style="--d:' + i * 0.07 + 's">' +
                '<span class="num" aria-hidden="true">0' + (i + 1) + "</span>" +
                '<div class="svc-ico"><svg class="ic" aria-hidden="true"><use href="#' + w.icon + '"/></svg></div>' +
                "<h3>" + esc(w.title) + "</h3><p>" + esc(w.text) + "</p></div>";
        }).join("");
    }

    /* -------------------------------------------------
       4. FILTER + SEARCH
       ------------------------------------------------- */
    function wireServicesSearch() {
        var grid = $("#svc-grid");
        if (!grid) return;
        var input = $("#svc-search");
        var clear = $("#svc-clear");
        var empty = $("#svc-empty");
        var currentFilter = "all";

        function apply() {
            var q = (input && input.value || "").trim().toLowerCase();
            if (input) input.closest(".search").classList.toggle("has-value", q.length > 0);
            var shown = 0;
            $$(".svc", grid).forEach(function (card) {
                var okCat = currentFilter === "all" ||
                    (currentFilter === "nails" ? false : card.dataset.cat === currentFilter);
                var okText = !q || card.textContent.toLowerCase().indexOf(q) > -1;
                var on = okCat && okText;
                card.classList.toggle("is-hidden", !on);
                if (on) shown++;
            });
            var nails = $("#nails");
            if (nails) nails.style.display = (currentFilter === "all" || currentFilter === "nails") && (!q || "nail manicure pedicure gel acrylic extensions art repair polish shaping".indexOf(q) > -1 || q === "") ? "" : "none";
            if (empty) empty.classList.toggle("is-on", shown === 0 && (currentFilter !== "all" || q !== ""));
        }

        $$("#filters .chip").forEach(function (btn) {
            btn.addEventListener("click", function () {
                $$("#filters .chip").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
                btn.setAttribute("aria-pressed", "true");
                currentFilter = btn.dataset.filter;
                apply();
            });
        });
        if (input) input.addEventListener("input", apply);
        if (clear) clear.addEventListener("click", function () {
            input.value = ""; input.focus(); apply();
        });
        grid.addEventListener("click", function (e) {
            var card = e.target.closest(".svc");
            if (card) pickService(card.dataset.id);
        });
        grid.addEventListener("keydown", function (e) {
            if (e.key !== "Enter" && e.key !== " ") return;
            var card = e.target.closest(".svc");
            if (card) { e.preventDefault(); pickService(card.dataset.id); }
        });
    }

    function pickService(id) {
        var sel = $("#service");
        if (!sel) return;
        sel.value = id;
        var name = (SERVICES.filter(function (x) { return x.id === id; })[0] || {}).name || "service";
        var sec = $("#book");
        if (sec && sec.scrollIntoView) {
            try { sec.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" }); } catch (err) { /* older engines */ }
        }
        window.setTimeout(function () {
            var f = $("#name");
            if (f && f.focus) { try { f.focus({ preventScroll: true }); } catch (err) { f.focus(); } }
        }, reduceMotion ? 0 : 700);
        toast("Selected: " + name + " — fill the form to confirm.");
    }

    /* -------------------------------------------------
       5. LIVE OPEN / CLOSED STATUS (Africa/Kampala)
       ------------------------------------------------- */
    function kampalaNow() {
        try {
            var parts = new Intl.DateTimeFormat("en-GB", {
                timeZone: BUSINESS.tz, hour12: false,
                weekday: "short", hour: "2-digit", minute: "2-digit"
            }).formatToParts(new Date());
            var get = function (t) { var p = parts.filter(function (x) { return x.type === t; })[0]; return p ? p.value : ""; };
            return {
                h: parseInt(get("hour"), 10) % 24,
                m: parseInt(get("minute"), 10),
                day: get("weekday")
            };
        } catch (e) {
            var d = new Date();
            return { h: d.getHours(), m: d.getMinutes(), day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()] };
        }
    }

    function renderStatus() {
        var els = $$("[data-status]");
        var cell = $("#status-cell");
        if (!els.length && !cell) return;
        var t = kampalaNow();
        var now = t.h + t.m / 60;
        var openTime = fmtTime(Math.floor(BUSINESS.open), (BUSINESS.open % 1) * 60);
        var closeTime = fmtTime(Math.floor(BUSINESS.close), (BUSINESS.close % 1) * 60);
        var openNow = now >= BUSINESS.open && now < BUSINESS.close;
        var closingSoon = openNow && (BUSINESS.close - now) * 60 <= 60;
        var state = openNow ? (closingSoon ? "closing" : "open") : "closed";
        var label, detail;

        if (state === "open") {
            label = "Open now";
            detail = "Closes " + closeTime + " EAT";
        } else if (state === "closing") {
            label = "Closing soon";
            var left = Math.max(1, Math.round((BUSINESS.close - now) * 60));
            detail = left + " min left · walk in now";
        } else {
            label = "Closed";
            detail = now < BUSINESS.open ? "Opens today " + openTime + " EAT" : "Opens tomorrow " + openTime + " EAT";
        }

        els.forEach(function (el) {
            el.setAttribute("data-state", state);
            el.innerHTML = '<span class="dot" aria-hidden="true"></span>' + label + " <small>· " + detail + "</small>";
        });

        if (cell) {
            cell.textContent = (openNow ? "Open" : "Closed") + " · " + openTime + " – " + closeTime;
            cell.style.color = openNow ? "#86efac" : "#fca5a5";
        }

        /* highlight today's row in the hours table */
        $$("#hours-table tr").forEach(function (tr) {
            tr.classList.toggle("is-today", tr.dataset.day === t.day);
        });
    }

    /* -------------------------------------------------
       6. REVIEWS CAROUSEL
       ------------------------------------------------- */
    function renderReviews() {
        var track = $("#car-track");
        if (!track) return;
        track.innerHTML = REVIEWS.map(function (r) {
            if (r.cta) {
                return '<figure class="slide"><div class="quote quote--cta">' +
                    '<span class="svc-ico"><svg class="ic ic--fill" aria-hidden="true"><use href="#' + (r.icon || "i-star") + '"/></svg></span>' +
                    "<blockquote>" + esc(r.text) + "</blockquote>" +
                    '<a class="btn btn--sm" href="https://www.google.com/maps/search/?api=1&query=Labwor+Street+Gulu+City+Uganda" target="_blank" rel="noopener">' + esc(r.who) + "</a>" +
                    '<p class="role" style="margin-top:14px">' + esc(r.role) + "</p></div></figure>";
            }
            return '<figure class="slide"><div class="quote">' +
                '<span class="stars" aria-label="Rated 5 out of 5">★★★★★</span>' +
                "<blockquote>“" + esc(r.text) + "”</blockquote>" +
                '<figcaption><span class="who">' + esc(r.who) + '</span><span class="role">' + esc(r.role) + "</span></figcaption>" +
                "</div></figure>";
        }).join("");

        var dots = $("#car-dots");
        if (dots) {
            dots.innerHTML = REVIEWS.map(function (_, i) {
                return '<button type="button" data-i="' + i + '" aria-label="Review ' + (i + 1) + '" aria-current="' + (i === 0) + '"></button>';
            }).join("");
        }

        var i = 0, timer = null;
        var total = REVIEWS.length;

        function go(n) {
            i = (n + total) % total;
            /* .slide is flex:0 0 100% of the track, and the track is exactly as wide as
               the visible box (items overflow it), so one step == 100% of the track */
            track.style.transform = "translateX(" + (-i * 100) + "%)";
            $$("#car-dots button").forEach(function (b, k) { b.setAttribute("aria-current", String(k === i)); });
        }
        function play() {
            if (reduceMotion || total < 2) return;
            stop();
            timer = window.setInterval(function () { go(i + 1); }, 6500);
        }
        function stop() { if (timer) { window.clearInterval(timer); timer = null; } }

        var prev = $("#car-prev"), next = $("#car-next"), car = $(".carousel");
        if (prev) prev.addEventListener("click", function () { go(i - 1); play(); });
        if (next) next.addEventListener("click", function () { go(i + 1); play(); });
        if (dots) dots.addEventListener("click", function (e) {
            var b = e.target.closest("button[data-i]");
            if (b) { go(parseInt(b.dataset.i, 10)); play(); }
        });
        if (car) {
            car.addEventListener("mouseenter", stop);
            car.addEventListener("mouseleave", play);
            car.addEventListener("focusin", stop);
            var x0 = null;
            car.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
            car.addEventListener("touchend", function (e) {
                if (x0 === null) return;
                var dx = e.changedTouches[0].clientX - x0;
                if (Math.abs(dx) > 45) go(i + (dx < 0 ? 1 : -1));
                x0 = null; play();
            });
            document.addEventListener("keydown", function (e) {
                if (!car.contains(document.activeElement)) return;
                if (e.key === "ArrowRight") go(i + 1);
                if (e.key === "ArrowLeft") go(i - 1);
            });
        }
        go(0); play();
    }

    /* -------------------------------------------------
       7. BOOKING FORM → WhatsApp
       ------------------------------------------------- */
    function buildForm() {
        var sel = $("#service");
        if (!sel) return;
        var keep = sel.value;
        sel.innerHTML = '<option value="">Choose a service…</option>' +
            '<optgroup label="Barbershop">' +
            SERVICES.map(function (s) {
                return '<option value="' + s.id + '">' + esc(s.name) + " — " + money(s.price) + "</option>";
            }).join("") +
            "</optgroup>" +
            '<optgroup label="Nail parlour">' +
            '<option value="nails-simple">Nails — Simple services (price at counter)</option>' +
            '<option value="nails-full">Nails — Full services (price at counter)</option>' +
            "</optgroup>";
        if (keep) sel.value = keep;

        var date = $("#date");
        if (date) {
            var d = new Date();
            var iso = d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
            date.min = iso;
            date.value = iso;
        }
        var time = $("#time");
        if (time) { time.min = "07:30"; time.max = "21:30"; }

        ["#name", "#phone", "#service", "#date", "#time", "#notes"].forEach(function (id) {
            var el = $(id);
            if (el) el.addEventListener("input", updatePreview);
            if (el) el.addEventListener("change", updatePreview);
        });

        var form = $("#book-form");
        if (form) form.addEventListener("submit", sendToWhatsApp);
        updatePreview();
    }

    function serviceNameFromSelect(v) {
        if (!v) return "";
        var s = SERVICES.filter(function (x)
