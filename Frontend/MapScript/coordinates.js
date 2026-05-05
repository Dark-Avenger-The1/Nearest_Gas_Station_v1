let currentCoordinates = null;

export function getCoordinates() {
    if (!navigator.geolocation) {
        return Promise.reject(new Error("Geolocation is not supported by this browser."));
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                currentCoordinates = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };

                resolve(currentCoordinates);
            },
            (error) => {
                reject(new Error(error.message));
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

export function extractCoordinates() {
    return currentCoordinates;
}


// old code

// let long =null;
// let lati =null;


// // mao ni ang function nga mo request sa geolocation API sa browser para makuha ang current location sa user, unya mo store sa latitude ug longitude sa global variables nga long ug lati
// export async function getCoordinates(){
//     if (navigator.geolocation) {
//         console.log("loading....");
//         await navigator.geolocation.getCurrentPosition(
//             (position) => {
//                 const latitude = position.coords.latitude;
//                 const longitude = position.coords.longitude;
                
//                 lati = latitude;
//                 long = longitude;
//                 console.log("Latitude:", latitude);
//                 console.log("Longitude:", longitude);
//             },
//             (error) => {
//                 console.error("Error getting location:", error.message);
//             }
//         );
//     } else {
//         console.log("Geolocation is not supported by this browser.");
//     }
// }

// // mao ni ang function nga mo extract sa latitude ug longitude gikan sa getCoordinates function, unya mo return og object nga naay latitude ug longitude properties
// export function extractCoordinates(){
//     if(lati===null || long ===null){
//         return null;
//     }

//     return {
//         "latitude":lati,
//         "longitude":long
//     };
// }