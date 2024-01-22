import { LangServerRpcClient } from '@wso2-enterprise/ballerina-rpc-client';
import { FunctionDefinition } from '@wso2-enterprise/syntax-tree';
import { create } from 'zustand';

export interface DataMapperState {
  imports: string[];
  setImports: (imports: string[]) => void;
  functionST: FunctionDefinition;
  setFunctionST: (st: FunctionDefinition) => void;
  filePath: string;
  setFilePath: (filePath: string) => void;
  langClientPromise: LangServerRpcClient;
  setLangClientPromise: (lCP: LangServerRpcClient) => void;
}

export interface DataMapperSearchState {
  inputSearch: string;
  setInputSearch: (inputSearch: string) => void;
  outputSearch: string;
  setOutputSearch: (outputSearch: string) => void;
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
  setLangClientPromise: (langClientPromise: LangServerRpcClient) => set({ langClientPromise }),
}));


export const useDMSearchStore = create<DataMapperSearchState>((set) => ({
  inputSearch: "",
  outputSearch: "",
  setInputSearch: (inputSearch: string) => set({ inputSearch }),
  setOutputSearch: (outputSearch: string) => set({ outputSearch }),
  resetSearchStore: () => set({ inputSearch: '', outputSearch: '' })
}));
