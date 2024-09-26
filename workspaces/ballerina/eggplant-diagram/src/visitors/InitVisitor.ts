/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Flow, FlowNode, ViewState } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class InitVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private flow;

    constructor(model: Flow) {
        console.log(">>> init visitor started");
        this.flow = model;
    }

    private getDefaultViewState(): ViewState {
        return { x: 0, y: 0, w: 0, h: 0, cw: 0, ch: 0 };
    }

    beginVisitNode(node: FlowNode, parent?: FlowNode): void {
        node.viewState = this.getDefaultViewState();
    }

    endVisitNode(node: FlowNode, parent?: FlowNode): void {
        // if this is last block in the flow, add empty node end of the block
        if (!node.returning && this.flow.nodes.at(-1).id === node.id) {
            const emptyNode: FlowNode = {
                id: `${node.id}-last`,
                codedata: {
                    node: "EMPTY",
                },
                returning: false,
                metadata: { label: "", description: "" },
                branches: [],
                viewState: this.getDefaultViewState(),
            };
            this.flow.nodes.push(emptyNode);
        }
    }

    beginVisitIf(node: FlowNode, parent?: FlowNode): void {
        node.viewState = this.getDefaultViewState();
        // add empty node if branch is empty
        node.branches?.forEach((branch) => {
            // if branch is not empty remove empty node
            if (branch.children && branch.children.length > 0) {
                const emptyNodeIndex = branch.children.findIndex((child) => child.codedata.node === "EMPTY");
                if (emptyNodeIndex >= 0) {
                    branch.children.splice(emptyNodeIndex, 1);
                }
            }

            // if branch is empty add empty node
            if (!branch.children || branch.children.length === 0) {
                // empty branch
                // add empty node as `add new node` button
                const emptyNode: FlowNode = {
                    id: `${node.id}-${branch.label}-branch`,
                    codedata: {
                        node: "EMPTY",
                    },
                    returning: false,
                    metadata: { label: "", description: "" },
                    branches: [],
                    viewState: this.getDefaultViewState(),
                };
                branch.children.push(emptyNode);
            }
            branch.viewState = this.getDefaultViewState();
        });

        // add empty else branch if not exists
        if (node.branches.find((branch) => branch.label === "Else") === undefined) {
            const emptyElseBranch: FlowNode = {
                id: `${node.id}-Else-branch`,
                codedata: {
                    node: "EMPTY",
                },
                returning: false,
                metadata: {
                    label: "",
                    description: "",
                    draft: true, // else branch is draft
                },
                branches: [],
                viewState: this.getDefaultViewState(),
            };
            node.branches.push({
                label: "Else",
                kind: "block",
                codedata: {
                    node: "ELSE",
                    lineRange: node.codedata.lineRange,
                },
                repeatable: "0..1",
                properties: {},
                children: [emptyElseBranch],
            });
        }

        // HACK: replace Then branch label with condition
        const thenBranch = node.branches.find((branch) => branch.label === "Then");
        if (thenBranch) {
            thenBranch.label = thenBranch.properties.condition.value;
        }
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
