# Tennis Courts Malaysia

Source for [tennis.irfanismail.com](https://tennis.irfanismail.com): every tennis court in Malaysia, and how to get on it. Planning docs are in [`docs/`](docs/).

## Layout

| Path | What it is |
| --- | --- |
| `apps/data` | Court data (`venues/<state>/<slug>.yaml`) and the pipeline: YAML → valibot validation → `dist/site/venues.json` (for page generation) + parquet views (for `/explore`) |
| `apps/site` | Astro static site styled with StyleX, plus a Cloudflare Worker that serves it and handles `/api/submit` |
| `packages/schema` | Valibot schemas, types and all user-facing labels (access types, surfaces…) shared by both apps and the Worker |

## Everyday commands

```sh
pnpm install
pnpm dev                                   # site at http://localhost:4321, rebuilds data as you edit
pnpm build                                 # validate data, build parquet + site
pnpm lint && pnpm typecheck && pnpm test
```

## Adding or updating a court

With `pnpm dev` running, saving a venue YAML (or a guide) rebuilds the data in about 30 ms and reloads the open page. Explore uses your local parquet in dev, not the published one. A typo prints the file and field in the terminal and the site keeps showing the last good data until you fix it.

1. Add or edit `apps/data/venues/<state>/<slug>.yaml`. The filename becomes the URL slug. Your editor autocompletes fields from `apps/data/schema/venue.schema.json` (regenerate with `pnpm --filter @tennis/data schema:json` after schema changes).
2. For the location, open the court in Google Maps, tap **Share**, and paste the link as `location.googleMaps`. The build reads the pin's coordinates and Place ID from it and caches them in `apps/data/geo-cache.json`. Commit that file with the venue. If a link can't be read, open the place in Google Maps and paste the full address-bar URL, or set `lat`/`lng` by hand, which always override the link.
3. Set `verified.date` and `verified.source` to when and how you checked it. Courts not checked for 12 months show a "needs re-checking" flag.
4. `pnpm build`. Validation errors name the file and field.
5. Commit and push to `main`. CI rebuilds, publishes the parquet views to R2 and deploys.

Know what's on site? Fill in `amenities`. Leave out anything you haven't checked; a `"no"` is shown to players. Add a `note` to show it as a tooltip:

```yaml
amenities:
  parking:
    value: both # free, paid, both or none
    note: Free at the field; paid in the mall basement.
  toilet: "yes"
  shower:
    value: "yes"
    note: Cold water only.
  surau: "no"
```

Played there yourself? Fill in `playedHere` (note, best time, last played).

## Corrections from players

Suggestions from `/suggest/` are stored in D1 and emailed to you.

```sh
pnpm --filter @tennis/data corrections              # list pending
pnpm --filter @tennis/data corrections applied 12   # after updating the YAML
pnpm --filter @tennis/data corrections rejected 12
```

## Photos

Put files in `apps/data/photos/<slug>/`, run `pnpm --filter @tennis/data photos:upload`, then list them in the venue YAML as `photos: [{ key: venues/<slug>/<file>, alt: "…", consent: true }]`. Only `consent: true` photos are shown. No identifiable people without their permission.

## Map tiles

The basemap (`tiles/malaysia.pmtiles`, ~226 MB) and its fonts/sprites live in the `tennis-data` R2 bucket. Refresh a couple of times a year with `pnpm --filter @tennis/data tiles` (needs the [`pmtiles` CLI](https://github.com/protomaps/go-pmtiles)).

## Cloudflare resources

| Resource | Name |
| --- | --- |
| Worker + static assets | `tennis-site` → tennis.irfanismail.com |
| R2 (data, tiles) | `tennis-data` → data.tennis.irfanismail.com |
| R2 (photos) | `tennis-media` → media.tennis.irfanismail.com |
| D1 | `tennis-submissions` |
| Turnstile | "tennis.irfanismail.com suggestions" (secret: `TURNSTILE_SECRET` Worker secret) |
| Email | Email Routing on irfanismail.com, sends from courts@irfanismail.com |

## One-time setup still to do by hand

- **GitHub:** create the repo, then add secrets `CLOUDFLARE_API_TOKEN` (permissions: Workers Scripts edit, Workers R2 Storage edit, D1 edit, Account read) and `CLOUDFLARE_ACCOUNT_ID`.
- **Web Analytics:** in the Cloudflare dashboard, add tennis.irfanismail.com under Web Analytics and set the beacon token as the GitHub Actions variable `PUBLIC_CF_BEACON_TOKEN`.
- **Umami analytics:** the website ID is in `Base.astro`, so tracking works with no setup. In Umami Cloud, turn on the share URL and set it as the GitHub Actions variable `PUBLIC_UMAMI_SHARE_URL` (it is linked from `/partners/`). Add goals for `booking_click` and `affiliate_click`.
- **Search Console:** verify tennis.irfanismail.com with a DNS TXT record in Cloudflare and submit `/sitemap-index.xml`. Import it into Bing Webmaster Tools.
- **Monetisation** (only once the PRD §9 thresholds hold): set the GitHub Actions variable `PUBLIC_MONETISATION=1`. This shows `stay` affiliate links and `featured` badges from the venue YAML and guide frontmatter, and makes `/partners/` indexable.
- **Image Transformations** (once there are photos): enable Transformations for irfanismail.com in the dashboard, then set the GitHub Actions variable `PUBLIC_IMAGE_TRANSFORMS=1`.
