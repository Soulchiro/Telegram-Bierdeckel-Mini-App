# 🍺 Beer Tally — Telegram Mini App

A tiny, funny Irish-pub-themed Telegram Mini App that counts how many beers
you've had this year. Tap a beer type (Lager / Ale / Dark / IPA), get a happy
little animation + "cheers" toast, watch the chalkboard total climb, and see
whether today happens to be a holiday.

**Stack:** React + Vite (frontend) · Supabase (Postgres backend) · Telegram
Mini Apps SDK (`telegram-web-app.js`) · [Nager.Date](https://date.nager.at)
free public holiday API.

---

## 1. Project structure

```
beer-tally/
├── index.html              ← loads Telegram WebApp SDK + fonts
├── vite.config.js
├── package.json
├── .env.example             ← copy to .env
├── supabase/schema.sql       ← run once in Supabase SQL Editor
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── style.css              ← the pub theme
    ├── supabaseClient.js
    ├── telegram.js            ← Telegram WebApp helpers
    ├── data/beerHolidays.js   ← curated fun drink holidays
    └── components/
        ├── BeerButton.jsx
        ├── CheersToast.jsx
        └── HolidayWidget.jsx
```

## 2. Set up Supabase (backend)

1. Create a free project at [supabase.com](https://supabase.com).
2. In the Supabase Dashboard, open **SQL Editor** → paste the contents of
   `supabase/schema.sql` → run it. This creates the `beer_log` table.
3. Go to **Project Settings → API** and copy your **Project URL** and
   **anon public key**.
4. In this project, copy `.env.example` to `.env` and fill both values in,
   plus optionally `VITE_HOLIDAY_COUNTRY` (a 2-letter country code, default
   `IE` for Ireland).

> ⚠️ **Honest security note:** this app reads the Telegram user id straight
> from the Mini App's `initDataUnsafe` on the client and doesn't verify it
> against your bot token. That's totally fine for a personal tally you share
> with a few mates, but it means the Supabase `anon` key can write rows under
> any `user_id`. `supabase/schema.sql` has notes on how to harden this with a
> Supabase Edge Function if you ever want it locked down properly.

## 3. Run it locally

```bash
npm install
npm run dev
```

This starts Vite's dev server (confirming Vite is indeed the build tool —
check `vite.config.js` and the `dev`/`build` scripts in `package.json`).
Open the printed `http://localhost:5173` URL in a normal browser to sanity
check the UI — outside Telegram it just falls back to a "Guest" user.

## 4. Create your Telegram bot + Mini App

1. Message [@BotFather](https://t.me/BotFather) → `/newbot` → follow the
   prompts → you'll get a bot token (keep it secret, not used by this
   frontend at all).
2. `/newapp` (or **Bot Settings → Menu Button → Configure Menu Button** on an
   existing bot) → attach a **Web App URL**. This URL must be **HTTPS**, so
   you first need to deploy the built app somewhere public (step 5).
3. Once set, tapping your bot's menu button (or a `t.me/<bot>?startapp=...`
   link) opens this app inside Telegram.

## 5. Build & deploy

```bash
npm run build   # outputs static files to dist/
```

Deploy the `dist/` folder to any static HTTPS host — e.g. Vercel, Netlify,
Cloudflare Pages, or GitHub Pages. Point BotFather's Web App URL at that
deployed address. Remember to set the same `VITE_SUPABASE_URL` /
`VITE_SUPABASE_ANON_KEY` / `VITE_HOLIDAY_COUNTRY` as environment variables in
your hosting provider's build settings (not just your local `.env`).

## 6. Optional: "which pub am I at" achievement

Type a pub name once in the small field under the beer grid — it tags every
beer you log from then on, until you clear it or type a different one.
There's no remembered list to manage or clean up; it just quietly counts how
many *distinct* names you've ever typed this year, and shows your current
title (from `src/data/pubMilestones.js`) as a small badge next to the beer
grid — e.g. "🗺️ Crawler". Edit thresholds/names in that file; keep labels
short, they're a badge, not a headline.

**To turn it off completely:** set `VITE_ENABLE_PUBS=false` in your `.env` (or
your hosting provider's environment variables) and redeploy. The UI
disappears entirely — no code changes needed.

**If your Supabase project is already live** (schema.sql already run once),
just add the missing column with:

```sql
alter table public.beer_log add column if not exists pub_name text;
```

## 7. Yearly rank

Cross a total-beers threshold and you get a little rank badge under the
greeting (e.g. "🏅 Irish Leprechaun"), plus a celebratory toast the moment you
hit it. Thresholds and names live in `src/data/beerGrades.js` — short array,
easy to edit, first entry in the file is the lowest tier.

## 9. Sharing your stats

The share icon (bottom-left, mirrors the reset button on the right) shares
your yearly total, per-type breakdown, and rank (if you've got one) as a
plain text message with a link back to the bot — no generated image. An
earlier version tried bundling a picture + caption + link into one message,
but that combo isn't reliably deliverable as a single share across targets
(Telegram's own share dialog included), so this sticks to text, which
Telegram and most share sheets handle natively and well.

- **Inside real Telegram:** opens Telegram's own share dialog directly
  (`t.me/share/url`), letting you pick a chat — the link gets its own bot
  preview, with the stats riding along as the message text.
- **Testing outside Telegram** (a plain browser): falls back to the native
  `navigator.share` with the same text + link.
- **If neither is available:** copies the full message (stats + link) to
  your clipboard so you can paste it manually.

Set `VITE_BOT_SHARE_URL` in `.env` to your bot's Mini App link — already
filled in as `https://t.me/bierdeckels_bot`. Leave it blank and sharing still
works, just without a link back to the app (and the UI will nudge you to set
it).

## 10. Customize

- **Donation link:** edit the `href` in `src/App.jsx`
  (`<a className="coffee-link" ...>`) — it's the small link at the very
  bottom of the app, currently a direct T-Bank donation link.
- **Holiday country:** change `VITE_HOLIDAY_COUNTRY` in `.env` to your
  country's 2-letter code ([full list](https://date.nager.at/Country)).
- **Curated fun holidays:** add more entries to `src/data/funHolidays.js`
  (checked before falling back to the filtered Wikipedia pick).
- **Colors/fonts:** all design tokens live at the top of `src/style.css`.

Sláinte! 🍀
