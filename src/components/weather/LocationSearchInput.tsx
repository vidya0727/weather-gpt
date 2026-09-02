import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, Navigation } from 'lucide-react';
import { searchLocations } from '../../services/weatherService';
import { LocationSearchResult } from '../../services/weatherProviders/openMeteoProvider';
import './LocationSearchInput.css';

interface LocationSearchInputProps {
  onSelectLocation: (location: LocationSearchResult) => void;
  onUseMyLocation: () => void;
  isLoading?: boolean;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onSelectLocation,
  onUseMyLocation,
  isLoading = false
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LocationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced Location Search Effect
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchLocations(query);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch (err) {
        console.error('Location search error:', err);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: LocationSearchResult) => {
    setQuery(`${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}`);
    setShowDropdown(false);
    onSelectLocation(loc);
  };

  return (
    <div className="location-search-wrapper" ref={containerRef}>
      <div className="search-controls-bar">
        {/* Search Input Box */}
        <div className="search-input-container">
          <Search size={18} className="search-bar-icon" />
          <input
            type="text"
            className="input-field location-input-field"
            placeholder="Search city e.g. Chennai, Bengaluru, Kanchipuram..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          />
          {searching && <Loader2 size={16} className="search-spinner" />}
        </div>

        {/* Use My Location Button */}
        <button
          type="button"
          className="btn btn-secondary btn-my-location"
          onClick={onUseMyLocation}
          disabled={isLoading}
          title="Detect my current location using browser GPS"
        >
          <Navigation size={16} className="icon-cyan" />
          <span>Use My Location</span>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div className="suggestions-dropdown glass-card">
          <span className="dropdown-label">Select Location:</span>
          {suggestions.map((loc) => (
            <button
              key={`${loc.id}-${loc.latitude}-${loc.longitude}`}
              type="button"
              className="suggestion-item"
              onClick={() => handleSelect(loc)}
            >
              <MapPin size={16} className="icon-cyan suggestion-icon" />
              <div className="suggestion-text">
                <span className="suggestion-name">{loc.name}</span>
                <span className="suggestion-details">
                  {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
