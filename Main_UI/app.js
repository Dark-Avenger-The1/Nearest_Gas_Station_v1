import { extractCoordinates, getCoordinates } from "../Frontend/MapScript/coordinates.js";
import { getGasStation } from "../Frontend/Hooks/testGasStation.js";
import { gasFilter } from "../Frontend/Hooks/testGasFilter.js";
import { getRoute } from "../Frontend/Hooks/getRoute.js";

import {
    clearRouteLine,
    createMap,
    drawRoadRoute,
    drawStraightLineToStation,
    renderGasStations
} from "./lib/mapRendering.js";
import { isValidStation, normalizeStation } from "./lib/stations.js";
import { extractRouteSummary } from "./lib/routing.js";
import { renderStationList } from "./lib/stationListView.js";

const defaultCenter = [7.426401792405303, 125.79344414105464];
const map = createMap("map", defaultCenter, 13);
const locateButton = document.querySelector(".locate_user");
const selectedStationPanel = document.querySelector("#selected-station");

let userMarker = null;
let stationMarkers = [];
let routeLine = null;

let currentUserCoordinates = null;
let currentStations = [];
let selectedStationIndex = null;
let routeRequestId = 0;
let selectedRouteSummary = null;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

function clearStationMarkers() {
    stationMarkers.forEach((marker) => {
        map.removeLayer(marker);
    });

    stationMarkers = [];
}

function clearRouteLine() {
    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }
}

function toFiniteNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return null;
        }

        const numberValue = Number(trimmed);
        return Number.isFinite(numberValue) ? numberValue : null;
    }

    return null;
}

function getStationCoordinates(station) {
    if (!station || typeof station !== "object") {
        return null;
    }

    const rawLat = station.lat ?? station.center?.lat ?? station.latitude ?? station.geometry?.lat;
    const rawLon =
        station.lon ??
        station.center?.lon ??
        station.lng ??
        station.longitude ??
        station.geometry?.lon ??
        station.geometry?.lng;

    const lat = toFiniteNumber(rawLat);
    const lon = toFiniteNumber(rawLon);

    if (lat === null || lon === null) {
        return null;
    }

    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        return null;
    }

    return { lat, lon };
}

function normalizeStation(station) {
    const coords = getStationCoordinates(station);
    if (!coords) {
        return null;
    }

    return { ...station, lat: coords.lat, lon: coords.lon };
}

function isValidStation(station) {
    return getStationCoordinates(station) !== null;
}

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function toRadians(deg) {
    return (deg * Math.PI) / 180;
}

function haversineDistanceKm(a, b) {
    // a: { lat, lng }  b: { lat, lon }
    const earthRadiusKm = 6371;
    const lat1 = toRadians(a.lat);
    const lat2 = toRadians(b.lat);
    const deltaLat = toRadians(b.lat - a.lat);
    const deltaLng = toRadians(b.lon - a.lng);

    const sinLat = Math.sin(deltaLat / 2);
    const sinLng = Math.sin(deltaLng / 2);
    const x = sinLat * sinLat + Math.cos(lat1) * Math.cos(lat2) * sinLng * sinLng;
    const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
    return earthRadiusKm * c;
}

function extractRouteSummary(routeGeoJson) {
    const feature = routeGeoJson?.features?.[0];
    const summary = feature?.properties?.summary;
    console.log(summary.distance);
    if (summary && typeof summary.distance === "number") {
        return {
            distanceMeters: summary.distance,
            durationSeconds: typeof summary.duration === "number" ? summary.duration : null
        };
    }

    const segments = feature?.properties?.segments;
    if (Array.isArray(segments) && segments.length > 0) {
        const distanceMeters = segments.reduce((total, segment) => {
            return total + (typeof segment?.distance === "number" ? segment.distance : 0);
        }, 0);

        const durationSeconds = segments.reduce((total, segment) => {
            return total + (typeof segment?.duration === "number" ? segment.duration : 0);
        }, 0);

        if (distanceMeters > 0) {
            return {
                distanceMeters,
                durationSeconds: durationSeconds > 0 ? durationSeconds : null
            };
        }
    }

    return null;
}

function drawStraightLineToStation(userCoordinates, station) {
    if (!userCoordinates || !isValidStation(station)) {
        return;
    }

    clearRouteLine();
    routeLine = L.polyline(
        [
            [userCoordinates.lat, userCoordinates.lng],
            [station.lat, station.lon]
        ],
        { weight: 4, opacity: 0.9, color: "#007bff" }
    ).addTo(map);
}

function drawRoadRoute(geojson) {
    if (!geojson) {
        return;
    }

    clearRouteLine();
    console.log("Draw Data")
    console.log(geojson);
    // ORS returns standard GeoJSON with [lng, lat] coordinate order.
    routeLine = L.geoJSON(geojson, {
        style: {
            color: "#007bff",
            weight: 4,
            opacity: 0.9
        }
    }).addTo(map);
}

