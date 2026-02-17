// Open-Meteo API（無料、APIキー不要）を使用
// ウェザーニュースのような詳細なデータを取得

export interface CityLocation {
  name: string;
  lat: number;
  lon: number;
}

export const cityLocations: CityLocation[] = [
  { name: "東京都 渋谷区", lat: 35.6595, lon: 139.7004 },
  { name: "東京都 新宿区", lat: 35.6938, lon: 139.7036 },
  { name: "東京都 港区", lat: 35.6581, lon: 139.7514 },
  { name: "大阪府 大阪市", lat: 34.6937, lon: 135.5023 },
  { name: "北海道 札幌市", lat: 43.0618, lon: 141.3545 },
  { name: "福岡県 福岡市", lat: 33.5902, lon: 130.4017 },
  { name: "愛知県 名古屋市", lat: 35.1815, lon: 136.9066 },
  { name: "京都府 京都市", lat: 35.0116, lon: 135.7681 },
  { name: "神奈川県 横浜市", lat: 35.4437, lon: 139.6380 },
  { name: "兵庫県 神戸市", lat: 34.6901, lon: 135.1956 },
  { name: "宮城県 仙台市", lat: 38.2682, lon: 140.8694 },
  { name: "広島県 広島市", lat: 34.3853, lon: 132.4553 },
  { name: "沖縄県 那覇市", lat: 26.2124, lon: 127.6809 },
];

