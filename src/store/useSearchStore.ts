import { create } from 'zustand';

interface SearchStore {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSearchOpen: boolean;
  toggleSearch: () => void;
  categoryFilter: string | null;
  setCategoryFilter: (category: string | null) => void;
  priceSort: 'asc' | 'desc' | null;
  setPriceSort: (sort: 'asc' | 'desc' | null) => void;
  priceRange: { min: number; max: number } | null;
  setPriceRange: (range: { min: number; max: number } | null) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSearchOpen: false,
  toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
  categoryFilter: null,
  setCategoryFilter: (categoryFilter) => set({ categoryFilter }),
  priceSort: null,
  setPriceSort: (priceSort) => set({ priceSort }),
  priceRange: null,
  setPriceRange: (priceRange) => set({ priceRange }),
}));
