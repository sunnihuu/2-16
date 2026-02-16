console.log("maps.js loaded ✅", !!window.mapboxgl);

window.addEventListener("load", () => {
  console.log("window loaded ✅", "mapboxgl:", !!window.mapboxgl);
});

/* =========================
   NYC Food System Observatory
   6 synced maps + active legend
   ========================= */

// 1) Token（建议你放到 config.js，不要公开）
mapboxgl.accessToken = "pk.eyJ1Ijoic3VubmlodSIsImEiOiJjbWxvcDgybjkwcXl5M2tva29ibG5tc2VmIn0.Irx4occMNtG5dMKorBjDJAE";

// 2) Map keys must match HTML: id="map-<key>" + data-mapkey="<key>"
const MAP_KEYS = [
  "supplyGap",
  "farmersMarkets",
  "emergencyFood",
  "freshZoning",
  "truckRoutes",
  "floodRisk",
];

const maps = new Map();

// 3) Data sources: match your real filenames exactly
const DATA_SOURCES = {
  supplyGap:      "/Users/sunni/Desktop/GitHub/2-16/data/nta_supply_gap_2024.geojson",
  // farmersMarkets: "./data/nyc_farmers_markets.geojson", // <- add later when you have it
  emergencyFood:  "/Users/sunni/Desktop/GitHub/2-16/data/cfc_food_sites.geojson",
  freshZoning:    "/Users/sunni/Desktop/GitHub/2-16/data/nyc-fresh-zoining.geojson",
  truckRoutes:    "/Users/sunni/Desktop/GitHub/2-16/data/nyc-truck-routes-2026.geojson",
  floodRisk:      "/Users/sunni/Desktop/GitHub/2-16/data/stormwater-flood.geojson",
};

// -------- helpers --------
function safeAddSource(map, id, spec) {
  if (map.getSource(id)) return;
  map.addSource(id, spec);
}
function safeAddLayer(map, layer) {
  if (map.getLayer(layer.id)) return;
  map.addLayer(layer);
}
function logMapError(key, e) {
  console.error(`[${key}] Map error:`, e?.error || e);
}

// -------- layer builders --------
function addLayersForKey(map, key) {
  if (key === "supplyGap") {
    safeAddSource(map, "supplyGap", { type: "geojson", data: DATA_SOURCES.supplyGap });

    // NOTE: field name might not be gap_rank in your file.
    // If your choropleth shows nothing, change "gap_rank" below to your actual property name.
    const FIELD = "gap_rank";

    safeAddLayer(map, {
      id: "supplyGap-fill",
      type: "fill",
      source: "supplyGap",
      paint: {
        "fill-color": [
          "interpolate",
          ["linear"],
          ["to-number", ["coalesce", ["get", FIELD], 0]],
          1, "#dbeafe",
          10, "#1d4ed8"
        ],
        "fill-opacity": 0.65
      }
    });

    safeAddLayer(map, {
      id: "supplyGap-outline",
      type: "line",
      source: "supplyGap",
      paint: { "line-color": "#1d4ed8", "line-width": 1 }
    });
  }

  if (key === "farmersMarkets") {
    // You currently do NOT have a farmers markets geojson in your data folder.
    // So we intentionally do nothing here to avoid errors.
    // When you have it, uncomment DATA_SOURCES.farmersMarkets and add:
    //
    // safeAddSource(map, "farmersMarkets", { type: "geojson", data: DATA_SOURCES.farmersMarkets });
    // safeAddLayer(map, {
    //   id: "farmersMarkets",
    //   type: "circle",
    //   source: "farmersMarkets",
    //   paint: {
    //     "circle-radius": 5,
    //     "circle-color": "#16a34a",
    //     "circle-opacity": 0.85,
    //     "circle-stroke-color": "#fff",
    //     "circle-stroke-width": 1
    //   }
    // });
  }

  if (key === "emergencyFood") {
    safeAddSource(map, "emergencyFood", { type: "geojson", data: DATA_SOURCES.emergencyFood });

    safeAddLayer(map, {
      id: "emergencyFood",
      type: "circle",
      source: "emergencyFood",
      paint: {
        "circle-radius": 5,
        "circle-color": "#dc2626",
        "circle-opacity": 0.75,
        "circle-stroke-color": "#fff",
        "circle-stroke-width": 1
      }
    });
  }

  if (key === "freshZoning") {
    safeAddSource(map, "freshZoning", { type: "geojson", data: DATA_SOURCES.freshZoning });

    safeAddLayer(map, {
      id: "freshZoning",
      type: "line",
      source: "freshZoning",
      paint: { "line-color": "#f97316", "line-width": 2 }
    });
  }

  if (key === "truckRoutes") {
    safeAddSource(map, "truckRoutes", { type: "geojson", data: DATA_SOURCES.truckRoutes });

    safeAddLayer(map, {
      id: "truckRoutes",
      type: "line",
      source: "truckRoutes",
      paint: { "line-color": "#111827", "line-width": 2 }
    });
  }

  if (key === "floodRisk") {
    safeAddSource(map, "floodRisk", { type: "geojson", data: DATA_SOURCES.floodRisk });

    safeAddLayer(map, {
      id: "floodRisk-fill",
      type: "fill",
      source: "floodRisk",
      paint: { "fill-color": "#38bdf8", "fill-opacity": 0.35 }
    });

    safeAddLayer(map, {
      id: "floodRisk-outline",
      type: "line",
      source: "floodRisk",
      paint: { "line-color": "#0284c7", "line-width": 1 }
    });
  }
}

