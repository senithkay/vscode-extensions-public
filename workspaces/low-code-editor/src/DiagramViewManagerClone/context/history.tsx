/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */
import React from 'react';

import { HistoryEntry } from '../hooks/history';


export interface HistoryProviderState {
    history: HistoryEntry[],
    historyPush: (info: HistoryEntry) => void;
    historyPop: () => void;
    historyClearAndPopulateWith: (info: HistoryEntry) => void;
    historyUpdateCurrentEntry: (info: HistoryEntry) => void;
    historySelect: (index: number) => void;
    historyReset: () => void;
}

export const Context = React.createContext<HistoryProviderState>({
    history: [],
    historyPush(info: HistoryEntry): void {
        throw new Error("Function not implemented.");
    },
    historyPop(): void {
        throw new Error('Function not implemented.');
    },
    historyClearAndPopulateWith(info: HistoryEntry): void {
        throw new Error("Function not implemented.");
    },
    historySelect(index: number): void {
        throw new Error('Function not implemented.');
    },
    historyReset(): void {
        throw new Error('Function not implemented.');
    },
    historyUpdateCurrentEntry(info: HistoryEntry): void {
        throw new Error('Function not implemented.');
    }
});

export const Provider: React.FC<HistoryProviderState> = (props) => {
    const { children, ...restProps } = props;
    return (
        <Context.Provider value={{ ...restProps }} >
            {props.children}
        </Context.Provider>
    )
}

export const useHistoryContext = () => React.useContext(Context);

