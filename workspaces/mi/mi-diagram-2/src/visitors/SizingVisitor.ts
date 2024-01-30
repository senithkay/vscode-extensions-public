import { Send, Visitor, STNode, WithParam } from "@wso2-enterprise/mi-syntax-tree/src";

const NODE_WIDTH = 100;
const NODE_HEIGHT = 50;

// Element types 

const calculateBasicMediator = (node: STNode): void => {
    if (node.viewState == undefined) {
        node.viewState = { x: 0, y: 0, w: 0, h: 0 }
    }
    node.viewState.w = NODE_WIDTH;
    node.viewState.h = NODE_HEIGHT;
}


export class SizingVisitor implements Visitor {
    endVisitSend = (node: STNode): void => calculateBasicMediator(node);
    endVisitWithParam = (node: WithParam): void => calculateBasicMediator(node);
    skipChildren(): boolean {
        return false;
    }
}
