// index.js
// Entry point for custom JS logic (if needed)
// Currently, map logic is handled in simple-map.js

// You can add custom interactivity or UI logic here.

console.log("index.js loaded ✅");

mapboxgl.accessToken = "pk.eyJ1Ijoic3VubmlodSIsImEiOiJjbWxwZmh6NDAxY200M2dvb2VlMzZ2aTM4In0.Xq6Z1l7EMA4II91mAAhyTw";

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
