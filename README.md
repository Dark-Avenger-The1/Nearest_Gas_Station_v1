# FuelFinder Route Map

Small web map that finds the nearest gas station based on the shortest driving route from the user's current location.

## APIs used

- `Leaflet` for the interactive web map UI
- `OpenStreetMap` tiles for the basemap
- `Overpass API` to search for nearby places tagged as fuel stations
- `OSRM` to compare driving distances and draw the final shortest route
- Browser `Geolocation API` for the user's current position

## Run

Because browser geolocation usually requires a secure origin, open this app through `localhost` instead of double-clicking the HTML file.

Example with Python:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Files

- `index.html` - app layout
- `styles.scss` - SCSS source
- `styles.css` - compiled stylesheet used by the page
- `app.js` - map logic, station lookup, route comparison, and rendering
