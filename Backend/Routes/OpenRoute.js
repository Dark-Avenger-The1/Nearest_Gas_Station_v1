const express = require("express");

const router = express.Router();

router.post("/route", async (req, res) => {
    const { start, end, profile = "driving-car" } = req.body;

    if (!process.env.ORS_API_KEY) {
        return res.status(500).json({
            status: "failed",
            message: "Missing ORS_API_KEY in the server environment."
        });
    }

    if (!start || !end || typeof start.lat !== "number" || typeof start.lng !== "number" || typeof end.lat !== "number" || typeof end.lng !== "number") {
        return res.status(400).json({
            status: "failed",
            message: "Both start and end coordinates are required."
        });
    }

    try {
        const orsResponse = await fetch(`https://api.openrouteservice.org/v2/directions/${profile}/geojson`, {
            method: "POST",
            headers: {
                "Authorization": process.env.ORS_API_KEY,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                coordinates: [
                    [start.lng, start.lat],
                    [end.lng, end.lat]
                ]
            })
        });

        const rawBody = await orsResponse.text();
        const parsedBody = rawBody ? JSON.parse(rawBody) : null;

        if (!orsResponse.ok) {
            return res.status(orsResponse.status).json({
                status: "failed",
                message: "OpenRouteService request failed.",
                details: parsedBody
            });
        }

        return res.json({
            status: "success",
            message: "Route fetched successfully.",
            data: parsedBody
        });
    } catch (error) {
        return res.status(500).json({
            status: "failed",
            message: error.message
        });
    }
});

module.exports = router;
