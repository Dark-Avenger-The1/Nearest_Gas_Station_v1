import { getRoute } from "../Hooks/HookRoute.js";

class GasStation {
    constructor() {
        this.gasStations = [];
        this.STORAGE_KEY = "gasStationData"; // ✅ key for localStorage
    }

    // ✅ Save to localStorage
    saveToStorage() {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.gasStations));
    }

    // ✅ Load from localStorage
    loadFromStorage() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if(stored) {
            this.gasStations = JSON.parse(stored);
            return true; // ✅ found cached data!
        }
        return false; // ❌ no cached data
    }

    // ✅ Clear localStorage
    clearStorage() {
        localStorage.removeItem(this.STORAGE_KEY);
        this.gasStations = [];
    }

    // ✅ Fetch routes and store
    async mapGasData(data, userData,profile) {
        const resArr = [];

        for(const val of data) {
            const start = userData;
            const end = (val.type === "node")
                ? { lat: val.lat, lng: val.lon }
                : { lat: val.center.lat, lng: val.center.lon };

            try {
                const response = await getRoute(start, end,profile);
                resArr.push({
                    id: val.id,
                    lat: end.lat,
                    lon: end.lng,
                    stationName: val.tags?.name || "Gas Station",
                    tags: val.tags,
                    type: val.type,
                    locData: response
                });
            } catch(error) {
                console.warn(`Route failed for station ${val.id}:`, error.message);
                resArr.push({
                    id: val.id,
                    lat: end.lat,
                    lon: end.lng,
                    stationName: val.tags?.name || "Gas Station",
                    tags: val.tags,
                    type: val.type,
                    locData: null
                });
            }
        }

        this.setGasStationData(resArr);
        this.saveToStorage(); // ✅ cache it!
        return resArr;
    }

    setGasStationData(data) {
        this.gasStations = data;
    }

    extractGasDirection(id) {
        const station = this.gasStations.find(s => s.id === id);
        return station?.locData || null;
    }

    getAll() {
        return this.gasStations;
    }

    getById(id) {
        return this.gasStations.find(s => s.id === id) || null;
    }
}

export default GasStation;