import { createContext, useContext } from "react";


interface SlidingPaneContextType {
  currentPage: string;
  nextPage:string;
  prevPage: string;
  next:(nextPage:string) => void;
  prev:(nextPage:string) => void;
  setNextPage:(nextPage:string) => void;
  setPrevPage:(prevPage:string) => void;
}
export const SlidingPaneContext = createContext<SlidingPaneContextType | undefined>(undefined);

export const useSlidingPane = () => {
  const context = useContext(SlidingPaneContext);
  if (!context) {
    throw new Error('useSlidingPane must be used within a SlidingPaneProvider');
  }
  return context;
};