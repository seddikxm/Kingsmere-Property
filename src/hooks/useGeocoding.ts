import { useEffect, useMemo, useRef, useState } from 'react';

export type LatLng = { lat: number; lng: number };

const CACHE_KEY = 'kingsmere-geocode-v1';
const REQUEST_INTERVAL_MS = 1100;

function loadCache(): Record<string, LatLng> {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, LatLng>) : {};
  } catch {
    return {};
  }
}

function persistCache(cache: Record<string, LatLng>) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // sessionStorage unavailable — geocoding still works, just not cached
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function geocodeAddress(address: string): Promise<LatLng | null> {
  try {
    const params = new URLSearchParams({ q: address, format: 'jsonv2', limit: '1' });
    const res = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    const lat = parseFloat(data[0].lat);
    const lng = parseFloat(data[0].lon);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

export function useGeocoding(addresses: string[]) {
  const uniqueAddresses = useMemo(
    () => [...new Set(addresses.map((a) => a.trim()).filter(Boolean))],
    [addresses],
  );
  const [coords, setCoords] = useState<Record<string, LatLng>>(() => loadCache());
  const [pending, setPending] = useState(0);
  const requestedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const cache = loadCache();
    const missing = uniqueAddresses.filter((a) => !cache[a] && !requestedRef.current.has(a));

    setCoords((prev) => {
      const merged = { ...prev };
      let changed = false;
      for (const a of uniqueAddresses) {
        if (!merged[a] && cache[a]) {
          merged[a] = cache[a];
          changed = true;
        }
      }
      return changed ? merged : prev;
    });

    if (missing.length === 0) {
      setPending(0);
      return;
    }

    missing.forEach((a) => requestedRef.current.add(a));
    setPending(missing.length);

    (async () => {
      for (let i = 0; i < missing.length; i++) {
        if (cancelled) return;
        const address = missing[i];
        const result = await geocodeAddress(address);
        if (cancelled) return;
        if (result) {
          const latest = loadCache();
          latest[address] = result;
          persistCache(latest);
          setCoords((prev) => ({ ...prev, [address]: result }));
        } else {
          requestedRef.current.delete(address);
        }
        setPending((p) => Math.max(0, p - 1));
        if (i < missing.length - 1) await sleep(REQUEST_INTERVAL_MS);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [uniqueAddresses]);

  return { coords, pending, total: uniqueAddresses.length };
}
