import { BalleriaLanguageClient } from '@wso2-enterprise/ballerina-languageclient';
import { FunctionDefinition } from '@wso2-enterprise/syntax-tree';
import create from 'zustand'

export interface DataMapperState {
  functionST: FunctionDefinition;
  setFunctionST: (st: FunctionDefinition) => void;
  filePath: string;
  setFilePath: (filePath: string) => void;
  langClientPromise: Promise<BalleriaLanguageClient>;
  setLangClientPromise: (lCP: Promise<BalleriaLanguageClient>) => void;
}

export const useDMStore = create<DataMapperState>((set) => ({
    functionST: undefined,
    filePath: undefined,
    langClientPromise: undefined,
    setFunctionST: (functionST: FunctionDefinition) => set({ functionST}),
    setFilePath: (filePath: string) => set({ filePath }),
    setLangClientPromise: (langClientPromise: Promise<BalleriaLanguageClient>) => set({ langClientPromise })
}));