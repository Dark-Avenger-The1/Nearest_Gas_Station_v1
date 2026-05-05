const fs = require("fs");
const path = require("path");

function loadEnv(filePath = path.resolve(__dirname, "..", ".env")) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const envLines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

    envLines.forEach((line) => {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith("#")) {
            return;
        }

        const separatorIndex = trimmedLine.indexOf("=");

        if (separatorIndex === -1) {
            return;
        }

        const key = trimmedLine.slice(0, separatorIndex).trim();
        const value = trimmedLine.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

        if (key && process.env[key] === undefined) {
            process.env[key] = value;
        }
    });
}

module.exports = { loadEnv };
