// Oddiy, xotira-asosli rate limiter.
// Eslatma: Vercel serverless muhitida bu xotira instance'lar orasida
// umumiy emas va cold start'da tozalanadi — bu 100% mukammal himoya emas,
// lekin spam/xato tufayli ketma-ket so'rovlarning oldini olish uchun yetarli.

type Entry = { count: number; resetAt: number }

const store = new Map<string, Entry>()

// Xotira cheksiz o'smasligi uchun vaqti-vaqti bilan eski yozuvlarni tozalaymiz
function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}

/**
 * @param key      Foydalanuvchini aniqlovchi kalit (odatda IP + endpoint nomi)
 * @param limit    Ruxsat etilgan maksimal so'rovlar soni
 * @param windowMs Vaqt oynasi (millisekundda)
 * @returns        { allowed: boolean, retryAfterSec?: number }
 */
export function rateLimit(key: string, limit: number, windowMs: number): { allowed: boolean; retryAfterSec?: number } {
  if (store.size > 5000) cleanup() // xotira haddan tashqari o'smasin

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true }
  }

  if (entry.count >= limit) {
    return { allowed: false, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { allowed: true }
}

/** So'rovdan foydalanuvchi IP manzilini olish (Vercel/Next.js uchun) */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