// 現在地を取得
export async function getCurrentLocation(): Promise<CityLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // 逆ジオコーディングで住所を取得
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=ja`
          );
          const data = await response.json();
          
          let name = "現在地";
          if (data.address) {
            const addr = data.address;
            const prefecture = addr.province || addr.state || "";
            const city = addr.city || addr.town || addr.village || addr.suburb || "";
            if (prefecture && city) {
              name = `${prefecture} ${city}`;
            } else if (city) {
              name = city;
            }
          }
          
          resolve({ name, lat: latitude, lon: longitude });
        } catch {
          resolve({ name: "現在地", lat: latitude, lon: longitude });
        }
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5分間キャッシュ
      }
    );
  });
}

export interface OpenMeteoResponse {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    surface_pressure: number;
    uv_index: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: number[];
    relative_humidity_2m: number[];
    wind_speed_10m: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
  };
  // WeatherAPI 等からの追加情報（任意）
  air_quality?: {
    pm25?: number;
    pm10?: number;
    o3?: number;
    no2?: number;
    epa_index?: number; // US EPA AQI (1-6)
  };
  alerts?: {
    headline: string;
    severity: string;
    description: string;
  }[];
}

// 天気コードから天気タイプへの変換
export function getWeatherType(code: number): 'sunny' | 'cloudy' | 'rainy' | 'partly-cloudy' | 'thunderstorm' | 'snow' {
  if (code === 0) return 'sunny';
  if (code >= 1 && code <= 3) return 'partly-cloudy';
  if (code >= 45 && code <= 48) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rainy';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'rainy';
  if (code >= 85 && code <= 86) return 'snow';
  if (code >= 95 && code <= 99) return 'thunderstorm';
  return 'cloudy';
}

// 天気コードから日本語の説明への変換
export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: '快晴',
    1: '晴れ',
    2: '晴れ時々曇り',
    3: '曇り',
    45: '霧',
    48: '霧氷',
    51: '小雨',
    53: '雨',
    55: '強い雨',
    56: '着氷性の小雨',
    57: '着氷性の雨',
    61: '小雨',
    63: '雨',
    65: '強い雨',
    66: '着氷性の小雨',
    67: '着氷性の強い雨',
    71: '小雪',
    73: '雪',
    75: '大雪',
    77: '霧雪',
    80: 'にわか雨',
    81: 'にわか雨',
    82: '激しいにわか雨',
    85: '小雪',
    86: '大雪',
    95: '雷雨',
    96: '雷雨（雹を伴う）',
    99: '激しい雷雨（雹を伴う）',
  };
  return descriptions[code] || '曇り';
}

// 風向を日本語に変換
export function getWindDirection(degrees: number): string {
  const directions = ['北', '北北東', '北東', '東北東', '東', '東南東', '南東', '南南東', '南', '南南西', '南西', '西南西', '西', '西北西', '北西', '北北西'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// UVレベルを日本語に変換
export function getUVLevel(uvIndex: number): string {
  if (uvIndex <= 2) return '弱い';
  if (uvIndex <= 5) return '中程度';
  if (uvIndex <= 7) return '強い';
  if (uvIndex <= 10) return '非常に強い';
  return '極端に強い';
}

// 時刻をフォーマット
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return `${date.getHours()}時`;
}

// 日付を曜日に変換
export function getDayOfWeek(dateString: string, index: number): { day: string; date: string } {
  if (index === 0) return { day: '今日', date: '' };
  if (index === 1) return { day: '明日', date: '' };
  
  const date = new Date(dateString);
  const days = ['日', '月', '火', '水', '木', '金', '土'];
  const month = date.getMonth() + 1;
  const dayOfMonth = date.getDate();
  return { 
    day: days[date.getDay()], 
    date: `${month}/${dayOfMonth}` 
  };
}

// Google Maps Geocoding API キー（オプション）
const GOOGLE_MAPS_API_KEY = '';

// 学校名のパターンを認識して検索を最適化
function isSchoolQuery(query: string): boolean {
  const schoolPatterns = [
    '小学校', '中学校', '高校', '高等学校', '大学', '専門学校',
    '学園', '学院', '附属', '付属', 'スクール', 'カレッジ',
    '幼稚園', '保育園', '短大', '短期大学'
  ];
  return schoolPatterns.some(pattern => query.includes(pattern));
}

// クエリを正規化（全角半角、スペース等）
function normalizeQuery(query: string): string {
  return query
    .replace(/\s+/g, '')
    .replace(/　/g, '')
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
}

// 有名施設・ランドマークのローカルデータベース
const famousPlaces: Record<string, { name: string; lat: number; lon: number }> = {
  // 芝浦工業大学系列
  '芝浦工業大学附属中学校': { name: '芝浦工業大学附属中学高等学校（江東区豊洲）', lat: 35.6478, lon: 139.7922 },
  '芝浦工業大学附属高校': { name: '芝浦工業大学附属中学高等学校（江東区豊洲）', lat: 35.6478, lon: 139.7922 },
  '芝浦工業大学附属高等学校': { name: '芝浦工業大学附属中学高等学校（江東区豊洲）', lat: 35.6478, lon: 139.7922 },
  '芝浦工大附属': { name: '芝浦工業大学附属中学高等学校（江東区豊洲）', lat: 35.6478, lon: 139.7922 },
  '芝浦工大附属中学': { name: '芝浦工業大学附属中学高等学校（江東区豊洲）', lat: 35.6478, lon: 139.7922 },
  '芝浦工大附属高校': { name: '芝浦工業大学附属中学高等学校（江東区豊洲）', lat: 35.6478, lon: 139.7922 },
  '芝浦工業大学': { name: '芝浦工業大学（江東区豊洲）', lat: 35.6478, lon: 139.7922 },
  '芝浦工大': { name: '芝浦工業大学（江東区豊洲）', lat: 35.6478, lon: 139.7922 },
  // チームラボ
  'チームラボプラネッツ': { name: 'チームラボプラネッツ（江東区豊洲）', lat: 35.6426, lon: 139.7879 },
  'チームラボボーダレス': { name: 'チームラボボーダレス（江東区青海）', lat: 35.6257, lon: 139.7832 },
  'teamlab planets': { name: 'チームラボプラネッツ（江東区豊洲）', lat: 35.6426, lon: 139.7879 },
  'teamlab borderless': { name: 'チームラボボーダレス（江東区青海）', lat: 35.6257, lon: 139.7832 },
  // 東京の観光地
  '東京スカイツリー': { name: '東京スカイツリー（墨田区）', lat: 35.7101, lon: 139.8107 },
  'スカイツリー': { name: '東京スカイツリー（墨田区）', lat: 35.7101, lon: 139.8107 },
  '東京タワー': { name: '東京タワー（港区）', lat: 35.6586, lon: 139.7454 },
  '浅草寺': { name: '浅草寺（台東区）', lat: 35.7148, lon: 139.7967 },
  '浅草': { name: '浅草（台東区）', lat: 35.7116, lon: 139.7966 },
  '上野動物園': { name: '上野動物園（台東区）', lat: 35.7163, lon: 139.7716 },
  '明治神宮': { name: '明治神宮（渋谷区）', lat: 35.6764, lon: 139.6993 },
  '皇居': { name: '皇居（千代田区）', lat: 35.6852, lon: 139.7528 },
  '築地市場': { name: '築地市場（中央区）', lat: 35.6654, lon: 139.7707 },
  '豊洲市場': { name: '豊洲市場（江東区）', lat: 35.6421, lon: 139.7883 },
  // テーマパーク
  '東京ディズニーランド': { name: '東京ディズニーランド（浦安市）', lat: 35.6329, lon: 139.8804 },
  'ディズニーランド': { name: '東京ディズニーランド（浦安市）', lat: 35.6329, lon: 139.8804 },
  '東京ディズニーシー': { name: '東京ディズニーシー（浦安市）', lat: 35.6267, lon: 139.8851 },
  'ディズニーシー': { name: '東京ディズニーシー（浦安市）', lat: 35.6267, lon: 139.8851 },
  'ユニバーサルスタジオジャパン': { name: 'ユニバーサル・スタジオ・ジャパン（大阪市）', lat: 34.6654, lon: 135.4323 },
  'USJ': { name: 'ユニバーサル・スタジオ・ジャパン（大阪市）', lat: 34.6654, lon: 135.4323 },
  'ユニバ': { name: 'ユニバーサル・スタジオ・ジャパン（大阪市）', lat: 34.6654, lon: 135.4323 },
  'ハウステンボス': { name: 'ハウステンボス（佐世保市）', lat: 33.0854, lon: 129.7896 },
  // 商業施設
  '渋谷ヒカリエ': { name: '渋谷ヒカリエ（渋谷区）', lat: 35.6590, lon: 139.7034 },
  '渋谷スクランブルスクエア': { name: '渋谷スクランブルスクエア（渋谷区）', lat: 35.6580, lon: 139.7016 },
  '六本木ヒルズ': { name: '六本木ヒルズ（港区）', lat: 35.6602, lon: 139.7293 },
  '東京ミッドタウン': { name: '東京ミッドタウン（港区）', lat: 35.6656, lon: 139.7310 },
  'あべのハルカス': { name: 'あべのハルカス（大阪市）', lat: 34.6462, lon: 135.5133 },
  'グランフロント大阪': { name: 'グランフロント大阪（大阪市）', lat: 34.7055, lon: 135.4953 },
  'ららぽーと豊洲': { name: 'ららぽーと豊洲（江東区）', lat: 35.6520, lon: 139.7920 },
  // スタジアム・アリーナ
  '東京ドーム': { name: '東京ドーム（文京区）', lat: 35.7056, lon: 139.7519 },
  '国立競技場': { name: '国立競技場（新宿区）', lat: 35.6779, lon: 139.7145 },
  '日産スタジアム': { name: '日産スタジアム（横浜市）', lat: 35.5103, lon: 139.6063 },
  '横浜アリーナ': { name: '横浜アリーナ（横浜市）', lat: 35.5093, lon: 139.6177 },
  'さいたまスーパーアリーナ': { name: 'さいたまスーパーアリーナ（さいたま市）', lat: 35.8949, lon: 139.6316 },
  '甲子園': { name: '阪神甲子園球場（西宮市）', lat: 34.7214, lon: 135.3617 },
  '甲子園球場': { name: '阪神甲子園球場（西宮市）', lat: 34.7214, lon: 135.3617 },
  '京セラドーム': { name: '京セラドーム大阪（大阪市）', lat: 34.6694, lon: 135.4760 },
  '武道館': { name: '日本武道館（千代田区）', lat: 35.6931, lon: 139.7497 },
  '日本武道館': { name: '日本武道館（千代田区）', lat: 35.6931, lon: 139.7497 },
  // 大学
  '東京大学': { name: '東京大学（文京区）', lat: 35.7126, lon: 139.7620 },
  '東大': { name: '東京大学（文京区）', lat: 35.7126, lon: 139.7620 },
  '京都大学': { name: '京都大学（京都市）', lat: 35.0268, lon: 135.7809 },
  '京大': { name: '京都大学（京都市）', lat: 35.0268, lon: 135.7809 },
  '早稲田大学': { name: '早稲田大学（新宿区）', lat: 35.7089, lon: 139.7195 },
  '早稲田': { name: '早稲田大学（新宿区）', lat: 35.7089, lon: 139.7195 },
  '慶應義塾大学': { name: '慶應義塾大学（港区）', lat: 35.6485, lon: 139.7420 },
  '慶応': { name: '慶應義塾大学（港区）', lat: 35.6485, lon: 139.7420 },
  '慶應': { name: '慶應義塾大学（港区）', lat: 35.6485, lon: 139.7420 },
  '上智大学': { name: '上智大学（千代田区）', lat: 35.6830, lon: 139.7314 },
  '明治大学': { name: '明治大学（千代田区）', lat: 35.6972, lon: 139.7621 },
  '青山学院大学': { name: '青山学院大学（渋谷区）', lat: 35.6617, lon: 139.7095 },
  '青学': { name: '青山学院大学（渋谷区）', lat: 35.6617, lon: 139.7095 },
  '立教大学': { name: '立教大学（豊島区）', lat: 35.7318, lon: 139.7036 },
  '中央大学': { name: '中央大学（八王子市）', lat: 35.6584, lon: 139.3782 },
  '法政大学': { name: '法政大学（千代田区）', lat: 35.6944, lon: 139.7419 },
  '日本大学': { name: '日本大学（千代田区）', lat: 35.6969, lon: 139.7559 },
  '日大': { name: '日本大学（千代田区）', lat: 35.6969, lon: 139.7559 },
  '東洋大学': { name: '東洋大学（文京区）', lat: 35.7073, lon: 139.7499 },
  '駒澤大学': { name: '駒澤大学（世田谷区）', lat: 35.6284, lon: 139.6614 },
  '専修大学': { name: '専修大学（千代田区）', lat: 35.6957, lon: 139.7565 },
  '同志社大学': { name: '同志社大学（京都市）', lat: 35.0269, lon: 135.7818 },
  '同志社': { name: '同志社大学（京都市）', lat: 35.0269, lon: 135.7818 },
  '立命館大学': { name: '立命館大学（京都市）', lat: 35.0299, lon: 135.7340 },
  '立命館': { name: '立命館大学（京都市）', lat: 35.0299, lon: 135.7340 },
  '関西大学': { name: '関西大学（吹田市）', lat: 34.7747, lon: 135.5194 },
  '関大': { name: '関西大学（吹田市）', lat: 34.7747, lon: 135.5194 },
  '関西学院大学': { name: '関西学院大学（西宮市）', lat: 34.7603, lon: 135.3610 },
  '関学': { name: '関西学院大学（西宮市）', lat: 34.7603, lon: 135.3610 },
  '近畿大学': { name: '近畿大学（東大阪市）', lat: 34.6416, lon: 135.5891 },
  '近大': { name: '近畿大学（東大阪市）', lat: 34.6416, lon: 135.5891 },
  '北海道大学': { name: '北海道大学（札幌市）', lat: 43.0714, lon: 141.3425 },
  '北大': { name: '北海道大学（札幌市）', lat: 43.0714, lon: 141.3425 },
  '東北大学': { name: '東北大学（仙台市）', lat: 38.2551, lon: 140.8727 },
  '名古屋大学': { name: '名古屋大学（名古屋市）', lat: 35.1551, lon: 136.9657 },
  '名大': { name: '名古屋大学（名古屋市）', lat: 35.1551, lon: 136.9657 },
  '大阪大学': { name: '大阪大学（吹田市）', lat: 34.8220, lon: 135.5243 },
  '阪大': { name: '大阪大学（吹田市）', lat: 34.8220, lon: 135.5243 },
  '九州大学': { name: '九州大学（福岡市）', lat: 33.6264, lon: 130.4256 },
  '九大': { name: '九州大学（福岡市）', lat: 33.6264, lon: 130.4256 },
  '神戸大学': { name: '神戸大学（神戸市）', lat: 34.7260, lon: 135.2373 },
  '筑波大学': { name: '筑波大学（つくば市）', lat: 36.1147, lon: 140.1025 },
  '一橋大学': { name: '一橋大学（国立市）', lat: 35.6953, lon: 139.4385 },
  '東京工業大学': { name: '東京工業大学（目黒区）', lat: 35.6047, lon: 139.6846 },
  '東工大': { name: '東京工業大学（目黒区）', lat: 35.6047, lon: 139.6846 },
  // 有名高校
  '開成高校': { name: '開成高等学校（荒川区）', lat: 35.7386, lon: 139.7736 },
  '開成': { name: '開成高等学校（荒川区）', lat: 35.7386, lon: 139.7736 },
  '灘高校': { name: '灘高等学校（神戸市）', lat: 34.7284, lon: 135.2545 },
  '灘': { name: '灘高等学校（神戸市）', lat: 34.7284, lon: 135.2545 },
  '筑波大附属駒場': { name: '筑波大学附属駒場中・高等学校（世田谷区）', lat: 35.6550, lon: 139.6717 },
  '筑駒': { name: '筑波大学附属駒場中・高等学校（世田谷区）', lat: 35.6550, lon: 139.6717 },
  '麻布高校': { name: '麻布中学校・高等学校（港区）', lat: 35.6522, lon: 139.7280 },
  '麻布': { name: '麻布中学校・高等学校（港区）', lat: 35.6522, lon: 139.7280 },
  '桜蔭': { name: '桜蔭中学校・高等学校（文京区）', lat: 35.7049, lon: 139.7515 },
  '女子学院': { name: '女子学院中学校・高等学校（千代田区）', lat: 35.6901, lon: 139.7392 },
  '渋谷教育学園幕張': { name: '渋谷教育学園幕張中学校・高等学校（千葉市）', lat: 35.6499, lon: 140.0429 },
  '渋幕': { name: '渋谷教育学園幕張中学校・高等学校（千葉市）', lat: 35.6499, lon: 140.0429 },
  '都立日比谷高校': { name: '東京都立日比谷高等学校（千代田区）', lat: 35.6750, lon: 139.7518 },
  '日比谷高校': { name: '東京都立日比谷高等学校（千代田区）', lat: 35.6750, lon: 139.7518 },
  '都立西高校': { name: '東京都立西高等学校（杉並区）', lat: 35.7072, lon: 139.6094 },
  '西高校': { name: '東京都立西高等学校（杉並区）', lat: 35.7072, lon: 139.6094 },
  '都立国立高校': { name: '東京都立国立高等学校（国立市）', lat: 35.6981, lon: 139.4471 },
  '北野高校': { name: '大阪府立北野高等学校（大阪市）', lat: 34.7133, lon: 135.4943 },
  '天王寺高校': { name: '大阪府立天王寺高等学校（大阪市）', lat: 34.6342, lon: 135.5173 },
  '東大寺学園': { name: '東大寺学園中・高等学校（奈良市）', lat: 34.7119, lon: 135.8389 },
  '甲陽学院': { name: '甲陽学院中学校・高等学校（西宮市）', lat: 34.7566, lon: 135.3457 },
  '洛南高校': { name: '洛南高等学校（京都市）', lat: 34.9799, lon: 135.7627 },
  '洛南': { name: '洛南高等学校（京都市）', lat: 34.9799, lon: 135.7627 },
  'ラ・サール高校': { name: 'ラ・サール中学校・高等学校（鹿児島市）', lat: 31.5733, lon: 130.5268 },
  'ラサール': { name: 'ラ・サール中学校・高等学校（鹿児島市）', lat: 31.5733, lon: 130.5268 },
  '久留米大附設': { name: '久留米大学附設中学校・高等学校（久留米市）', lat: 33.3080, lon: 130.5186 },
  '附設': { name: '久留米大学附設中学校・高等学校（久留米市）', lat: 33.3080, lon: 130.5186 },
  // 空港
  '羽田空港': { name: '羽田空港（大田区）', lat: 35.5494, lon: 139.7798 },
  '成田空港': { name: '成田空港（成田市）', lat: 35.7720, lon: 140.3929 },
  '関西国際空港': { name: '関西国際空港（泉佐野市）', lat: 34.4347, lon: 135.2441 },
  '関空': { name: '関西国際空港（泉佐野市）', lat: 34.4347, lon: 135.2441 },
  '中部国際空港': { name: '中部国際空港（常滑市）', lat: 34.8584, lon: 136.8123 },
  'セントレア': { name: '中部国際空港（常滑市）', lat: 34.8584, lon: 136.8123 },
  '新千歳空港': { name: '新千歳空港（千歳市）', lat: 42.7752, lon: 141.6924 },
  '福岡空港': { name: '福岡空港（福岡市）', lat: 33.5856, lon: 130.4513 },
  '那覇空港': { name: '那覇空港（那覇市）', lat: 26.2075, lon: 127.6468 },
  // 歴史・神社仏閣
  '金閣寺': { name: '金閣寺（京都市）', lat: 35.0394, lon: 135.7292 },
  '銀閣寺': { name: '銀閣寺（京都市）', lat: 35.0268, lon: 135.7982 },
  '清水寺': { name: '清水寺（京都市）', lat: 34.9949, lon: 135.7850 },
  '伏見稲荷大社': { name: '伏見稲荷大社（京都市）', lat: 34.9671, lon: 135.7727 },
  '伏見稲荷': { name: '伏見稲荷大社（京都市）', lat: 34.9671, lon: 135.7727 },
  '大阪城': { name: '大阪城（大阪市）', lat: 34.6873, lon: 135.5262 },
  '姫路城': { name: '姫路城（姫路市）', lat: 34.8394, lon: 134.6939 },
  '富士山': { name: '富士山（静岡県/山梨県）', lat: 35.3606, lon: 138.7274 },
  '厳島神社': { name: '厳島神社（廿日市市）', lat: 34.2959, lon: 132.3199 },
  '宮島': { name: '宮島（廿日市市）', lat: 34.2792, lon: 132.3199 },
  '原爆ドーム': { name: '原爆ドーム（広島市）', lat: 34.3955, lon: 132.4536 },
  '首里城': { name: '首里城（那覇市）', lat: 26.2170, lon: 127.7195 },
  // 水族館・動物園
  '美ら海水族館': { name: '沖縄美ら海水族館（本部町）', lat: 26.6939, lon: 127.8778 },
  '海遊館': { name: '海遊館（大阪市）', lat: 34.6545, lon: 135.4290 },
  '八景島シーパラダイス': { name: '横浜・八景島シーパラダイス（横浜市）', lat: 35.3360, lon: 139.6441 },
  'シーパラダイス': { name: '横浜・八景島シーパラダイス（横浜市）', lat: 35.3360, lon: 139.6441 },
  'すみだ水族館': { name: 'すみだ水族館（墨田区）', lat: 35.7099, lon: 139.8094 },
  // ショッピング・ストリート
  '渋谷109': { name: 'SHIBUYA109（渋谷区）', lat: 35.6597, lon: 139.6992 },
  '109': { name: 'SHIBUYA109（渋谷区）', lat: 35.6597, lon: 139.6992 },
  '原宿': { name: '原宿（渋谷区）', lat: 35.6702, lon: 139.7027 },
  '竹下通り': { name: '竹下通り（渋谷区）', lat: 35.6715, lon: 139.7053 },
  '表参道': { name: '表参道（渋谷区）', lat: 35.6654, lon: 139.7121 },
  '銀座': { name: '銀座（中央区）', lat: 35.6721, lon: 139.7649 },
  '秋葉原': { name: '秋葉原（千代田区）', lat: 35.7022, lon: 139.7741 },
  '池袋': { name: '池袋（豊島区）', lat: 35.7295, lon: 139.7109 },
  '新宿': { name: '新宿（新宿区）', lat: 35.6896, lon: 139.7006 },
  '渋谷': { name: '渋谷（渋谷区）', lat: 35.6580, lon: 139.7016 },
  '品川': { name: '品川（港区）', lat: 35.6284, lon: 139.7387 },
  '心斎橋': { name: '心斎橋（大阪市）', lat: 34.6756, lon: 135.5004 },
  '道頓堀': { name: '道頓堀（大阪市）', lat: 34.6687, lon: 135.5013 },
  '難波': { name: '難波（大阪市）', lat: 34.6659, lon: 135.5013 },
  'なんば': { name: '難波（大阪市）', lat: 34.6659, lon: 135.5013 },
  '梅田': { name: '梅田（大阪市）', lat: 34.7055, lon: 135.4983 },
  '天神': { name: '天神（福岡市）', lat: 33.5902, lon: 130.3990 },
  '中洲': { name: '中洲（福岡市）', lat: 33.5910, lon: 130.4060 },
  // 主要駅
  '東京駅': { name: '東京駅（千代田区）', lat: 35.6812, lon: 139.7671 },
  '新宿駅': { name: '新宿駅（新宿区）', lat: 35.6896, lon: 139.7006 },
  '渋谷駅': { name: '渋谷駅（渋谷区）', lat: 35.6580, lon: 139.7016 },
  '池袋駅': { name: '池袋駅（豊島区）', lat: 35.7295, lon: 139.7109 },
  '品川駅': { name: '品川駅（港区）', lat: 35.6284, lon: 139.7387 },
  '横浜駅': { name: '横浜駅（横浜市）', lat: 35.4660, lon: 139.6223 },
  '大阪駅': { name: '大阪駅（大阪市）', lat: 34.7024, lon: 135.4959 },
  '名古屋駅': { name: '名古屋駅（名古屋市）', lat: 35.1709, lon: 136.8815 },
  '京都駅': { name: '京都駅（京都市）', lat: 34.9856, lon: 135.7588 },
  '博多駅': { name: '博多駅（福岡市）', lat: 33.5897, lon: 130.4207 },
  '札幌駅': { name: '札幌駅（札幌市）', lat: 43.0687, lon: 141.3508 },
};

// Google Maps Geocoding APIで検索
async function searchWithGoogleMaps(query: string): Promise<CityLocation | null> {
  if (!GOOGLE_MAPS_API_KEY) return null;
  
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query + ' 日本')}&key=${GOOGLE_MAPS_API_KEY}&language=ja&region=jp`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.status !== 'OK' || !data.results || data.results.length === 0) {
      return null;
    }
    
    const result = data.results[0];
    const location = result.geometry?.location;
    if (!location) return null;
    
    // 住所コンポーネントから地名を構築
    const components = result.address_components || [];
    let prefecture = '';
    let city = '';
    let sublocality = '';
    let premise = '';
    
    for (const comp of components) {
      const types = comp.types || [];
      if (types.includes('administrative_area_level_1')) {
        prefecture = comp.long_name;
      } else if (types.includes('locality')) {
        city = comp.long_name;
      } else if (types.includes('sublocality_level_1') || types.includes('sublocality')) {
        sublocality = comp.long_name;
      } else if (types.includes('premise') || types.includes('point_of_interest')) {
        premise = comp.long_name;
      }
    }
    
    // 名前を構築
    let name = '';
    if (premise && city) {
      name = `${premise}（${city}）`;
    } else if (premise && prefecture) {
      name = `${premise}（${prefecture}）`;
    } else if (prefecture && city && sublocality) {
      name = `${prefecture} ${city} ${sublocality}`;
    } else if (prefecture && city) {
      name = `${prefecture} ${city}`;
    } else {
      name = result.formatted_address?.replace(/日本、?/g, '').replace(/〒[\d-]+/g, '').trim() || query;
    }
    
    return {
      name,
      lat: location.lat,
      lon: location.lng,
    };
  } catch {
    return null;
  }
}

