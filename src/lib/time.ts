export function secsToH(s: number) {
  return (s / 3600).toFixed(1);
}

export function secsToHms(s: number) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
