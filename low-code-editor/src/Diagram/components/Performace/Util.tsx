import { STKindChecker, STNode, traversNode } from "@ballerina/syntax-tree";

import { InvocationPerformanceVisitor } from "../../visitors/InvocationPerformanceVisitor";

export function getPerformance(model: STNode){
    let performance: any;
    if (model) {
        const findPerformaceVisitor = new InvocationPerformanceVisitor();
        traversNode(model, findPerformaceVisitor);
        const performanceNode = findPerformaceVisitor.getPerformanceNode();
        if (performanceNode && STKindChecker.isRemoteMethodCallAction(performanceNode)) {
            performance = (performanceNode as any).performance;
        }
    }
    return performance;
}