// 住所文字列から位置情報を検索（高精度・日本特化・建物名・学校対応）
export async function searchLocation(query: string): Promise<CityLocation> {
  const queryTrimmed = query.trim();
  const queryLower = queryTrimmed.toLowerCase();
  const queryNorm = normalizeQuery(queryTrimmed);
  
  // 1. まずローカルデータベースで検索（完全一致・部分一致）
  // 完全一致チェック
  for (const [key, value] of Object.entries(famousPlaces)) {
    const keyNorm = normalizeQuery(key);
    if (keyNorm === queryNorm || key === queryTrimmed) {
      return value;
    }
  }
  
  // 部分一致チェック（クエリがキーを含む or キーがクエリを含む）
  for (const [key, value] of Object.entries(famousPlaces)) {
    const keyLower = key.toLowerCase();
    if (queryLower.includes(keyLower) || keyLower.includes(queryLower)) {
      return value;
    }
  }
  
  // 2. Google Maps Geocoding APIで検索（キーがあれば）
  if (GOOGLE_MAPS_API_KEY) {
    try {
      const googleResult = await searchWithGoogleMaps(queryTrimmed);
      if (googleResult) {
        return googleResult;
      }
    } catch (e) {
      console.warn('Google Maps Geocoding に失敗:', e);
    }
  }

  // 3. Nominatim APIで検索
  // 学校かどうかで検索戦略を変える
  const isSchool = isSchoolQuery(queryTrimmed);
  
  // 複数の検索戦略を試す
  const searchStrategies: string[] = [];
  
  if (isSchool) {
    // 学校検索の場合は特別な戦略
    // 学校・教育施設を優先
    searchStrategies.push(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&accept-language=ja&countrycodes=jp&q=${encodeURIComponent(queryTrimmed)}&limit=20`
    );
    // 「学校」を付加
    searchStrategies.push(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&accept-language=ja&countrycodes=jp&q=${encodeURIComponent(queryTrimmed + ' 学校')}&limit=20`
    );
  }
  
  // 通常の検索戦略
  searchStrategies.push(
    // 1. 日本国内で検索
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&accept-language=ja&countrycodes=jp&q=${encodeURIComponent(queryTrimmed)}&limit=20`,
    // 2. 日本を付加して検索
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&accept-language=ja&q=${encodeURIComponent(queryTrimmed + ' 日本')}&limit=20`,
    // 3. フリーフォーム検索（制限なし）
    `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&namedetails=1&accept-language=ja&q=${encodeURIComponent(queryTrimmed)}&limit=20`
  );

  let allResults: any[] = [];

  // 各戦略で検索を試みる
  for (const url of searchStrategies) {
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'WeatherApp/1.0',
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          allResults = [...allResults, ...data];
        }
      }
    } catch {
      // 続行
    }
    
    // 結果が見つかったら早期終了
    if (allResults.length > 0) break;
  }

  if (allResults.length === 0) {
    throw new Error('場所が見つかりませんでした');
  }

  // 重複を除去（lat,lonの組み合わせで）
  const uniqueResults = allResults.filter((item, index, self) => 
    index === self.findIndex(t => t.lat === item.lat && t.lon === item.lon)
  );

  // ベストな結果を選択（優先度順）
  let bestItem = uniqueResults[0];
  let bestScore = -1;

  for (const item of uniqueResults) {
    let score = 0;
    const type = item.type || '';
    const classType = item.class || '';
    const displayName = (item.display_name || '').toLowerCase();
    const nameDetails = item.namedetails || {};
    const itemName = (nameDetails.name || item.name || '').toLowerCase();
    const itemNameNorm = normalizeQuery(itemName);

    // 名前が完全一致または含まれる場合は高スコア
    if (itemNameNorm === queryNorm || itemName === queryLower) {
      score += 200; // 完全一致は最優先
    } else if (displayName.includes(queryLower) || queryLower.includes(itemName)) {
      score += 100;
    } else if (itemNameNorm.includes(queryNorm) || queryNorm.includes(itemNameNorm)) {
      score += 80;
    }

    // 学校検索の場合は学校タイプを大幅に優先
    if (isSchool) {
      const schoolTypes = ['school', 'university', 'college', 'kindergarten'];
      const schoolClasses = ['amenity'];
      
      if (schoolTypes.includes(type)) {
        score += 150;
      }
      if (schoolClasses.includes(classType) && (type === 'school' || type === 'university')) {
        score += 100;
      }
      // 名前に学校系のキーワードが含まれていればボーナス
      const schoolKeywords = ['小学校', '中学校', '高校', '高等学校', '大学', '学園', '学院'];
      if (schoolKeywords.some(kw => itemName.includes(kw))) {
        score += 80;
      }
    }

    // 建物・ランドマークタイプを優先
    const landmarkTypes = [
      'attraction', 'tower', 'stadium', 'museum', 'theme_park', 'zoo', 
      'aquarium', 'shopping_mall', 'mall', 'department_store', 'station',
      'hotel', 'hospital', 'university', 'school', 'college', 'airport', 
      'landmark', 'building', 'commercial', 'retail', 'office'
    ];
    const landmarkClasses = [
      'tourism', 'amenity', 'building', 'shop', 'railway', 'aeroway',
      'leisure', 'historic', 'office'
    ];

    if (landmarkTypes.includes(type)) score += 60;
    if (landmarkClasses.includes(classType)) score += 40;

    // 駅
    if (type === 'station' || classType === 'railway') score += 70;

    // 日本国内の結果を優先
    const addr = item.address || {};
    if (addr.country === '日本' || addr.country_code === 'jp') {
      score += 50;
    }

    // 市区町村
    if (['city', 'town', 'village', 'suburb', 'quarter'].includes(type)) {
      score += 30;
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  const addr = bestItem.address || {};
  const nameDetails = bestItem.namedetails || {};
  const prefecture = addr.province || addr.state || '';
  const city = addr.city || addr.town || addr.village || '';
  const suburb = addr.suburb || addr.quarter || addr.neighbourhood || '';
  
  // 建物名があれば優先的に表示
  const buildingName = nameDetails.name || bestItem.name || '';
  
  // より詳細な地名を表示
  let name = '';
  
  // 建物名がクエリと一致する場合は建物名を含める
  if (buildingName && (buildingName.includes(query) || query.includes(buildingName) || 
      buildingName.toLowerCase().includes(query.toLowerCase()))) {
    if (city) {
      name = `${buildingName}（${city}）`;
    } else if (prefecture) {
      name = `${buildingName}（${prefecture}）`;
    } else {
      name = buildingName;
    }
  } else if (prefecture && city && suburb) {
    name = `${prefecture} ${city} ${suburb}`;
  } else if (prefecture && city) {
    name = `${prefecture} ${city}`;
  } else if (city && suburb) {
    name = `${city} ${suburb}`;
  } else if (buildingName) {
    name = buildingName;
  } else {
    name = bestItem.display_name?.split(',').slice(0, 2).join(' ') || query;
  }

  return {
    name,
    lat: parseFloat(bestItem.lat),
    lon: parseFloat(bestItem.lon),
  };
}

export type WeatherProvider = 'open-meteo' | 'openweather' | 'weatherapi';

// ===========================================
// アメダス（気象庁観測データ）の取得
// ===========================================

interface AmedasStation {
  id: string;
  name: string;
  lat: number;
  lon: number;
}

interface AmedasData {
  temp?: number;        // 気温
  humidity?: number;    // 湿度
  wind?: number;        // 風速
  windDirection?: number; // 風向
  precipitation1h?: number; // 1時間降水量
  pressure?: number;    // 気圧
}

// アメダス観測所一覧（キャッシュ）
let amedasStationsCache: AmedasStation[] | null = null;

// アメダス観測所一覧を取得
async function fetchAmedasStations(): Promise<AmedasStation[]> {
  if (amedasStationsCache) {
    return amedasStationsCache;
  }

  try {
    const response = await fetch('https://www.jma.go.jp/bosai/amedas/const/amedastable.json');
    if (!response.ok) throw new Error('Failed to fetch amedas stations');
    
    const data = await response.json();
    const stations: AmedasStation[] = [];
    
    for (const [id, info] of Object.entries(data)) {
      const stationInfo = info as any;
      if (stationInfo.lat && stationInfo.lon) {
        stations.push({
          id,
          name: stationInfo.kjName || stationInfo.knName || id,
          lat: stationInfo.lat[0] + stationInfo.lat[1] / 60,
          lon: stationInfo.lon[0] + stationInfo.lon[1] / 60,
        });
      }
    }
    
    amedasStationsCache = stations;
    return stations;
  } catch (error) {
    console.warn('アメダス観測所一覧の取得に失敗:', error);
    return [];
  }
}

// 最寄りのアメダス観測所を検索
function findNearestAmedasStation(lat: number, lon: number, stations: AmedasStation[]): AmedasStation | null {
  if (stations.length === 0) return null;
  
  let nearest: AmedasStation | null = null;
  let minDistance = Infinity;
  
  for (const station of stations) {
    const dLat = station.lat - lat;
    const dLon = station.lon - lon;
    const distance = Math.sqrt(dLat * dLat + dLon * dLon);
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = station;
    }
  }
  
  // 約50km以内の観測所のみ使用（緯度経度の差が約0.5度以内）
  if (minDistance > 0.5) {
    return null;
  }
  
  return nearest;
}

