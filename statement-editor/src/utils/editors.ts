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
import { NodePosition } from "@wso2-enterprise/syntax-tree";

export interface StmtEditorStackItem {
    label: string;
    source: string;
    position: NodePosition;
    isConfigurableStmt?: boolean;
}

class StmtEditorStack {

    private items : StmtEditorStackItem[];

    constructor() {
        this.items = [];
    }

    add(element: StmtEditorStackItem) {
        return this.items.push(element);
    }

    remove() {
        if (this.items.length > 0) {
            return this.items.pop();
        }
    }

    get(index: number) {
        if (this.items.length > index) {
            return this.items[index];
        }
    }

    getAll() {
        return this.items;
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
export class StmtEditorManager {

    private stmtStack: StmtEditorStack;

    constructor() {
        this.stmtStack = new StmtEditorStack();
    }

    public add(label: string, source: string, position: NodePosition, isConfigurableStmt: boolean = false) {
        this.stmtStack.add({
            source,
            label,
            position,
            isConfigurableStmt
        });
    }

    public getEditor(index: number) {
        if (!this.stmtStack.isEmpty()) {
            return this.stmtStack.get(index);
        }
    }

    public getAll() {
        return this.stmtStack.getAll();
    }

    public remove() {
        return this.stmtStack.remove();
    }
}
