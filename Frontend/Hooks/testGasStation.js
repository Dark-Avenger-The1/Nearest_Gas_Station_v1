export async function getGasStation(lat, long){
    let request = {
        lat:lat,
        long:long
    };

    //const query = `[out:json];node(around:${5000},${lat},${long})["amenity"="fuel"];out body;`;
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
    /**
     const response = await fetch("http://localhost:3000/api/GasStation",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(request)
    });
     */


    const responseData = await response.json();

    return responseData.elements;
} 