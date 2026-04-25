"use strict";

const config = {
  searchRadiusMeters: 7000,
  stationFetchLimit: 20,
  routeCompareLimit: 8,
  overpassUrl: "https://overpass-api.de/api/interpreter",
  osrmTableBase: "https://router.project-osrm.org/table/v1/driving/",
  osrmRouteBase: "https://router.project-osrm.org/route/v1/driving/"
};

const dom = {
  locateBtn: document.getElementById("locate-btn"),
  resetBtn: document.getElementById("reset-btn"),
  statusText: document.getElementById("status-text"),
  statusBadge: document.getElementById("status-badge"),
  bestStationName: document.getElementById("best-station-name"),
  bestDistance: document.getElementById("best-distance"),
  bestDuration: document.getElementById("best-duration"),
  stationsCount: document.getElementById("stations-count"),
  routeDetails: document.getElementById("route-details"),
  stationList: document.getElementById("station-list"),
  lastUpdated: document.getElementById("last-updated")
};

const state = {
  map: null,
  userMarker: null,
  stationMarkersLayer: null,
  routeLayer: null,
  userPosition: null,
  stations: [],
  bestStation: null
};

document.addEventListener("DOMContentLoaded", () => {
  initializeMap();
  bindEvents();
});

function initializeMap() {
  state.map = L.map("map", {
    zoomControl: true,
    attributionControl: true
  }).setView([20, 0], 2);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(state.map);

  state.stationMarkersLayer = L.layerGroup().addTo(state.map);
}

function bindEvents() {
  dom.locateBtn.addEventListener("click", handleLocateClick);
  dom.resetBtn.addEventListener("click", resetExperience);
}

async function handleLocateClick() {
  if (!navigator.geolocation) {
    setStatus("Geolocation is not supported in this browser.", "error");
    return;
  }

  setLoading(true);
  clearMapLayers();
  state.stations = [];
  state.bestStation = null;
  dom.stationList.innerHTML = '<div class="empty-state">Searching nearby gas stations and route options...</div>';
  dom.routeDetails.className = "route-details empty";
  dom.routeDetails.textContent = "Checking stations around your current location.";
  dom.bestStationName.textContent = "Searching...";
  dom.bestDistance.textContent = "--";
  dom.bestDuration.textContent = "--";
  dom.stationsCount.textContent = "0";
  setStatus("Getting your current location...", "loading");

  try {
    const position = await getCurrentPosition();
    const { latitude, longitude } = position.coords;

    state.userPosition = {
      lat: latitude,
      lng: longitude
    };

    renderUserMarker();
    setStatus("Searching nearby fuel stations...", "loading");

    const nearbyStations = await fetchNearbyStations(latitude, longitude);

    if (!nearbyStations.length) {
      throw new Error("No nearby gas stations were found in the current search radius.");
    }

    setStatus("Comparing driving routes to nearby stations...", "loading");
    const rankedStations = await rankStationsByDrivingDistance(nearbyStations, state.userPosition);

    if (!rankedStations.length) {
      throw new Error("Routes could not be calculated for the stations that were found.");
    }

    state.stations = rankedStations;
    state.bestStation = rankedStations[0];

    const route = await fetchRouteGeometry(state.userPosition, state.bestStation);
    renderStations();
    renderRoute(route, state.bestStation);
    renderSummary();
    setStatus("Shortest route to the nearest gas station is ready.", "success");
  } catch (error) {
    console.error(error);
    state.stations = [];
    state.bestStation = null;
    dom.stationList.innerHTML = '<div class="empty-state">No route results to show yet. Try another search after checking permissions and connectivity.</div>';
    setStatus(error.message || "Something went wrong while finding a route.", "error");
    dom.routeDetails.className = "route-details empty";
    dom.routeDetails.textContent = "Try again after confirming location permission and internet access.";
  } finally {
    setLoading(false);
  }
}

function resetExperience() {
  clearMapLayers();
  state.userPosition = null;
  state.stations = [];
  state.bestStation = null;
  state.map.setView([20, 0], 2);
  dom.bestStationName.textContent = "Waiting for search";
  dom.bestDistance.textContent = "--";
  dom.bestDuration.textContent = "--";
  dom.stationsCount.textContent = "0";
  dom.lastUpdated.textContent = "No search yet";
  dom.stationList.innerHTML = '<div class="empty-state">Nearby stations will be listed here once the app has your location.</div>';
  dom.routeDetails.className = "route-details empty";
  dom.routeDetails.textContent = "Route details will appear here after the first successful search.";
  setStatus("Map reset. Share your location to search again.", "idle");
}

