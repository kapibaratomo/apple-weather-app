import { cn } from "@/utils/cn";

interface WeatherIconProps {
  weather: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function WeatherIcon({ weather, size = 'md', className }: WeatherIconProps) {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28'
  };

  const iconClass = cn(sizeClasses[size], className);

  switch (weather) {
    case 'sunny':
      return (
        <svg className={iconClass} viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="sunGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="20" fill="url(#sunGrad)" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <line
              key={i}
              x1={50 + 28 * Math.cos((angle * Math.PI) / 180)}
              y1={50 + 28 * Math.sin((angle * Math.PI) / 180)}
              x2={50 + 38 * Math.cos((angle * Math.PI) / 180)}
              y2={50 + 38 * Math.sin((angle * Math.PI) / 180)}
              stroke="url(#sunGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />
          ))}
        </svg>
      );
      
    case 'cloudy':
      return (
        <svg className={iconClass} viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E5E7EB" />
              <stop offset="100%" stopColor="#9CA3AF" />
            </linearGradient>
          </defs>
          <ellipse cx="55" cy="55" rx="28" ry="18" fill="url(#cloudGrad)" />
          <ellipse cx="35" cy="58" rx="20" ry="14" fill="url(#cloudGrad)" />
          <ellipse cx="70" cy="58" rx="16" ry="12" fill="url(#cloudGrad)" />
          <ellipse cx="48" cy="48" rx="18" ry="13" fill="#F3F4F6" />
        </svg>
      );
      
    case 'rainy':
      return (
        <svg className={iconClass} viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="rainCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <linearGradient id="rainDropGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="100%" stopColor="#3B82F6" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="32" rx="26" ry="15" fill="url(#rainCloudGrad)" />
          <ellipse cx="32" cy="35" rx="18" ry="12" fill="url(#rainCloudGrad)" />
          <ellipse cx="66" cy="35" rx="14" ry="10" fill="url(#rainCloudGrad)" />
          <ellipse cx="44" cy="26" rx="16" ry="11" fill="#94A3B8" />
          {[30, 45, 60].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1={52 + i * 4}
              x2={x - 4}
              y2={68 + i * 4}
              stroke="url(#rainDropGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
        </svg>
      );
      
    case 'partly-cloudy':
      return (
        <svg className={iconClass} viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="sunGradPC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FCD34D" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
            <linearGradient id="cloudGradPC" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F3F4F6" />
              <stop offset="100%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <circle cx="35" cy="32" r="16" fill="url(#sunGradPC)" />
          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
            <line
              key={i}
              x1={35 + 22 * Math.cos((angle * Math.PI) / 180)}
              y1={32 + 22 * Math.sin((angle * Math.PI) / 180)}
              x2={35 + 28 * Math.cos((angle * Math.PI) / 180)}
              y2={32 + 28 * Math.sin((angle * Math.PI) / 180)}
              stroke="url(#sunGradPC)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
          <ellipse cx="58" cy="58" rx="24" ry="14" fill="url(#cloudGradPC)" />
          <ellipse cx="42" cy="60" rx="16" ry="10" fill="url(#cloudGradPC)" />
          <ellipse cx="72" cy="60" rx="12" ry="8" fill="url(#cloudGradPC)" />
          <ellipse cx="52" cy="52" rx="14" ry="10" fill="#F9FAFB" />
        </svg>
      );
      
    case 'thunderstorm':
      return (
        <svg className={iconClass} viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="stormCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4B5563" />
              <stop offset="100%" stopColor="#1F2937" />
            </linearGradient>
            <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#FACC15" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="30" rx="26" ry="15" fill="url(#stormCloudGrad)" />
          <ellipse cx="32" cy="33" rx="18" ry="12" fill="url(#stormCloudGrad)" />
          <ellipse cx="66" cy="33" rx="14" ry="10" fill="url(#stormCloudGrad)" />
          <path d="M54 45 L46 58 L52 58 L44 75 L58 55 L51 55 L58 45 Z" fill="url(#lightningGrad)" />
        </svg>
      );
      
    case 'snow':
      return (
        <svg className={iconClass} viewBox="0 0 100 100" fill="none">
          <defs>
            <linearGradient id="snowCloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#94A3B8" />
            </linearGradient>
          </defs>
          <ellipse cx="50" cy="30" rx="26" ry="15" fill="url(#snowCloudGrad)" />
          <ellipse cx="32" cy="33" rx="18" ry="12" fill="url(#snowCloudGrad)" />
          <ellipse cx="66" cy="33" rx="14" ry="10" fill="url(#snowCloudGrad)" />
          <ellipse cx="44" cy="24" rx="16" ry="11" fill="#E2E8F0" />
          {[32, 50, 68].map((x, i) => (
            <circle key={i} cx={x} cy={55 + (i % 2) * 12} r="4" fill="white" />
          ))}
          {[40, 58].map((x, i) => (
            <circle key={i + 3} cx={x} cy={68 + (i % 2) * 8} r="3" fill="white" />
          ))}
        </svg>
      );
      
    default:
      return null;
  }
}
