export function toFiniteNumber(value) {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : null;
    }

    if (typeof value === "string") {
        const trimmed = value.trim();
        if (trimmed.length === 0) {
            return null;
        }

        const numberValue = Number(trimmed);
        return Number.isFinite(numberValue) ? numberValue : null;
    }

    return null;
}
