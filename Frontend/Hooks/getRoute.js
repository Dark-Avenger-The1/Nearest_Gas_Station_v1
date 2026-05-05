export async function getRoute(start, end, profile = "driving-car") {
    const response = await fetch("http://localhost:3000/api/route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            start,
            end,
            profile
        })
    });

    const responseData = await response.json();

    if (!response.ok) {
        throw new Error(responseData.message || "Failed to fetch route.");
    }

    return responseData.data;
}
