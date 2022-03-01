/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

import { STNode } from "@wso2-enterprise/syntax-tree";

interface StmtActionStackItem {
    oldModel: STNode;
    newModel: STNode;
}

class StatementSTStack {

    private items : StmtActionStackItem[];

    constructor() {
        this.items = [];
    }

    add(element: StmtActionStackItem) {
        return this.items.push(element);
    }

    remove() {
        if (this.items.length > 0) {
            return this.items.pop();
        }
    }

    peek() {
        return this.items[this.items.length - 1];
    }

    isEmpty(){
       return this.items.length === 0;
    }

    size(){
        return this.items.length;
    }

    clear(){
        this.items = [];
    }
}

// tslint:disable-next-line: max-classes-per-file
export class StmtEditorUndoRedoManager {

    private undoStack: StatementSTStack;
    private redoStack: StatementSTStack;

    constructor() {
        this.undoStack = new StatementSTStack();
        this.redoStack = new StatementSTStack();
    }

    public add(oldModel: STNode, newModel: STNode) {
        this.undoStack.add({ oldModel, newModel});
    }

    public getUndoModel() {
        if (!this.undoStack.isEmpty()) {
            const element = this.undoStack.remove();
            this.redoStack.add(element);
            return element;
        }
    }

    public getRedoModel() {
        if (!this.redoStack.isEmpty()) {
            const element = this.redoStack.remove();
            this.undoStack.add(element);
            return element;
        }
    }
}
