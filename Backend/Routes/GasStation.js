

const express = require("express");
const router = express.Router();
const API = require("../../Helper/LocalAPI.js");


router.post("/GasStation",async (req,res)=>{
  try{
    const rad = 5000;
    const query = `[out:json];node(around:${rad},${req.body.lat},${req.body.long})["amenity"="fuel"];out body;`;

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);

    
    console.log("📩 Overpass status:", response.status);      // ADD
    console.log("📩 Overpass ok?:", response.ok);             // ADD

    const rawText = await response.text();                     // ADD - read as text first
    console.log("📩 Raw Overpass response:", rawText.slice(0, 300)); // ADD - first 300 chars

    const responseData = JSON.parse(rawText);   

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


