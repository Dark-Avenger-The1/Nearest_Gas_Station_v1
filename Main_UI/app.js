// Initialize the map — ang coordinates mag start kay sa um visayan
const map = L.map('map').setView([7.426401792405303, 125.79344414105464], 13);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

