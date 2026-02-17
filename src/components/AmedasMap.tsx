import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// =============================
// 全国のアメダス観測地点（約400地点）
// 最北端・最東端・最西端・最南端を含む
// =============================
const STATIONS: { name: string; lat: number; lon: number }[] = [
  // ===== 日本の端っこ =====
  { name: "宗谷岬", lat: 45.5225, lon: 141.9369 }, // 最北端
  { name: "納沙布岬", lat: 43.3869, lon: 145.8200 }, // 最東端
  { name: "与那国島", lat: 24.4678, lon: 122.9428 }, // 最西端
  { name: "波照間島", lat: 24.0536, lon: 123.7858 }, // 最南端
  { name: "南鳥島", lat: 24.2867, lon: 153.9833 }, // 最東端（離島）
  
  // 北海道 (40地点)
  { name: "札幌", lat: 43.0621, lon: 141.3544 },
  { name: "旭川", lat: 43.7707, lon: 142.365 },
  { name: "函館", lat: 41.7686, lon: 140.729 },
  { name: "釧路", lat: 42.985, lon: 144.3814 },
  { name: "帯広", lat: 42.9236, lon: 143.1964 },
  { name: "稚内", lat: 45.4155, lon: 141.6729 },
  { name: "網走", lat: 44.0206, lon: 144.2739 },
  { name: "室蘭", lat: 42.315, lon: 140.9731 },
  { name: "小樽", lat: 43.1907, lon: 140.9947 },
  { name: "北見", lat: 43.8038, lon: 143.8906 },
  { name: "千歳", lat: 42.8206, lon: 141.6506 },
  { name: "苫小牧", lat: 42.6342, lon: 141.6053 },
  { name: "岩見沢", lat: 43.1961, lon: 141.7758 },
  { name: "留萌", lat: 43.938, lon: 141.6369 },
  { name: "紋別", lat: 44.3536, lon: 143.3542 },
  { name: "根室", lat: 43.33, lon: 145.5831 },
  { name: "富良野", lat: 43.3419, lon: 142.3831 },
  { name: "名寄", lat: 44.3572, lon: 142.4631 },
  { name: "倶知安", lat: 42.9011, lon: 140.7578 },
  { name: "江差", lat: 41.8678, lon: 140.1306 },
  { name: "浦河", lat: 42.1656, lon: 142.7731 },
  { name: "広尾", lat: 42.2867, lon: 143.3117 },
  { name: "中標津", lat: 43.5539, lon: 144.9731 },
  { name: "羅臼", lat: 44.0228, lon: 145.1869 },
  { name: "斜里", lat: 43.9114, lon: 144.6728 },
  { name: "遠軽", lat: 44.0589, lon: 143.5278 },
  { name: "士別", lat: 44.1772, lon: 142.3989 },
  { name: "深川", lat: 43.7256, lon: 142.0539 },
  { name: "滝川", lat: 43.5575, lon: 141.9103 },
  { name: "美唄", lat: 43.3336, lon: 141.8522 },
  { name: "夕張", lat: 43.0561, lon: 141.9736 },
  { name: "恵庭", lat: 42.8828, lon: 141.5778 },
  { name: "登別", lat: 42.4128, lon: 141.1064 },
  { name: "伊達", lat: 42.4719, lon: 140.8656 },
  { name: "洞爺湖", lat: 42.5511, lon: 140.8317 },
  { name: "ニセコ", lat: 42.8047, lon: 140.6867 },
  { name: "余市", lat: 43.1956, lon: 140.7911 },
  { name: "石狩", lat: 43.1711, lon: 141.3156 },
  { name: "当別", lat: 43.2256, lon: 141.5172 },
  { name: "美瑛", lat: 43.5878, lon: 142.4672 },

  // 東北 (40地点)
  { name: "青森", lat: 40.8244, lon: 140.74 },
  { name: "盛岡", lat: 39.7036, lon: 141.1525 },
  { name: "仙台", lat: 38.2682, lon: 140.8694 },
  { name: "秋田", lat: 39.7186, lon: 140.1025 },
  { name: "山形", lat: 38.2405, lon: 140.3633 },
  { name: "福島", lat: 37.7608, lon: 140.4747 },
  { name: "八戸", lat: 40.5122, lon: 141.4886 },
  { name: "弘前", lat: 40.5933, lon: 140.4636 },
  { name: "むつ", lat: 41.2931, lon: 141.1831 },
  { name: "宮古", lat: 39.6414, lon: 141.9533 },
  { name: "大船渡", lat: 39.0819, lon: 141.7089 },
  { name: "一関", lat: 38.9344, lon: 141.1286 },
  { name: "花巻", lat: 39.3886, lon: 141.1167 },
  { name: "横手", lat: 39.3108, lon: 140.5531 },
  { name: "大曲", lat: 39.4511, lon: 140.4778 },
  { name: "能代", lat: 40.2094, lon: 140.0261 },
  { name: "酒田", lat: 38.9144, lon: 139.8361 },
  { name: "鶴岡", lat: 38.7272, lon: 139.8267 },
  { name: "新庄", lat: 38.7631, lon: 140.3028 },
  { name: "米沢", lat: 37.9222, lon: 140.1167 },
  { name: "白河", lat: 37.1253, lon: 140.2147 },
  { name: "郡山", lat: 37.4006, lon: 140.3594 },
  { name: "会津若松", lat: 37.4947, lon: 139.9297 },
  { name: "いわき", lat: 37.0505, lon: 140.8878 },
  { name: "石巻", lat: 38.4347, lon: 141.3028 },
  { name: "気仙沼", lat: 38.9069, lon: 141.5689 },
  { name: "古川", lat: 38.5772, lon: 140.9561 },
  { name: "白石", lat: 38.0028, lon: 140.6178 },
  { name: "角田", lat: 37.9756, lon: 140.7817 },
  { name: "二戸", lat: 40.2711, lon: 141.3053 },
  { name: "久慈", lat: 40.1908, lon: 141.7756 },
  { name: "釜石", lat: 39.2758, lon: 141.8858 },
  { name: "北上", lat: 39.2867, lon: 141.1128 },
  { name: "湯沢", lat: 39.1628, lon: 140.4944 },
  { name: "本荘", lat: 39.3861, lon: 140.0489 },
  { name: "大館", lat: 40.2711, lon: 140.5656 },
  { name: "男鹿", lat: 39.8867, lon: 139.8456 },
  { name: "十和田", lat: 40.6128, lon: 141.2028 },
  { name: "三沢", lat: 40.6828, lon: 141.3719 },
  { name: "五所川原", lat: 40.8078, lon: 140.4428 },

  // 関東 (55地点)
  { name: "東京", lat: 35.6895, lon: 139.6917 },
  { name: "横浜", lat: 35.4437, lon: 139.638 },
  { name: "千葉", lat: 35.6047, lon: 140.1233 },
  { name: "さいたま", lat: 35.8617, lon: 139.6455 },
  { name: "水戸", lat: 36.3418, lon: 140.4468 },
  { name: "宇都宮", lat: 36.5658, lon: 139.8836 },
  { name: "前橋", lat: 36.3911, lon: 139.0608 },
  { name: "甲府", lat: 35.6642, lon: 138.5683 },
  { name: "長野", lat: 36.6513, lon: 138.181 },
  { name: "川崎", lat: 35.5308, lon: 139.7029 },
  { name: "相模原", lat: 35.5714, lon: 139.3736 },
  { name: "八王子", lat: 35.6664, lon: 139.316 },
  { name: "立川", lat: 35.6979, lon: 139.4097 },
  { name: "練馬", lat: 35.7356, lon: 139.6517 },
  { name: "世田谷", lat: 35.6461, lon: 139.6533 },
  { name: "府中", lat: 35.6686, lon: 139.4778 },
  { name: "船橋", lat: 35.6947, lon: 139.9828 },
  { name: "柏", lat: 35.8678, lon: 139.9717 },
  { name: "市川", lat: 35.7219, lon: 139.9311 },
  { name: "松戸", lat: 35.7875, lon: 139.9028 },
  { name: "成田", lat: 35.7764, lon: 140.3183 },
  { name: "銚子", lat: 35.7347, lon: 140.8267 },
  { name: "館山", lat: 34.9961, lon: 139.8697 },
  { name: "木更津", lat: 35.3761, lon: 139.9169 },
  { name: "熊谷", lat: 36.1472, lon: 139.3886 },
  { name: "秩父", lat: 35.9922, lon: 139.0853 },
  { name: "川越", lat: 35.9251, lon: 139.4858 },
  { name: "所沢", lat: 35.7989, lon: 139.4689 },
  { name: "越谷", lat: 35.8911, lon: 139.7906 },
  { name: "日立", lat: 36.5994, lon: 140.6514 },
  { name: "土浦", lat: 36.0858, lon: 140.2039 },
  { name: "つくば", lat: 36.0825, lon: 140.1117 },
  { name: "鹿嶋", lat: 35.9656, lon: 140.6447 },
  { name: "日光", lat: 36.7197, lon: 139.6981 },
  { name: "小山", lat: 36.3147, lon: 139.8003 },
  { name: "那須", lat: 36.9883, lon: 140.1211 },
  { name: "高崎", lat: 36.3219, lon: 139.0032 },
  { name: "桐生", lat: 36.4108, lon: 139.3308 },
  { name: "沼田", lat: 36.6439, lon: 139.0439 },
  { name: "小田原", lat: 35.2644, lon: 139.1522 },
  { name: "厚木", lat: 35.4411, lon: 139.3617 },
  { name: "藤沢", lat: 35.3386, lon: 139.4903 },
  { name: "横須賀", lat: 35.2814, lon: 139.6722 },
  { name: "鎌倉", lat: 35.3192, lon: 139.5467 },
  { name: "平塚", lat: 35.3294, lon: 139.3497 },
  { name: "松本", lat: 36.2381, lon: 137.972 },
  { name: "上田", lat: 36.4028, lon: 138.2489 },
  { name: "飯田", lat: 35.5147, lon: 137.8219 },
  { name: "諏訪", lat: 36.0392, lon: 138.1144 },
  { name: "軽井沢", lat: 36.3486, lon: 138.5969 },
  { name: "佐野", lat: 36.3144, lon: 139.5786 },
  { name: "足利", lat: 36.3408, lon: 139.4497 },
  { name: "真岡", lat: 36.4419, lon: 140.0114 },
  { name: "栃木", lat: 36.3819, lon: 139.7306 },
  { name: "伊勢崎", lat: 36.3111, lon: 139.1967 },

  // 中部 (50地点)
  { name: "新潟", lat: 37.9161, lon: 139.0364 },
  { name: "富山", lat: 36.6953, lon: 137.2114 },
  { name: "金沢", lat: 36.5944, lon: 136.6256 },
  { name: "福井", lat: 36.0652, lon: 136.2217 },
  { name: "名古屋", lat: 35.1815, lon: 136.9066 },
  { name: "岐阜", lat: 35.4232, lon: 136.7606 },
  { name: "静岡", lat: 34.9769, lon: 138.383 },
  { name: "津", lat: 34.7303, lon: 136.5086 },
  { name: "長岡", lat: 37.4469, lon: 138.8511 },
  { name: "上越", lat: 37.1481, lon: 138.2364 },
  { name: "佐渡", lat: 38.0186, lon: 138.3678 },
  { name: "高岡", lat: 36.7539, lon: 137.0258 },
  { name: "魚津", lat: 36.8264, lon: 137.4086 },
  { name: "氷見", lat: 36.8572, lon: 136.9878 },
  { name: "七尾", lat: 37.0428, lon: 136.9661 },
  { name: "輪島", lat: 37.3906, lon: 136.8989 },
  { name: "敦賀", lat: 35.6453, lon: 136.0553 },
  { name: "小浜", lat: 35.4958, lon: 135.7461 },
  { name: "浜松", lat: 34.7108, lon: 137.7261 },
  { name: "沼津", lat: 35.0956, lon: 138.8636 },
  { name: "富士", lat: 35.1614, lon: 138.6764 },
  { name: "三島", lat: 35.1186, lon: 138.9189 },
  { name: "伊豆", lat: 34.9717, lon: 138.9456 },
  { name: "御前崎", lat: 34.6378, lon: 138.2278 },
  { name: "高山", lat: 36.1461, lon: 137.2522 },
  { name: "多治見", lat: 35.3328, lon: 137.1322 },
  { name: "大垣", lat: 35.3664, lon: 136.6128 },
  { name: "中津川", lat: 35.4875, lon: 137.5006 },
  { name: "豊橋", lat: 34.7692, lon: 137.3917 },
  { name: "岡崎", lat: 34.9544, lon: 137.1625 },
  { name: "豊田", lat: 35.0836, lon: 137.1561 },
  { name: "一宮", lat: 35.3039, lon: 136.8031 },
  { name: "春日井", lat: 35.2475, lon: 136.9722 },
  { name: "四日市", lat: 34.9649, lon: 136.6244 },
  { name: "鈴鹿", lat: 34.8819, lon: 136.5839 },
  { name: "伊勢", lat: 34.4869, lon: 136.7092 },
  { name: "尾鷲", lat: 34.0711, lon: 136.1911 },
  { name: "熊野", lat: 33.8886, lon: 136.0989 },
  { name: "柏崎", lat: 37.3722, lon: 138.5589 },
  { name: "三条", lat: 37.6369, lon: 138.9611 },
  { name: "村上", lat: 38.2236, lon: 139.4789 },
  { name: "糸魚川", lat: 37.0411, lon: 137.8614 },
  { name: "十日町", lat: 37.1294, lon: 138.7561 },
  { name: "妙高", lat: 36.9928, lon: 138.2478 },
  { name: "小松", lat: 36.4028, lon: 136.4456 },
  { name: "加賀", lat: 36.3028, lon: 136.3147 },
  { name: "白山", lat: 36.5147, lon: 136.5656 },
  { name: "砺波", lat: 36.6478, lon: 136.9614 },
  { name: "黒部", lat: 36.8689, lon: 137.4486 },
  { name: "越前", lat: 35.9028, lon: 136.1639 },

  // 近畿 (45地点)
  { name: "大阪", lat: 34.6937, lon: 135.5022 },
  { name: "京都", lat: 35.0116, lon: 135.7681 },
  { name: "神戸", lat: 34.69, lon: 135.1956 },
  { name: "奈良", lat: 34.6851, lon: 135.8048 },
  { name: "和歌山", lat: 34.2261, lon: 135.1675 },
  { name: "大津", lat: 35.0045, lon: 135.8686 },
  { name: "姫路", lat: 34.8153, lon: 134.6853 },
  { name: "堺", lat: 34.5733, lon: 135.4831 },
  { name: "東大阪", lat: 34.6794, lon: 135.6008 },
  { name: "豊中", lat: 34.7814, lon: 135.4694 },
  { name: "吹田", lat: 34.7561, lon: 135.5178 },
  { name: "高槻", lat: 34.8428, lon: 135.6172 },
  { name: "茨木", lat: 34.8167, lon: 135.5686 },
  { name: "枚方", lat: 34.8144, lon: 135.6503 },
  { name: "西宮", lat: 34.7378, lon: 135.3417 },
  { name: "尼崎", lat: 34.7333, lon: 135.4064 },
  { name: "明石", lat: 34.6431, lon: 134.9972 },
  { name: "加古川", lat: 34.7567, lon: 134.8414 },
  { name: "宝塚", lat: 34.7994, lon: 135.3603 },
  { name: "伊丹", lat: 34.7847, lon: 135.4006 },
  { name: "川西", lat: 34.8297, lon: 135.4156 },
  { name: "三田", lat: 34.8894, lon: 135.2272 },
  { name: "宇治", lat: 34.8842, lon: 135.8003 },
  { name: "舞鶴", lat: 35.4414, lon: 135.3858 },
  { name: "福知山", lat: 35.2914, lon: 135.1283 },
  { name: "亀岡", lat: 35.0147, lon: 135.5803 },
  { name: "彦根", lat: 35.2761, lon: 136.2519 },
  { name: "長浜", lat: 35.3814, lon: 136.2692 },
  { name: "近江八幡", lat: 35.1286, lon: 136.0978 },
  { name: "田辺", lat: 33.7308, lon: 135.3778 },
  { name: "新宮", lat: 33.7283, lon: 135.9883 },
  { name: "白浜", lat: 33.6822, lon: 135.3481 },
  { name: "橿原", lat: 34.5092, lon: 135.7928 },
  { name: "生駒", lat: 34.6922, lon: 135.7006 },
  { name: "天理", lat: 34.5969, lon: 135.8372 },
  { name: "桜井", lat: 34.5178, lon: 135.8419 },
  { name: "豊岡", lat: 35.5439, lon: 134.8206 },
  { name: "洲本", lat: 34.3489, lon: 134.8922 },
  { name: "赤穂", lat: 34.7547, lon: 134.3906 },
  { name: "龍野", lat: 34.8592, lon: 134.5544 },
  { name: "相生", lat: 34.8031, lon: 134.4675 },
  { name: "豊岡", lat: 35.5439, lon: 134.8206 },
  { name: "丹波", lat: 35.1778, lon: 135.0453 },
  { name: "草津", lat: 35.0156, lon: 135.9608 },
  { name: "守山", lat: 35.0578, lon: 135.9944 },

  // 中国 (40地点)
  { name: "広島", lat: 34.3853, lon: 132.4553 },
  { name: "岡山", lat: 34.6617, lon: 133.935 },
  { name: "松江", lat: 35.4722, lon: 133.0505 },
  { name: "鳥取", lat: 35.5039, lon: 134.2378 },
  { name: "山口", lat: 34.1861, lon: 131.4706 },
  { name: "下関", lat: 33.9508, lon: 130.9181 },
  { name: "福山", lat: 34.4858, lon: 133.3622 },
  { name: "呉", lat: 34.2492, lon: 132.5658 },
  { name: "尾道", lat: 34.4089, lon: 133.205 },
  { name: "三原", lat: 34.3978, lon: 133.0781 },
  { name: "東広島", lat: 34.4269, lon: 132.7431 },
  { name: "廿日市", lat: 34.3492, lon: 132.3311 },
  { name: "倉敷", lat: 34.585, lon: 133.7722 },
  { name: "津山", lat: 35.0681, lon: 134.0078 },
  { name: "笠岡", lat: 34.5061, lon: 133.5058 },
  { name: "総社", lat: 34.6722, lon: 133.7464 },
  { name: "玉野", lat: 34.4917, lon: 133.9456 },
  { name: "出雲", lat: 35.3669, lon: 132.7547 },
  { name: "浜田", lat: 34.8994, lon: 132.0803 },
  { name: "益田", lat: 34.6781, lon: 131.8422 },
  { name: "大田", lat: 35.1878, lon: 132.5019 },
  { name: "米子", lat: 35.4283, lon: 133.3306 },
  { name: "倉吉", lat: 35.4297, lon: 133.8256 },
  { name: "境港", lat: 35.5392, lon: 133.2319 },
  { name: "周南", lat: 34.0556, lon: 131.8056 },
  { name: "岩国", lat: 34.1672, lon: 132.2197 },
  { name: "萩", lat: 34.4081, lon: 131.3992 },
  { name: "防府", lat: 34.0514, lon: 131.5628 },
  { name: "宇部", lat: 33.9519, lon: 131.2469 },
  { name: "長門", lat: 34.3711, lon: 131.1828 },
  { name: "柳井", lat: 33.9644, lon: 132.1078 },
  { name: "三次", lat: 34.8022, lon: 132.8511 },
  { name: "庄原", lat: 34.8536, lon: 133.0194 },
  { name: "府中広島", lat: 34.5683, lon: 133.2369 },
  { name: "竹原", lat: 34.3411, lon: 132.9086 },
  { name: "安来", lat: 35.4322, lon: 133.2506 },
  { name: "雲南", lat: 35.3011, lon: 132.8947 },
  { name: "新見", lat: 34.9789, lon: 133.4686 },
  { name: "真庭", lat: 35.0794, lon: 133.7472 },
  { name: "高梁", lat: 34.7911, lon: 133.6172 },

  // 四国 (35地点)
  { name: "高松", lat: 34.3403, lon: 134.0433 },
  { name: "松山", lat: 33.8392, lon: 132.7656 },
  { name: "高知", lat: 33.5597, lon: 133.5311 },
  { name: "徳島", lat: 34.0658, lon: 134.5594 },
  { name: "今治", lat: 34.0661, lon: 132.9978 },
  { name: "新居浜", lat: 33.9603, lon: 133.2831 },
  { name: "宇和島", lat: 33.2239, lon: 132.5606 },
  { name: "西条", lat: 33.9203, lon: 133.1831 },
  { name: "四国中央", lat: 33.9803, lon: 133.5497 },
  { name: "丸亀", lat: 34.2897, lon: 133.7978 },
  { name: "坂出", lat: 34.3153, lon: 133.8547 },
  { name: "観音寺", lat: 34.1272, lon: 133.6611 },
  { name: "さぬき", lat: 34.3269, lon: 134.1764 },
  { name: "三豊", lat: 34.1831, lon: 133.7147 },
  { name: "鳴門", lat: 34.1778, lon: 134.6094 },
  { name: "阿南", lat: 33.9219, lon: 134.6594 },
  { name: "吉野川", lat: 34.0656, lon: 134.3425 },
  { name: "美馬", lat: 34.0536, lon: 134.1592 },
  { name: "室戸", lat: 33.2889, lon: 134.1514 },
  { name: "安芸", lat: 33.5019, lon: 133.9058 },
  { name: "南国", lat: 33.5756, lon: 133.6372 },
  { name: "土佐", lat: 33.4969, lon: 133.4247 },
  { name: "四万十", lat: 33.0028, lon: 132.9347 },
  { name: "須崎", lat: 33.4003, lon: 133.2847 },
  { name: "宿毛", lat: 32.9383, lon: 132.7286 },
  { name: "八幡浜", lat: 33.4625, lon: 132.4228 },
  { name: "大洲", lat: 33.5069, lon: 132.5456 },
  { name: "西予", lat: 33.3636, lon: 132.5097 },
  { name: "東温", lat: 33.7894, lon: 132.8719 },
  { name: "伊予", lat: 33.7556, lon: 132.7031 },
  { name: "小豆島", lat: 34.4833, lon: 134.2333 },
  { name: "三好", lat: 34.0256, lon: 133.8083 },
  { name: "土佐清水", lat: 32.7806, lon: 132.9572 },
  { name: "香南", lat: 33.5581, lon: 133.6925 },
  { name: "いの", lat: 33.5472, lon: 133.4269 },

  // 九州 (45地点)
  { name: "福岡", lat: 33.6064, lon: 130.4181 },
  { name: "北九州", lat: 33.8833, lon: 130.8752 },
  { name: "佐賀", lat: 33.2494, lon: 130.2989 },
  { name: "長崎", lat: 32.7503, lon: 129.8779 },
  { name: "熊本", lat: 32.7898, lon: 130.7417 },
  { name: "大分", lat: 33.2382, lon: 131.6126 },
  { name: "宮崎", lat: 31.9111, lon: 131.4239 },
  { name: "鹿児島", lat: 31.5603, lon: 130.5581 },
  { name: "久留米", lat: 33.3194, lon: 130.5081 },
  { name: "飯塚", lat: 33.6464, lon: 130.6914 },
  { name: "大牟田", lat: 33.0303, lon: 130.4456 },
  { name: "直方", lat: 33.7414, lon: 130.7297 },
  { name: "田川", lat: 33.6403, lon: 130.8058 },
  { name: "柳川", lat: 33.1631, lon: 130.4078 },
  { name: "八女", lat: 33.2122, lon: 130.5578 },
  { name: "佐世保", lat: 33.1803, lon: 129.7147 },
  { name: "諫早", lat: 32.8439, lon: 130.0531 },
  { name: "島原", lat: 32.7869, lon: 130.3703 },
  { name: "大村", lat: 32.9225, lon: 129.9589 },
  { name: "五島", lat: 32.6969, lon: 128.8422 },
  { name: "対馬", lat: 34.2028, lon: 129.2875 },
  { name: "壱岐", lat: 33.7492, lon: 129.6914 },
  { name: "八代", lat: 32.5069, lon: 130.6028 },
  { name: "天草", lat: 32.4569, lon: 130.1947 },
  { name: "人吉", lat: 32.2108, lon: 130.7631 },
  { name: "阿蘇", lat: 32.9494, lon: 131.0928 },
  { name: "別府", lat: 33.2847, lon: 131.4911 },
  { name: "中津", lat: 33.5975, lon: 131.1878 },
  { name: "日田", lat: 33.3211, lon: 130.9414 },
  { name: "佐伯", lat: 32.9589, lon: 131.8992 },
  { name: "臼杵", lat: 33.1258, lon: 131.8047 },
  { name: "延岡", lat: 32.5822, lon: 131.6656 },
  { name: "都城", lat: 31.7256, lon: 131.0619 },
  { name: "日南", lat: 31.6036, lon: 131.3678 },
  { name: "小林", lat: 31.9989, lon: 130.9728 },
  { name: "鹿屋", lat: 31.3781, lon: 130.8528 },
  { name: "枕崎", lat: 31.2728, lon: 130.2972 },
  { name: "指宿", lat: 31.2531, lon: 130.6331 },
  { name: "出水", lat: 32.0878, lon: 130.3561 },
  { name: "薩摩川内", lat: 31.8133, lon: 130.3042 },
  { name: "霧島", lat: 31.7408, lon: 130.7631 },
  { name: "姶良", lat: 31.7306, lon: 130.6297 },
  { name: "日置", lat: 31.6289, lon: 130.3867 },
  { name: "南さつま", lat: 31.4189, lon: 130.3289 },
  { name: "垂水", lat: 31.4919, lon: 130.7031 },

  // 沖縄・離島 (40地点)
  { name: "那覇", lat: 26.2124, lon: 127.6809 },
  { name: "石垣島", lat: 24.3406, lon: 124.1556 },
  { name: "宮古島", lat: 24.8055, lon: 125.2811 },
  { name: "名護", lat: 26.5917, lon: 127.9775 },
  { name: "糸満", lat: 26.1236, lon: 127.6656 },
  { name: "沖縄市", lat: 26.3344, lon: 127.8056 },
  { name: "うるま", lat: 26.3794, lon: 127.8578 },
  { name: "浦添", lat: 26.2458, lon: 127.7214 },
  { name: "宜野湾", lat: 26.2817, lon: 127.7783 },
  { name: "豊見城", lat: 26.1611, lon: 127.6686 },
  { name: "久米島", lat: 26.3378, lon: 126.8039 },
  { name: "南大東", lat: 25.8289, lon: 131.2328 },
  { name: "北大東", lat: 25.9456, lon: 131.2989 },
  { name: "西表島", lat: 24.4, lon: 123.8 },
  { name: "竹富島", lat: 24.3256, lon: 124.0833 },
  { name: "多良間", lat: 24.6678, lon: 124.7028 },
  { name: "奄美", lat: 28.3778, lon: 129.4944 },
  { name: "種子島", lat: 30.7269, lon: 130.9919 },
  { name: "屋久島", lat: 30.3706, lon: 130.6589 },
  { name: "徳之島", lat: 27.7333, lon: 128.9833 },
  { name: "沖永良部", lat: 27.3833, lon: 128.5667 },
  { name: "与論", lat: 27.0467, lon: 128.4133 },
  { name: "喜界島", lat: 28.3167, lon: 129.9333 },
  { name: "加計呂麻", lat: 28.1167, lon: 129.2833 },
  { name: "八丈島", lat: 33.1136, lon: 139.7858 },
  { name: "三宅島", lat: 34.0742, lon: 139.5256 },
  { name: "大島", lat: 34.7522, lon: 139.3572 },
  { name: "小笠原", lat: 27.0936, lon: 142.1917 },
  { name: "読谷", lat: 26.3956, lon: 127.7444 },
  { name: "北谷", lat: 26.3267, lon: 127.7656 },
  { name: "嘉手納", lat: 26.3611, lon: 127.7544 },
  { name: "恩納", lat: 26.4978, lon: 127.8522 },
  { name: "本部", lat: 26.6578, lon: 127.8778 },
  { name: "今帰仁", lat: 26.6856, lon: 127.9667 },
  { name: "国頭", lat: 26.7528, lon: 128.1778 },
  { name: "伊平屋", lat: 27.0411, lon: 127.9667 },
  { name: "伊是名", lat: 26.9278, lon: 127.9389 },
  { name: "渡嘉敷", lat: 26.1989, lon: 127.3644 },
  { name: "座間味", lat: 26.2267, lon: 127.3028 },
  { name: "粟国", lat: 26.5778, lon: 127.2256 },
];

