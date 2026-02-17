import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import {
  fetchWeatherData,
  cityLocations,
  getWeatherType,
  getWeatherDescription,
  getWindDirection,
  getUVLevel,
  formatTime,
  getDayOfWeek,
  searchLocation,
  type OpenMeteoResponse,
  type CityLocation,
} from "@/services/weatherApi";
import type {
  WeatherData,
  HourlyForecast as HourlyForecastType,
  DailyForecast as DailyForecastType,
} from "@/data/weatherData";

import { WeatherIcon } from "@/components/WeatherIcon";
import WeatherMap from "@/components/WeatherMap";
import AmedasMap from "@/components/AmedasMap";

// =============================
// タブの種類
// =============================
type TabType = "today" | "hourly" | "daily" | "radar" | "amedas";

// =============================
// APIレスポンス → UI用データ変換
// =============================

function transformApiData(apiData: OpenMeteoResponse, location: CityLocation): WeatherData {
  const now = new Date();
  const currentHour = now.getHours();

  const hourlyStartIndex = apiData.hourly.time.findIndex((t) => {
    const date = new Date(t);
    return date.getHours() === currentHour && date.getDate() === now.getDate();
  });

  const hourlyForecast: HourlyForecastType[] = [];
  for (let i = 0; i < 24; i++) {
    const idx = hourlyStartIndex + i;
    if (idx < apiData.hourly.time.length && idx >= 0) {
      hourlyForecast.push({
        time: i === 0 ? "今" : formatTime(apiData.hourly.time[idx]),
        temp: Math.round(apiData.hourly.temperature_2m[idx]),
        weather: getWeatherType(apiData.hourly.weather_code[idx]),
        precipitation: apiData.hourly.precipitation_probability[idx] || 0,
        humidity: apiData.hourly.relative_humidity_2m[idx],
        windSpeed: Math.round(apiData.hourly.wind_speed_10m[idx]),
      });
    }
  }

  const dailyForecast: DailyForecastType[] = apiData.daily.time.map((time, index) => {
    const { day, date } = getDayOfWeek(time, index);
    return {
      day,
      date,
      high: Math.round(apiData.daily.temperature_2m_max[index]),
      low: Math.round(apiData.daily.temperature_2m_min[index]),
      weather: getWeatherType(apiData.daily.weather_code[index]),
      precipitation: apiData.daily.precipitation_probability_max[index] || 0,
      humidity: 60,
    };
  });

  let todayHigh = Math.round(apiData.daily.temperature_2m_max[0]);
  let todayLow = Math.round(apiData.daily.temperature_2m_min[0]);
  try {
    const todayDateStr = apiData.daily.time[0]?.split("T")[0];
    if (todayDateStr) {
      const todayTemps: number[] = [];
      apiData.hourly.time.forEach((t, idx) => {
        if (t.startsWith(todayDateStr)) {
          const temp = apiData.hourly.temperature_2m[idx];
          if (typeof temp === "number" && !Number.isNaN(temp)) todayTemps.push(temp);
        }
      });
      if (todayTemps.length > 0) {
        todayHigh = Math.round(Math.max(...todayTemps));
        todayLow = Math.round(Math.min(...todayTemps));
      }
    }
  } catch (e) {
    console.warn("Failed to refine today high/low from hourly data", e);
  }

  const formatSunTime = (isoString: string) => {
    const date = new Date(isoString);
    return `${date.getHours()}:${String(date.getMinutes()).padStart(2, "0")}`;
  };

  const alerts: string[] = [];
  if (apiData.daily.precipitation_probability_max[0] > 70) alerts.push("雨の可能性が高い");
  if (apiData.current.uv_index >= 8) alerts.push("UV非常に強い");
  if (apiData.current.temperature_2m >= 35) alerts.push("猛暑日");

  if (apiData.alerts && apiData.alerts.length > 0) {
    for (const a of apiData.alerts) {
      if (a.headline) alerts.push(a.headline);
    }
  }

  const baseAirQuality = { aqi: 42, level: "良好", pm25: 15, pm10: 28, o3: 45, no2: 18 };
  let airQuality = baseAirQuality;
  if (apiData.air_quality) {
    const pm25 = apiData.air_quality.pm25 ?? baseAirQuality.pm25;
    const pm10 = apiData.air_quality.pm10 ?? baseAirQuality.pm10;
    const o3 = apiData.air_quality.o3 ?? baseAirQuality.o3;
    const no2 = apiData.air_quality.no2 ?? baseAirQuality.no2;

    let aqi = Math.round(pm25);
    let level = "良好";
    if (aqi > 100) level = "やや悪い";
    if (aqi > 150) level = "注意";
    if (aqi > 200) level = "非常に悪い";

    airQuality = { aqi, level, pm25, pm10, o3, no2 };
  }

  return {
    location: location.name,
    currentTemp: Math.round(apiData.current.temperature_2m),
    feelsLike: Math.round(apiData.current.apparent_temperature),
    weather: getWeatherType(apiData.current.weather_code),
    description: getWeatherDescription(apiData.current.weather_code),
    high: todayHigh,
    low: todayLow,
    humidity: apiData.current.relative_humidity_2m,
    pressure: Math.round(apiData.current.surface_pressure),
    visibility: 16,
    windSpeed: Math.round(apiData.current.wind_speed_10m),
    windDirection: getWindDirection(apiData.current.wind_direction_10m),
    uvIndex: {
      current: Math.round(apiData.current.uv_index),
      max: Math.round(apiData.daily.uv_index_max[0]),
      level: getUVLevel(apiData.current.uv_index),
    },
    sunrise: formatSunTime(apiData.daily.sunrise[0]),
    sunset: formatSunTime(apiData.daily.sunset[0]),
    moonPhase: "上弦の月",
    airQuality,
    pollen: { cedar: "low", cypress: "medium", grass: "none" },
    hourlyForecast,
    dailyForecast,
    alerts,
    lastUpdated: `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`,
  };
}

