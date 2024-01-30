import { Send, Visitor, STNode, WithParam, APIResource } from "@wso2-enterprise/mi-syntax-tree/src";

const NODE_GAP = 100;
// Element types 




export class PositionVisitor implements Visitor {

    skipChildren(): boolean {
        return false;
    }

    beginVisitAPIResource(node: APIResource): void {
        if (node.viewState == undefined) {
            node.viewState = { x: 0, y: 0, w: 0, h: 0 }
        }
        let y = node.viewState.y;
        node.inSequence.mediatorList.forEach(element => {
            if (element.viewState == undefined) {
                element.viewState = { x: 0, y: 0, w: 0, h: 0 }
            }
            element.viewState.x = 100;
            element.viewState.y = 100 + y;
            y = NODE_GAP + element.viewState.h;
            console.log(y);
        });

    }
}
