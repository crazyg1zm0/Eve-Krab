const BASE = import.meta.env.VITE_API_URL || ""

async function req(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } }
  if (body !== undefined) opts.body = JSON.stringify(body)
  const res = await fetch(`${BASE}/api${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || "Request failed")
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  // Stock
  getStock:        ()                       => req("GET",  "/stock/"),
  updateAlert:     (mat_id, min_alert)      => req("PATCH","/stock/alert", { mat_id, min_alert }),

  // Log
  getLog:          (limit=200)              => req("GET",  `/log/?limit=${limit}`),
  createLog:       (data)                   => req("POST", "/log/", data),
  deleteLog:       (id)                     => req("DELETE",`/log/${id}`),

  // Prices
  getLatestPrices: ()                       => req("GET",  "/prices/latest"),
  refreshPrices:   ()                       => req("POST", "/prices/refresh"),
  getPriceSettings:()                       => req("GET",  "/prices/settings"),
  savePriceSettings:(hub, type, theme)      => req("POST",
    `/prices/settings?price_hub=${hub}&price_type=${type}&theme=${theme}`),

  // Analytics
  getDaily:        (days=14)                => req("GET",  `/analytics/daily?days=${days}`),
  getPerMaterial:  ()                       => req("GET",  "/analytics/per-material"),
}
