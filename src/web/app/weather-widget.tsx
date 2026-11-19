'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Weather } from './api/weather/route';

type State =
  | { status: 'idle' }
  | { status: 'locating' }
  | { status: 'loading' }
  | { status: 'ready'; weather: Weather }
  | { status: 'error'; message: string };

// WMO weather interpretation codes → label + emoji
function describe(code: number, isDay: boolean): { label: string; icon: string } {
  if (code === 0) return { label: 'Clear sky', icon: isDay ? '☀️' : '🌙' };
  if (code <= 2) return { label: 'Partly cloudy', icon: isDay ? '⛅' : '☁️' };
  if (code === 3) return { label: 'Overcast', icon: '☁️' };
  if (code <= 48) return { label: 'Fog', icon: '🌫️' };
  if (code <= 57) return { label: 'Drizzle', icon: '🌦️' };
  if (code <= 67) return { label: 'Rain', icon: '🌧️' };
  if (code <= 77) return { label: 'Snow', icon: '🌨️' };
  if (code <= 82) return { label: 'Rain showers', icon: '🌦️' };
  if (code <= 86) return { label: 'Snow showers', icon: '🌨️' };
  return { label: 'Thunderstorm', icon: '⛈️' };
}

function prefersImperial(): boolean {
  const region = new Intl.Locale(navigator.language).maximize().region;
  return region === 'US' || region === 'LR' || region === 'MM';
}

const cardClass =
  'mb-8 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-3';
const buttonClass =
  'rounded-lg bg-zinc-900 dark:bg-zinc-50 px-4 py-1.5 text-sm font-medium text-white dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500';

export default function WeatherWidget() {
  const [state, setState] = useState<State>({ status: 'idle' });

  const locate = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setState({ status: 'error', message: 'Location is not supported by this browser.' });
      return;
    }
    setState({ status: 'locating' });
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        setState({ status: 'loading' });
        try {
          const qs = new URLSearchParams({
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            units: prefersImperial() ? 'imperial' : 'metric',
          });
          const res = await fetch(`/api/weather?${qs}`);
          if (!res.ok) throw new Error();
          setState({ status: 'ready', weather: await res.json() });
        } catch {
          setState({ status: 'error', message: 'Could not load the weather. Try again later.' });
        }
      },
      (err) => {
        setState({
          status: 'error',
          message:
            err.code === err.PERMISSION_DENIED
              ? 'Location access was denied. Allow it to see local weather.'
              : 'Could not determine your location.',
        });
      },
      { maximumAge: 10 * 60 * 1000, timeout: 10_000 },
    );
  }, []);

  // Auto-load only if the user has already granted location permission;
  // otherwise wait for an explicit click instead of prompting on page load.
  useEffect(() => {
    navigator.permissions
      ?.query({ name: 'geolocation' })
      .then((p) => {
        if (p.state === 'granted') locate();
      })
      .catch(() => {});
  }, [locate]);

  return (
    <section aria-label="Current weather" aria-live="polite" className={cardClass}>
      {state.status === 'idle' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            See the current weather where you are.
          </p>
          <button type="button" onClick={locate} className={buttonClass}>
            Use my location
          </button>
        </div>
      )}

      {(state.status === 'locating' || state.status === 'loading') && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400 py-1.5">
          {state.status === 'locating' ? 'Finding your location…' : 'Loading weather…'}
        </p>
      )}

      {state.status === 'error' && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{state.message}</p>
          <button type="button" onClick={locate} className={buttonClass}>
            Retry
          </button>
        </div>
      )}

      {state.status === 'ready' && <WeatherDetails weather={state.weather} onRefresh={locate} />}
    </section>
  );
}

function WeatherDetails({ weather, onRefresh }: { weather: Weather; onRefresh: () => void }) {
  const { label, icon } = describe(weather.weatherCode, weather.isDay);
  const t = (n: number) => `${Math.round(n)}${weather.units.temperature}`;

  return (
    <div className="flex items-center gap-4">
      <span className="text-4xl leading-none" aria-hidden="true">
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
          {t(weather.temperature)}
          <span className="ml-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</span>
        </p>
        <p className="text-xs text-zinc-400">
          Feels like {t(weather.apparentTemperature)} · Humidity {Math.round(weather.humidity)}% ·
          Wind {Math.round(weather.windSpeed)} {weather.units.windSpeed}
        </p>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        aria-label="Refresh weather"
        className="rounded-lg p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
        </svg>
      </button>
    </div>
  );
}
