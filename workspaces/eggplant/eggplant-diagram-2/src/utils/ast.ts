/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { BaseVisitor } from "../visitors/BaseVisitor";
import { Flow, Node } from "./types";

const metaNodes = ["viewState", "position", "parent"];

export function traverseFlow(flow: Flow, visitor: BaseVisitor, parent?: Node) {
    flow.nodes.forEach((node) => {
        traverseNode(node, visitor, parent);
    });
}

export function traverseNode(node: Node, visitor: BaseVisitor, parent?: Node) {
    let name = "";
    node.kind.split("_").forEach((kind) => {
        name += kind.charAt(0).toUpperCase() + kind.slice(1);
    });

    let beginVisitFn: any = (visitor as any)[`beginVisit${name}`];
    if (!beginVisitFn) {
        beginVisitFn = visitor.beginVisitNode && visitor.beginVisitNode;
    }

    if (beginVisitFn) {
        beginVisitFn.bind(visitor)(node, parent);
    }

    const keys = Object.keys(node);
    keys.forEach((key) => {
        if (metaNodes.includes(key) || visitor.skipChildren()) {
            return;
        }

        const childNode = (node as any)[key] as any;
        if (Array.isArray(childNode)) {
            childNode.forEach((elementNode) => {
                if (!elementNode?.kind) {
                    return;
                }

                traverseNode(elementNode, visitor, node);
            });
            return;
        }

        if (!childNode.kind) {
            return;
        }

        traverseNode(childNode, visitor, node);
    });

    let endVisitFn: any = (visitor as any)[`endVisit${name}`];
    if (!endVisitFn) {
        endVisitFn = visitor.endVisitNode && visitor.endVisitNode;
    }

    if (endVisitFn) {
        endVisitFn.bind(visitor)(node, parent);
    }
}
