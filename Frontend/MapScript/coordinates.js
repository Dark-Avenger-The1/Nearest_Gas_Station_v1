let currentCoordinates = null;

export function getCoordinates() {
    if (!navigator.geolocation) {
        return Promise.reject(new Error("Geolocation is not supported by this browser."));
    }

    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                localStorage.setItem("userCoordinates", JSON.stringify({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                }));
                loadCoordinatesFromStorage();
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

export function loadCoordinatesFromStorage() {
    const stored = localStorage.getItem("userCoordinates");
    if (!stored) {
       currentCoordinates = null;
       return null;
    }

    currentCoordinates = JSON.parse(stored);
    return currentCoordinates;
}

export function clearCoordinates(){
    currentCoordinates = null;
    localStorage.removeItem("userCoordinates");
}

export function clearCoordinatesReloadShortcut(){
    window.addEventListener("keydown", (event) =>{
        const isHardReload = 
        event.ctrlKey &&
        event.shiftKey &&
        event.key.toLowerCase === "r";

        if(isHardReload){
            clearCoordinates();
            console.log("Event hit");
        }
    });
}