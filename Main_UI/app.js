import { getCoordinates } from "../Frontend/MapScript/coordinates.js";

const defaultCenter = [7.426401792405303, 125.79344414105464];
const map = L.map("map").setView(defaultCenter, 13);
const locateButton = document.querySelector(".locate_user");

let userMarker = null;

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
}).addTo(map);

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
        console.log("User coordinates:", userCoordinates);
    } catch (error) {
        console.error("Unable to get user location:", error.message);
        window.alert(`Unable to get your location: ${error.message}`);
    } finally {
        locateButton.disabled = false;
        locateButton.textContent = "Locate Me";
    }
}

if (locateButton) {
    locateButton.addEventListener("click", handleLocateUser);
}
