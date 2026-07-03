/**
 * Minimal in-memory, tag-based cache for DB reads.
 * There's no Next.js `unstable_cache` here (this is a plain Express API),
 * so reads are memoized per key and invalidated by tag when the admin writes.
 *
 * @typedef {Object} CacheEntry
 * @property {any} value
 * @property {string[]} tags
 */

/** @type {Map<string, CacheEntry>} */
const store = new Map();

/**
 * @param {string} key
 * @param {string[]} tags
 * @param {() => Promise<any>} loader
 * @param {number} [ttlMs]
 */
export async function cached(key, tags, loader, ttlMs = 60_000) {
  const existing = store.get(key);
  if (existing && existing.expiresAt > Date.now()) {
    return existing.value;
  }
  const value = await loader();
  store.set(key, { value, tags, expiresAt: Date.now() + ttlMs });
  return value;
}

/** @param {string} tag */
export function revalidateTag(tag) {
  for (const [key, entry] of store.entries()) {
    if (entry.tags.includes(tag)) {
      store.delete(key);
    }
  }
}

export function clearCache() {
  store.clear();
}
