import { escapeHtml } from "../../Helper/UtilsHelper.js";
import { extractRouteSummary } from "../Data/ExtractSummary.js";
export function renderGasCards(data){
    console.log("Render Hit!");
    console.log(data);
    const container = document.querySelector(".card-container");
    container.innerHTML="";
    if(data===null || data.length ===0){
        const elem = `
            <div class="gas-station">
                <h3 class="station-name">No Gas Station Nearby.</h3>
            </div>
        `;
        container.innerHTML+=elem;
        return;
    }

    data.forEach((val)=>{
        const summary = extractRouteSummary(val.locData);
        console.log(summary);
        const elem = `
            <div class="gas-station gas-card" data-id="${val.id}">
                <h3 class="station-name">${escapeHtml(val.stationName)}</h3>
                <p class="station-address">Duration Expected Arrive: ${summary.duration}</p>
                <p class="station-distance">${summary.distance}</p>
            </div>
        `;
        container.innerHTML+=elem;
    });
}