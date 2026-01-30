export function getOrCreateDeviceId() {
  if (typeof window === "undefined") return "";
  const key = "deviceId";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;

  const id =
    typeof window.crypto !== "undefined" && "randomUUID" in window.crypto
      ? window.crypto.randomUUID()
      : `dev-${Math.random().toString(36).slice(2)}-${Date.now()}`;

  window.localStorage.setItem(key, id);
  return id;
}