// 型定義
interface StationData {
  temp: number;
  humidity: number;
  windSpeed: number;
  rain: number;
  pressure?: number;
  weatherCode?: number;
}

type Mode = "temp" | "rain" | "wind" | "humidity";

// 色計算関数
function getColor(mode: Mode, data: StationData | undefined): string {
  if (!data) return "#6b7280";
  
  switch (mode) {
    case "temp": {
      const t = data.temp;
      if (t < -5) return "#1e3a8a";
      if (t < 0) return "#3b82f6";
      if (t < 5) return "#06b6d4";
      if (t < 10) return "#22d3ee";
      if (t < 15) return "#4ade80";
      if (t < 20) return "#22c55e";
      if (t < 25) return "#eab308";
      if (t < 30) return "#f97316";
      if (t < 35) return "#ef4444";
      return "#991b1b";
    }
    case "rain": {
      const r = data.rain;
      if (r <= 0) return "#6b7280";
      if (r < 1) return "#67e8f9";
      if (r < 5) return "#22d3ee";
      if (r < 10) return "#0ea5e9";
      if (r < 20) return "#eab308";
      if (r < 30) return "#f97316";
      return "#ef4444";
    }
    case "wind": {
      const w = data.windSpeed;
      if (w < 2) return "#22d3ee";
      if (w < 5) return "#4ade80";
      if (w < 10) return "#eab308";
      if (w < 15) return "#f97316";
      return "#ef4444";
    }
    case "humidity": {
      const h = data.humidity;
      if (h < 30) return "#f97316";
      if (h < 50) return "#eab308";
      if (h < 70) return "#4ade80";
      if (h < 85) return "#22d3ee";
      return "#3b82f6";
    }
  }
}

