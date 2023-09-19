import React from "react";
import { Persister } from "@tanstack/react-query-persist-client";
/**
 * Creates an Indexed DB persister
 */
export declare function createIDBPersister(idbValidKey?: IDBValidKey): Persister;
export declare const ChoreoWebviewQueryClientProvider: ({ children }: {
    children: React.ReactNode;
}) => JSX.Element;
