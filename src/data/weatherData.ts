// 天気データ（モックデータ）
export interface HourlyForecast {
  time: string;
  temp: number;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow';
  precipitation: number;
  humidity: number;
  windSpeed: number;
}

export interface DailyForecast {
  day: string;
  date: string;
  high: number;
  low: number;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow';
  precipitation: number;
  humidity: number;
}

export interface AirQuality {
  aqi: number;
  level: string;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
}

export interface PollenData {
  cedar: 'none' | 'low' | 'medium' | 'high' | 'very-high';
  cypress: 'none' | 'low' | 'medium' | 'high' | 'very-high';
  grass: 'none' | 'low' | 'medium' | 'high' | 'very-high';
}

export interface UVIndex {
  current: number;
  max: number;
  level: string;
}

export interface WeatherData {
  location: string;
  currentTemp: number;
  feelsLike: number;
  weather: 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow';
  description: string;
  high: number;
  low: number;
  humidity: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: UVIndex;
  sunrise: string;
  sunset: string;
  moonPhase: string;
  airQuality: AirQuality;
  pollen: PollenData;
  hourlyForecast: HourlyForecast[];
  dailyForecast: DailyForecast[];
  alerts: string[];
  lastUpdated: string;
}

export const weatherData: WeatherData = {
  location: "東京都 渋谷区",
  currentTemp: 24,
  feelsLike: 26,
  weather: "partly-cloudy",
  description: "晴れ時々曇り",
  high: 28,
  low: 18,
  humidity: 65,
  pressure: 1013,
  visibility: 16,
  windSpeed: 12,
  windDirection: "北東",
  uvIndex: {
    current: 6,
    max: 8,
    level: "強い"
  },
  sunrise: "5:12",
  sunset: "18:45",
  moonPhase: "満月",
  airQuality: {
    aqi: 42,
    level: "良好",
    pm25: 15,
    pm10: 28,
    o3: 45,
    no2: 18
  },
  pollen: {
    cedar: "low",
    cypress: "medium",
    grass: "none"
  },
  hourlyForecast: [
    { time: "現在", temp: 24, weather: "partly-cloudy", precipitation: 0, humidity: 65, windSpeed: 12 },
    { time: "13時", temp: 26, weather: "sunny", precipitation: 0, humidity: 60, windSpeed: 14 },
    { time: "14時", temp: 27, weather: "sunny", precipitation: 0, humidity: 55, windSpeed: 15 },
    { time: "15時", temp: 28, weather: "sunny", precipitation: 0, humidity: 50, windSpeed: 14 },
    { time: "16時", temp: 27, weather: "partly-cloudy", precipitation: 10, humidity: 55, windSpeed: 12 },
    { time: "17時", temp: 25, weather: "cloudy", precipitation: 20, humidity: 60, windSpeed: 10 },
    { time: "18時", temp: 23, weather: "cloudy", precipitation: 30, humidity: 65, windSpeed: 8 },
    { time: "19時", temp: 22, weather: "rainy", precipitation: 60, humidity: 75, windSpeed: 6 },
    { time: "20時", temp: 21, weather: "rainy", precipitation: 80, humidity: 80, windSpeed: 5 },
    { time: "21時", temp: 20, weather: "rainy", precipitation: 70, humidity: 82, windSpeed: 4 },
    { time: "22時", temp: 19, weather: "cloudy", precipitation: 40, humidity: 78, windSpeed: 4 },
    { time: "23時", temp: 19, weather: "cloudy", precipitation: 20, humidity: 75, windSpeed: 3 },
  ],
  dailyForecast: [
    { day: "今日", date: "6/15", high: 28, low: 18, weather: "partly-cloudy", precipitation: 40, humidity: 65 },
    { day: "明日", date: "6/16", high: 25, low: 19, weather: "rainy", precipitation: 80, humidity: 85 },
    { day: "月", date: "6/17", high: 23, low: 17, weather: "rainy", precipitation: 90, humidity: 90 },
    { day: "火", date: "6/18", high: 26, low: 18, weather: "cloudy", precipitation: 30, humidity: 70 },
    { day: "水", date: "6/19", high: 28, low: 19, weather: "partly-cloudy", precipitation: 20, humidity: 60 },
    { day: "木", date: "6/20", high: 30, low: 21, weather: "sunny", precipitation: 10, humidity: 55 },
    { day: "金", date: "6/21", high: 31, low: 22, weather: "sunny", precipitation: 0, humidity: 50 },
    { day: "土", date: "6/22", high: 32, low: 23, weather: "sunny", precipitation: 0, humidity: 48 },
    { day: "日", date: "6/23", high: 30, low: 22, weather: "partly-cloudy", precipitation: 20, humidity: 55 },
    { day: "月", date: "6/24", high: 29, low: 21, weather: "cloudy", precipitation: 40, humidity: 65 },
  ],
  alerts: [
    "🌧️ 今夜から明日にかけて大雨の可能性があります",
    "⚡ 落雷に注意してください"
  ],
  lastUpdated: "12:30"
};

export const cities = [
  "東京都 渋谷区",
  "大阪府 大阪市",
  "北海道 札幌市",
  "福岡県 福岡市",
  "愛知県 名古屋市",
  "京都府 京都市",
  "神奈川県 横浜市",
  "沖縄県 那覇市"
];
