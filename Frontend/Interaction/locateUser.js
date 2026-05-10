import { getCoordinates,extractCoordinates } from "../MapScript/coordinates.js";
import { getGasStation } from "../Hooks/testGasStation.js";
import { gasFilter } from "../Hooks/testGasFilter.js";
import { mapGasData } from "../Data/GasData.js";
const btn = document.querySelector("button");

btn.addEventListener("click",async ()=>{
    await getCoordinates();

    console.log(extractCoordinates());
    const userData = extractCoordinates();
//    const data = await getGasStation(7.357986886112671,125.85786129773027);
    
    const data = await getGasStation(userData.lat,userData.lng);
    
    console.log(data);

    //const data2 = await gasFilter(7.357986886112671,125.85786129773027,data);
    
    const data2 = await gasFilter(userData.lat,userData.lng,data);

    console.log("Filtered Data");

    console.log(data2);
    
    //const data3=await mapGasData(data2.data,userData);

    console.log("Map Data");
    //console.log(data3);
});