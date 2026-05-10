import { escapeHtml } from "../../Helper/UtilsHelper.js";

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
    }

    data.forEach((val)=>{
        const elem = `
            <div class="gas-station">
                <h3 class="station-name">${escapeHtml(val.stationName)}</h3>
                <p class="station-address"></p>
                <p class="station-distance">2.0 miles away</p>
            </div>
        `;
        container.innerHTML+=elem;
    });
}