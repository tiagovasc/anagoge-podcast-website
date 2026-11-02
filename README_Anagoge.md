# Basics

The public Anagoge Podcast website: a Next.js app listing every published episode with its video, description and chapter timestamps. Originally generated in v0 and hosted on Vercel, now fully self-owned and deployed on Railway at `anagogepodcast.com`.

# Table of Contents

- [Basics](#basics)
- [Maintenance](#maintenance)
- [What Belongs Here](#what-belongs-here)
- [How This Folder Works](#how-this-folder-works)
  - [The stack](#the-stack)
  - [Where episode data lives](#where-episode-data-lives)
  - [How episodes are loaded](#how-episodes-are-loaded)
  - [Hosting and deploy chain](#hosting-and-deploy-chain)
  - [Domain and DNS](#domain-and-dns)
- [How to Add or Edit](#how-to-add-or-edit)
  - [Adding a new episode](#adding-a-new-episode)
  - [Changing the site itself](#changing-the-site-itself)
- [Changelog](#changelog)
- [Reminders](#reminders)
- [Learnings](#learnings)
- [MISC](#misc)

# Maintenance

Keep this README current whenever the folder changes meaningfully: a new episode field, a change to the deploy chain, a DNS change, or a new script.

Folder-specific rule: **this folder is a standalone git repo and is NOT part of the workspace repo.** If you change how it is deployed or where it is deployed to, update this README, `ROUTER.md`, and the Bat Launcher entry for `deploy-anagoge-site.bat` in the same session.

# What Belongs Here

**Belongs here:** the website's source code, its episode JSON data, its images, and the deploy script.

**Does not belong here:**

- Episode production material (transcripts, prep, audio, marketing) goes in `Anagoge Podcast/`, not here. This folder is only the public website.
- Guest data and the tracker live in `Anagoge Podcast/Podcast Database/`.
- Anything large or binary. This folder is pushed to a public-facing host, so every file added here ships to the internet.

**Related folders:**

- `Anagoge Podcast/` - all podcast production, including the blog transcripts the site descriptions are drawn from.
- `Code and Scripts/Railway Gemini Test/` - the earlier reference implementation for GitHub Pages plus Railway hosting. Separate project, not connected to this one.
- `Virtual Assistant/` - the other standalone nested repo in the workspace, and the pattern this folder follows.

# How This Folder Works

## The stack

Next.js 14.2.35 (App Router) with React 19, TypeScript, Tailwind, and a large shadcn/ui component set in `components/ui/` (57 files, mostly unused, inherited from the v0 scaffold). 55 runtime dependencies.

Since 2026-11-02 the site is statically generated: every page, including one per episode at `/episode/N`, is prerendered at build time with the episode data baked into the HTML. Moving between episodes happens in the browser without a page load and updates the URL. There are no API routes, no server actions, no middleware, and no environment variables. `next.config.mjs` sets `images.unoptimized: true`, `typescript.ignoreBuildErrors: true`, cache headers for images and icons, and basic security headers.

The video player is a lightweight thumbnail (`components/youtube-embed.tsx`); YouTube's own player (about 1 to 2 MB) loads only when a visitor presses play or picks a chapter. Embeds use `youtube-nocookie.com`.

## Where episode data lives

Each episode is a flat JSON file at `public/episodes/epN.json`, numbered chronologically from `ep1.json` (oldest) upward. Fields:

| Field | Notes |
|---|---|
| `title` | Episode title without the guest name |
| `side_title` | Guest name, shown under the title |
| `youtube_id` | The 11-character video ID, drives the embed |
| `description` | Prose abstract, taken from the published YouTube description |
| `timestamps` | Newline-separated chapter list |
| `apple_link` | Per-episode Apple Podcasts deep link |
| `spotify_link` | Per-episode Spotify episode link |
| `youtube_link` | Full watch URL |
| `google_link` | Legacy, empty on recent episodes |
| `medium_link` | The `tiagovf.com/posts/...` blog post. Added from ep15 onward |

## How episodes are loaded

`lib/episodes.ts` reads every `public/episodes/epN.json` file at build time, sorts them newest first, and passes them to the page. The browser makes no episode requests. The displayed episode number is the file number `N`.

Consequences: a new or edited episode appears only after a rebuild (Railway rebuilds on every push, so the normal deploy covers this), and a numbering gap no longer truncates the site but is still wrong, so `npm test` fails on it.

Before 2026-11-02, `components/home.tsx` fetched `ep1.json`, `ep2.json` and so on one at a time in the browser and stopped after 3 consecutive 404s; that took about 8 seconds before anything showed.

## Hosting and deploy chain

```
Projects/Anagoge Podcast Website/   (standalone git repo, its own .git)
        |
        |  deploy-anagoge-site.bat  ->  git push
        v
github.com/tiagovasc/anagoge-podcast-website   (public)
        |
        |  Railway auto-deploys on push to main
        v
Railway service "anagoge-podcast-website"  ->  anagogepodcast.com
```

Railway builds with Nixpacks, runs `npm run build` then `npm run start`, and injects `PORT=8080`. `railway.json` pins the build and start commands and sets restart-on-failure.

## Domain and DNS

Registrar and DNS: **Namecheap**, using Namecheap BasicDNS. Four records:

| Type | Host | Value |
|---|---|---|
| ALIAS | `@` | `g4y85x9s.up.railway.app` |
| CNAME | `www` | `v3sxkogc.up.railway.app` |
| TXT | `_railway-verify` | Railway apex verification token |
| TXT | `_railway-verify.www` | Railway www verification token |

The apex needs ALIAS rather than CNAME, because a raw CNAME is not valid at a zone apex. The domain previously used Vercel's nameservers; those are gone, and both domains have been detached from the Vercel project.

# How to Add or Edit

## Adding a new episode

1. Find the next free number, `epN.json`, in `public/episodes/`.
2. Take the `description` and `timestamps` from the **published YouTube description**, not from workspace draft files. Drafts have been wrong before (see Learnings).
3. Get `apple_link` from the iTunes lookup API: `https://itunes.apple.com/lookup?id=1512482918&entity=podcastEpisode&limit=60`, which returns every episode with its `trackViewUrl`.
4. Get `spotify_link` from the show page, `open.spotify.com/show/4ifa95kknLrUQblYTUMQ7T`, using "Load more episodes".
5. Get `medium_link` from the blog URL in the YouTube description.
6. Validate before deploying: run `npm test`. It checks that numbers are contiguous, no `youtube_id` is duplicated, required fields are filled, `youtube_link` matches `youtube_id`, and every chapter list parses.
7. Run `deploy-anagoge-site.bat`.

Only full interview episodes belong on the site. Clips and Tiago's own lectures and conference talks are excluded.

## Changing the site itself

Edit, run `npm test`, then run `deploy-anagoge-site.bat`. Set `RUN_BUILD=1` at the top of the bat to build locally before pushing, which is worth doing for any code change as opposed to a data-only change.

# Changelog

- **2026-11-02, transfer archive cleanup** - After verifying the successful latest-episode deployment, removed only the two user-named transfer archives `Projects/anagoge_src_snapshot.tgz` and `Projects/anagoge_mvp_changes_20261102.tgz`. Historical snapshot references below describe the staging state; use the preserved Git commits for source rollback now. Unused scaffold/dependency removal is pending exact approval.

- **2026-11-02, verified episode corrections** - Corrected ep8's copied Michael Strevens description to Juensung Kim's published description; restored ep5's complete Azim Shariff description; corrected ep6's guest to Jonathan Pageau. Verified all three against each video's published `attributedDescription` in YouTube page metadata. Only the affected description/name fields changed. The older defect list below records the pre-fix state. Scaffold/package cleanup remains pending an exact deletion approval after automatic review rejected broad inferred cleanup.

- **2026-11-02, player alignment** - All episode headings share a CSS grid sizing region calculated from every title/guest at the current viewport width. This keeps the player at the same document position across short/long titles without truncation or fixed-height assumptions. Invisible sizing copies are hidden from accessibility tools; the visible heading remains the only H1. Reserved scrollbar space prevents sideways movement, scroll anchoring is disabled for the episode content, and episode navigation returns to the top immediately rather than animating through a changing layout.

- **2026-11-02, latest episode** - Added `public/episodes/ep31.json`: Selfhood and Psychedelic Phenomenology with Jason K. Day. Description and 15 chapters copied from the published YouTube feed (`sdZjDP7D5hI`); Apple episode `1000793841894` verified via iTunes lookup, Spotify episode `0BriXcdN2FwlVrqKzyHwjf` verified on the official show page. YouTube chapters are 73 seconds later than audio chapters after the opening and are used because the website embeds YouTube. Blog link comes from the published YouTube description. Existing episode files preserved.

- **2026-11-02, repository visibility** - At the user's request, changed this repository from private to public after reviewing tracked files and history and scanning 141 historical blobs, 148 current files and text files inside the original export ZIP for credentials; no findings. Only the standalone website repository was exposed. GitHub confirmed `visibility: public`.

- **2026-11-02, production publication** - User authorized committing and deploying the staged MVP-to-production pass described below. Fresh `npm test`: 5/5 passed; fresh production build: all 34 static pages generated, including 30 episode pages. Deployment proceeds through the existing GitHub-to-Railway chain. The earlier "not yet deployed" entry records the staging state.

- **2026-11-02, MVP-to-production pass (not yet deployed)** - Applied `Prompts/prompt_app_mvp_to_production.md` (all four sections, UI/UX at polish depth). Speed: episodes are baked into static HTML instead of 33 sequential fetches, YouTube player loads on demand, unused font declarations removed, logo served as a 14 KB WebP. On a throttled phone the first episode title appears in about 0.3 s instead of 7.7 s, and the page transfers about 270 KB instead of about 3 MB. Features: a shareable URL per episode (`/episode/N`) with its own link preview, back/forward support, arrow-key navigation, accent-insensitive search in the episode list, a share/copy-link button, chapters that jump the embedded player to that time. Fixes: the oldest episode's "Next" wrapped around to the newest; nine episodes showed a stray "- " before every chapter; the list could not be closed with Escape or by clicking outside; the missing `/card.png` link-preview image now exists; the web manifest had no name or icons. "Previous/Next" are relabelled "Newer/Older". Added `npm test`. Rollback: the pre-change Git commit is `8f3ed27`, and a source snapshot is at `Projects/anagoge_src_snapshot.tgz`.

- **2026-11-02, approved revision** - Replaced the first favicon with the user-approved dark rounded logo tile, using the high-resolution intro logo source and a warm-white cave opening. Master PNG and matching ICO are preserved in `Anagoge Podcast/28 VISUALS logo intro/assets/logo/`. Layout cache version is `20261102-approved`; revert this revision's Git commit to restore the previous favicon.

- **2026-11-02** - Added `public/favicon.ico`, derived from the existing podcast logo badge, with 16–256 px sizes. The layout uses a dated favicon URL to refresh browser caches. This resolves the missing favicon noted below; the separate `/card.png` preview issue remains.

- **2026-09-07** - Added episode 30 for Jussi Jylkkä and documented the repository's operating, deployment, and maintenance procedures in this README.
- **2026-08-11** - Migrated off v0/Vercel. Stripped v0 remnants, added a real `package-lock.json` and `.npmrc`, added `railway.json`, created the GitHub repo, and deployed to Railway.
- **2026-08-11** - First deploy shipped with every image 404ing, because the workspace `.gitignore` blanket-ignores image files. Re-architected from a `git subtree` push to a standalone nested repo so the workspace's media rules can no longer govern the site's assets.
- **2026-08-11** - Added ep23 to ep29 (Patitsas, Heidi Campbell, Danny Forde, Hüseyin Beyköylü, Allister Lee, Kiverstein, Vervaeke), taking the site to 29 episodes.
- **2026-08-11** - Moved DNS from Vercel nameservers to Namecheap BasicDNS and pointed `anagogepodcast.com` at Railway. Detached both domains from the Vercel project.

# Reminders

- **Everything in this folder ships to the public internet.** No secrets, no large binaries, no private notes.
- **`.npmrc` with `legacy-peer-deps=true` is load-bearing.** React 19 against Next 14.2.35 is a hard peer conflict and a plain `npm install` fails outright. Deleting that file breaks the Railway build.
- **Do not delete `.git` from this folder.** It is the standalone repo, not a stray.
- **Never add this folder back to the workspace repo.** It is deliberately listed under "Nested repos" in the workspace `.gitignore`.
- **Episode numbering must stay contiguous.** A gap no longer truncates the site, but `npm test` fails on it and the displayed episode numbers would be wrong.
- **Episode data is read at build time.** Editing a JSON file changes the live site only after a rebuild and deploy.
- **A green Railway deploy does not mean the site works.** Verify a real asset URL, not just that the page loads.

# Learnings

- **2026-11-02 - Drive the real build with a keyboard, not only clicks.** Two modal bugs passed visual review and only showed in a scripted keyboard test: "Clear search" removed the focused button so typing went nowhere, and Enter in the search box reopened the list because focus returned to the opener mid-keypress. Fixed by refocusing the input and calling `preventDefault` on Enter.
- **2026-08-11 - FIXED. Workspace-wide ignore rules silently stripped the site's images.** The workspace `.gitignore` ignores `*.png`, `*.jpg`, `*.svg` and `*.ico` as "workspace media". Under the old `git subtree` deploy, the site's 19 `public/` images were never tracked and the live site rendered with every image broken while every other check passed. Fixed by making this folder a standalone repo with its own `.gitignore`. The deploy bat now also has an asset guard that counts ignored files under `public/` and aborts rather than shipping a broken site.
- **2026-08-11 - Workspace draft files are not authoritative for published metadata.** `03 EPISODE prep guests/GUEST Julian Kiverstein/julian_kiverstein_youtube_description.md` lists a video ID that was never published, and carries a description paragraph that did not make it into the live video. Always pull `youtube_id`, `description` and `timestamps` from the published video.
- **2026-08-11 - Railway does not adopt the target port you type into the domain dialog.** Railway injects `PORT=8080` and Next binds to it. Setting the generated domain's target port to 3000 gives a 502 while Railway still reports "Deployment successful" and the service shows Online.
- **2026-08-11 - Identify the origin by response headers during any host migration.** The Vercel deploy and the Railway deploy render identically, so a page loading proves nothing about which host served it. `server:`, `x-vercel-id:` and `x-vercel-cache:` settle it. Also test from a network other than the one that made the DNS change, since the local resolver caches the old IP.

# MISC

**Known cosmetic defects, not yet fixed:**

- `public/episodes/full_list.json` is fabricated v0 placeholder data listing Stephen Wolfram, Karl Friston, David Chalmers and Francisco Varela as guests. Nothing references it, but it is publicly fetchable. Should be deleted.
- ~~`app/layout.tsx` references `/card.png` as the Open Graph image, which does not exist.~~ Fixed 2026-11-02: `public/card.png` (1200x630) now exists, and each episode page uses its YouTube thumbnail as its preview.
- **Episode data errors, found 2026-11-02, not yet fixed** (take corrections from the published YouTube descriptions): `ep8.json` (Juensung Kim) carries Michael Strevens' description, copied from `ep10.json`; `ep5.json` (Azim Shariff) description is cut off at "cultural evolutio"; `ep6.json` spells the guest "Jonathan Pageuau" while its own description says "Pageau".
- `public/apple-icon.png` is the old v0 logo, not Anagoge's. It is not linked anywhere; `public/apple-touch-icon.png` is the real touch icon.
- `anagoge-podcast.zip` (1.9 MB) is the original v0 export retained locally in the folder root. It is ignored and was removed from Git tracking during the 2026-09-07 housekeeping pass.
- `components/ui/` holds 57 shadcn components, of which the site uses a handful. Harmless, since unused ones are tree-shaken out of the bundle.

**Useful IDs:**

- Apple Podcasts show ID: `1512482918`
- Spotify show ID: `4ifa95kknLrUQblYTUMQ7T`
- YouTube channel ID: `UCH4eOgbF9-O_HSFx-oBOySw` (its RSS feed at `youtube.com/feeds/videos.xml?channel_id=...` is the fastest authoritative source for recent video IDs and publish dates)