// アメダスの最新データを取得
async function fetchAmedasLatestData(stationId: string): Promise<AmedasData | null> {
  try {
    // 最新のアメダスデータのタイムスタンプを取得
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    // 10分単位で切り捨て
    const minutes = Math.floor(now.getMinutes() / 10) * 10;
    const min = String(minutes).padStart(2, '0');
    
    // 最新データを取得（10分ごとに更新）
    const timeStr = `${year}${month}${day}_${hour}${min}`;
    const url = `https://www.jma.go.jp/bosai/amedas/data/map/${timeStr}00.json`;
    
    const response = await fetch(url);
    if (!response.ok) {
      // 10分前のデータを試す
      const prevMinutes = minutes === 0 ? 50 : minutes - 10;
      const prevHour = minutes === 0 ? (now.getHours() === 0 ? 23 : now.getHours() - 1) : now.getHours();
      const prevTimeStr = `${year}${month}${day}_${String(prevHour).padStart(2, '0')}${String(prevMinutes).padStart(2, '0')}`;
      const prevUrl = `https://www.jma.go.jp/bosai/amedas/data/map/${prevTimeStr}00.json`;
      
      const prevResponse = await fetch(prevUrl);
      if (!prevResponse.ok) throw new Error('Failed to fetch amedas data');
      
      const prevData = await prevResponse.json();
      return parseAmedasData(prevData, stationId);
    }
    
    const data = await response.json();
    return parseAmedasData(data, stationId);
  } catch (error) {
    console.warn('アメダスデータの取得に失敗:', error);
    return null;
  }
}

