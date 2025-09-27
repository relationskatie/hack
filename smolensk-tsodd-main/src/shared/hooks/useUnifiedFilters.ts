'use client';

import { useState, useCallback, useMemo } from 'react';
import { FilterValues, FilterField } from '@/shared/components/ui/UnifiedFilterPanel';

export interface UseUnifiedFiltersConfig {
  defaultSearch?: string;
  defaultSort?: string;
  defaultFilters?: FilterValues;
  fields?: FilterField[];
}

export interface UseUnifiedFiltersReturn {
  // Состояние
  searchValue: string;
  sortValue: string;
  filterValues: FilterValues;
  
  // Обработчики
  setSearchValue: (value: string) => void;
  setSortValue: (value: string) => void;
  setFilterValue: (key: string, value: any) => void;
  clearAllFilters: () => void;
  
  // Вычисляемые значения
  hasActiveFilters: boolean;
  activeFiltersCount: number;
  
  // Функция фильтрации данных
  filterData: <T>(data: T[], filterFn?: (item: T, filters: FilterState) => boolean) => T[];
}

export interface FilterState {
  search: string;
  sort: string;
  filters: FilterValues;
}

export const useUnifiedFilters = (config: UseUnifiedFiltersConfig = {}): UseUnifiedFiltersReturn => {
  const {
    defaultSearch = '',
    defaultSort = '',
    defaultFilters = {},
    fields = []
  } = config;

  // Состояние
  const [searchValue, setSearchValue] = useState(defaultSearch);
  const [sortValue, setSortValue] = useState(defaultSort);
  const [filterValues, setFilterValues] = useState<FilterValues>(defaultFilters);

  // Обработчики
  const setFilterValue = useCallback((key: string, value: any) => {
    setFilterValues(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setSearchValue(defaultSearch);
    setSortValue(defaultSort);
    setFilterValues(defaultFilters);
  }, [defaultSearch, defaultSort, defaultFilters]);

  // Вычисляемые значения
  const hasActiveFilters = useMemo(() => {
    if (searchValue !== defaultSearch) return true;
    if (sortValue !== defaultSort) return true;
    
    return Object.entries(filterValues).some(([key, value]) => {
      const defaultValue = defaultFilters[key];
      if (Array.isArray(value)) {
        const defaultArray = Array.isArray(defaultValue) ? defaultValue : [];
        return value.length !== defaultArray.length || 
               value.some((v, i) => v !== defaultArray[i]);
      }
      return value !== defaultValue;
    });
  }, [searchValue, sortValue, filterValues, defaultSearch, defaultSort, defaultFilters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    
    if (searchValue !== defaultSearch) count++;
    if (sortValue !== defaultSort) count++;
    
    Object.entries(filterValues).forEach(([key, value]) => {
      const defaultValue = defaultFilters[key];
      if (Array.isArray(value)) {
        const defaultArray = Array.isArray(defaultValue) ? defaultValue : [];
        if (value.length !== defaultArray.length || 
            value.some((v, i) => v !== defaultArray[i])) {
          count++;
        }
      } else if (value !== defaultValue) {
        count++;
      }
    });
    
    return count;
  }, [searchValue, sortValue, filterValues, defaultSearch, defaultSort, defaultFilters]);

  // Функция фильтрации данных
  const filterData = useCallback(<T>(
    data: T[],
    customFilterFn?: (item: T, filters: FilterState) => boolean
  ): T[] => {
    const filterState: FilterState = {
      search: searchValue,
      sort: sortValue,
      filters: filterValues
    };

    // Если передана кастомная функция фильтрации, используем её
    if (customFilterFn) {
      return data.filter(item => customFilterFn(item, filterState));
    }

    // Иначе используем базовую фильтрацию (только поиск)
    let filtered = data;

    // Базовая фильтрация по поиску
    if (searchValue) {
      filtered = filtered.filter(item => {
        const searchableText = JSON.stringify(item).toLowerCase();
        return searchableText.includes(searchValue.toLowerCase());
      });
    }

    return filtered;
  }, [searchValue, sortValue, filterValues]);

  return {
    // Состояние
    searchValue,
    sortValue,
    filterValues,
    
    // Обработчики
    setSearchValue,
    setSortValue,
    setFilterValue,
    clearAllFilters,
    
    // Вычисляемые значения
    hasActiveFilters,
    activeFiltersCount,
    
    // Функция фильтрации
    filterData
  };
};

// Хук для сортировки данных
export const useSorting = <T>(
  data: T[],
  sortValue: string,
  sortOptions: { [key: string]: (a: T, b: T) => number }
): T[] => {
  return useMemo(() => {
    if (!sortValue || !sortOptions[sortValue]) {
      return data;
    }

    return [...data].sort(sortOptions[sortValue]);
  }, [data, sortValue, sortOptions]);
};

// Утилиты для создания функций сортировки
export const createSortFunctions = {
  // Сортировка по строке
  string: <T>(getter: (item: T) => string, direction: 'asc' | 'desc' = 'asc') => 
    (a: T, b: T): number => {
      const aVal = getter(a).toLowerCase();
      const bVal = getter(b).toLowerCase();
      const result = aVal.localeCompare(bVal);
      return direction === 'asc' ? result : -result;
    },

  // Сортировка по числу
  number: <T>(getter: (item: T) => number, direction: 'asc' | 'desc' = 'asc') => 
    (a: T, b: T): number => {
      const aVal = getter(a);
      const bVal = getter(b);
      const result = aVal - bVal;
      return direction === 'asc' ? result : -result;
    },

  // Сортировка по дате
  date: <T>(getter: (item: T) => string | Date, direction: 'asc' | 'desc' = 'asc') => 
    (a: T, b: T): number => {
      const aVal = new Date(getter(a)).getTime();
      const bVal = new Date(getter(b)).getTime();
      const result = aVal - bVal;
      return direction === 'asc' ? result : -result;
    },

  // Сортировка по булевому значению
  boolean: <T>(getter: (item: T) => boolean, direction: 'asc' | 'desc' = 'asc') => 
    (a: T, b: T): number => {
      const aVal = getter(a) ? 1 : 0;
      const bVal = getter(b) ? 1 : 0;
      const result = aVal - bVal;
      return direction === 'asc' ? result : -result;
    }
};

export default useUnifiedFilters;
