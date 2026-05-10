import { escapeHtml } from "./dom.js";
import { getStationName } from "./stations.js";

export function renderStationList(panel, stations, { selectedIndex = null, selectedRouteSummary = null } = {}) {
    if (!panel) {
        return;
    }

    console.log("Render Station List Hit. " + stations.length + " " + stations);

    if (!Array.isArray(stations) || stations.length === 0) {
        panel.innerHTML = `
            <div class="gas-station">
                <h3 class="station-name">No nearby stations</h3>
                <p class="station-distance">Click "Locate Me" to load nearby stations.</p>
            </div>
        `;
        return;
    }

    const selectedStation =
        typeof selectedIndex === "number" && selectedIndex >= 0 && selectedIndex < stations.length
            ? stations[selectedIndex]
            : null;

    const selectedCard = selectedStation
        ? (() => {
            const stationName = escapeHtml(getStationName(selectedStation));
            const routeStatus = selectedRouteSummary?.status;

            const distanceText = (() => {
                if (routeStatus === "loading") {
                    return "Calculating route distance...";
                }

                if (routeStatus === "success" && typeof selectedRouteSummary?.distanceMeters === "number") {
                    const km = selectedRouteSummary.distanceMeters / 1000;
                    const minutes =
                        typeof selectedRouteSummary?.durationSeconds === "number"
                            ? Math.max(1, Math.round(selectedRouteSummary.durationSeconds / 60))
                            : null;

                    return minutes === null
                        ? `${km.toFixed(2)} km (by road)`
                        : `${km.toFixed(2)} km • ${minutes} min (by road)`;
                }

                if (routeStatus === "failed") {
                    return "Route distance unavailable";
                }

                return "Click again to calculate route";
            })();

            return `
                <div class="gas-station selected-summary">
                    <h3 class="station-name">${stationName}</h3>
                    <p class="station-distance">${escapeHtml(distanceText)}</p>
                </div>
            `;
        })()
        : `
            <div class="gas-station selected-summary">
                <h3 class="station-name">No station selected</h3>
                <p class="station-distance">Click a station name to draw a line.</p>
            </div>
        `;

    const stationCards = stations
        .map((station, index) => {
            const stationName = escapeHtml(getStationName(station));
            const selectedClass = index === selectedIndex ? " is-selected" : "";
            return `
                <div class="gas-station station-item${selectedClass}" data-station-index="${index}">
                    <h3 class="station-name">${stationName}</h3>
                </div>
            `;
        })
        .join("");

    panel.innerHTML = `
        ${selectedCard}
        <div class="gas-station">
            <p class="station-distance">Filtered stations: ${stations.length}</p>
        </div>
        ${stationCards}
    `;
}
