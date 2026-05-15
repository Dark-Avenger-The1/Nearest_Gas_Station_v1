import { extractCoordinates, getCoordinates, loadCoordinatesFromStorage, clearCoordinatesReloadShortcut} from "../MapScript/coordinates.js";
import { getGasStation } from "../Hooks/testGasStation.js";
import { gasFilter } from "../Hooks/testGasFilter.js";
import { setCurrentLocation,extractCurrentLoc, ifUser} from "../MapScript/currentLocation.js";
import { pinCurrentLoc,pinGasStation } from "../MapScript/MapPin.js";
import { escapeHtml } from "../../Helper/UtilsHelper.js";
import GasStation from "../Data/GasData.js";
import { renderGasCards } from "../Render/RenderCards.js";
import { drawRoadRoute,clearRouteLine } from "../MapScript/MapDraw.js";
import { hideLoadingScreen, showLoadingScreen, updateLoadingScreen, waitForLoadingStep } from "./loadingscreen.js";

const defaultCenter = [7.426401792405303, 125.79344414105464];
const map = L.map("map").fitWorld();

const travelModeButtons = document.querySelectorAll(".travel-mode")
const locateButton = document.querySelector(".locate_user");
const btnFindGas = document.querySelector(".findGas");
const selectedStationPanel = document.querySelector("#selected-station");
let profile = "driving-car";

renderGasCards(null);

travelModeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        travelModeButtons.forEach((modeButton) => {
            modeButton.classList.remove("active");
        });
        profile = button.dataset.profile;
        console.log(profile);
        button.classList.add("active");
    });
});

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

locateButton.addEventListener("click",async()=>{
    try{
        locateButton.disabled = true;
        locateButton.innerText = "Locating...";
        await getCoordinates();
        setCurrentLocation(extractCoordinates(),true);
        console.log(extractCurrentLoc());
        pinCurrentLoc(extractCurrentLoc(),ifUser,map);
    }catch(err){
        alert(err.message);
    }finally{
        locateButton.disabled = false;
        locateButton.innerText = "Locate Me";
    }
});

btnFindGas.addEventListener("click",async()=>{
    try{
        btnFindGas.disabled=true;
        btnFindGas.innerText = "Finding...";
        let gasManage = new GasStation();
        const currentLoc = extractCurrentLoc();
        if(currentLoc===null) throw new Error("Press Locate Me or Search Location");

        showLoadingScreen("Fetching nearby gas stations...");
        const gasStations = await getGasStation(currentLoc.lat,currentLoc.lng);
        updateLoadingScreen(`${gasStations.length} gas stations fetched`);
        await waitForLoadingStep();
        updateLoadingScreen("Filtering gas stations...");
        const filteredGas = await gasFilter(currentLoc.lat,currentLoc.lng,gasStations);
        updateLoadingScreen(`${filteredGas.data.length} gas stations successfully filtered`, "Successfully filtered");
        await waitForLoadingStep();
        console.log(gasStations);
        console.log(filteredGas);
        
        console.log("Profile: "+profile)
        await gasManage.mapGasData(filteredGas.data,currentLoc,profile);
        await gasManage.loadFromStorage();
        const finalGas = gasManage.getAll();
        console.log(finalGas);
        pinGasStation(finalGas,currentLoc,map);
        renderGasCards(finalGas);
        clearRouteLine(map);    
        bindCardEvent();
    }catch(err){
        alert(err.message);
    }finally{
        hideLoadingScreen();
        btnFindGas.disabled=false;
        btnFindGas.innerText = "Find Gas";
    }
});

function bindCardEvent(){
    const cards = document.querySelectorAll(".gas-card");
    cards.forEach((card)=>{
        card.addEventListener("click",()=>{
            
            const id = card.dataset.id;
            const gasManage = new GasStation();
            gasManage.loadFromStorage();
            const gas = gasManage.extractGasDirection(Number(id));
            console.log(gas);
            drawRoadRoute(gas,map);
        });
    });
}

async function initialLoad(){
    //diri kay kada refresh dapat ang mapa naa gihapon sa specific destination sa mapa. dapat ang ctrl + shift + r ra reset
    const savedLocation = loadCoordinatesFromStorage();
    console.log("Local: "+savedLocation);
    if(savedLocation){
        setCurrentLocation(savedLocation, true);
        pinCurrentLoc(savedLocation,ifUser(),map);
        return;
    }

    map.setView(defaultCenter,15)
}

initialLoad();
clearCoordinatesReloadShortcut();

