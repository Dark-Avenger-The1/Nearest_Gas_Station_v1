import { escapeHtml } from "../../Helper/UtilsHelper.js";
let currentMarker;
let stationMarkers = [];
export function pinCurrentLoc(loc,type,map){
    console.log("Pin current loc hit!")
    const user = (type)?"You are here.":"Current Location";
    if(currentMarker){
        currentMarker.setLatLng([loc.lat,loc.lng]);
    }else{
        currentMarker = window.L.marker([loc.lat,loc.lng])
                .addTo(map)
                .bindPopup(user);
    }

    currentMarker.openPopup();
    map.setView([loc.lat, loc.lng], 15);
}

export function pinGasStation(gas,currLoc,map){
    clearStationMarkers(map);
    if(gas===null || gas.length===0) return;

    const bounds = [
        [currLoc.lat,currLoc.lng]
    ];
    gas.forEach((station)=>{
        const gasMarker = window.L.marker([station.lat,station.lon]).addTo(map)
            .bindPopup(`
                <strong>${escapeHtml(station.stationName)}</strong>
            `);
        stationMarkers.push(gasMarker);
        bounds.push([station.lat,station.lon]);
    });

    if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40] });
    }
}

function clearStationMarkers(map) {
    stationMarkers.forEach((marker) => {
        map.removeLayer(marker);
    });

    stationMarkers = [];
}