// 天気絵文字
function getWeatherEmoji(code?: number): string {
  if (!code) return "🌤️";
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 49) return "🌫️";
  if (code <= 69) return "🌧️";
  if (code <= 79) return "❄️";
  if (code <= 82) return "🌧️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

// 凡例データ
const LEGENDS = {
  temp: [
    { label: "-5°以下", color: "#1e3a8a" },
    { label: "0°", color: "#3b82f6" },
    { label: "10°", color: "#22d3ee" },
    { label: "20°", color: "#22c55e" },
    { label: "25°", color: "#eab308" },
    { label: "30°", color: "#f97316" },
    { label: "35°以上", color: "#991b1b" },
  ],
  rain: [
    { label: "0mm", color: "#6b7280" },
    { label: "1mm", color: "#67e8f9" },
    { label: "5mm", color: "#0ea5e9" },
    { label: "10mm", color: "#eab308" },
    { label: "20mm", color: "#f97316" },
    { label: "30mm+", color: "#ef4444" },
  ],
  wind: [
    { label: "2m/s", color: "#22d3ee" },
    { label: "5m/s", color: "#4ade80" },
    { label: "10m/s", color: "#eab308" },
    { label: "15m/s+", color: "#ef4444" },
  ],
  humidity: [
    { label: "30%", color: "#f97316" },
    { label: "50%", color: "#eab308" },
    { label: "70%", color: "#4ade80" },
    { label: "85%+", color: "#3b82f6" },
  ],
};

