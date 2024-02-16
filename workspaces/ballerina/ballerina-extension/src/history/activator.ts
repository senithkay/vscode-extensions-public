/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { VisualizerLocation } from "@wso2-enterprise/ballerina-core";

export interface HistoryEntry {
    location: VisualizerLocation;
    uid?: string;
}

export let historyStack: HistoryEntry[];

export function activate() {
    historyStack = [];
}

export function pushHistory(item: HistoryEntry): void {
    historyStack.push(item);
}

export function popHistory(): void {
    historyStack.pop();
}

export function selectHistory(index: number): void {
    if (index < 0 || index >= historyStack.length) return;
    historyStack.slice(0, index + 1);
}

export function clearHistory(): void {
    historyStack = [];
}

export function clearHistoryAndPopulateWith(historyEntry: HistoryEntry): void {
    historyStack = [historyEntry];
}

export function updateCurrentEntry(historyEntry: HistoryEntry): void {
    if (historyStack.length === 0) return;
    const newHistory = [...historyStack];
    newHistory[newHistory.length - 1] = historyEntry;
    historyStack = newHistory;
}
