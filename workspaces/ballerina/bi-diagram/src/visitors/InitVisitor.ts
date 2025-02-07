/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { LAST_NODE, START_NODE } from "../resources/constants";
import { getCustomNodeId } from "../utils/node";
import { Branch, Flow, FlowNode, ViewState } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class InitVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private flow: Flow;

    constructor(model: Flow) {
        // console.log(">>> init visitor started");
        this.flow = model;
    }

    private getDefaultViewState(): ViewState {
        return {
            x: 0,
            y: 0,
            lw: 0,
            rw: 0,
            h: 0,
            clw: 0,
            crw: 0,
            ch: 0,
        };
    }

    private validateNode(node: FlowNode): boolean {
        if (this.skipChildrenVisit) {
            return false;
        }
        return true;
    }

    beginVisitNode(node: FlowNode, parent?: FlowNode): void {
        if (!this.validateNode(node)) return;
        node.viewState = this.getDefaultViewState();
    }

    endVisitNode(node: FlowNode, parent?: FlowNode): void {
        if (!this.validateNode(node)) return;
        // if this is last block in the flow, add empty node end of the block
        if (!node.returning && this.flow.nodes.at(-1).id === node.id) {
            const emptyNode: FlowNode = {
                id: getCustomNodeId(node.id, LAST_NODE),
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
        if (!this.validateNode(node)) return;
        node.viewState = this.getDefaultViewState();
        // add empty node if branch is empty
        node.branches?.forEach((branch, index) => {
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
                    id: getCustomNodeId(node.id, branch.label, index),
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
                id: getCustomNodeId(node.id, "Else"),
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
                repeatable: "ZERO_OR_MORE",
                properties: {},
                children: [emptyElseBranch],
            });
        }
    }

    private visitContainerNode(node: FlowNode, parent?: FlowNode): void {
        node.viewState = this.getDefaultViewState();

        if (!node.branches || node.branches.length < 1) {
            console.error("Branch node model not found");
            return;
        }

        const branch = node.branches.at(0);
        branch.viewState = this.getDefaultViewState();

        // remove empty nodes if the branch is not empty
        if (branch.children && branch.children.length > 0) {
            let emptyNodeIndex = branch.children.findIndex((child) => child.codedata.node === "EMPTY");
            while (emptyNodeIndex >= 0) {
                branch.children.splice(emptyNodeIndex, 1);
                emptyNodeIndex = branch.children.findIndex((child) => child.codedata.node === "EMPTY");
            }
        }

        // add empty node if the branch is empty
        if (!branch.children || branch.children.length === 0) {
            // empty branch
            // add empty node as `add new node` button
            const emptyNode: FlowNode = {
                id: getCustomNodeId(node.id, branch.label),
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
    }

    beginVisitWhile(node: FlowNode, parent?: FlowNode): void {
        if (!this.validateNode(node)) return;
        this.visitContainerNode(node, parent);
    }

    beginVisitForeach(node: FlowNode, parent?: FlowNode): void {
        if (!this.validateNode(node)) return;
        this.visitContainerNode(node, parent);
    }

    beginVisitErrorHandler(node: FlowNode, parent?: FlowNode): void {
        if (!this.validateNode(node)) return;
        this.visitContainerNode(node, parent);

        // Add start node for On Failure branch if it doesn't exist
        const onFailureBranch = node.branches.find((branch) => branch.codedata.node === "ON_FAILURE");
        if (onFailureBranch && onFailureBranch.children && onFailureBranch.children.length > 0) {
            // Check if first node is not already a start node
            if (onFailureBranch.children[0].codedata.node !== "EVENT_START") {
                const startNode: FlowNode = {
                    id: getCustomNodeId(node.id, START_NODE, 0, "ON_FAILURE"),
                    metadata: {
                        label: "On Error",
                        description: "",
                    },
                    codedata: {
                        node: "EVENT_START",
                        lineRange: onFailureBranch.codedata.lineRange,
                    },
                    branches: [],
                    returning: false,
                    viewState: this.getDefaultViewState(),
                };
                onFailureBranch.children.unshift(startNode);
            }
        }

        // hide container if the error handler is in top level
        const errorNode = this.flow.nodes?.find((n) => n.codedata.node === "ERROR_HANDLER");
        if (errorNode) {
            errorNode.viewState.isTopLevel = true;
        }
    }

    private visitForkNode(node: FlowNode, parent?: FlowNode): void {
        node.viewState = this.getDefaultViewState();

        // if node has no branches, create a new branch
        if (!node.branches || node.branches.length === 0) {
            const newBranch: Branch = {
                label: "Empty",
                kind: "block",
                codedata: { node: "WORKER" },
                repeatable: "ZERO_OR_MORE",
                properties: {},
                children: [],
            };
            node.branches = [newBranch];
        }

        node.branches?.forEach((branch, index) => {
            // add start node, end node to every branch
            const startNode: FlowNode = {
                id: getCustomNodeId(node.id, START_NODE, index, branch.label),
                metadata: {
                    label: branch.label,
                    description: "",
                },
                codedata: {
                    node: "EVENT_START",
                },
                branches: [],
                returning: false,
                viewState: this.getDefaultViewState(),
            };
            // add startNode as first child of the branch
            branch.children.unshift(startNode);

            const endNode: FlowNode = {
                id: getCustomNodeId(node.id, LAST_NODE, index, branch.label),
                codedata: {
                    node: "EMPTY",
                },
                returning: false,
                metadata: { label: "", description: "" },
                branches: [],
                viewState: this.getDefaultViewState(),
            };
            // add endNode as last child of the branch
            branch.children.push(endNode);
        });
    }

    beginVisitFork(node: FlowNode, parent?: FlowNode): void {
        if (!this.validateNode(node)) return;
        this.visitForkNode(node, parent);
    }

    endVisitErrorHandler(node: FlowNode, parent?: FlowNode): void {
        if (!this.validateNode(node)) return;
        // remove view state of error branch and its children to avoid visiting them
        const errorBranch = node.branches.find((branch) => branch.codedata.node === "ON_FAILURE");
        errorBranch.viewState = undefined;
        errorBranch.children.forEach((child) => {
            child.viewState = undefined;
        });
        this.endVisitNode(node, parent);
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
