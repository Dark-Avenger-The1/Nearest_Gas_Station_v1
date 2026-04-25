//const axios = require('axios');
import { json } from 'body-parser';
import { API } from '../../Helper/LocalAPI.js';
const express = require('express');
const app = express();
const router = express.Router();
const API = require()
router.post("/GasStation",async (req,res)=>{
  const rad = 5000;
  let query=`
    node(around:${rad}, ${req.body.lat}, ${req.body.long})["amenity"="fuel"]; out;
  `;

  const response = await fetch(API.OverPass,{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:'data='+encodeURIComponent(query)
  });

  const responseData = response.json();

  return responseData;
})



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

