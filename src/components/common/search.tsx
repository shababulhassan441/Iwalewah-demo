// src/components/common/search.tsx

import React, { useState, useEffect, useRef } from 'react';
import cn from 'classnames';
import { useRouter } from 'next/router'; // Import useRouter
import SearchBox from '@components/common/search-box';

type Props = {
  className?: string;
  searchId?: string;
  variant?: 'border' | 'fill';
};

const Search = React.forwardRef<HTMLDivElement, Props>(
  (
    {
      className = 'md:w-[730px] 2xl:w-[800px]',
      searchId = 'search',
      variant = 'border',
    },
    ref
  ) => {
    const router = useRouter(); // Initialize router
    const [searchText, setSearchText] = useState('');

    // Ref to store the previous pathname
    const previousPathnameRef = useRef(router.pathname);

    // Centralized search function
    const performSearch = (query: string) => {
      const trimmedSearch = query.trim();
      if (trimmedSearch) {
        // Get current pathname and query
        const { pathname, query: existingQuery } = router;

        // Create a new query object with the 'q' parameter
        const newQuery = { ...existingQuery, q: trimmedSearch };

        // Redirect to the current pathname with the new query
        router.push({
          pathname,
          query: newQuery,
        });
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
      performSearch(suggestion);
    };

    // Effect to detect pathname changes and clear search input
    useEffect(() => {
      const handleRouteChange = (url: string) => {
        // Extract the pathname from the URL
        const newPathname = new URL(url, window.location.origin).pathname;

        // If the pathname has changed, clear the search input
        if (newPathname !== previousPathnameRef.current) {
          setSearchText('');
          previousPathnameRef.current = newPathname;
        }
      };

      // Listen for route changes
      router.events.on('routeChangeStart', handleRouteChange);

      // Cleanup the event listener on component unmount
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

    return (
      <div
        ref={ref}
        className={cn(
          'w-full transition-all duration-200 ease-in-out',
          className
        )}
      >
        <div className="relative z-30 flex flex-col justify-center w-full shrink-0">
          <div className="flex flex-col w-full mx-auto">
            <SearchBox
              searchId={searchId}
              name="search"
              value={searchText}
              onSubmit={handleSearchSubmit} // Pass the submit handler
              onChange={handleSearchChange}
              onClear={handleSearchClear}
              onSelectSuggestion={handleSelectSuggestion} // Pass the new handler
              variant={variant}
            />
          </div>
        </div>
      </div>
    );
  }
);

Search.displayName = 'Search';
export default Search;
