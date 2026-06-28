import { useEffect, useRef } from "react";
import type { Destination } from "@/data/destinations";

type Props = {
  stops: Destination[];
  active: number;
  onPick: (i: number) => void;
};

// Approximate great-circle distance in km between two lat/lng points
function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * R * Math.asin(Math.sqrt(x)));
}

export default function LeafletMap({ stops, active, onPick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  // We intentionally use any here because leaflet's types come from a dynamic import
  // at runtime, and threading them through every ref would not add safety.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const layersRef = useRef<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  // Init map once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !containerRef.current) return;
      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([22.5, 79], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);
      mapRef.current = map;
      // Trigger a marker render after map mounts
      renderMarkers();
    })();
    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render stops + route line whenever inputs change
  async function renderMarkers() {
    const map = mapRef.current;
    if (!map) return;
    const L = (await import("leaflet")).default;

    // Clear previous layers
    for (const layer of layersRef.current) map.removeLayer(layer);
    layersRef.current = [];
    markersRef.current = [];

    if (stops.length === 0) return;

    // Route line
    if (stops.length > 1) {
      const line = L.polyline(
        stops.map((s) => [s.lat, s.lng] as [number, number]),
        { color: "#e07a3c", weight: 4, opacity: 0.85, dashArray: "8 6" },
      ).addTo(map);
      layersRef.current.push(line);
    }

    // Markers
    stops.forEach((s, i) => {
      const isActive = i === active;
      const html = `<div style="
        display:flex;align-items:center;justify-content:center;
        width:${isActive ? 34 : 28}px;height:${isActive ? 34 : 28}px;
        border-radius:9999px;
        background:${isActive ? "#e07a3c" : "white"};
        color:${isActive ? "white" : "#e07a3c"};
        border:3px solid #e07a3c;
        font-weight:700;font-size:12px;
        box-shadow:0 4px 10px rgba(0,0,0,0.18);
      ">${i + 1}</div>`;
      const icon = L.divIcon({
        html,
        className: "wc-stop-marker",
        iconSize: [isActive ? 34 : 28, isActive ? 34 : 28],
        iconAnchor: [isActive ? 17 : 14, isActive ? 17 : 14],
      });
      const prev = i > 0 ? stops[i - 1] : null;
      const legKm = prev ? haversineKm(prev, s) : 0;
      const popupHtml = `
        <div style="font-family:Inter,sans-serif;min-width:180px;">
          <div style="font-weight:700;font-size:14px;">${i + 1}. ${s.name}</div>
          <div style="font-size:11px;color:#666;">${s.state}</div>
          ${prev ? `<div style="margin-top:4px;font-size:11px;">↳ ${legKm} km from ${prev.name}</div>` : ""}
          <div style="margin-top:4px;font-size:11px;">${s.tagline}</div>
        </div>`;
      const marker = L.marker([s.lat, s.lng], { icon })
        .addTo(map)
        .bindPopup(popupHtml)
        .on("click", () => onPickRef.current(i));
      layersRef.current.push(marker);
      markersRef.current.push(marker);
    });

    // Fit bounds
    if (stops.length === 1) {
      map.setView([stops[0].lat, stops[0].lng], 9);
    } else {
      const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lng] as [number, number]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }

  // Re-render when stops or active change
  useEffect(() => {
    renderMarkers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, active]);

  // Pan / pop the active marker
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !stops[active]) return;
    const s = stops[active];
    map.panTo([s.lat, s.lng], { animate: true });
    const marker = markersRef.current[active];
    if (marker) marker.openPopup();
  }, [active, stops]);

  return <div ref={containerRef} className="h-[480px] w-full" style={{ background: "#dfeaf2" }} />;
}
