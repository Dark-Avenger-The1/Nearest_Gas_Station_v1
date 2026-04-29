import { getCoordinates } from "../MapScript/coordinates.js";
import { getGasStation } from "../Hooks/testGasStation.js";

const btn = document.querySelector("button");

btn.addEventListener("click",async ()=>{
    await getCoordinates();

    const data = await getGasStation(7.357986886112671,125.85786129773027);

    console.log(data);
});