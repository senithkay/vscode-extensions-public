import { BalleriaLanguageClient } from '@wso2-enterprise/ballerina-languageclient';
import { FunctionDefinition } from '@wso2-enterprise/syntax-tree';
import create from 'zustand'

export interface DataMapperState {
  imports: string[];
  setImports: (imports: string[]) => void;
  functionST: FunctionDefinition;
  setFunctionST: (st: FunctionDefinition) => void;
  filePath: string;
  setFilePath: (filePath: string) => void;
  langClientPromise: Promise<BalleriaLanguageClient>;
  setLangClientPromise: (lCP: Promise<BalleriaLanguageClient>) => void;
}

export interface DataMapperSearchState {
  inputSearch: string;
  setInputSearch: (inputSearch: string) => void;
  inputSearchFocused: boolean;
  setInputSearchFocused: (focused: boolean) => void;
  outputSearch: string;
  setOutputSearch: (outputSearch: string) => void;
  outputSearchFocused: boolean;
  setOutputSearchFocused: (focused: boolean) => void;
  resetSearchStore: () => void;
}

export const useDMStore = create<DataMapperState>((set) => ({
  imports: [],
  functionST: undefined,
  filePath: undefined,
  langClientPromise: undefined,
  setFunctionST: (functionST: FunctionDefinition) => set({ functionST }),
  setImports: (imports) => set({ imports }),
  setFilePath: (filePath: string) => set({ filePath }),
  setLangClientPromise: (langClientPromise: Promise<BalleriaLanguageClient>) => set({ langClientPromise }),
}));


export const useDMSearchStore = create<DataMapperSearchState>((set) => ({
  inputSearch: "",
  inputSearchFocused: false,
  outputSearch: "",
  outputSearchFocused: false,
  setInputSearch: (inputSearch: string) => set({ inputSearch }),
  setInputSearchFocused: (inputSearchFocused: boolean) => set({ inputSearchFocused }),
  setOutputSearch: (outputSearch: string) => set({ outputSearch }),
  setOutputSearchFocused: (outputSearchFocused: boolean) => set({ outputSearchFocused }),
  resetSearchStore: () => set({ inputSearch: '', inputSearchFocused: false, outputSearch: '', outputSearchFocused: false })
}));
