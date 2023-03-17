/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { useState } from "react";

import { NodePosition } from "@wso2-enterprise/syntax-tree";

export interface HistoryEntry {
    file: string;
    position?: NodePosition;
    uid?: string;
}

type historyPushFnType = (info: HistoryEntry) => void;
type historyPopFnType = () => void;
type historyClearFnType = () => void;
type updateCurrentEntryFnType = (info: HistoryEntry) => void;

export function useComponentHistory():
    [HistoryEntry[], historyPushFnType, historyPopFnType, historyClearFnType, updateCurrentEntryFnType] {
    const [history, updateHistory] = useState<HistoryEntry[]>([]);

    const historyPush = (historyEntry: HistoryEntry) => {
        updateHistory([...history, historyEntry]);
    }

    const historyPop = () => {
        if (history.length === 0) return;
        updateHistory(history.slice(0, history.length - 1));
    }

    const historyClear = () => {
        updateHistory([]);
    }

    const updateCurrentEntry = (historyEntry: HistoryEntry) => {
        if (history.length === 0) return;
        const newHistory = [...history];
        newHistory[newHistory.length - 1] = historyEntry;
        updateHistory(newHistory);
    }

    return [history, historyPush, historyPop, historyClear, updateCurrentEntry];
}

