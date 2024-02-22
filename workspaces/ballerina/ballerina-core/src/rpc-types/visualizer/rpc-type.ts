/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import { HistoryEntry } from "../../history";
import { VisualizerLocation } from "../../state-machine-types";
import { UndoRedoManager } from "../../undo-redo-manager";
import { NotificationType, RequestType } from "vscode-messenger-common";

const _preFix = "visualizer";
export const openView: NotificationType<VisualizerLocation> = { method: `${_preFix}/openView` };
export const getUndoRedoManager: RequestType<void, UndoRedoManager> = { method: `${_preFix}/getUndoRedoManager` };
export const getHistory: RequestType<void, HistoryEntry[]> = { method: `${_preFix}/getHistory` };
export const addToHistory: NotificationType<HistoryEntry> = { method: `${_preFix}/addToHistory` };
export const goBack: NotificationType<void> = { method: `${_preFix}/goBack` };
export const goHome: NotificationType<void> = { method: `${_preFix}/goHome` };
export const goSelected: NotificationType<number> = { method: `${_preFix}/goSelected` };
