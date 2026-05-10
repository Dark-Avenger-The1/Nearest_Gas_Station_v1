import { extractCoordinates, getCoordinates } from "../MapScript/coordinates.js";
import { getGasStation } from "../Hooks/testGasStation.js";
import { gasFilter } from "../Hooks/testGasFilter.js";
import { setCurrentLocation,extractCurrentLoc, ifUser} from "../MapScript/currentLocation.js";
import { pinCurrentLoc,pinGasStation } from "../MapScript/MapPin.js";
import { escapeHtml } from "../../Helper/UtilsHelper.js";
import GasStation from "../Data/GasData.js";

const defaultCenter = [7.426401792405303, 125.79344414105464];
const map = L.map("map").fitWorld();


const locateButton = document.querySelector(".locate_user");
const btnFindGas = document.querySelector(".findGas");
const selectedStationPanel = document.querySelector("#selected-station");

// let userMarker = null;
// let stationMarkers = [];
// let routeLine = null;

//let currentUserCoordinates = null;
// let currentStations = [];
// let selectedStationIndex = null;
// let routeRequestId = 0;
// let selectedRouteSummary = null;


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

        const gasStations = await getGasStation(currentLoc.lat,currentLoc.lng);
        const filteredGas = await gasFilter(currentLoc.lat,currentLoc.lng,gasStations);
        console.log(gasStations);
        console.log(filteredGas);
        //gasManage.mapGasData(filteredGas.data,currentLoc);
        gasManage.loadFromStorage();
        const finalGas = gasManage.getAll();
        console.log(finalGas);
        pinGasStation(finalGas,currentLoc,map);
    }catch(err){
        const msg = (extractCurrentLoc()===null)?"Press Locate Me or Search Location":err.message;
        alert(msg);
    }finally{
        btnFindGas.disabled=false;
        btnFindGas.innerText = "Find Near Gas";
    }
});









