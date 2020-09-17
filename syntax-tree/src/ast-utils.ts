
import { Visitor } from "./base-visitor";
import { STNode } from "./syntax-tree-interfaces";

const metaNodes = ["viewState", "position", "parent"];

export function traversNode(node: STNode, visitor: Visitor, parent?: STNode) {
    let beginVisitFn: any = (visitor as any)[`beginVisit${node.kind}`];
    if (!beginVisitFn) {
        beginVisitFn = visitor.beginVisitSTNode && visitor.beginVisitSTNode;
    }

    if (beginVisitFn) {
        beginVisitFn.bind(visitor)(node, parent);
    }

    const keys = Object.keys(node);
    keys.forEach((key) => {
        if (metaNodes.includes(key)) {
            return;
        }

        const childNode = (node as any)[key] as any;
        if (Array.isArray(childNode)) {
            childNode.forEach((elementNode) => {
                if (!elementNode.kind) {
                    return;
                }

                traversNode(elementNode, visitor, node);
            });
            return;
        }

        if (!childNode.kind) {
            return;
        }

        traversNode(childNode, visitor, node);
    });

    let endVisitFn: any = (visitor as any)[`endVisit${node.kind}`];
    if (!endVisitFn) {
        endVisitFn = visitor.endVisitSTNode && visitor.endVisitSTNode;
    }

    if (endVisitFn) {
        endVisitFn.bind(visitor)(node, parent);
    }
}