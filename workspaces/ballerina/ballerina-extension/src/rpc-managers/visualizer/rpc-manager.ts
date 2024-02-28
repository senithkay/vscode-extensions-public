/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 * 
 * THIS FILE INCLUDES AUTO GENERATED CODE
 */
import {
    HistoryEntry,
    UpdateUndoRedoMangerRequest,
    VisualizerAPI,
    VisualizerLocation
} from "@wso2-enterprise/ballerina-core";
import { history, updateView, openView, undoRedoManager } from "../../stateMachine";

export class VisualizerRpcManager implements VisualizerAPI {

    openView(params: VisualizerLocation): Promise<void> {
        return new Promise(async (resolve) => {
            openView("OPEN_VIEW", params);
            resolve();
        });
    }

    goBack(): void {
        history.pop();
        updateView();
    }

    async getHistory(): Promise<HistoryEntry[]> {
        return history.get();
    }

    goHome(): void {
        history.clear();
        updateView();
    }

    goSelected(index: number): void {
        history.select(index);
        updateView();
    }

    addToHistory(entry: HistoryEntry): void {
        history.push(entry);
        updateView();
    }

    async undo(): Promise<string> {
        return undoRedoManager.undo();
    }

    async redo(): Promise<string> {
        return undoRedoManager.redo();
    }

    addToUndoStack(source: string): void {
        undoRedoManager.addModification(source);
    }

    updateUndoRedoManager(params: UpdateUndoRedoMangerRequest): void {
        undoRedoManager.updateContent(params.filePath, params.fileContent);
    }
}
