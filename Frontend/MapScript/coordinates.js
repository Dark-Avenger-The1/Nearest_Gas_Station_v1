let long =null;
let lati =null;



export async function getCoordinates(){
    if (navigator.geolocation) {
        console.log("loading....");
        await navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                
                lati = latitude;
                long = longitude;
                console.log("Latitude:", latitude);
                console.log("Longitude:", longitude);
            },
            (error) => {
                console.error("Error getting location:", error.message);
            }
        );
    } else {
        console.log("Geolocation is not supported by this browser.");
    }
}

export function extractCoordinates(){
    if(lati===null || long ===null){
        return null;
    }

    return {
        "latitude":lati,
        "longitude":long
    };
}