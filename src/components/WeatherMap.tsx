import React from "react";

interface WeatherMapProps {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
}

// Windy API キー（ユーザー提供）
const WINDY_API_KEY = "zyiKXY47nLVkJqXoKKvK0q1zwlY5caw9";

const WeatherMap: React.FC<WeatherMapProps> = ({ location }) => {
  const { lat, lon, name } = location;

  // Windy 埋め込み URL（雨 + レーダー、24時間タイムラインつき）
  const windyUrl = `https://embed.windy.com/embed2.html?` +
    `lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}` +
    `&zoom=7&level=surface&overlay=rain&product=radar` +
    `&menu=&message=true&marker=true` +
    `&calendar=24&pressure=&type=map` +
    `&location=coordinates&detail=&detailLat=${lat.toFixed(4)}&detailLon=${lon.toFixed(4)}` +
    `&metricWind=default&metricTemp=default&radarRange=-1` +
    `&key=${WINDY_API_KEY}`;

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <svg
            className="w-4 h-4 text-white/70"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              d="M3 4a1 1 0 0 1 1-1h2.5a1 1 0 0 1 .9.6L8.6 6H20a1 1 0 0 1 1 1v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4Z"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-xs text-white/60 uppercase tracking-[0.18em]">
            雨雲レーダー
          </span>
          <span className="ml-1 text-[10px] text-sky-200 bg-sky-400/15 px-1.5 py-0.5 rounded-full">
            Windy
          </span>
        </div>
        <div className="text-[11px] text-white/70 max-w-[55%] text-right truncate">
          📍 {name}
        </div>
      </div>

      {/* Windy iframe */}
      <div className="relative" style={{ height: 360 }}>
        <iframe
          key={`${lat.toFixed(4)},${lon.toFixed(4)}`}
          src={windyUrl}
          className="w-full h-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          title="Windy rain radar"
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 bg-black/30 flex items-center justify-between text-[10px] text-white/60">
        <div className="flex items-center gap-2">
          <span className="text-[9px] uppercase tracking-wide text-white/50">Overlay</span>
          <span className="px-1.5 py-0.5 rounded-full bg-sky-400/15 text-sky-200">
            Rain & Radar (Windy)
          </span>
        </div>
        <span className="text-[9px] text-white/40">Map © Windy.com</span>
      </div>
    </div>
  );
};

export default WeatherMap;
