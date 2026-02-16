console.log("maps.js loaded ✅", !!window.mapboxgl);

window.addEventListener("DOMContentLoaded", () => {
	const maps = {};
	let isSyncing = false;
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
		});
		maps[key] = map;
		if (key === "emergencyFood") {
			map.on("load", () => {
				map.addSource("emergencyFood", {
					type: "geojson",
					data: DATA_SOURCES.emergencyFood,
				});
				map.addLayer({
					id: "emergencyFood",
					type: "circle",
					source: "emergencyFood",
					paint: {
						"circle-radius": 5,
						"circle-color": "#dc2626",
						"circle-opacity": 0.75,
						"circle-stroke-color": "#fff",
						"circle-stroke-width": 1,
					},
				});
			});
		}
		if (key === "floodRisk") {
			map.on("load", () => {
				map.addSource("floodRisk", {
					type: "geojson",
					data: DATA_SOURCES.floodRisk,
				});
				map.addLayer({
					id: "floodRisk-fill",
					type: "fill",
					source: "floodRisk",
					paint: {
						"fill-color": [
							"interpolate",
							["linear"],
							["to-number", ["get", "rank"]],
							1, "#dbeafe",
							10, "#1d4ed8"
						],
						"fill-opacity": 0.35
					}
				});
				map.addLayer({
					id: "floodRisk-outline",
					type: "line",
					source: "floodRisk",
					paint: { "line-color": "#0284c7", "line-width": 1 }
				});
			});
		}
		if (key === "freshZoning") {
			map.on("load", () => {
				map.addSource("freshZoning", {
					type: "geojson",
					data: DATA_SOURCES.freshZoning,
				});
				map.addLayer({
					id: "freshZoning",
					type: "line",
					source: "freshZoning",
					paint: {
						"line-color": [
							"match",
							["get", "zone_type"],
							"A", "#1d4ed8",
							"B", "#38bdf8",
							"C", "#f97316",
							"D", "#16a34a",
							/* other */ "#a21caf"
						],
						"line-width": 3
					}
				});
			});
		}
		if (key === "truckRoutes") {
			map.on("load", () => {
				map.addSource("truckRoutes", {
					type: "geojson",
					data: DATA_SOURCES.truckRoutes,
				});
				map.addLayer({
					id: "truckRoutes",
					type: "line",
					source: "truckRoutes",
					paint: {
						"line-color": "#111827",
						"line-width": 2
					}
				});
			});
		}
		if (key === "supplyGap") {
			map.on("load", () => {
				map.addSource("supply-gap", {
					type: "geojson",
					data: DATA_SOURCES.supplyGap,
				});
				map.addLayer({
					id: 'supply-gap-fill',
					type: 'fill',
					source: 'supply-gap',
					paint: {
						'fill-color': [
							'interpolate',
							['linear'],
							['get', 'log_gap'],
							4.1, '#ffcccc',
							5.0, '#ff9999',
							5.5, '#ff6666',
							6.0, '#ff3333',
							6.3, '#cc0000',
							6.6, '#990000'
						],
						'fill-opacity': 0.6
					}
				});
			});
		}
		if (key === "farmersMarkets") {
			map.on("load", () => {
				map.addSource("heatVulnerability", {
					type: "geojson",
					data: DATA_SOURCES.floodRisk,
				});
				map.addLayer({
					id: "heatVulnerability-fill",
					type: "fill",
					source: "heatVulnerability",
					paint: {
						'fill-color': [
							'interpolate',
							['linear'],
							['get', 'hvi'],
							1, '#00ff00',   // Green (low)
							2, '#ffff00',   // Yellow
							3, '#ffa500',   // Orange
							4, '#ff0000'    // Red (high)
						],
						'fill-opacity': 0.6
					}
				});
				// Outline layer removed
			});
		}
		// 同步 pan/zoom
		map.on("move", () => {
			if (isSyncing) return;
			isSyncing = true;
			const center = map.getCenter();
			const zoom = map.getZoom();
			const bearing = map.getBearing();
			const pitch = map.getPitch();
			Object.entries(maps).forEach(([otherKey, otherMap]) => {
				if (otherKey !== key) {
					otherMap.jumpTo({ center, zoom, bearing, pitch });
				}
			});
			isSyncing = false;
		});
	});
});

/* =========================
	 NYC Food System Observatory
	 6 synced maps + active legend
	 ========================= */

// 1) Token（建议你放到 config.js，不要公开）
mapboxgl.accessToken = "pk.eyJ1Ijoic3VubmlodSIsImEiOiJjbWxwZm54bHUwNWJiM2ZvcXh3NHlrdGllIn0.zdpq6eZxirk5VV9tQ7uqBg";

// 2) Map keys must match HTML: id="map-<key>" + data-mapkey="<key>"
const MAP_KEYS = [
	"supplyGap",
	"farmersMarkets",
	"emergencyFood",
	"freshZoning",
	"truckRoutes",
	"floodRisk",
];

const DATA_SOURCES = {
	supplyGap:      "./data/nta_supply_gap_2024.geojson",
	// farmersMarkets: "./data/nyc_farmers_markets.geojson", // <- add later when you have it
	emergencyFood:  "./data/cfc_food_sites.geojson",
	freshZoning:    "./data/nyc-fresh-zoining.geojson",
	truckRoutes:    "./data/nyc-truck-routes-2026.geojson",
	floodRisk:      "./data/Heat_Vulnerability_Index_Rankings_20260216.geojson",
};

function safeAddSource(map, id, spec) {
	if (map.getSource(id)) return;
	map.addSource(id, spec);
}
