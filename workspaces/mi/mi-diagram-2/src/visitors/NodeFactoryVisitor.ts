import { Send, Visitor, STNode, WithParam } from "@wso2-enterprise/mi-syntax-tree/src";
import createEngine, {
    DefaultLinkModel,
    DefaultNodeModel,
    DiagramModel
} from '@projectstorm/react-diagrams';

export class NodeFactoryVisitor implements Visitor {
    nodes: DefaultNodeModel[] = [];

    private createNode(node: STNode): void {
        const diagramNode = new DefaultNodeModel({
            name: node.tag,
            color: 'rgb(0,192,255)',
        });
        diagramNode.setPosition(100, node.viewState.y);
        this.nodes.push(diagramNode);
    }

    getNodes(): any[] {
        return this.nodes;
    }

    endVisitSend = (node: STNode): void => this.createNode(node);
    endVisitWithParam = (node: WithParam): void => this.createNode(node);
    skipChildren(): boolean {
        return false;
    }
}