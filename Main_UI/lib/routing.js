export function extractRouteSummary(routeGeoJson) {
    const feature = routeGeoJson?.features?.[0];
    const summary = feature?.properties?.summary;

    if (summary && typeof summary.distance === "number") {
        return {
            distanceMeters: summary.distance,
            durationSeconds: typeof summary.duration === "number" ? summary.duration : null
        };
    }

    const segments = feature?.properties?.segments;
    if (Array.isArray(segments) && segments.length > 0) {
        const distanceMeters = segments.reduce((total, segment) => {
            return total + (typeof segment?.distance === "number" ? segment.distance : 0);
        }, 0);

        const durationSeconds = segments.reduce((total, segment) => {
            return total + (typeof segment?.duration === "number" ? segment.duration : 0);
        }, 0);

        if (distanceMeters > 0) {
            return {
                distanceMeters,
                durationSeconds: durationSeconds > 0 ? durationSeconds : null
            };
        }
    }

    return null;
}
