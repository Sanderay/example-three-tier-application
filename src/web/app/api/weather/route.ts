import type { NextRequest } from 'next/server';

// Open-Meteo needs no API key. Override via env var (e.g. for a proxy or mock).
const WEATHER_API_URL =
  process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast';

export type Weather = {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  isDay: boolean;
  units: { temperature: string; windSpeed: string };
};

function parseCoord(value: string | null, limit: number): number | null {
  if (value === null || value.trim() === '') return null;
  const n = Number(value);
  return Number.isFinite(n) && Math.abs(n) <= limit ? n : null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseCoord(params.get('lat'), 90);
  const lon = parseCoord(params.get('lon'), 180);
  if (lat === null || lon === null) {
    return Response.json({ error: 'Invalid or missing lat/lon' }, { status: 400 });
  }
  const fahrenheit = params.get('units') === 'imperial';

  const url = new URL(WEATHER_API_URL);
  url.searchParams.set('latitude', lat.toFixed(4));
  url.searchParams.set('longitude', lon.toFixed(4));
  url.searchParams.set(
    'current',
    'temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,is_day',
  );
  if (fahrenheit) {
    url.searchParams.set('temperature_unit', 'fahrenheit');
    url.searchParams.set('wind_speed_unit', 'mph');
  }

  try {
    const res = await fetch(url, { next: { revalidate: 600 } });
    if (!res.ok) throw new Error(`Upstream responded ${res.status}`);
    const data = await res.json();
    const c = data.current;
    const u = data.current_units ?? {};
    const weather: Weather = {
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      weatherCode: c.weather_code,
      isDay: c.is_day === 1,
      units: {
        temperature: u.temperature_2m ?? (fahrenheit ? '°F' : '°C'),
        windSpeed: u.wind_speed_10m ?? (fahrenheit ? 'mph' : 'km/h'),
      },
    };
    return Response.json(weather);
  } catch (err) {
    console.error('Weather fetch failed:', err);
    return Response.json({ error: 'Weather service unavailable' }, { status: 502 });
  }
}