// アメダスデータをパース
function parseAmedasData(data: any, stationId: string): AmedasData | null {
  const stationData = data[stationId];
  if (!stationData) return null;
  
  return {
    temp: stationData.temp?.[0] ?? undefined,
    humidity: stationData.humidity?.[0] ?? undefined,
    wind: stationData.wind?.[0] ?? undefined,
    windDirection: stationData.windDirection?.[0] ?? undefined,
    precipitation1h: stationData.precipitation1h?.[0] ?? undefined,
    pressure: stationData.normalPressure?.[0] ?? stationData.pressure?.[0] ?? undefined,
  };
}

// 位置からアメダスデータを取得
export async function fetchAmedasDataForLocation(lat: number, lon: number): Promise<{ data: AmedasData | null; stationName: string | null }> {
  try {
    const stations = await fetchAmedasStations();
    const nearest = findNearestAmedasStation(lat, lon, stations);
    
    if (!nearest) {
      return { data: null, stationName: null };
    }
    
    const data = await fetchAmedasLatestData(nearest.id);
    return { data, stationName: nearest.name };
  } catch (error) {
    console.warn('アメダスデータの取得に失敗:', error);
    return { data: null, stationName: null };
  }
}

// WeatherAPI.com の天気コードを WMO コードにざっくりマップ
function mapWeatherApiCodeToWmo(code?: number | null): number {
  if (!code) return 3; // デフォルト曇り

  if (code === 1000) return 0; // 晴れ
  if (code === 1003) return 1; // 晴れ時々曇り
  if (code === 1006 || code === 1009) return 3; // 曇り

  // 霧・もや
  if ([1030, 1135, 1147].includes(code)) return 45;

  // 雨系
  if (
    (code >= 1063 && code <= 1087) ||
    (code >= 1150 && code <= 1207) ||
    (code >= 1240 && code <= 1246)
  ) {
    return 61; // 雨
  }

  // 雪系
  if (
    (code >= 1066 && code <= 1072) ||
    (code >= 1210 && code <= 1237) ||
    (code >= 1249 && code <= 1264)
  ) {
    return 71; // 雪
  }

  // 雷雨
  if (code >= 1273 && code <= 1282) {
    return 95;
  }

  return 3;
}

