import { useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { Bath, BedDouble } from 'lucide-react';
import type { LatLng } from '@/hooks/useGeocoding';
import type { Listing } from '@/types';

const FALLBACK_CENTER: [number, number] = [51.45, -1.26];
const FALLBACK_ZOOM = 6;
const MARKER_ZOOM = 11;
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

const goldMarker = L.divIcon({
  className: 'kingsmere-marker',
  html: '<span class="kingsmere-marker-pin"></span>',
  iconSize: [30, 30],
  iconAnchor: [15, 29],
  popupAnchor: [0, -28],
});

const MAP_CSS = `
.kingsmere-marker { background: transparent; border: none; }
.kingsmere-marker-pin {
  display: block;
  width: 30px;
  height: 30px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: linear-gradient(135deg, #e3c878, #c9a045);
  border: 2px solid #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
  position: relative;
}
.kingsmere-marker-pin::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 10px;
  height: 10px;
  margin: -5px 0 0 -5px;
  border-radius: 50%;
  background: #0b1220;
}
.kingsmere-map .leaflet-popup-content-wrapper {
  background: #0f172a;
  color: #e7e5e4;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.6);
}
.kingsmere-map .leaflet-popup-content { margin: 12px; line-height: 1.4; }
.kingsmere-map .leaflet-popup-tip { background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); }
.kingsmere-map .leaflet-popup-close-button { color: #a8a29e; padding: 6px 8px 0 0; }
.kingsmere-map .leaflet-popup-close-button:hover { color: #d4b665; }
.kingsmere-map .leaflet-bar a {
  background: #0f172a;
  color: #e7e5e4;
  border-color: rgba(255, 255, 255, 0.12);
}
.kingsmere-map .leaflet-bar a:hover { background: #1e293b; color: #d4b665; }
.kingsmere-map .leaflet-control-attribution {
  background: rgba(15, 23, 42, 0.85);
  color: #78716c;
  font-size: 10px;
}
.kingsmere-map .leaflet-control-attribution a { color: #a8a29e; }
`;

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return null;
}

type PropertyMapProps = {
  listings: Listing[];
  coords: Record<string, LatLng>;
  className?: string;
};

export function PropertyMap({ listings, coords, className }: PropertyMapProps) {
  const mapped = listings.flatMap((listing) => {
    const c = coords[listing.address];
    return c ? [{ listing, lat: c.lat, lng: c.lng }] : [];
  });
  const first = mapped[0];
  const center: [number, number] = first ? [first.lat, first.lng] : FALLBACK_CENTER;

  return (
    <div className={`kingsmere-map relative ${className ?? ''}`}>
      <style>{MAP_CSS}</style>
      <MapContainer
        center={center}
        zoom={first ? MARKER_ZOOM : FALLBACK_ZOOM}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer url={TILE_URL} attribution={ATTRIBUTION} subdomains="abcd" />
        <MapResizer />
        {mapped.map(({ listing, lat, lng }) => (
          <Marker key={listing.id} position={[lat, lng]} icon={goldMarker}>
            <Popup>
              <div className="w-52">
                {listing.images[0] && (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="h-24 w-full rounded-lg object-cover"
                  />
                )}
                <p className="mt-2 text-sm font-semibold text-white">{listing.title}</p>
                <p className="text-sm font-bold text-gold-400">{listing.price}</p>
                <p className="mt-1 text-xs text-stone-400">{listing.address}</p>
                <div className="mt-2 flex items-center gap-4 border-t border-white/10 pt-2 text-xs text-stone-300">
                  <span className="flex items-center gap-1">
                    <BedDouble className="h-3.5 w-3.5 text-gold-400" />
                    {listing.beds} beds
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5 text-gold-400" />
                    {listing.baths} baths
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
