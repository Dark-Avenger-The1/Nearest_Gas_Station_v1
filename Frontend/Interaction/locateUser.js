import { getCoordinates,extractCoordinates } from "../MapScript/coordinates.js";
import { getGasStation } from "../Hooks/testGasStation.js";
import { gasFilter } from "../Hooks/testGasFilter.js";
import { mapGasData } from "../Data/GasData.js";
const btn = document.querySelector("button");

btn.addEventListener("click",async ()=>{
    await getCoordinates();

    console.log(extractCoordinates());
    const userData = extractCoordinates();

    
    const data = await getGasStation(userData.lat,userData.lng);
    
    console.log(data);

    
    const data2 = await gasFilter(userData.lat,userData.lng,data);

    console.log("Filtered Data");

    console.log(data2);
    
   
    console.log("Map Data");
});