// -------- init maps (after window load) --------
window.addEventListener("load", () => {
  if (!window.mapboxgl) {
    console.error("Mapbox GL not loaded. Check script tag / network.");
    return;
  }

  MAP_KEYS.forEach((key) => {
    const containerId = `map-${key}`;
    const el = document.getElementById(containerId);
    if (!el) {
      console.warn(`Missing map container: #${containerId}`);
      return;
    }

    const map = new mapboxgl.Map({
      container: containerId,
      style: "mapbox://styles/mapbox/light-v11",
      center: [-73.95, 40.73],
      zoom: 10.5,
      interactive: true,
    });

    maps.set(key, map);

    map.on("error", (e) => logMapError(key, e));
    // 额外诊断：直接打印关键错误
    map.on("error", (e) => {
      console.error(`[${key}]`, e?.error || e);
    });

    map.on("load", () => {
      // critical in grid layouts
      map.resize();

      addLayersForKey(map, key);

      // Optional: show basic message if farmersMarkets has no data yet
      if (key === "farmersMarkets") {
        // nothing — no error
      }
    });
  });

  // after maps exist, hook sync + selection
  setupSync();
  setupSelection();
  setActive("supplyGap");
});

// -------- sync (safe against loops) --------
let isSyncing = false;

function setupSync() {
  maps.forEach((map, key) => {
    map.on("move", () => {
      if (isSyncing) return;
      isSyncing = true;

      const center = map.getCenter();
      const zoom = map.getZoom();
      const bearing = map.getBearing();
      const pitch = map.getPitch();

      maps.forEach((m, k) => {
        if (k === key) return;
        m.jumpTo({ center, zoom, bearing, pitch });
      });

      isSyncing = false;
    });
  });
}

// -------- legend --------
const LEGENDS = {
  supplyGap: {
    title: "Supply Gap",
    subtitle: "Unmet emergency food need (rank 1–10)",
    items: [{ type: "ramp", label: "Low → High", ramp: ["#dbeafe", "#1d4ed8"] }],
  },
  farmersMarkets: {
    title: "NYC Farmers Markets",
    subtitle: "Market locations (data not loaded yet)",
    items: [{ type: "dot", label: "Farmers Market", color: "#16a34a" }],
  },
  emergencyFood: {
    title: "Emergency Food Sites",
    subtitle: "CFC program locations",
    items: [{ type: "dot", label: "Food Site", color: "#dc2626" }],
  },
  freshZoning: {
    title: "NYC FRESH Zoning",
    subtitle: "Zoning districts",
    items: [{ type: "line", label: "FRESH boundary", color: "#f97316" }],
  },
  truckRoutes: {
    title: "Truck Routes",
    subtitle: "Designated truck routes",
    items: [{ type: "line", label: "Truck Route", color: "#111827" }],
  },
  floodRisk: {
    title: "Flood Risk",
    subtitle: "Stormwater flood risk areas",
    items: [{ type: "fill", label: "Flood Risk Area", color: "#38bdf8" }],
  },
};

function renderLegend(key) {
  const cfg = LEGENDS[key] || { title: "Legend", subtitle: "", items: [] };
  const titleEl = document.getElementById("legendTitle");
  const subEl = document.getElementById("legendSubtitle");
  const wrap = document.getElementById("legendContent");

  if (titleEl) titleEl.textContent = cfg.title;
  if (subEl) subEl.textContent = cfg.subtitle;
  if (!wrap) return;

  wrap.innerHTML = "";

  cfg.items.forEach((it) => {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "10px";
    row.style.padding = "8px 0";
    row.style.borderBottom = "1px solid #f0f0f0";

    const swatch = document.createElement("div");

    if (it.type === "dot") {
      swatch.style.width = "14px";
      swatch.style.height = "14px";
      swatch.style.borderRadius = "999px";
      swatch.style.background = it.color || "#999";
      swatch.style.border = "1px solid #fff";
    } else if (it.type === "line") {
      swatch.style.width = "26px";
      swatch.style.height = "4px";
      swatch.style.borderRadius = "6px";
      swatch.style.background = it.color || "#999";
    } else if (it.type === "fill") {
      swatch.style.width = "18px";
      swatch.style.height = "18px";
      swatch.style.borderRadius = "6px";
      swatch.style.background = it.color || "#999";
      swatch.style.opacity = "0.7";
    } else if (it.type === "ramp") {
      const [c1, c2] = it.ramp || ["#eee", "#111"];
      swatch.style.width = "90px";
      swatch.style.height = "10px";
      swatch.style.borderRadius = "6px";
      swatch.style.background = `linear-gradient(90deg, ${c1}, ${c2})`;
    }

    const label = document.createElement("div");
    label.textContent = it.label;

    row.appendChild(swatch);
    row.appendChild(label);
    wrap.appendChild(row);
  });
}

// -------- selection --------
function setupSelection() {
  document.querySelectorAll(".cell").forEach((cell) => {
    cell.addEventListener("click", () => setActive(cell.dataset.mapkey));
  });
}

function setActive(key) {
  document.querySelectorAll(".cell").forEach((el) => {
    const active = el.dataset.mapkey === key;
    el.classList.toggle("is-active", active);
    if (el.tagName === "BUTTON") {
      el.setAttribute("aria-pressed", active ? "true" : "false");
    }
  });
  renderLegend(key);
}
