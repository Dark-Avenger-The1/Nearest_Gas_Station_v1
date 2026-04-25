import { getCoordinates } from "../MapScript/coordinates.js";

const btn = document.querySelector("button");

btn.addEventListener("click",()=>{
    getCoordinates();
});