export default function AmedasMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.CircleMarker[]>([]);
  
  const [mode, setMode] = useState<Mode>("temp");
  const [stationData, setStationData] = useState<Record<string, StationData>>({});
  const [selectedStation, setSelectedStation] = useState<{ name: string; data: StationData } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  // データ取得
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      setLoadedCount(0);
      const newData: Record<string, StationData> = {};
      const batchSize = 25;
      
      for (let i = 0; i < STATIONS.length; i += batchSize) {
        const batch = STATIONS.slice(i, i + batchSize);
        
        await Promise.all(
          batch.map(async (station) => {
            try {
              const res = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${station.lat}&longitude=${station.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,surface_pressure,weather_code&timezone=Asia/Tokyo`
              );
              const json = await res.json();
              if (json.current) {
                newData[station.name] = {
                  temp: Math.round(json.current.temperature_2m),
                  humidity: json.current.relative_humidity_2m,
                  windSpeed: Math.round(json.current.wind_speed_10m),
                  rain: json.current.precipitation || 0,
                  pressure: Math.round(json.current.surface_pressure),
                  weatherCode: json.current.weather_code,
                };
              }
            } catch (e) {
              console.warn(`Failed to fetch ${station.name}:`, e);
            }
          })
        );
        
        setLoadedCount(Math.min(i + batchSize, STATIONS.length));
        
        if (i + batchSize < STATIONS.length) {
          await new Promise((r) => setTimeout(r, 80));
        }
      }
      
      setStationData(newData);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  // マップ初期化
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current, {
      center: [36.5, 138],
      zoom: 5,
      zoomControl: true,
      scrollWheelZoom: true,
      dragging: true,
      touchZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '© OSM',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // マーカー更新
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    STATIONS.forEach((station) => {
      const data = stationData[station.name];
      
      // 降水モードでは雨が降っている地点のみ表示
      if (mode === "rain" && (!data || data.rain <= 0)) {
        return;
      }

      const color = getColor(mode, data);
      const hasData = !!data;

      const marker = L.circleMarker([station.lat, station.lon], {
        radius: hasData ? 7 : 4,
        fillColor: color,
        color: "#fff",
        weight: hasData ? 2 : 1,
        fillOpacity: hasData ? 0.9 : 0.4,
      }).addTo(map);

      marker.on("click", () => {
        if (data) setSelectedStation({ name: station.name, data });
      });

      marker.on("mouseover", () => marker.setStyle({ radius: 12, weight: 3 }));
      marker.on("mouseout", () => marker.setStyle({ radius: hasData ? 7 : 4, weight: hasData ? 2 : 1 }));

      markersRef.current.push(marker);
    });
  }, [stationData, mode]);

  const modeButtons: { key: Mode; icon: string; label: string }[] = [
    { key: "temp", icon: "🌡️", label: "気温" },
    { key: "rain", icon: "🌧️", label: "降水" },
    { key: "wind", icon: "💨", label: "風速" },
    { key: "humidity", icon: "💧", label: "湿度" },
  ];

  return (
    <div className="bg-slate-800 rounded-xl overflow-hidden">
      {/* ヘッダー */}
      <div className="p-3 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">📍</span>
          <span className="font-medium">JMA アメダス</span>
          <span className="text-xs text-slate-400">{STATIONS.length}地点</span>
        </div>
        {isLoading ? (
          <span className="px-2 py-1 rounded text-xs bg-amber-500/20 text-amber-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
            {loadedCount}/{STATIONS.length}
          </span>
        ) : (
          <span className="px-2 py-1 rounded text-xs bg-emerald-500/20 text-emerald-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            LIVE
          </span>
        )}
      </div>

      {/* モード切替 */}
      <div className="p-2 border-b border-slate-700 flex gap-1">
        {modeButtons.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={`flex-1 py-2 text-sm rounded-lg transition-all ${
              mode === m.key
                ? "bg-sky-600 text-white font-medium"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* マップ */}
      <div className="relative" style={{ height: "400px" }}>
        <div ref={mapRef} className="absolute inset-0 z-0" />
        
        {/* ローディング画面 */}
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center z-50">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-sky-500 rounded-full animate-spin mb-4" />
            <p className="text-white text-xl font-medium mb-2">ローディング中...</p>
            <p className="text-slate-400 text-sm mb-4">{loadedCount} / {STATIONS.length} 地点を取得中</p>
            <div className="w-64 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${(loadedCount / STATIONS.length) * 100}%` }}
              />
            </div>
            <p className="text-slate-500 text-xs mt-2">{Math.round((loadedCount / STATIONS.length) * 100)}%</p>
          </div>
        )}

        {/* 凡例 */}
        {!isLoading && (
          <div className="absolute bottom-3 left-3 bg-slate-900/90 rounded-lg p-2 z-10">
            <div className="text-xs text-slate-400 mb-1">
              {mode === "temp" && "気温"}
              {mode === "rain" && "降水量"}
              {mode === "wind" && "風速"}
              {mode === "humidity" && "湿度"}
            </div>
            <div className="flex gap-1">
              {LEGENDS[mode].map((item, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div 
                    className="w-4 h-4 rounded-full border border-white/30"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 地点数表示 */}
        {!isLoading && (
          <div className="absolute top-3 right-3 bg-slate-900/80 rounded-lg px-2 py-1 z-10">
            <span className="text-xs text-slate-300">
              {mode === "rain" 
                ? `${Object.values(stationData).filter(d => d.rain > 0).length} 地点で降水中`
                : `${Object.keys(stationData).length} 地点を表示中`
              }
            </span>
          </div>
        )}
      </div>

      {/* 選択した地点の詳細 */}
      {selectedStation && (
        <div className="p-3 border-t border-slate-700 bg-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-lg flex items-center gap-2">
              {getWeatherEmoji(selectedStation.data.weatherCode)}
              {selectedStation.name}
            </span>
            <button
              onClick={() => setSelectedStation(null)}
              className="w-7 h-7 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 flex items-center justify-center"
            >
              ✕
            </button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-slate-400 text-xs">気温</div>
              <div className="font-bold text-lg">{selectedStation.data.temp}°</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-slate-400 text-xs">湿度</div>
              <div className="font-bold text-lg">{selectedStation.data.humidity}%</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-slate-400 text-xs">風速</div>
              <div className="font-bold text-lg">{selectedStation.data.windSpeed}<span className="text-xs">m/s</span></div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-slate-400 text-xs">降水</div>
              <div className="font-bold text-lg">{selectedStation.data.rain}<span className="text-xs">mm</span></div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-2 text-center">
              <div className="text-slate-400 text-xs">気圧</div>
              <div className="font-bold text-lg">{selectedStation.data.pressure || "-"}</div>
            </div>
          </div>
        </div>
      )}

      {/* フッター */}
      <div className="p-2 border-t border-slate-700 flex items-center justify-between text-xs text-slate-500">
        <span>ドラッグ&スクロールで操作</span>
        <span>Data: Open-Meteo API</span>
      </div>
    </div>
  );
}