// =============================
// メインコンポーネント
// =============================

export function App() {
  const [selectedLocation, setSelectedLocation] = useState<CityLocation>(cityLocations[0]);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>("today");

  const loadWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      const apiData = await fetchWeatherData(selectedLocation, "weatherapi");
      const transformedData = transformApiData(apiData, selectedLocation);
      setWeatherData(transformedData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedLocation]);

  useEffect(() => {
    loadWeatherData();
    const interval = setInterval(loadWeatherData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [loadWeatherData]);

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearchLoading(true);
    setSearchError(null);
    try {
      const loc = await searchLocation(searchQuery.trim());
      setSelectedLocation(loc);
      setSearchQuery("");
      setActiveTab("today");
    } catch (err) {
      console.error(err);
      setSearchError("場所が見つかりませんでした");
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">天気データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!weatherData) return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "today", label: "今日", icon: "☀️" },
    { id: "hourly", label: "時間別", icon: "🕐" },
    { id: "daily", label: "週間", icon: "📅" },
    { id: "radar", label: "雨雲", icon: "🌧️" },
    { id: "amedas", label: "観測", icon: "📍" },
  ];

  const maxTemp = Math.max(...weatherData.dailyForecast.map((d) => d.high));
  const minTemp = Math.min(...weatherData.dailyForecast.map((d) => d.low));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          {/* 検索バー */}
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="場所を検索（例：東京駅、渋谷、チームラボプラネッツ）"
                className="w-full px-4 py-3 pl-11 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm placeholder:text-slate-500 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
              />
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="11" cy="11" r="7" />
                <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
              </svg>
              {searchLoading && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 border-2 border-slate-600 border-t-sky-500 rounded-full animate-spin" />
              )}
            </div>
            {searchError && (
              <p className="mt-2 text-xs text-red-400 text-center">{searchError}</p>
            )}
          </form>

          {/* 現在地表示 */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{weatherData.location}</h1>
              <p className="text-xs text-slate-400">最終更新 {weatherData.lastUpdated}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE
              </span>
            </div>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex overflow-x-auto scrollbar-hide -mx-4 px-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto px-4 py-6 mt-2">
        {/* 今日のタブ */}
        {activeTab === "today" && (
          <div className="space-y-6">
            {/* 現在の天気 */}
            <section className="bg-gradient-to-br from-sky-600/30 via-indigo-600/20 to-purple-600/10 rounded-3xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-7xl font-extralight">{weatherData.currentTemp}</span>
                    <span className="text-2xl text-slate-300">°C</span>
                  </div>
                  <p className="text-lg text-slate-200 mt-1">{weatherData.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-300">
                    <span>H:{weatherData.high}°</span>
                    <span>L:{weatherData.low}°</span>
                    <span>体感 {weatherData.feelsLike}°</span>
                  </div>
                </div>
                <div className="scale-150">
                  <WeatherIcon weather={weatherData.weather} size="xl" />
                </div>
              </div>

              {/* アラート */}
              {weatherData.alerts.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/10">
                  {weatherData.alerts.map((alert, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300">
                      ⚠️ {alert}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* 詳細グリッド */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* 湿度 */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="text-slate-400 text-xs mb-2">💧 湿度</div>
                <div className="text-2xl font-light">{weatherData.humidity}%</div>
              </div>

              {/* 風 */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="text-slate-400 text-xs mb-2">💨 風</div>
                <div className="text-2xl font-light">{weatherData.windSpeed}<span className="text-sm text-slate-400">km/h</span></div>
                <div className="text-xs text-slate-500 mt-1">{weatherData.windDirection}</div>
              </div>

              {/* 気圧 */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="text-slate-400 text-xs mb-2">📊 気圧</div>
                <div className="text-2xl font-light">{weatherData.pressure}<span className="text-sm text-slate-400">hPa</span></div>
              </div>

              {/* UV */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="text-slate-400 text-xs mb-2">☀️ UV指数</div>
                <div className="text-2xl font-light">{weatherData.uvIndex.current}</div>
                <div className="text-xs text-slate-500 mt-1">{weatherData.uvIndex.level}</div>
              </div>

              {/* 日の出 */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="text-slate-400 text-xs mb-2">🌅 日の出</div>
                <div className="text-2xl font-light">{weatherData.sunrise}</div>
              </div>

              {/* 日の入り */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="text-slate-400 text-xs mb-2">🌇 日の入り</div>
                <div className="text-2xl font-light">{weatherData.sunset}</div>
              </div>

              {/* 大気質 */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="text-slate-400 text-xs mb-2">🌫️ 大気質</div>
                <div className="text-2xl font-light">{weatherData.airQuality.aqi}</div>
                <div className="text-xs text-slate-500 mt-1">{weatherData.airQuality.level}</div>
              </div>

              {/* 視程 */}
              <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
                <div className="text-slate-400 text-xs mb-2">👁️ 視程</div>
                <div className="text-2xl font-light">{weatherData.visibility}<span className="text-sm text-slate-400">km</span></div>
              </div>
            </section>

            {/* 時間別プレビュー */}
            <section className="bg-slate-800/30 rounded-2xl p-4 border border-slate-700/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-300">🕐 時間別予報</h3>
                <button
                  onClick={() => setActiveTab("hourly")}
                  className="text-xs text-sky-400 hover:text-sky-300"
                >
                  もっと見る →
                </button>
              </div>
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
                {weatherData.hourlyForecast.slice(0, 8).map((hour, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[50px]">
                    <span className="text-xs text-slate-400">{hour.time}</span>
                    <div className="my-2">
                      <WeatherIcon weather={hour.weather} size="sm" />
                    </div>
                    <span className="text-sm font-medium">{hour.temp}°</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* 時間別タブ */}
        {activeTab === "hourly" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">🕐 24時間予報</h2>
            <div className="grid gap-2">
              {weatherData.hourlyForecast.map((hour, i) => (
                <div key={i} className={`flex items-center gap-4 px-4 py-3 rounded-xl ${i === 0 ? "bg-sky-600/20 border border-sky-500/30" : "bg-slate-800/50"}`}>
                  <span className={`w-12 text-sm ${i === 0 ? "font-bold text-sky-400" : "text-slate-400"}`}>{hour.time}</span>
                  <WeatherIcon weather={hour.weather} size="sm" />
                  <div className="flex-1">
                    {hour.precipitation > 30 && (
                      <span className="text-xs text-sky-400">💧{hour.precipitation}%</span>
                    )}
                  </div>
                  <span className="text-lg font-medium">{hour.temp}°</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 週間タブ */}
        {activeTab === "daily" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">📅 10日間予報</h2>
            <div className="bg-slate-800/30 rounded-2xl overflow-hidden border border-slate-700/50">
              {weatherData.dailyForecast.map((day, i) => {
                const tempRangeRaw = maxTemp - minTemp;
                const tempRange = tempRangeRaw === 0 ? 1 : tempRangeRaw;
                const lowPos = ((day.low - minTemp) / tempRange) * 100;
                const highPos = ((day.high - minTemp) / tempRange) * 100;

                return (
                  <div key={i} className={`flex items-center gap-4 px-4 py-4 border-b border-slate-700/30 last:border-0 ${i === 0 ? "bg-sky-600/10" : ""}`}>
                    <div className="w-16">
                      <span className={`text-sm ${i === 0 ? "font-bold text-sky-400" : "text-slate-300"}`}>
                        {i === 0 ? "今日" : day.day}
                      </span>
                      {day.date && <span className="text-xs text-slate-500 ml-1">{day.date}</span>}
                    </div>
                    <WeatherIcon weather={day.weather} size="sm" />
                    {day.precipitation > 30 ? (
                      <span className="w-12 text-xs text-sky-400">💧{day.precipitation}%</span>
                    ) : (
                      <span className="w-12" />
                    )}
                    <span className="w-10 text-right text-slate-400">{day.low}°</span>
                    <div className="flex-1 h-2 bg-slate-700 rounded-full relative mx-2">
                      <div
                        className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 via-emerald-400 to-orange-400"
                        style={{
                          left: `${lowPos}%`,
                          width: `${Math.max(10, highPos - lowPos)}%`,
                        }}
                      />
                    </div>
                    <span className="w-10 text-right font-medium">{day.high}°</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 雨雲レーダータブ */}
        {activeTab === "radar" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">🌧️ 雨雲レーダー</h2>
            <WeatherMap location={selectedLocation} />
          </div>
        )}

        {/* アメダスタブ */}
        {activeTab === "amedas" && (
          <div className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/50">
            <AmedasMap />
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="max-w-4xl mx-auto px-4 py-6 border-t border-slate-800">
        <p className="text-center text-xs text-slate-600">
          Weather data by WeatherAPI.com • Radar by Windy • Map data © OpenStreetMap
        </p>
      </footer>
    </div>
  );
}
