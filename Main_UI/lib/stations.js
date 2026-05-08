import { toFiniteNumber } from "./geo.js";

export function getStationCoordinates(station) {
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

export function normalizeStation(station) {
    const coords = getStationCoordinates(station);
    if (!coords) {
        return null;
    }

    return { ...station, lat: coords.lat, lon: coords.lon };
}

export function isValidStation(station) {
    return getStationCoordinates(station) !== null;
}

export function getStationName(station) {
    return station.tags?.name || station.tags?.brand || "Gas Station";
}
