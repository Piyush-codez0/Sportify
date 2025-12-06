"use client";
import { useEffect, useRef, useState } from "react";

// Import leaflet only on client side
const getLeaflet = () => {
  if (typeof window === "undefined") return null;
  const L = require("leaflet");
  return L;
};

// CSS import
import "leaflet/dist/leaflet.css";

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationChange: (lat: number, lng: number, address?: string) => void;
  height?: string;
}

// Rough bounding box for India (SW: lat, lng; NE: lat, lng)
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.4626999, 68.1097],
  [35.513327, 97.395561],
];

export default function LocationPicker({
  initialLat = 30.3165, // Dehradun latitude
  initialLng = 78.0322, // Dehradun longitude
  onLocationChange,
  height = "400px",
}: LocationPickerProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Get Leaflet - this will work because it's in useEffect (client-side only)
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
    const map = L.map(mapContainerRef.current, {
      maxBounds: INDIA_BOUNDS,
      maxBoundsViscosity: 0.8,
    }).setView([initialLat, initialLng], 13);

    // Add OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Add draggable marker
    const marker = L.marker([initialLat, initialLng], {
      draggable: true,
    }).addTo(map);

    // Emit initial position and fetch address
    onLocationChange(initialLat, initialLng);
    reverseGeocode(initialLat, initialLng);

    // Handle marker drag
    marker.on("dragend", async () => {
      const position = marker.getLatLng();
      onLocationChange(position.lat, position.lng);
      // Optionally fetch address via reverse geocoding
      await reverseGeocode(position.lat, position.lng);
    });

    // Handle map click
    map.on("click", async (e: any) => {
      marker.setLatLng(e.latlng);
      onLocationChange(e.latlng.lat, e.latlng.lng);
      await reverseGeocode(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    // Cleanup
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        onLocationChange(lat, lng, data.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };

  const searchLocation = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5&countrycodes=in&viewbox=${INDIA_BOUNDS[0][1]},${
          INDIA_BOUNDS[1][0]
        },${INDIA_BOUNDS[1][1]},${INDIA_BOUNDS[0][0]}&bounded=1`
      );
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Search failed:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
      onLocationChange(lat, lng, result.display_name);
    }

    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-3">
      {/* Search Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            searchLocation(e.target.value);
          }}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        />
        {isSearching && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}

        {/* Search Results Dropdown */}
        {searchResults.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {searchResults.map((result, idx) => (
              <button
                key={idx}
                onClick={() => selectSearchResult(result)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 last:border-b-0"
              >
                {result.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map Container */}
      <div
        ref={mapContainerRef}
        style={{ height, width: "100%" }}
        className="rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden z-0"
      />

      <p className="text-xs text-gray-500 dark:text-gray-400">
        Click on the map or drag the marker to select a location. You can also
        search for a place above.
      </p>
    </div>
  );
}
