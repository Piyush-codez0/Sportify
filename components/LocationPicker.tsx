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
  height = "220px",
}: LocationPickerProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [locationMode, setLocationMode] = useState<"search" | "map">("search");
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [selectedLocationDisplay, setSelectedLocationDisplay] =
    useState<string>("");

  // Initialize map only when user switches to map mode (lazy loading)
  useEffect(() => {
    if (
      !mapContainerRef.current ||
      mapRef.current ||
      locationMode !== "map" ||
      isMapInitialized
    )
      return;

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

    // Emit initial position
    onLocationChange(initialLat, initialLng);

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
    setIsMapInitialized(true);

    // Cleanup
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
        setIsMapInitialized(false);
      }
    };
  }, [locationMode]);

  // Update map and marker when initialLat/initialLng change (e.g., when returning to this step)
  useEffect(() => {
    if (mapRef.current && markerRef.current && isMapInitialized) {
      const newLatLng = [initialLat, initialLng];
      markerRef.current.setLatLng(newLatLng);
      mapRef.current.setView(newLatLng, mapRef.current.getZoom());
    }
  }, [initialLat, initialLng, isMapInitialized]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      if (data.display_name) {
        setSelectedLocationDisplay(data.display_name);
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

    // Update map if it's initialized
    if (mapRef.current && markerRef.current) {
      mapRef.current.setView([lat, lng], 15);
      markerRef.current.setLatLng([lat, lng]);
    }

    // Always call onLocationChange to update the selected location display
    setSelectedLocationDisplay(result.display_name);
    onLocationChange(lat, lng, result.display_name);

    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <div className="space-y-3">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <button
          type="button"
          onClick={() => setLocationMode("search")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            locationMode === "search"
              ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            Search Location
          </div>
        </button>
        <button
          type="button"
          onClick={() => setLocationMode("map")}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            locationMode === "map"
              ? "bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            Pick from Map
          </div>
        </button>
      </div>

      {/* Search Section */}
      <div
        className={
          locationMode === "search" ? "block space-y-2 pb-2" : "hidden"
        }
      >
        <div className="relative mb-2">
          <input
            type="text"
            placeholder="Search for a location in India..."
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
            <div className="absolute z-[100] w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-40 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectSearchResult(result)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
        {searchQuery && searchResults.length === 0 && !isSearching && (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No locations found. Try a different search or use "Pick from Map"
          </p>
        )}
      </div>

      {/* Map Section */}
      <div className={locationMode === "map" ? "block space-y-2" : "hidden"}>
        <div
          ref={mapContainerRef}
          style={{ height, width: "100%" }}
          className="rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click on the map or drag the marker to select a location
        </p>
      </div>

      {/* Selected Location Display - Shows in both modes */}
      {selectedLocationDisplay && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg transition-colors">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-semibold text-green-800 dark:text-green-200">
                Selected Location:
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {selectedLocationDisplay}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
