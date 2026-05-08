import { escapeHtml } from "./dom.js";
import { getStationName, isValidStation } from "./stations.js";

export function createMap(mapElementId, defaultCenter, defaultZoom) {
    const map = L.map(mapElementId).setView(defaultCenter, defaultZoom);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    return map;
}

export function clearStationMarkers(map, stationMarkers) {
    stationMarkers.forEach((marker) => {
        map.removeLayer(marker);
    });

    return [];
}

export function clearRouteLine(map, routeLine) {
    if (routeLine) {
        map.removeLayer(routeLine);
        return null;
    }

    return routeLine;
}

export function drawStraightLineToStation(map, routeLine, userCoordinates, station) {
    if (!userCoordinates || !isValidStation(station)) {
        return routeLine;
    }

    routeLine = clearRouteLine(map, routeLine);
    return L.polyline(
        [
            [userCoordinates.lat, userCoordinates.lng],
            [station.lat, station.lon]
        ],
        { weight: 4, opacity: 0.9, color: "#007bff" }
    ).addTo(map);
}

export function drawRoadRoute(map, routeLine, geojson) {
    if (!geojson) {
        return routeLine;
    }

    routeLine = clearRouteLine(map, routeLine);

    // ORS returns standard GeoJSON with [lng, lat] coordinate order.
    return L.geoJSON(geojson, {
        style: {
            color: "#007bff",
            weight: 4,
            opacity: 0.9
        }
    }).addTo(map);
}

export function renderGasStations({ map, stations, userCoordinates, stationMarkers, routeLine }) {
    stationMarkers = clearStationMarkers(map, stationMarkers);
    routeLine = clearRouteLine(map, routeLine);
    console.log("Render Gas Stations Hit. " + stations.length + " " + stations);
    console.log("Data:" + stations);
    const validStations = Array.isArray(stations) ? stations.filter(isValidStation) : [];

    const bounds = [[userCoordinates.lat, userCoordinates.lng]];

    validStations.forEach((station) => {
        const marker = L.marker([station.lat, station.lon])
            .addTo(map)
            .bindPopup(`
                <strong>${escapeHtml(getStationName(station))}</strong>
            `);

        stationMarkers.push(marker);
        bounds.push([station.lat, station.lon]);
    });

    if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
    }

    return { stationMarkers, routeLine };
}
