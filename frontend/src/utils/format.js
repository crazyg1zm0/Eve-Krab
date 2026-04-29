export function formatISK(val) {
  if (val === null || val === undefined) return '—'
  const n = Number(val)
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B'
  if (n >= 1_000_000)     return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000)         return (n / 1_000).toFixed(1) + 'K'
  return n.toFixed(2)
}

export function formatQty(val) {
  if (val === null || val === undefined) return '—'
  const n = Number(val)
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return n.toLocaleString()
}

export function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}
