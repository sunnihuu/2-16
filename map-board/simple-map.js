const DATA_SOURCES = {
  supplyGap:      "../data/nta_supply_gap_2024.geojson",
  // farmersMarkets: "../data/nyc_farmers_markets.geojson", // Uncomment when available
  emergencyFood:  "../data/cfc_food_sites.geojson",
  freshZoning:    "../data/nyc-fresh-zoining.geojson",
  truckRoutes:    "../data/nyc-truck-routes-2026.geojson",
  floodRisk:      "../data/stormwater-flood.geojson",
};

const MAP_KEYS = [
  "supplyGap",
  "farmersMarkets",
  "emergencyFood",
  "freshZoning",
  "truckRoutes",
  "floodRisk",
];

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
						"circle-color": [
							"match",
							["get", "type"],
							"FP", "#34d399",
							"FPH", "#60a5fa",
							"FPK", "#fbbf24",
							"SK", "#f87171",
							"#d1d5db"
						],
						"circle-opacity": 0.75,
						"circle-stroke-color": "#fff",
						"circle-stroke-width": 1,
					},
				});
			});
		}
		// ...existing code for other maps...
	});
});
