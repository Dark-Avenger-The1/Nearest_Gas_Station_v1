export function extractRouteSummary(GeoLoc){
    console.log("Extract Method: ");
    console.log(GeoLoc);
    const feature = GeoLoc?.features?.[0];
    const summary = feature?.properties?.summary;
    const distance = (summary.distance>=1000)?`${(summary.distance/1000).toFixed(2)} kilometers away`:`${summary.distance} meters away`;
    const duration = (summary.duration>=60)?`${Math.floor(summary.duration/60)} mins`:`${summary.duration} secs`;

    const result = {
        distance:distance,
        duration:duration
    }
    return result;
}