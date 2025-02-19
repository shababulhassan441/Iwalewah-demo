// src/components/SearchBox.tsx

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { useTranslation } from 'next-i18next';
import SearchIcon from '@components/icons/search-icon';
import CloseIcon from '@components/icons/close-icon';
import cn from 'classnames';
import { debounce } from 'lodash';
import axios from 'axios'; // Ensure axios is installed: npm install axios

interface Suggestion {
  id: string;
  name: string;
  // Add other fields if necessary
}

type SearchProps = {
  className?: string;
  searchId?: string;
  onSubmit: (e: React.SyntheticEvent) => void;
  onClear: (e: React.SyntheticEvent) => void;
  onFocus?: (e: React.SyntheticEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectSuggestion: (suggestion: string) => void; // New prop
  name: string;
  value: string;
  variant?: 'border' | 'fill';
};

const SearchBox = React.forwardRef<HTMLInputElement, SearchProps>(
  (
    {
      className,
      searchId = 'search',
      variant = 'border',
      value,
      onSubmit,
      onClear,
      onFocus,
      onChange,
      onSelectSuggestion, // Destructure the new prop
      name,
      ...rest
    },
    ref
  ) => {
    const { t } = useTranslation('forms');
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

    const handleSubmit = (e: React.SyntheticEvent) => {
      onSubmit(e);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    };

    const handleClear = (e: React.SyntheticEvent) => {
      onClear(e);
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
    };

    const handleSuggestionClick = (suggestion: Suggestion) => {
      onSelectSuggestion(suggestion.name); // Use the new prop to handle selection
      setShowSuggestions(false);
      setActiveSuggestionIndex(-1);
      // Optionally, trigger a submit or navigate to a search results page
      // onSubmit(e);
      // router.push(`/search?q=${encodeURIComponent(suggestion.name)}`);
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange(e);
      const query = e.target.value;
      if (query.trim().length >= 2) {
        setShowSuggestions(true);
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      if (onFocus) onFocus(e);
      if (value.trim().length >= 2) {
        setShowSuggestions(true);
        fetchSuggestions(value);
      }
    };

    const highlightMatch = (name: string, query: string) => {
      const keywords = query.trim().split(/\s+/);
      const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
      const parts = name.split(regex);
      return (
        <>
          {parts.map((part, index) =>
            keywords.some(
              (keyword) => keyword.toLowerCase() === part.toLowerCase()
            ) ? (
              <span key={index} className="font-bold text-brand">
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
          className={cn(
            'relative flex w-full rounded-md',
            className // Apply any additional classes passed via props
          )}
          noValidate
          role="search"
          onSubmit={handleSubmit}
        >
          <label htmlFor={searchId} className="flex flex-1 items-center py-0.5">
            <input
              id={searchId}
              name={name}
              className={cn(
                'text-heading outline-none w-full h-[52px] ltr:pl-5 rtl:pr-5 md:ltr:pl-6 md:rtl:pr-6 ltr:pr-14 rtl:pl-14 md:ltr:pr-16 md:rtl:pl-16 text-sm lg:text-15px transition-all duration-200 rounded-md placeholder:text-brand-dark/50 bg-brand-light text-brand-dark',
                {
                  'border border-border-base': variant === 'border',
                  'bg-fill-one': variant === 'fill',
                }
              )}
              placeholder={t('placeholder-search')}
              aria-label={searchId}
              autoComplete="off"
              value={value}
              onChange={handleInputChange} // Use the new handler
              onFocus={handleInputFocus} // Use the new handler
              onKeyDown={handleKeyDown}
              ref={ref}
              {...rest}
            />
          </label>

          {value ? (
            <button
              type="button"
              onClick={handleClear}
              title="Clear search"
              className="absolute top-0 flex items-center justify-center h-full transition duration-200 ease-in-out outline-none ltr:right-0 rtl:left-0 w-14 md:w-16 hover:text-heading focus:outline-none"
            >
              <CloseIcon className="w-[17px] h-[17px] text-brand-dark text-opacity-40" />
            </button>
          ) : (
            <span className="absolute top-0 flex items-center justify-center h-full w-14 md:w-16 ltr:right-0 rtl:left-0 shrink-0 focus:outline-none">
              <SearchIcon className="w-5 h-5 text-brand-dark text-opacity-40" />
            </span>
          )}
        </form>

        {showSuggestions && (
          <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-2">Loading...</div>
            ) : suggestions.length > 0 ? (
              <ul>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.id}
                    className={cn(
                      'cursor-pointer px-4 py-2 flex items-center',
                      {
                        'bg-gray-100': index === activeSuggestionIndex,
                        'hover:bg-gray-100': index !== activeSuggestionIndex,
                      }
                    )}
                    onClick={() => handleSuggestionClick(suggestion)}
                    onMouseEnter={() => setActiveSuggestionIndex(index)}
                    onMouseLeave={() => setActiveSuggestionIndex(-1)}
                  >
                    {/* Search Icon in Suggestion */}
                    <SearchIcon
                      className="w-4 h-4 text-brand-dark text-opacity-60 mr-2"
                      aria-hidden="true"
                    />
                    {/* Highlighted Text */}
                    <span>{highlightMatch(suggestion.name, value)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-2">No suggestions found.</div>
            )}
          </div>
        )}
      </div>
    );
  }
);

SearchBox.displayName = 'SearchBox';

export default SearchBox;
