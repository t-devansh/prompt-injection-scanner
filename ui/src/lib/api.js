export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function scan(target) {
  // target is { url: "https://..." } OR { html: "<div>..." }
  const res = await fetch(`${API_BASE}/scan`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target),
  });
  // API returns 200 normally, or 409 with a full JSON body when fail_on trips.
  const data = await res.json().catch(() => ({}));
  if (!res.ok && res.status !== 409) {
    throw new Error(`Scan failed (${res.status})`);
  }
  return data;
}
