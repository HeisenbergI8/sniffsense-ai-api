import axios from "axios";
import { WeatherTag } from "../enums/weather-tag.enum";

type GeoResponse = Array<{
  lat: number;
  lon: number;
}>;

type OneCallResponse3 = { current?: { temp?: number } };
type OneCallResponse25 = { current?: { temp?: number } };
type CurrentWeatherResponse25 = { main?: { temp?: number } };

export async function geocodeCity(
  city: string,
  state?: string,
  country?: string,
  apiKey = process.env.OPENWEATHER_API_KEY
) {
  if (!apiKey) throw new Error("Missing OPENWEATHER_API_KEY");
  const q = [city, state, country].filter(Boolean).join(",");
  const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=1&appid=${apiKey}`;
  const { data } = await axios.get<GeoResponse>(url);
  const first = data?.[0];
  if (!first) throw new Error("Location not found");
  return { lat: first.lat, lon: first.lon };
}

export async function getCurrentTempC(
  lat: number,
  lon: number,
  apiKey = process.env.OPENWEATHER_API_KEY
) {
  if (!apiKey) throw new Error("Missing OPENWEATHER_API_KEY");
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
  ] as const;

  for (const attempt of urls) {
    try {
      const { data } = await axios.get(attempt.url);
      if (attempt.kind === "onecall3") {
        const temp = (data as OneCallResponse3)?.current?.temp;
        if (typeof temp === "number") return temp;
      } else if (attempt.kind === "onecall25") {
        const temp = (data as OneCallResponse25)?.current?.temp;
        if (typeof temp === "number") return temp;
      } else {
        const temp = (data as CurrentWeatherResponse25)?.main?.temp;
        if (typeof temp === "number") return temp;
      }
    } catch (err: any) {
      // If unauthorized or not available, continue to next endpoint
      const status = err?.response?.status;
      console.warn(
        `Weather request failed (${attempt.kind}):`,
        status ?? err?.message
      );
      continue;
    }
  }

  throw new Error("Weather data unavailable");
}

// Returns primary temperature tag and optional humidity-based tag
export function mapToWeatherTags(
  tempC: number,
  humidityPercent?: number
): { primary: "hot" | "cold" | "all_season"; secondary?: "humid" | "dry" } {
  // Temperature thresholds aligned to comfort ranges
  // >= 30°C → hot, <= 10°C → cold, else all_season
  const primary: "hot" | "cold" | "all_season" =
    tempC >= 30
      ? WeatherTag.HOT
      : tempC <= 22
        ? WeatherTag.COLD
        : WeatherTag.ALL_SEASON;

  let secondary: "humid" | "dry" | undefined;
  if (typeof humidityPercent === "number") {
    // Humidity thresholds
    // >= 70% → humid, <= 35% → dry, else undefined
    if (humidityPercent >= 70) secondary = WeatherTag.HUMID;
    else if (humidityPercent <= 35) secondary = WeatherTag.DRY;
  }

  return { primary, secondary };
}
