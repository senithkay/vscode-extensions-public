
import { FunctionViewState, initVisitor, positionVisitor, sizingVisitor } from "@wso2-enterprise/ballerina-low-code-diagram";
import { DiagramSize } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { STKindChecker, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

export function calculateSize(st: STNode): DiagramSize {
    return {
        height: 1000,
        width: 1000
    }
}

export function sizingAndPositioning(st: STNode): STNode {
    traversNode(st, initVisitor);
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);

    if (STKindChecker.isFunctionDefinition(st) && st?.viewState?.onFail) {
        const viewState = st.viewState as FunctionViewState;
        traversNode(viewState.onFail, sizingVisitor);
        traversNode(viewState.onFail, positionVisitor);
    }
    const clone = { ...st };
    return clone;
}

export function recalculateSizingAndPositioning(st: STNode): STNode {
    traversNode(st, sizingVisitor);
    traversNode(st, positionVisitor);
    if (STKindChecker.isFunctionDefinition(st) && st?.viewState?.onFail) {
        const viewState = st.viewState as FunctionViewState;
        traversNode(viewState.onFail, sizingVisitor);
        traversNode(viewState.onFail, positionVisitor);
    }
    const clone = { ...st };
    return clone;
}

