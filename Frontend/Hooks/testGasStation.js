export async function getGasStation(lat, long){
    let request = {
        lat:lat,
        long:long
    };

    const query = `
            [out:json][timeout:25];
            (
            node["amenity"="fuel"](around:5000,${lat},${long});
            way["amenity"="fuel"](around:5000,${lat},${long});
            relation["amenity"="fuel"](around:5000,${lat},${long});
            );
            out center;
            `;

    const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);


    const responseData = await response.json();

    return responseData.elements;
} 