async function fetchAndDrawRoadRoute(userCoordinates, station) {
    if (!userCoordinates || !isValidStation(station)) {
        return;
    }

    const requestId = ++routeRequestId;

    try {
        const start = { lat: userCoordinates.lat, lng: userCoordinates.lng };
        const end = { lat: station.lat, lng: station.lon };

        const routeGeoJson = await getRoute(start, end, "driving-car");

        // Only apply the latest click's route.
        if (requestId !== routeRequestId) {
            return;
        }

        const summary = extractRouteSummary(routeGeoJson);
        //console.log("summary Result: "+summary);
        selectedRouteSummary = summary
            ? { status: "success", ...summary }
            : { status: "failed" };

        routeLine = drawRoadRoute(map, routeLine, routeGeoJson);
        renderStationList(selectedStationPanel, currentStations, {
            selectedIndex: selectedStationIndex,
            selectedRouteSummary
        });
    } catch (error) {
        // If routing fails (missing API key, network, etc.), fall back to a straight line.
        if (requestId !== routeRequestId) {
            return;
        }

        console.warn("Failed to fetch road route, falling back to straight line:", error?.message || error);
        selectedRouteSummary = { status: "failed" };
        routeLine = drawStraightLineToStation(map, routeLine, userCoordinates, station);
        renderStationList(selectedStationPanel, currentStations, {
            selectedIndex: selectedStationIndex,
            selectedRouteSummary
        });
    }
}

if (selectedStationPanel) {
    // Clicking a station name focuses its marker and opens its popup.
    selectedStationPanel.addEventListener("click", (event) => {
        const stationItem = event.target?.closest?.("[data-station-index]");
        if (!stationItem) {
            return;
        }

        const markerIndex = Number(stationItem.dataset.stationIndex);
        const marker = stationMarkers[markerIndex];
        const station = currentStations[markerIndex];
        if (!marker) {
            return;
        }

        selectedStationIndex = markerIndex;
        selectedRouteSummary = { status: "loading" };
        routeLine = clearRouteLine(map, routeLine);
        renderStationList(selectedStationPanel, currentStations, {
            selectedIndex: selectedStationIndex,
            selectedRouteSummary
        });

        if (currentUserCoordinates && station) {
            fetchAndDrawRoadRoute(currentUserCoordinates, station);
        }

        const latLng = marker.getLatLng();
        map.setView(latLng, Math.max(map.getZoom(), 16));
        marker.openPopup();
    });
}

// Panel starts empty in HTML; populate the initial placeholder.
renderStationList(selectedStationPanel, []);

async function handleLocateUser() {
    if (!locateButton) {
        return;
    }

    locateButton.disabled = true;
    locateButton.textContent = "Locating...";

    try {
        const userCoordinates = await getCoordinates();
        currentUserCoordinates = extractCoordinates();
        selectedStationIndex = null;
        selectedRouteSummary = null;
        console.log("User coordinates obtained:", userCoordinates);
        map.setView([userCoordinates.lat, userCoordinates.lng], 15);

        if (userMarker) {
            userMarker.setLatLng([userCoordinates.lat, userCoordinates.lng]);
        } else {
            userMarker = L.marker([userCoordinates.lat, userCoordinates.lng]).addTo(map).bindPopup("You are here.");
        }

        userMarker.openPopup();

        const nearbyStations = await getGasStation(userCoordinates.lat, userCoordinates.lng);
        console.log("Nearby stations fetched:", nearbyStations);
        const filteredResponse = await gasFilter(userCoordinates.lat, userCoordinates.lng, nearbyStations);

        console.log("Filtered stations response:", filteredResponse.data);
        if (!filteredResponse || filteredResponse.status !== "success") {
            throw new Error(filteredResponse?.message || "Failed to filter nearby gas stations.");
        }

        const filteredStations = Array.isArray(filteredResponse.data)
            ? filteredResponse.data.map(normalizeStation).filter(Boolean)
            : [];

        currentStations = filteredStations;
        renderStationList(selectedStationPanel, currentStations, {
            selectedIndex: selectedStationIndex,
            selectedRouteSummary
        });

        const renderResult = renderGasStations({
            map,
            stations: currentStations,
            userCoordinates,
            stationMarkers,
            routeLine
        });

        stationMarkers = renderResult.stationMarkers;
        routeLine = renderResult.routeLine;

        console.log("Rendered gas stations:", filteredResponse.data);
    } catch (error) {
        console.error("Unable to get user location or gas stations:", error.message);
        window.alert(`Unable to load nearby gas stations: ${error.message}`);
    } finally {
        locateButton.disabled = false;
        locateButton.textContent = "Locate Me";
    }
}

if (locateButton) {
    locateButton.addEventListener("click", handleLocateUser);
}
