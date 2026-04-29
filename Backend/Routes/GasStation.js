//const axios = require('axios');

const express = require("express");
const router = express.Router();
const API = require("../../Helper/LocalAPI.js");

console.log("API object:", API);
router.post("/GasStation",async (req,res)=>{
  console.log("✅ Route was hit!"); // ADD THIS
  console.log("Body received:", req.body); // ADD THIS
  try{
    const rad = 5000;
    const query = `[out:json];node(around:${rad},${req.body.lat},${req.body.long})["amenity"="fuel"];out body;`;

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);

    //
    console.log("📩 Overpass status:", response.status);      // ADD
    console.log("📩 Overpass ok?:", response.ok);             // ADD

    const rawText = await response.text();                     // ADD - read as text first
    console.log("📩 Raw Overpass response:", rawText.slice(0, 300)); // ADD - first 300 chars

    const responseData = JSON.parse(rawText);   

    //const responseData = await response.json();
    let feedback = {
      status:"success",
      message:`Successfuly Fetched Gas Station in ${rad}m radius.`,
      data:responseData.elements
    };
    res.json(feedback);     
  }catch(error){
    let feedback = {
      status:"failed",
      message:`Something went wrong. Error Code: ${error.message}`
    }

    res.status(500).json(feedback);
  }
})

module.exports = router;


/*
async function getGasStations(lat, lon, radiusMeters = 5000) {
  // Overpass QL query - finds all fuel/gas stations within radius
  const query = `
    [out:json];
    node["amenity"="fuel"](around:${radiusMeters},${lat},${lon});
    out body;
  `;

  const response = await axios.post(
    'https://overpass-api.de/api/interpreter',
    `data=${encodeURIComponent(query)}`,
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return response.data.elements; // array of gas station nodes
}*/

