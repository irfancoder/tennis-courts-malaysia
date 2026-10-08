import { layers, namedFlavor } from "@protomaps/basemaps";
import { ACCESS, ACCESS_GROUP_COLOR, type AccessType } from "@tennis/schema";
import type { FeatureCollection } from "geojson";
import type { GeoJSONSource, Map as MLMap } from "maplibre-gl";
import * as maplibregl from "maplibre-gl";
import maplibreCss from "maplibre-gl/dist/maplibre-gl.css?url";
import maplibreWorker from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import { Protocol } from "pmtiles";
import { useEffect, useRef } from "preact/hooks";
import type { Filters, Result } from "./query";

type Props = {
  results: Result[];
  tilesBase: string;
  near: Filters["near"];
  className: string;
};

let protocolAdded = false;

function ensureMapCss() {
  if (document.querySelector(`link[href="${maplibreCss}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = maplibreCss;
  document.head.append(link);
}

// Peninsular Malaysia + Borneo.
const MALAYSIA_BOUNDS: [[number, number], [number, number]] = [
  [99.6, 0.85],
  [119.3, 7.4],
];

function toGeoJson(results: Result[]): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: results.map((r) => {
      const info = ACCESS[r.access_type as AccessType];
      return {
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.lng, r.lat] },
        properties: {
          name: r.name,
          url: r.url,
          access: info.label,
          color: ACCESS_GROUP_COLOR[info.group],
        },
      };
    }),
  };
}

export default function CourtMap({ results, tilesBase, near, className }: Props) {
  const container = useRef<HTMLElement>(null);
  const map = useRef<MLMap | null>(null);

  useEffect(() => {
    if (!container.current) return;
    ensureMapCss();
    if (!protocolAdded) {
      // MapLibre finds its worker relative to its own script, which bundling breaks.
      maplibregl.setWorkerUrl(new URL(maplibreWorker, location.href).href);
      maplibregl.addProtocol("pmtiles", new Protocol().tile);
      protocolAdded = true;
    }
    // MapLibre requires absolute URLs for sprites, glyphs and tiles.
    const base = new URL(tilesBase, location.href).href.replace(/\/$/, "");
    const assets = `${base}/basemaps-assets`;
    const m = new maplibregl.Map({
      container: container.current,
      bounds: MALAYSIA_BOUNDS,
      attributionControl: { compact: true },
      style: {
        version: 8,
        glyphs: `${assets}/fonts/{fontstack}/{range}.pbf`,
        sprite: `${assets}/sprites/v4/light`,
        sources: {
          protomaps: {
            type: "vector",
            url: `pmtiles://${base}/tiles/malaysia.pmtiles`,
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
          },
        },
        layers: layers("protomaps", namedFlavor("light"), { lang: "en" }),
      },
    });
    m.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    m.on("load", () => {
      m.addSource("courts", {
        type: "geojson",
        data: toGeoJson([]),
        cluster: true,
        clusterRadius: 40,
        clusterMaxZoom: 12,
      });
      m.addLayer({
        id: "clusters",
        type: "circle",
        source: "courts",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": "#2D5B45",
          "circle-radius": ["step", ["get", "point_count"], 16, 10, 22, 50, 28],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#FFFFFF",
        },
      });
      m.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "courts",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Noto Sans Medium"],
          "text-size": 13,
        },
        paint: { "text-color": "#FFFFFF" },
      });
      m.addLayer({
        id: "court",
        type: "circle",
        source: "courts",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": ["get", "color"],
          "circle-radius": 8,
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#FFFFFF",
        },
      });
      m.on("click", "clusters", async (e) => {
        const feature = e.features?.[0];
        if (feature?.geometry.type !== "Point") return;
        const zoom = await (m.getSource("courts") as GeoJSONSource).getClusterExpansionZoom(
          feature.properties.cluster_id,
        );
        m.easeTo({ center: feature.geometry.coordinates as [number, number], zoom });
      });
      m.on("click", "court", (e) => {
        const feature = e.features?.[0];
        if (feature?.geometry.type !== "Point") return;
        const el = document.createElement("div");
        const a = document.createElement("a");
        a.href = String(feature.properties.url);
        a.textContent = String(feature.properties.name);
        a.style.fontWeight = "700";
        const p = document.createElement("div");
        p.textContent = String(feature.properties.access);
        el.append(a, p);
        new maplibregl.Popup({ offset: 12 })
          .setLngLat(feature.geometry.coordinates as [number, number])
          .setDOMContent(el)
          .addTo(m);
      });
      for (const id of ["clusters", "court"]) {
        m.on("mouseenter", id, () => {
          m.getCanvas().style.cursor = "pointer";
        });
        m.on("mouseleave", id, () => {
          m.getCanvas().style.cursor = "";
        });
      }
      map.current = m;
    });
    return () => {
      map.current = null;
      m.remove();
    };
  }, [tilesBase]);

  useEffect(() => {
    const update = () => {
      const m = map.current;
      if (!m) return;
      (m.getSource("courts") as GeoJSONSource | undefined)?.setData(toGeoJson(results));
      if (results.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        for (const r of results) bounds.extend([r.lng, r.lat]);
        if (near) bounds.extend([near.lng, near.lat]);
        m.fitBounds(bounds, { padding: 48, maxZoom: 13, duration: 0 });
      }
    };
    if (map.current) update();
    else {
      const handle = setInterval(() => {
        if (map.current) {
          clearInterval(handle);
          update();
        }
      }, 100);
      return () => clearInterval(handle);
    }
  }, [results, near]);

  return <section ref={container} class={className} aria-label="Map of courts" />;
}
