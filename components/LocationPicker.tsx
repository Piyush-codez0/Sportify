"use client";
/*
 - Used on: /organizer/tournaments/new (tournament creation)
 - Features: Location autocomplete, reverse geocoding, city/district/state detection
*/
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
  initialSelectedLocationDisplay?: string;
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
  initialSelectedLocationDisplay = "",
  onLocationChange,
  height = "220px",
}: LocationPickerProps) {
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchRequestIdRef = useRef(0);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [selectedLocationDisplay, setSelectedLocationDisplay] =
    useState<string>(initialSelectedLocationDisplay);

  // Initialize map on component mount (always visible)
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isMapInitialized) return;

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
  }, []);

  // Update map and marker when initialLat/initialLng change (e.g., when returning to this step)
  useEffect(() => {
    if (mapRef.current && markerRef.current && isMapInitialized) {
      const newLatLng = [initialLat, initialLng];
      markerRef.current.setLatLng(newLatLng);
      mapRef.current.setView(newLatLng, mapRef.current.getZoom());
    }
  }, [initialLat, initialLng, isMapInitialized]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (!trimmedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      const requestId = ++searchRequestIdRef.current;
      searchLocation(trimmedQuery, requestId);
    }, 30);

    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `/api/location/reverse?lat=${lat}&lng=${lng}`,
      );
      if (!response.ok) {
        throw new Error(`Reverse geocoding failed: ${response.status}`);
      }
      const data = await response.json();
      if (data.result?.display_name) {
        setSelectedLocationDisplay(data.result.display_name);
        onLocationChange(lat, lng, data.result.display_name);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };

  const searchLocation = async (query: string, requestId: number) => {
    setIsSearching(true);
    try {
      const response = await fetch(
        `/api/location/search?query=${encodeURIComponent(query)}`,
      );
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
      const data = await response.json();
      if (requestId === searchRequestIdRef.current) {
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
      if (requestId === searchRequestIdRef.current) {
        setSearchResults([]);
      }
    } finally {
      if (requestId === searchRequestIdRef.current) {
        setIsSearching(false);
      }
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
    <div className="space-y-4">
      {/* Search Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Search Location
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Search for a location..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
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
            <div className="absolute z-100 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-xl max-h-40 overflow-y-auto">
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
            No locations found
          </p>
        )}
      </div>

      {/* Map Section */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Or Pick from Map
        </label>
        <div
          className="rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden"
          style={{ borderRadius: 12 }}
        >
          <div
            ref={mapContainerRef}
            style={{
              height: "400px",
              width: "100%",
              borderRadius: 12,
              overflow: "hidden",
              WebkitClipPath: "inset(0 round 12px)",
              clipPath: "inset(0 round 12px)",
            }}
            className="w-full h-full"
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Click on the map or drag the marker to select a location
        </p>
      </div>

      {/* Selected Location Display - Shows in both modes */}
      {selectedLocationDisplay && (
        <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg transition-colors">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
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
