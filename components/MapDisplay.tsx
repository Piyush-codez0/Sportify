"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

// Get Leaflet dynamically to avoid SSR issues
const getLeaflet = () => {
  if (typeof window === "undefined") return null;
  const L = require("leaflet");
  return L;
};

interface MapDisplayProps {
  lat: number;
  lng: number;
  popupText?: string;
  height?: string;
  zoom?: number;
}

export default function MapDisplay({
  lat,
  lng,
  popupText,
  height = "300px",
  zoom = 15,
}: MapDisplayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Get Leaflet - works because useEffect runs on client-side only
    const L = getLeaflet();
    if (!L) return;

    // Setup L.Icon for markers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    // Initialize map
    const map = L.map(mapContainerRef.current).setView([lat, lng], zoom);

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add marker
    const marker = L.marker([lat, lng]).addTo(map);

    // Add popup if text provided
    if (popupText) {
      marker.bindPopup(popupText).openPopup();
    }

    mapRef.current = map;

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [lat, lng, popupText, zoom]);

  return (
    <div
      ref={mapContainerRef}
      style={{ height, width: "100%" }}
      className="rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
    />
  );
}