function clearMapLayers() {
  if (state.userMarker) {
    state.map.removeLayer(state.userMarker);
    state.userMarker = null;
  }

  if (state.routeLayer) {
    state.map.removeLayer(state.routeLayer);
    state.routeLayer = null;
  }

  state.stationMarkersLayer.clearLayers();
}

function renderUserMarker() {
  if (!state.userPosition) {
    return;
  }

  if (state.userMarker) {
    state.map.removeLayer(state.userMarker);
  }

  state.userMarker = L.marker([state.userPosition.lat, state.userPosition.lng], {
    icon: buildPin("user-pin")
  })
    .addTo(state.map)
    .bindPopup("<strong>Your current location</strong>");

  state.map.setView([state.userPosition.lat, state.userPosition.lng], 14);
}

function renderStations() {
  state.stationMarkersLayer.clearLayers();

  state.stations.forEach((station, index) => {
    const isWinner = index === 0;
    const marker = L.marker([station.lat, station.lng], {
      icon: buildPin(`station-pin${isWinner ? " winner" : ""}`)
    }).bindPopup(`
      <strong>${escapeHtml(station.name)}</strong><br>
      ${escapeHtml(station.address)}<br>
      Drive: ${formatDistance(station.routeDistance)} - ${formatDuration(station.routeDuration)}
    `);

    marker.addTo(state.stationMarkersLayer);
  });

  dom.stationList.innerHTML = state.stations
    .map((station, index) => {
      const isWinner = index === 0;

      return `
        <article class="station-card ${isWinner ? "winner" : ""}">
          <div class="station-title-row">
            <h3 class="station-title">${escapeHtml(station.name)}</h3>
            ${isWinner ? '<span class="winner-badge">Best route</span>' : ""}
          </div>
          <p class="station-address">${escapeHtml(station.address)}</p>
          <div class="station-meta">
            <span>${formatDistance(station.routeDistance)}</span>
            <span>${formatDuration(station.routeDuration)}</span>
            <span>${formatDistance(station.airDistance)} away direct</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderRoute(route, bestStation) {
  if (state.routeLayer) {
    state.map.removeLayer(state.routeLayer);
  }

  const latLngs = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);

  state.routeLayer = L.polyline(latLngs, {
    color: "#2e7d61",
    weight: 6,
    opacity: 0.92,
    lineJoin: "round"
  }).addTo(state.map);

  const bounds = L.latLngBounds([
    [state.userPosition.lat, state.userPosition.lng],
    ...latLngs
  ]);

  state.map.fitBounds(bounds, {
    padding: [48, 48]
  });

  const stepCount = route.legs?.[0]?.steps?.length ?? 0;

  dom.routeDetails.className = "route-details";
  dom.routeDetails.innerHTML = `
    <p class="route-name">${escapeHtml(bestStation.name)}</p>
    <p class="route-address">${escapeHtml(bestStation.address)}</p>
    <div class="route-meta">
      <span>${formatDistance(bestStation.routeDistance)} driving distance</span>
      <span>${formatDuration(bestStation.routeDuration)} estimated time</span>
      <span>${stepCount} navigation steps</span>
    </div>
  `;
}

function renderSummary() {
  if (!state.bestStation) {
    return;
  }

  dom.bestStationName.textContent = state.bestStation.name;
  dom.bestDistance.textContent = formatDistance(state.bestStation.routeDistance);
  dom.bestDuration.textContent = formatDuration(state.bestStation.routeDuration);
  dom.stationsCount.textContent = String(state.stations.length);
  dom.lastUpdated.textContent = new Date().toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit"
  });
}

function setStatus(message, tone) {
  dom.statusText.textContent = message;
  dom.statusBadge.className = `status-badge ${tone}`;
  dom.statusBadge.textContent = tone === "loading"
    ? "Working"
    : tone === "success"
      ? "Ready"
      : tone === "error"
        ? "Issue"
        : "Waiting";
}

function setLoading(isLoading) {
  dom.locateBtn.disabled = isLoading;
  dom.locateBtn.textContent = isLoading ? "Finding route..." : "Use my location";
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, handleLocationError.bind(null, reject), {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    });
  });
}

function handleLocationError(reject, error) {
  const messageMap = {
    1: "Location access was denied. Please allow location permission and try again.",
    2: "Your location could not be determined right now.",
    3: "Location request timed out. Try again in a moment."
  };

  reject(new Error(messageMap[error.code] || "Unable to get your current location."));
}

async function fetchNearbyStations(lat, lng) {
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"="fuel"](around:${config.searchRadiusMeters},${lat},${lng});
      way["amenity"="fuel"](around:${config.searchRadiusMeters},${lat},${lng});
      relation["amenity"="fuel"](around:${config.searchRadiusMeters},${lat},${lng});
    );
    out center;
  `;

  const response = await fetch(config.overpassUrl, {
    method: "POST",
    body: query.trim()
  });

  if (!response.ok) {
    throw new Error("Fuel station search API is currently unavailable.");
  }

  const data = await response.json();

  return dedupeStations(
    data.elements
      .map((element) => normalizeStation(element, lat, lng))
      .filter(Boolean)
  );
}

function normalizeStation(element, userLat, userLng) {
  const lat = element.lat ?? element.center?.lat;
  const lng = element.lon ?? element.center?.lon;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  const tags = element.tags || {};
  const name = tags.name || tags.brand || "Unnamed gas station";
  const address = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"] || tags["addr:town"] || tags["addr:village"]
  ]
    .filter(Boolean)
    .join(", ") || "Address not available";

  return {
    id: `${element.type}-${element.id}`,
    lat,
    lng,
    name,
    address,
    airDistance: getDistanceInMeters(userLat, userLng, lat, lng)
  };
}

function dedupeStations(stations) {
  const seen = new Set();

  return stations
    .sort((a, b) => a.airDistance - b.airDistance)
    .filter((station) => {
      const key = `${station.lat.toFixed(5)}:${station.lng.toFixed(5)}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, config.stationFetchLimit);
}

async function rankStationsByDrivingDistance(stations, userPosition) {
  const shortlisted = stations.slice(0, config.routeCompareLimit);
  const coordinateList = [
    `${userPosition.lng},${userPosition.lat}`,
    ...shortlisted.map((station) => `${station.lng},${station.lat}`)
  ].join(";");

  const response = await fetch(
    `${config.osrmTableBase}${coordinateList}?sources=0&annotations=distance,duration`
  );

  if (!response.ok) {
    throw new Error("Routing API is currently unavailable.");
  }

  const data = await response.json();
  const distances = data.distances?.[0] || [];
  const durations = data.durations?.[0] || [];

  return shortlisted
    .map((station, index) => ({
      ...station,
      routeDistance: distances[index + 1],
      routeDuration: durations[index + 1]
    }))
    .filter((station) => Number.isFinite(station.routeDistance) && Number.isFinite(station.routeDuration))
    .sort((a, b) => a.routeDistance - b.routeDistance);
}

async function fetchRouteGeometry(userPosition, station) {
  const coordinates = `${userPosition.lng},${userPosition.lat};${station.lng},${station.lat}`;
  const response = await fetch(
    `${config.osrmRouteBase}${coordinates}?overview=full&geometries=geojson&steps=true`
  );

  if (!response.ok) {
    throw new Error("Unable to load the final route.");
  }

  const data = await response.json();
  const route = data.routes?.[0];

  if (!route) {
    throw new Error("No route geometry was returned.");
  }

  return route;
}

function buildPin(className) {
  return L.divIcon({
    html: `<span class="${className}"></span>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10]
  });
}

function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const earthRadius = 6371000;
  const latDelta = toRadians(lat2 - lat1);
  const lngDelta = toRadians(lng2 - lng1);
  const a =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(lngDelta / 2) ** 2;

  return 2 * earthRadius * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function formatDistance(meters) {
  if (!Number.isFinite(meters)) {
    return "--";
  }

  return meters >= 1000
    ? `${(meters / 1000).toFixed(2)} km`
    : `${Math.round(meters)} m`;
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) {
    return "--";
  }

  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes
    ? `${hours} hr ${remainingMinutes} min`
    : `${hours} hr`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
