import { getCoordinates } from "../Frontend/MapScript/coordinates.js";
import { getGasStation } from "../Frontend/Hooks/testGasStation.js";
import { gasFilter } from "../Frontend/Hooks/testGasFilter.js";

const defaultCenter = [7.426401792405303, 125.79344414105464];
const map = L.map("map").setView(defaultCenter, 13);
const locateButton = document.querySelector(".locate_user");
const travelModeButtons = document.querySelectorAll(".travel-mode");

let userMarker = null;
let stationMarkers = [];

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

function clearStationMarkers() {
    stationMarkers.forEach((marker) => {
        map.removeLayer(marker);
    });

    stationMarkers = [];
}

function getStationName(station) {
    return station.tags?.name || station.tags?.brand || "Gas Station";
}

function getStationAddress(station) {
    const tags = station.tags || {};
    const addressLine = [tags["addr:housenumber"], tags["addr:street"]]
        .filter(Boolean)
        .join(" ")
        .trim();

    if (addressLine) {
        return addressLine;
    }

    return tags["addr:city"] || "Address unavailable";
}

function renderGasStations(stations, userCoordinates) {
    clearStationMarkers();

    const bounds = [
        [userCoordinates.lat, userCoordinates.lng]
    ];

    stations.forEach((station) => {
        if (typeof station?.lat !== "number" || typeof station?.lon !== "number") {
            return;
        }

        const marker = L.marker([station.lat, station.lon])
            .addTo(map)
            .bindPopup(`
                <strong>${getStationName(station)}</strong><br>
                ${getStationAddress(station)}
            `);

        stationMarkers.push(marker);
        bounds.push([station.lat, station.lon]);
    });

    if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
    }
}

async function handleLocateUser() {
    if (!locateButton) {
        return;
    }

    locateButton.disabled = true;
    locateButton.textContent = "Locating...";

    try {
        const userCoordinates = await getCoordinates();

        map.setView([userCoordinates.lat, userCoordinates.lng], 15);

        if (userMarker) {
            userMarker.setLatLng([userCoordinates.lat, userCoordinates.lng]);
        } else {
            userMarker = L.marker([userCoordinates.lat, userCoordinates.lng])
                .addTo(map)
                .bindPopup("You are here.");
        }

        userMarker.openPopup();

        const nearbyStations = await getGasStation(
            userCoordinates.lat,
            userCoordinates.lng
        );

        const filteredResponse = await gasFilter(
            userCoordinates.lat,
            userCoordinates.lng,
            nearbyStations
        );

        if (!filteredResponse || filteredResponse.status !== "success") {
            throw new Error(filteredResponse?.message || "Failed to filter nearby gas stations.");
        }

        renderGasStations(filteredResponse.data|| [], userCoordinates);
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

travelModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        travelModeButtons.forEach((modeButton) => {
            modeButton.classList.remove("active");
        });

        button.classList.add("active");
    });
});
