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
