import { createContext, useContext } from "react";


interface SlidingPaneContextType {
  getCurrentPage: () => string;
  nextPage:string;
  prevPage: string;
  height:string;
  width:number;
  next:(nextPage:string) => void;
  prev:(nextPage:string) => void;
  setNextPage:(nextPage:string) => void;
  setPrevPage:(prevPage:string) => void;
  setHeight:(height:string) => void;
  setWidth:(width:number) => void;
  moveToNext: (nextPage:string) => void;
  moveToPrev: () => void;
}
export const SlidingPaneContext = createContext<SlidingPaneContextType | undefined>(undefined);

export const useSlidingPane = () => {
    const context = useContext(SlidingPaneContext);
    if (!context) {
        throw new Error('useSlidingPane must be used within a SlidingPaneProvider');
    }
    return context;
};