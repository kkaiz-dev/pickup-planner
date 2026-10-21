// 時刻（時:分）。日付をまたぐ計算はしない（v1では1日の中だけで完結する）。
export type ClockTime = {
  readonly hours: number;
  readonly minutes: number;
};

export function clockTime(hours: number, minutes: number): ClockTime {
  return { hours, minutes };
}

export function addMinutes(time: ClockTime, delta: number): ClockTime {
  const total = time.hours * 60 + time.minutes + delta;
  const wrapped = ((total % (24 * 60)) + 24 * 60) % (24 * 60);
  return clockTime(Math.floor(wrapped / 60), wrapped % 60);
}

export function subtractMinutes(time: ClockTime, delta: number): ClockTime {
  return addMinutes(time, -delta);
}

export function formatClockTime(time: ClockTime): string {
  const h = String(time.hours).padStart(2, "0");
  const m = String(time.minutes).padStart(2, "0");
  return `${h}:${m}`;
}
