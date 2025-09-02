// ui/src/lib/api.js
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export async function scan(target, { failOn = "none", rendered = false } = {}) {
  const params = new URLSearchParams();
  if (failOn && failOn !== "none") params.set("fail_on", failOn);
  if (rendered) params.set("rendered", "true");

  const res = await fetch(`${API_BASE}/scan?${params.toString()}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(target),
  });

  const data = await res.json().catch(() => ({}));

  if (res.status === 409) {
    // Special case: fail_on threshold tripped
    return { ...data, _failOnTriggered: true };
  }

  if (!res.ok) {
    throw new Error(`Scan failed (${res.status})`);
  }

  return data;
}

export async function getReport(target, { failOn = "none", rendered = false } = {}) {
  const params = new URLSearchParams();
  if (failOn && failOn !== "none") params.set("fail_on", failOn);
  if (rendered) params.set("rendered", "true");

  const res = await fetch(`${API_BASE}/report?${params.toString()}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/html",
    },
    body: JSON.stringify(target),
  });

  const html = await res.text();
  if (!res.ok) {
    throw new Error(`Report failed (${res.status})`);
  }
  return html;
}
