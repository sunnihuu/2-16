// index.js
// Entry point for custom JS logic (if needed)
// Currently, map logic is handled in simple-map.js

// You can add custom interactivity or UI logic here.

console.log("index.js loaded ✅");

mapboxgl.accessToken = "pk.eyJ1Ijoic3VubmlodSIsImEiOiJjbWxwZm54bHUwNWJiM2ZvcXh3NHlrdGllIn0.zdpq6eZxirk5VV9tQ7uqBg";

window.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("mapbox-base");
  if (container) {
    new mapboxgl.Map({
      container: "mapbox-base",
      style: "mapbox://styles/mapbox/light-v11",
      center: [-73.95, 40.73],
      zoom: 10.5,
    });
  }
});
