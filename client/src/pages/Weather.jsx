import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Droplets,
  Wind,
  Sun,
  AlertTriangle,
  CloudRain,
  Sprout,
} from 'lucide-react';
import { Card, Button, Input, Select, EmptyState, Spinner } from '../components/ui';
import { useToast } from '../context/ToastContext';
import { getForecast } from '../api/weather';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
];

export default function Weather() {
  const toast = useToast();
  const [city, setCity] = useState('');
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setSearched(true);
    try {
      const result = await getForecast({ city: city.trim(), lang });
      setData(result);
    } catch (err) {
      const message = err.response?.data?.error || 'Could not fetch weather for this location.';
      toast.error(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const forecast = data?.forecast || [];
  const alerts = data?.alerts || [];
  const sowingDays = data?.optimalSowingDays || [];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22 }}>Weather Forecast</h2>
        <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>
          7-day forecast with rain alerts and optimal sowing suggestions.
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 26, flexWrap: 'wrap' }}>
        <label htmlFor="city-input" className="sr-only">City name</label>
        <Input
          id="city-input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="Enter city name (e.g. Nagpur)"
          style={{ maxWidth: 280 }}
        />
        <Select aria-label="Alert language" value={lang} onChange={(e) => setLang(e.target.value)} style={{ width: 130 }}>
          {LANGUAGES.map((l) => (
            <option key={l.code} value={l.code}>{l.label}</option>
          ))}
        </Select>
        <Button type="submit" icon={Search} loading={loading}>
          Get Forecast
        </Button>
      </form>

      {loading && <Spinner label="Fetching forecast..." />}

      {!loading && searched && forecast.length === 0 && (
        <EmptyState icon={CloudRain} title="No forecast available" description="Try searching for a different city." />
      )}

      {!loading && !searched && (
        <EmptyState icon={Sun} title="Search a city to see its forecast" description="Get a 7-day outlook with farming-specific alerts." />
      )}

      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
          {alerts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: 14,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(250, 204, 21, 0.1)',
                border: '1px solid rgba(250, 204, 21, 0.3)',
              }}
            >
              <AlertTriangle size={18} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13.5 }}>{a?.message || 'Weather alert'}</p>
            </motion.div>
          ))}
        </div>
      )}

      {sowingDays.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 15, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sprout size={16} style={{ color: 'var(--primary)' }} /> Optimal Sowing Days
          </h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {sowingDays.map((d) => (
              <span
                key={d}
                style={{
                  background: 'rgba(63,163,77,0.12)',
                  color: 'var(--primary)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                {d}
              </span>
            ))}
          </div>
        </Card>
      )}

      {forecast.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 16,
          }}
        >
          {forecast.map((day, i) => {
            const weather = Array.isArray(day?.weather) ? day.weather[0] : null;
            const dateLabel = day?.dt
              ? new Date(day.dt * 1000).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
              : `Day ${i + 1}`;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card padding={16} style={{ textAlign: 'center', height: '100%' }} animate={false}>
                  <p style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 6 }}>{dateLabel}</p>
                  {weather?.icon && (
                    <img
                      src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
                      alt={weather.description || 'weather icon'}
                      width={48}
                      height={48}
                      style={{ margin: '0 auto' }}
                    />
                  )}
                  <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', margin: '4px 0' }}>
                    {day?.temp?.day != null ? `${Math.round(day.temp.day)}°C` : '—'}
                  </p>
                  <p style={{ fontSize: 12.5, color: 'var(--muted)', marginBottom: 10, textTransform: 'capitalize' }}>
                    {weather?.description || 'No description'}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 11.5, color: 'var(--muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Droplets size={12} /> {day?.humidity != null ? `${day.humidity}%` : '—'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Wind size={12} /> {day?.wind_speed != null ? `${day.wind_speed} m/s` : '—'}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <CloudRain size={12} /> {day?.rain != null ? `${day.rain}mm` : '0mm'}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
