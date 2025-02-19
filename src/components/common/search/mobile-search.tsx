// src/components/common/MobileSearch.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useUI } from '@contexts/ui.context';
import { useRouter } from 'next/router';
import SearchBox from '../search-box';
import cn from 'classnames';

const MobileSearch: React.FC = () => {
  const { displayMobileSearch, closeMobileSearch } = useUI();
  const router = useRouter();
  const [searchText, setSearchText] = useState('');
  const previousPathnameRef = useRef(router.pathname);

  // Centralized search function
  const performSearch = (query: string) => {
    const trimmedSearch = query.trim();
    if (trimmedSearch) {
      const { pathname, query: existingQuery } = router;

      // Create a new query object with the 'q' parameter
      const newQuery = { ...existingQuery, q: trimmedSearch };

      // If we're on the home page, redirect to /search
      if (pathname === '/') {
        router.push({
          pathname: '/search',
          query: newQuery,
        });
      } else {
        router.push({
          pathname,
          query: newQuery,
        });
      }

      // Close the mobile search overlay after searching
      closeMobileSearch();
    }
  };

  // Handle form submission
  const handleSearchSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    performSearch(searchText);
  };

  // Handle input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  // Handle clearing the search input
  const handleSearchClear = () => {
    setSearchText('');
  };

  // Handle selecting a suggestion
  const handleSelectSuggestion = (suggestion: string) => {
    setSearchText(suggestion);
    performSearch(suggestion); // Trigger search immediately upon selection
  };

  // Effect to detect pathname changes and clear search input
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      const newPathname = new URL(url, window.location.origin).pathname;
      if (newPathname !== previousPathnameRef.current) {
        setSearchText('');
        previousPathnameRef.current = newPathname;
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  // Effect to prefill search input from URL query parameter 'q'
  useEffect(() => {
    const { q } = router.query;
    if (typeof q === 'string' && q.trim() !== '') {
      setSearchText(q.trim());
    }
  }, [router.query]);

  if (!displayMobileSearch) return null;

  return (
    <div className="fixed top-0 left-0 right-0 h-full z-50">
      <div
        className="w-full h-full bg-black bg-opacity-70"
        onClick={closeMobileSearch}
      >
        <div
          className="relative top-0 w-full bg-brand-light p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <SearchBox
            name="mobile-search"
            onSubmit={handleSearchSubmit}
            onClear={handleSearchClear}
            onChange={handleSearchChange}
            onSelectSuggestion={handleSelectSuggestion}
            value={searchText}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileSearch;
