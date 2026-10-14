# us.

One thing a day, for the two of us. A private little app: each person can add one note or one photo per day, it keeps all of it forever, and every month gets a recap.

## What it does

- **Today** shows your slot and theirs. Write a note or add a photo (with an optional caption). Once you've posted, that's your one thing for the day. You can take it back the same day if you change your mind; after that, history is permanent.
- **Archive** lets you page through every month and jump to any month that has entries.
- **Recap** for any month: days with something, days you both showed up, longest streak, who posted what, every photo as a grid, every note in order. In the first week of a new month, Today shows a card linking to last month's recap.
- Installable on a phone home screen (iPhone: Share → Add to Home Screen). Works in light and dark mode.
- Days follow each person's own timezone, so "today" is right wherever you each are.

## Deploy on Vercel (about 10 minutes)

1. Push this folder to a **private** GitHub repo and import it in Vercel (Add New → Project).
2. In the Vercel project, open **Storage** and create:
   - a **Neon** Postgres database (this sets `DATABASE_URL` for you), and
   - a **Blob** store (this sets `BLOB_READ_WRITE_TOKEN` for you).
   Connect both to the project. The table is created automatically on first use.
3. In **Settings → Environment Variables** add:
   - `APP_PASSCODE` — the passcode you'll both type once.
   - `NAMES` — the two names, comma separated, e.g. `Brandon,Priya`. The first name is person "a", the second is person "b".
4. Redeploy. Open the URL on each phone, pick your name, type the passcode, and add it to your home screen.

Vercel's "Deployment Protection" is not needed; the passcode screen is the lock. The URL itself can stay unlisted.

## Run locally

```bash
npm install
cp .env.example .env.local   # set APP_PASSCODE and NAMES
npm run dev
```

Without `DATABASE_URL`, entries and photos are kept in a local `.data/` folder so you can try it without any accounts.

## Notes

- Photos are resized on the phone before upload (max 1800px, JPEG), so they stay small and quick.
- Photos on Vercel Blob are served from unguessable URLs. The app itself is behind the passcode.
- Both people share one passcode on purpose; it's a two-person app. Change it by updating `APP_PASSCODE` (both of you will need to sign in again).
- `SESSION_SECRET` is optional. If unset, sessions are derived from the passcode.
