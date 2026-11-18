'use client';

import { useEffect, useState } from 'react';

interface WeatherData {
  temperature: number;
  description: string;
  location: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}

type WeatherState = 
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'success'; data: WeatherData };

export default function WeatherWidget() {
  const [weatherState, setWeatherState] = useState<WeatherState>({ status: 'loading' });

  useEffect(() => {
    if (!navigator.geolocation) {
      setWeatherState({
        status: 'error',
        message: 'Geolocation is not supported by your browser',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Using OpenWeatherMap's free API
          // In production, this API key should be in an environment variable
          const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY || 'demo';
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`
          );
          
          if (!response.ok) {
            throw new Error('Failed to fetch weather data');
          }
          
          const data = await response.json();
          
          setWeatherState({
            status: 'success',
            data: {
              temperature: Math.round(data.main.temp),
              description: data.weather[0].description,
              location: data.name,
              icon: data.weather[0].icon,
              humidity: data.main.humidity,
              windSpeed: data.wind.speed,
            },
          });
        } catch (error) {
          setWeatherState({
            status: 'error',
            message: 'Failed to fetch weather data. Please try again later.',
          });
        }
      },
      (error) => {
        let message = 'Unable to retrieve your location';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied. Please enable location in your browser settings.';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out.';
            break;
        }
        
        setWeatherState({
          status: 'error',
          message,
        });
      }
    );
  }, []);

  if (weatherState.status === 'loading') {
    return (
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-zinc-300 dark:border-zinc-600 border-t-zinc-900 dark:border-t-zinc-50 rounded-full"></div>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center mt-4">
          Getting your location...
        </p>
      </div>
    );
  }

  if (weatherState.status === 'error') {
    return (
      <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 className="font-semibold text-red-900 dark:text-red-100">Weather Unavailable</h3>
        </div>
        <p className="text-sm text-red-700 dark:text-red-300">
          {weatherState.message}
        </p>
      </div>
    );
  }

  const { data } = weatherState;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-zinc-600 dark:text-zinc-300 mb-1">
            Current Weather
          </h3>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">
            {data.location}
          </p>
          <div className="flex items-center gap-2">
            <img 
              src={`https://openweathermap.org/img/wn/${data.icon}@2x.png`}
              alt={data.description}
              className="w-16 h-16"
            />
            <div>
              <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                {data.temperature}°C
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-300 capitalize">
                {data.description}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-700 flex gap-6">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.5 2a.5.5 0 000 1h9a.5.5 0 000-1h-9zM3 5.5A1.5 1.5 0 014.5 4h11A1.5 1.5 0 0117 5.5v9a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 14.5v-9z" clipRule="evenodd" />
          </svg>
          <span className="text-sm text-zinc-700 dark:text-zinc-200">
            {data.humidity}% humidity
          </span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
          <span className="text-sm text-zinc-700 dark:text-zinc-200">
            {data.windSpeed} m/s wind
          </span>
        </div>
      </div>
    </div>
  );
}
