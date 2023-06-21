/**
 * Copyright (c) 2023, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
export class UndoRedoManager {
    private undoStack: string[];
    private redoStack: string[];

    constructor() {
        this.undoStack = [];
        this.redoStack = [];
    }

    public addModification(content: string) {
        if (this.undoStack.length >= 100) {
            this.undoStack.shift();
        }

        this.undoStack.push(content);
    }

    public undo(): string {
        if (this.redoStack.length > 0) {
            if (this.redoStack.length >= 100) {
                this.redoStack.shift();
            }
            this.redoStack.push(this.undoStack.pop());
            return this.undoStack[this.undoStack.length - 1];
        }
    }

    public redo(): string {
        this.undoStack.push(this.redoStack.pop());
        return this.undoStack[this.undoStack.length - 1];
    }

    public clear() {
        this.undoStack = [];
        this.redoStack = [];
    }
}

