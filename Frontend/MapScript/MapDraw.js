let routeLine = null;

export function drawRoadRoute(geojson,map) {
    if (!geojson) {
        return;
    }

    clearRouteLine(map);
    console.log("Draw Data")
    console.log(geojson);
    // ORS returns standard GeoJSON with [lng, lat] coordinate order.
    routeLine = window.L.geoJSON(geojson, {
        style: {
            color: "#007bff",
            weight: 4,
            opacity: 0.9
        }
    }).addTo(map);
}

function clearRouteLine(map) {
    if (routeLine) {
        map.removeLayer(routeLine);
        routeLine = null;
    }
}