function mapOpenWeatherIdToWmoCode(id: number): number {
  // OpenWeather の天気IDを、ざっくりとWMOコードにマップして既存ロジックを再利用
  if (id === 800) return 0; // 快晴
  if (id === 801) return 1; // 晴れ
  if (id === 802) return 2; // 晴れ時々曇り
  if (id === 803 || id === 804) return 3; // 曇り

  if (id >= 200 && id < 300) return 95; // 雷雨
  if (id >= 300 && id < 400) return 51; // 霧雨
  if (id >= 500 && id < 600) return 61; // 雨
  if (id >= 600 && id < 700) return 71; // 雪
  if (id >= 700 && id < 800) return 45; // 霧など

  return 3; // デフォルトで曇り
}

// Open-Meteo から取得
async function fetchFromOpenMeteo(location: CityLocation): Promise<OpenMeteoResponse> {
  // 日本向けに、Open-Meteo の気象庁シームレスモデルを優先的に利用
  // これにより、気象庁の公式値や民間サービス（ウェザーニュース等）に近い傾向の気温になります。
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,uv_index` +
    `&hourly=temperature_2m,weather_code,precipitation_probability,relative_humidity_2m,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max,sunrise,sunset,uv_index_max` +
    `&timezone=Asia/Tokyo&forecast_days=10&models=jma_seamless`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('天気データの取得に失敗しました');
  }
  return response.json();
}

// WeatherAPI.com から取得
async function fetchFromWeatherApi(location: CityLocation): Promise<OpenMeteoResponse> {
  const apiKey = '4149d3986ddd463fa8d50532260602';
  // aqi=yes, alerts=yes にして WeatherAPI の情報を最大限取得
  const url = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location.lat},${location.lon}&days=10&aqi=yes&alerts=yes`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('WeatherAPI.com の取得に失敗しました');
  }

  const data: any = await response.json();

  const current = data.current || {};
  const forecastDays = Array.isArray(data.forecast?.forecastday) ? data.forecast.forecastday : [];
  const alertsRaw = Array.isArray(data.alerts?.alert) ? data.alerts.alert : [];

  // 空気質（AQI）: WeatherAPI は current.air_quality に各種指標を持つ
  const aq = current.air_quality || {};

  const airQualityExtra = {
    pm25: typeof aq.pm2_5 === 'number' ? Math.round(aq.pm2_5) : undefined,
    pm10: typeof aq.pm10 === 'number' ? Math.round(aq.pm10) : undefined,
    o3: typeof aq.o3 === 'number' ? Math.round(aq.o3) : undefined,
    no2: typeof aq.no2 === 'number' ? Math.round(aq.no2) : undefined,
    epa_index: typeof aq['us-epa-index'] === 'number' ? aq['us-epa-index'] : undefined,
  };

  const alertsExtra = alertsRaw.map((a: any) => ({
    headline: a.headline || a.event || '気象警報',
    severity: a.severity || '',
    description: a.desc || a.description || '',
  }));

  // hourly データを連結して 10 日分のタイムラインにする
  const hourlyTime: string[] = [];
  const hourlyTemp: number[] = [];
  const hourlyCode: number[] = [];
  const hourlyPop: number[] = [];
  const hourlyHumidity: number[] = [];
  const hourlyWind: number[] = [];

  for (const day of forecastDays) {
    const hours = Array.isArray(day.hour) ? day.hour : [];
    for (const h of hours) {
      const ts = h.time_epoch ?? 0;
      hourlyTime.push(new Date(ts * 1000).toISOString());
      hourlyTemp.push(h.temp_c ?? 0);
      hourlyCode.push(mapWeatherApiCodeToWmo(h.condition?.code));
      hourlyPop.push(typeof h.chance_of_rain === 'number' ? h.chance_of_rain : Number(h.chance_of_rain ?? 0));
      hourlyHumidity.push(h.humidity ?? 0);
      hourlyWind.push(h.wind_kph ?? 0);
    }
  }

  const dailyTime: string[] = [];
  const dailyMax: number[] = [];
  const dailyMin: number[] = [];
  const dailyCode: number[] = [];
  const dailyPopMax: number[] = [];
  const dailySunrise: string[] = [];
  const dailySunset: string[] = [];
  const dailyUvMax: number[] = [];

  for (const d of forecastDays) {
    const dayInfo = d.day || {};
    dailyTime.push(new Date((d.date_epoch ?? 0) * 1000).toISOString());
    dailyMax.push(dayInfo.maxtemp_c ?? 0);
    dailyMin.push(dayInfo.mintemp_c ?? 0);
    dailyCode.push(mapWeatherApiCodeToWmo(dayInfo.condition?.code));
    dailyPopMax.push(dayInfo.daily_chance_of_rain ?? 0);
    dailySunrise.push(new Date(`${d.date}T${d.astro?.sunrise ?? '06:00'}`).toISOString());
    dailySunset.push(new Date(`${d.date}T${d.astro?.sunset ?? '18:00'}`).toISOString());
    dailyUvMax.push(dayInfo.uv ?? current.uv ?? 0);
  }

  return {
    current: {
      temperature_2m: current.temp_c ?? 0,
      relative_humidity_2m: current.humidity ?? 0,
      apparent_temperature: current.feelslike_c ?? current.temp_c ?? 0,
      weather_code: mapWeatherApiCodeToWmo(current.condition?.code),
      wind_speed_10m: current.wind_kph ?? 0,
      wind_direction_10m: current.wind_degree ?? 0,
      surface_pressure: current.pressure_mb ?? 1013,
      uv_index: current.uv ?? 0,
    },
    hourly: {
      time: hourlyTime,
      temperature_2m: hourlyTemp,
      weather_code: hourlyCode,
      precipitation_probability: hourlyPop,
      relative_humidity_2m: hourlyHumidity,
      wind_speed_10m: hourlyWind,
    },
    daily: {
      time: dailyTime,
      temperature_2m_max: dailyMax,
      temperature_2m_min: dailyMin,
      weather_code: dailyCode,
      precipitation_probability_max: dailyPopMax,
      sunrise: dailySunrise,
      sunset: dailySunset,
      uv_index_max: dailyUvMax,
    },
    air_quality: airQualityExtra,
    alerts: alertsExtra,
  };
}

