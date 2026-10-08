import * as stylex from "@stylexjs/stylex";
import {
  ACCESS,
  ACCESS_GROUP_COLOR,
  type AccessType,
  CHANNEL_LABEL,
  CHANNELS,
  PRICE_BAND_LABEL,
  PRICE_BANDS,
  REGIONS,
  SURFACE_LABEL,
  SURFACES,
} from "@tennis/schema";
import { lazy, Suspense } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { type Conn, connect, rows, type Stage } from "./duck";
import { s } from "./explore.styles";
import {
  buildQuery,
  DEFAULT_FILTERS,
  type Filters,
  filtersFromUrl,
  filtersToUrl,
  type Result,
} from "./query";

const CourtMap = lazy(() => import("./CourtMap"));

export type Place = { label: string; lat: number; lng: number };

type Props = {
  /** Where manifest.json and the parquet views live. */
  dataBase: string;
  /** Where the PMTiles basemap, fonts and sprites live. */
  tilesBase: string;
  places: Place[];
  /** Id of the server-rendered list to hide once live results are ready. */
  staticListId: string;
};

export default function Explore({ dataBase, tilesBase, places, staticListId }: Props) {
  // Rendered client-only, so the URL is available for the very first query.
  const [filters, setFilters] = useState<Filters>(() => filtersFromUrl(window.location.search));
  const [conn, setConn] = useState<Conn | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "map">("list");
  const [locating, setLocating] = useState(false);
  const [stage, setStage] = useState<Stage>("engine");
  const [attempt, setAttempt] = useState(0);

  // `attempt` is a dependency so "Try again" re-runs the load.
  useEffect(() => {
    let cancelled = false;
    connect(dataBase, (s) => !cancelled && setStage(s))
      .then((c) => !cancelled && setConn(c))
      .catch((e: unknown) => {
        if (cancelled) return;
        setError(
          `Live filters couldn't load: ${(e as Error).message}. The full list below still works.`,
        );
      });
    return () => {
      cancelled = true;
    };
  }, [dataBase, attempt]);

  function retry() {
    setError(null);
    setStage("engine");
    setAttempt((n) => n + 1);
  }

  useEffect(() => {
    if (!conn) return;
    const { sql, params } = buildQuery(filters);
    let cancelled = false;
    rows<Result>(conn, sql, params)
      .then((r) => {
        if (cancelled) return;
        setResults(r);
        document.getElementById(staticListId)?.setAttribute("hidden", "");
      })
      .catch((e: unknown) => setError((e as Error).message));
    history.replaceState(null, "", `${location.pathname}${filtersToUrl(filters)}`);
    return () => {
      cancelled = true;
    };
  }, [conn, filters, staticListId]);

  const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  function useMyLocation() {
    if (!navigator.geolocation)
      return setError("Your browser can't share its location. Pick a place instead.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        set("near", {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "your location",
        });
      },
      () => {
        setLocating(false);
        setError("Location access was blocked. Pick a place from the list instead.");
      },
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  }

  return (
    <div {...stylex.props(s.layout)}>
      <form
        {...stylex.props(s.filters)}
        onSubmit={(e) => e.preventDefault()}
        aria-label="Filter courts"
      >
        <label {...stylex.props(s.field)}>
          <span {...stylex.props(s.label)}>Search</span>
          <input
            type="search"
            value={filters.q}
            placeholder="Area, city or court name"
            onInput={(e) => set("q", e.currentTarget.value)}
            {...stylex.props(s.input)}
          />
        </label>
        <label {...stylex.props(s.check)}>
          <input
            type="checkbox"
            checked={filters.anyone}
            onChange={(e) => set("anyone", e.currentTarget.checked)}
            {...stylex.props(s.checkbox)}
          />
          <span>Only courts I can book without knowing anyone</span>
        </label>
        <div {...stylex.props(s.field)}>
          <span {...stylex.props(s.label)}>Sort by distance</span>
          <div {...stylex.props(s.near)}>
            <button
              type="button"
              onClick={useMyLocation}
              disabled={locating}
              {...stylex.props(s.smallButton)}
            >
              {locating ? "Finding you…" : "Near me"}
            </button>
            <select
              aria-label="Near a place"
              value={
                filters.near && filters.near.label !== "your location" ? filters.near.label : ""
              }
              onChange={(e) => {
                const p = places.find((x) => x.label === e.currentTarget.value);
                set("near", p ? { lat: p.lat, lng: p.lng, label: p.label } : null);
              }}
              {...stylex.props(s.input)}
            >
              <option value="">Near a place…</option>
              {places.map((p) => (
                <option value={p.label}>{p.label}</option>
              ))}
            </select>
          </div>
          {filters.near && (
            <button type="button" onClick={() => set("near", null)} {...stylex.props(s.linkButton)}>
              Stop sorting by distance from {filters.near.label}
            </button>
          )}
        </div>
        <Select
          label="Area"
          value={filters.region}
          onChange={(v) => set("region", v)}
          options={Object.entries(REGIONS)}
        />
        <label {...stylex.props(s.check)}>
          <input
            type="checkbox"
            checked={filters.covered}
            onChange={(e) => set("covered", e.currentTarget.checked)}
            {...stylex.props(s.checkbox)}
          />
          <span>Covered courts</span>
        </label>
        <label {...stylex.props(s.check)}>
          <input
            type="checkbox"
            checked={filters.lit}
            onChange={(e) => set("lit", e.currentTarget.checked)}
            {...stylex.props(s.checkbox)}
          />
          <span>Floodlit for night play</span>
        </label>
        <label {...stylex.props(s.check)}>
          <input
            type="checkbox"
            checked={filters.visitor}
            onChange={(e) => set("visitor", e.currentTarget.checked)}
            {...stylex.props(s.checkbox)}
          />
          <span>Confirmed bookable without local ID</span>
        </label>
        <Select
          label="Surface"
          value={filters.surface}
          onChange={(v) => set("surface", v)}
          options={SURFACES.map((x) => [x, SURFACE_LABEL[x]])}
        />
        <Select
          label="Price"
          value={filters.price}
          onChange={(v) => set("price", v)}
          options={PRICE_BANDS.map((x) => [x, PRICE_BAND_LABEL[x]])}
        />
        <Select
          label="How to book"
          value={filters.channel}
          onChange={(v) => set("channel", v)}
          options={CHANNELS.filter((c) => c !== "resident").map((x) => [x, CHANNEL_LABEL[x]])}
        />
        <button
          type="button"
          onClick={() => setFilters(DEFAULT_FILTERS)}
          {...stylex.props(s.linkButton)}
        >
          Reset filters
        </button>
      </form>

      <div>
        {error && (
          <div role="alert" {...stylex.props(s.error)}>
            <p>{error}</p>
            {!conn && (
              <button type="button" onClick={retry} {...stylex.props(s.smallButton)}>
                Try again
              </button>
            )}
          </div>
        )}
        {!results && !error && (
          <p {...stylex.props(s.status)} aria-live="polite">
            {stage === "engine"
              ? "Loading the search engine (about 7 MB on your first visit)…"
              : "Loading court data…"}
          </p>
        )}
        {results && (
          <>
            <div {...stylex.props(s.summary)}>
              <p {...stylex.props(s.count)} aria-live="polite">
                {results.length === 1 ? "1 court" : `${results.length} courts`}
              </p>
              <fieldset aria-label="View" {...stylex.props(s.tabs)}>
                <button
                  type="button"
                  aria-pressed={view === "list"}
                  onClick={() => setView("list")}
                  {...stylex.props(s.tab, view === "list" && s.tabActive)}
                >
                  List
                </button>
                <button
                  type="button"
                  aria-pressed={view === "map"}
                  onClick={() => setView("map")}
                  {...stylex.props(s.tab, view === "map" && s.tabActive)}
                >
                  Map
                </button>
              </fieldset>
            </div>
            {view === "map" ? (
              <Suspense fallback={<p {...stylex.props(s.status)}>Loading map…</p>}>
                <CourtMap
                  results={results}
                  tilesBase={tilesBase}
                  near={filters.near}
                  className={stylex.props(s.map).className ?? ""}
                />
              </Suspense>
            ) : results.length === 0 ? (
              <p {...stylex.props(s.status)}>
                No courts match these filters. Try turning off a filter, or{" "}
                <a href="/suggest/?kind=new">tell us about a court</a>.
              </p>
            ) : (
              <ul {...stylex.props(s.list)}>
                {results.map((r) => (
                  <ResultItem r={r} />
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ResultItem({ r }: { r: Result }) {
  const info = ACCESS[r.access_type as AccessType];
  const price = r.price_day ?? r.price_night;
  return (
    <li {...stylex.props(s.item)}>
      <a href={r.url} {...stylex.props(s.name)}>
        {r.name}
      </a>
      <span {...stylex.props(s.badge)}>
        <span
          {...stylex.props(s.dot)}
          style={{ backgroundColor: ACCESS_GROUP_COLOR[info.group] }}
          aria-hidden="true"
        />
        {info.label}
      </span>
      <span {...stylex.props(s.meta)}>
        <span>{r.city}</span>
        <span>{r.court_count === 1 ? "1 court" : `${r.court_count} courts`}</span>
        {r.has_covered && <span>Covered</span>}
        {r.has_lit && <span>Floodlit</span>}
        {price !== null && <span>{price === 0 ? "Free" : `From RM${price}/hr`}</span>}
        {r.distance_km !== null && (
          <span>
            {r.distance_km < 10 ? r.distance_km.toFixed(1) : Math.round(r.distance_km)} km away
          </span>
        )}
        {r.played_here && <span>Played here</span>}
      </span>
    </li>
  );
}

function Select(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <label {...stylex.props(s.field)}>
      <span {...stylex.props(s.label)}>{props.label}</span>
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.currentTarget.value)}
        {...stylex.props(s.input)}
      >
        <option value="">Any</option>
        {props.options.map(([value, label]) => (
          <option value={value}>{label}</option>
        ))}
      </select>
    </label>
  );
}
