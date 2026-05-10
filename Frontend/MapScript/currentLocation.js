let currentLocation = null;
let ifUserLoc = false;

export function setCurrentLocation(loc,type){
    currentLocation = loc;
    ifUserLoc = type;
}

export function ifUser(){
    return ifUserLoc;
}

export function extractCurrentLoc(){
    return currentLocation;
}