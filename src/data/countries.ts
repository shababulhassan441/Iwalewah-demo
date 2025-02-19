// src/data/countries.ts

import { getNames, getCode } from 'country-list';

export interface CountryOption {
  label: string; // Country Name
  value: string; // Country ISO Code
}

// Generate the countries list dynamically
export const countries: CountryOption[] = getNames().map((name: any) => ({
  label: name,
  value: getCode(name) || '',
})).filter((country: { value: string; }) => country.value !== ''); // Filter out countries without a code
