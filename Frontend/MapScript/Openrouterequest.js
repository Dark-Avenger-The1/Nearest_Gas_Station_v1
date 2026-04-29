const ORS_BASE_URL = "https://api.openrouteservice.org/v2/directions";
const DEFAULT_PROFILE = "driving-car";

function buildHeaders(apiKey) {
    return {
        "Authorization": apiKey,
        "Accept": "application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8",
        "Content-Type": "application/json; charset=utf-8"
    };
}


// mao ni ang mo build sa JSON body para sa OpenRouteService request, nagkuha siya og user coordinates ug station coordinates
function buildRouteBody(userCoordinates, stationCoordinates) {
    return {
        coordinates: [
            [userCoordinates.longitude, userCoordinates.latitude],
            [stationCoordinates.longitude, stationCoordinates.latitude]
        ],
        instructions: false
    };
}

// mao ni ang function nga mo request sa OpenRouteService API para sa usa ka route gikan sa user location ngadto sa station, gamit ang buildHeaders ug buildRouteBody functions
async function requestSingleRoute({ apiKey, userCoordinates, station, profile }) {
    const endpoint = `${ORS_BASE_URL}/${profile}/geojson`;
    const response = await fetch(endpoint, {
        method: "POST",
        headers: buildHeaders(apiKey),
        body: JSON.stringify(buildRouteBody(userCoordinates, station))
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouteService request failed (${response.status}): ${errorText}`);
    }

    const routeJson = await response.json();
    const summary = routeJson.features?.[0]?.properties?.summary ?? null;

    return {
        stationName: station.name ?? "Unknown Station",
        stationAddress: station.address ?? "No address provided",
        stationCoordinates: {
            latitude: station.latitude,
            longitude: station.longitude
        },
        distance: summary?.distance ?? null,
        duration: summary?.duration ?? null,
        route: routeJson
    };
}

// mao ni mo for loop sa listahan sa stations ug mo request og route para sa matag station gamit ang requestSingleRoute function, unya mo sort sa results base sa distance gikan sa user location ngadto sa station
export async function getRoutesToStations({
    apiKey,
    userCoordinates,
    stations,
    profile = DEFAULT_PROFILE
}) {
    if (!apiKey) {
        throw new Error("Missing OpenRouteService API key.");
    }

    if (userCoordinates?.latitude == null || userCoordinates?.longitude == null) {
        throw new Error("Missing user coordinates.");
    }

    if (!Array.isArray(stations) || stations.length === 0) {
        return [];
    }

    const requests = stations.map((station) =>
        requestSingleRoute({
            apiKey,
            userCoordinates,
            station,
            profile
        })
    );

    const routes = await Promise.all(requests);

    return routes.sort((first, second) => {
        const firstDistance = first.distance ?? Number.POSITIVE_INFINITY;
        const secondDistance = second.distance ?? Number.POSITIVE_INFINITY;
        return firstDistance - secondDistance;
    });
}
