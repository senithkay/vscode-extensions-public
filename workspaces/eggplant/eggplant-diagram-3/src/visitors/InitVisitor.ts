/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { Branch, Flow, Node } from "../utils/types";
import { BaseVisitor } from "./BaseVisitor";

export class InitVisitor implements BaseVisitor {
    private skipChildrenVisit = false;
    private flow;

    constructor(model: Flow) {
        console.log("sizing visitor started");
        this.flow = model;
    }

    beginVisitIf(node: Node, parent?: Node): void {
        // add empty node if branch is empty
        node.branches?.forEach((branch) => {
            if (!branch.children || branch.children.length === 0) {
                // empty branch
                // add empty node as `add new node` button
                const emptyNode: Node = {
                    id: `${node.id}-${branch.label}-branch`,
                    kind: "EMPTY",
                    label: "",
                    nodeProperties: {},
                    returning: false,
                    fixed: false,
                    lineRange: {
                        fileName: "",
                        startLine: [],
                        endLine: [],
                    },
                };
                branch.children.push(emptyNode);
            }
        });
    }

    endVisitIf(node: Node, parent?: Node): void {
        // if early return not present in both branches, add empty node end of the if block
        const thenBranchHasEarlyReturn =
            node.branches.find((branch) => branch.label === "Then")?.children.at(-1)?.kind == "RETURN";
        const elseBranchHasEarlyReturn =
            node.branches.find((branch) => branch.label === "Else")?.children.at(-1)?.kind == "RETURN";
        if (!(thenBranchHasEarlyReturn && elseBranchHasEarlyReturn)) {
            // add empty node
            const emptyNode: Node = {
                id: `${node.id}-endif`,
                kind: "EMPTY",
                label: "",
                nodeProperties: {},
                returning: false,
                fixed: false,
                lineRange: {
                    fileName: "",
                    startLine: [],
                    endLine: [],
                },
            };
            // fine node form flow and add empty node before it
            if (parent && (parent as unknown as Branch).children) {
                const index = (parent as unknown as Branch).children.findIndex((n) => n.id === node.id);
                if (index !== -1) {
                    (parent as unknown as Branch).children.splice(index + 1, 0, emptyNode);
                }
            }
            if (!parent) {
                const index = this.flow.nodes.findIndex((n) => n.id === node.id);
                if (index !== -1) {
                    this.flow.nodes.splice(index + 1, 0, emptyNode);
                }
            }
        }
    }

    skipChildren(): boolean {
        return this.skipChildrenVisit;
    }
}
