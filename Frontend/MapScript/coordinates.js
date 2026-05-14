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