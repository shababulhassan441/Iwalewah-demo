// src/components/HeroSearchBox.tsx

import { useTranslation } from 'next-i18next';
import SearchIcon from '@components/icons/search-icon';
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { debounce } from 'lodash';
import axios from 'axios'; // Ensure axios is installed: npm install axios

interface Suggestion {
  id: string;
  name: string;
  // Add other fields if necessary
}

const HeroSearchBox = () => {
  const { t } = useTranslation('forms');
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);

  // Debounced function to fetch suggestions
  const fetchSuggestions = debounce(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      // Replace with your actual API endpoint
      const response = await axios.get('/api/search-suggestions', {
        params: { q: query },
      });
      setSuggestions(response.data.suggestions);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, 300); // 300ms debounce delay

  // Effect to fetch suggestions when searchTerm changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    fetchSuggestions(searchTerm);
  }, [searchTerm]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      fetchSuggestions.cancel();
    };
  }, []);

  // Handle clicks outside the suggestions dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setActiveSuggestionIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const onSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== '') {
      router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setSearchTerm(suggestion.name);
    setShowSuggestions(false);
    setActiveSuggestionIndex(-1);
    router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeSuggestionIndex < suggestions.length - 1) {
        setActiveSuggestionIndex(activeSuggestionIndex + 1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeSuggestionIndex > 0) {
        setActiveSuggestionIndex(activeSuggestionIndex - 1);
      }
    } else if (e.key === 'Enter') {
      if (
        activeSuggestionIndex >= 0 &&
        activeSuggestionIndex < suggestions.length
      ) {
        e.preventDefault();
        handleSuggestionClick(suggestions[activeSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    }
  };

  const highlightMatch = (name: string, query: string) => {
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = name.split(regex);
    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <span key={index} className="font-bold">
              {part}
            </span>
          ) : (
            <span key={index}>{part}</span>
          )
        )}
      </>
    );
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <form
        className="relative flex w-full mt-6 rounded-md"
        noValidate
        role="search"
        onSubmit={onSubmit}
      >
        <label htmlFor="hero-search" className="flex flex-1 items-center py-0.5">
          <input
            id="hero-search"
            className="w-full text-sm transition-all duration-200 rounded-md outline-none placeholder:text-brand-dark/50 text-black h-14 md:h-16 ltr:pl-5 rtl:pr-5 md:ltr:pl-6 md:rtl:pr-6 ltr:pr-14 rtl:pl-14 md:ltr:pr-16 md:rtl:pl-16 lg:text-base shadow-heroSearch focus:ring-2 focus:ring-brand"
            placeholder={t('placeholder-search')}
            aria-label="Search"
            autoComplete="off"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
          />
        </label>

        <button
          type="submit"
          title="Search"
          className="absolute top-0 flex items-center justify-center h-full transition duration-200 ease-in-out outline-none ltr:right-0 rtl:left-0 w-14 md:w-16 hover:text-heading focus:outline-none"
        >
          <SearchIcon className="w-5 h-5 text-brand-dark text-opacity-40" />
        </button>
      </form>

      {showSuggestions && (
        <>
          {isLoading ? (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 px-4 py-2">
              Loading...
            </div>
          ) : suggestions.length > 0 ? (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    className={`cursor-pointer px-4 py-2 ${
                      index === activeSuggestionIndex
                        ? 'bg-gray-100'
                        : 'hover:bg-gray-100'
                    } flex items-center`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    onMouseLeave={() => setActiveSuggestionIndex(-1)}
                  >
                    {/* Search Icon in Suggestion */}
                    <SearchIcon className="w-4 h-4 text-brand-dark text-opacity-60 mr-2" />
                    {/* Highlighted Text */}
                    <span>{highlightMatch(suggestion.name, searchTerm)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 px-4 py-2">
              No suggestions found.
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HeroSearchBox;