// OpenWeatherMap から取得（One Call API 3.0）
async function fetchFromOpenWeather(location: CityLocation): Promise<OpenMeteoResponse> {
  const apiKey = (import.meta as any).env?.VITE_OPENWEATHER_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('OpenWeather API key is not set (VITE_OPENWEATHER_API_KEY)');
  }

  const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${location.lat}&lon=${location.lon}` +
    `&units=metric&lang=ja&exclude=minutely,alerts&appid=${apiKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('OpenWeather データの取得に失敗しました');
  }

  const data: any = await response.json();

  const current = data.current || {};
  const hourly = Array.isArray(data.hourly) ? data.hourly : [];
  const daily = Array.isArray(data.daily) ? data.daily : [];

  return {
    current: {
      temperature_2m: current.temp ?? 0,
      relative_humidity_2m: current.humidity ?? 0,
      apparent_temperature: current.feels_like ?? current.temp ?? 0,
      weather_code: mapOpenWeatherIdToWmoCode(current.weather?.[0]?.id ?? 800),
      wind_speed_10m: current.wind_speed ?? 0,
      wind_direction_10m: current.wind_deg ?? 0,
      surface_pressure: current.pressure ?? 1013,
      uv_index: current.uvi ?? 0,
    },
    hourly: {
      time: hourly.map((h: any) => new Date((h.dt ?? 0) * 1000).toISOString()),
      temperature_2m: hourly.map((h: any) => h.temp ?? 0),
      weather_code: hourly.map((h: any) => mapOpenWeatherIdToWmoCode(h.weather?.[0]?.id ?? 800)),
      precipitation_probability: hourly.map((h: any) =>
        typeof h.pop === 'number' ? Math.round(h.pop * 100) : 0
      ),
      relative_humidity_2m: hourly.map((h: any) => h.humidity ?? 0),
      wind_speed_10m: hourly.map((h: any) => h.wind_speed ?? 0),
    },
    daily: {
      time: daily.map((d: any) => new Date((d.dt ?? 0) * 1000).toISOString()),
      temperature_2m_max: daily.map((d: any) => d.temp?.max ?? d.temp?.day ?? 0),
      temperature_2m_min: daily.map((d: any) => d.temp?.min ?? d.temp?.night ?? 0),
      weather_code: daily.map((d: any) => mapOpenWeatherIdToWmoCode(d.weather?.[0]?.id ?? 800)),
      precipitation_probability_max: daily.map((d: any) =>
        typeof d.pop === 'number' ? Math.round(d.pop * 100) : 0
      ),
      sunrise: daily.map((d: any) => new Date((d.sunrise ?? 0) * 1000).toISOString()),
      sunset: daily.map((d: any) => new Date((d.sunset ?? 0) * 1000).toISOString()),
      uv_index_max: daily.map((d: any) => d.uvi ?? 0),
    },
  };
}

// 共通のエクスポート関数（プロバイダを選択可能）
export async function fetchWeatherData(location: CityLocation, provider: WeatherProvider = 'open-meteo'): Promise<OpenMeteoResponse> {
  if (provider === 'weatherapi') {
    try {
      return await fetchFromWeatherApi(location);
    } catch (err) {
      console.warn('WeatherAPI.com からの取得に失敗したため、Open-Meteo にフォールバックします', err);
      return fetchFromOpenMeteo(location);
    }
  }

  if (provider === 'openweather') {
    try {
      return await fetchFromOpenWeather(location);
    } catch (err) {
      console.warn('OpenWeather からの取得に失敗したため、Open-Meteo にフォールバックします', err);
      return fetchFromOpenMeteo(location);
    }
  }

  return fetchFromOpenMeteo(location);
}
