
export interface LocationData {
  lat: number;
  lng: number;
  city?: string;
}

export interface ZmanimData {
  date: string;
  hebrew: string;
  parasha: string;
  times: {
    alotHaShachar: string;
    misheyakir: string;
    sunrise: string;
    sofZmanShmaMGA: string;
    sofZmanShmaGRA: string;
    sofZmanTfillaGRA: string;
    chatzot: string;
    minchaGedola: string;
    minchaKetana: string;
    plagHaMincha: string;
    sunset: string;
    tzeitHaKochavim: string;
    candleLighting?: string;
    havdalah?: string;
  };
}

export interface PrayerItem {
  id: string;
  name: string;
  time: string;
}

export interface AppSettings {
  announcements: string[];
  prayers: PrayerItem[];
  lessons: PrayerItem[];
}
