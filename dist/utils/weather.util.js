"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.geocodeCity = geocodeCity;
exports.getCurrentTempC = getCurrentTempC;
exports.mapToWeatherTags = mapToWeatherTags;
const axios_1 = __importDefault(require("axios"));
const weather_tag_enum_1 = require("../enums/weather-tag.enum");
async function geocodeCity(city, state, country, apiKey = process.env.OPENWEATHER_API_KEY) {
    if (!apiKey)
        throw new Error("Missing OPENWEATHER_API_KEY");
    const q = [city, state, country].filter(Boolean).join(",");
    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${apiKey}`;
    const { data } = await axios_1.default.get(url);
    const first = data?.[0];
    if (!first)
        throw new Error("Location not found");
    return { lat: first.lat, lon: first.lon };
}
async function getCurrentTempC(lat, lon, apiKey = process.env.OPENWEATHER_API_KEY) {
    if (!apiKey)
        throw new Error("Missing OPENWEATHER_API_KEY");
    // Try One Call 3.0 first, then 2.5, then current weather 2.5
    const urls = [
        {
            url: `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
            kind: "onecall3",
        },
        {
            url: `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
            kind: "onecall25",
        },
        {
            url: `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`,
            kind: "weather25",
        },
    ];
    for (const attempt of urls) {
        try {
            const { data } = await axios_1.default.get(attempt.url);
            if (attempt.kind === "onecall3") {
                const temp = data?.current?.temp;
                if (typeof temp === "number")
                    return temp;
            }
            else if (attempt.kind === "onecall25") {
                const temp = data?.current?.temp;
                if (typeof temp === "number")
                    return temp;
            }
            else {
                const temp = data?.main?.temp;
                if (typeof temp === "number")
                    return temp;
            }
        }
        catch (err) {
            // If unauthorized or not available, continue to next endpoint
            const status = err?.response?.status;
            console.warn(`Weather request failed (${attempt.kind}):`, status ?? err?.message);
            continue;
        }
    }
    throw new Error("Weather data unavailable");
}
// Returns primary temperature tag and optional humidity-based tag
function mapToWeatherTags(tempC, humidityPercent) {
    // Temperature thresholds aligned to comfort ranges
    // >= 30°C → hot, <= 10°C → cold, else all_season
    const primary = tempC >= 30
        ? weather_tag_enum_1.WeatherTag.HOT
        : tempC <= 22
            ? weather_tag_enum_1.WeatherTag.COLD
            : weather_tag_enum_1.WeatherTag.ALL_SEASON;
    let secondary;
    if (typeof humidityPercent === "number") {
        // Humidity thresholds
        // >= 70% → humid, <= 35% → dry, else undefined
        if (humidityPercent >= 70)
            secondary = weather_tag_enum_1.WeatherTag.HUMID;
        else if (humidityPercent <= 35)
            secondary = weather_tag_enum_1.WeatherTag.DRY;
    }
    return { primary, secondary };
}
