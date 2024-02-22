/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel } from "@projectstorm/react-diagrams";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/src";
import { getNodeIdFromModel } from "../../utils/node";
import { NodePortModel } from "../NodePort/NodePortModel";
import { NodeTypes } from "../../resources/constants";
import { useVisualizerContext } from '@wso2-enterprise/mi-rpc-client';

export class BaseNodeModel extends NodeModel {
    readonly stNode: STNode;
    protected portIn: NodePortModel;
    protected portOut: NodePortModel;
    protected parentNode: STNode;
    protected prevNodes: STNode[];

    constructor(type: NodeTypes, stNode: STNode, parentNode?: STNode, prevNodes: STNode[] = []) {
        super({
            id: stNode.viewState?.id || getNodeIdFromModel(stNode),
            type: type,
            locked: true,
        });
        this.stNode = stNode;
        this.parentNode = parentNode;
        this.prevNodes = prevNodes;
        this.addInPort("in");
        this.addOutPort("out");
    }

    addPort<T extends NodePortModel>(port: T): T {
        super.addPort(port);
        if (port.getOptions().in) {
            this.portIn = port;
        } else {
            this.portOut = port;
        }
        return port;
    }

    addInPort(label: string): NodePortModel {
        const p = new NodePortModel(true, label);
        return this.addPort(p);
    }

    addOutPort(label: string): NodePortModel {
        const p = new NodePortModel(false, label);
        return this.addPort(p);
    }

    getInPort(): NodePortModel {
        return this.portIn;
    }

    getOutPort(): NodePortModel {
        return this.portOut;
    }

    getStNode(): STNode {
        return this.stNode;
    }

    getParentStNode(): STNode {
        return this.parentNode;
    }

    getPrevStNodes(): STNode[] {
        return this.prevNodes;
    }

    onClicked(visualizerContext: ReturnType<typeof useVisualizerContext>): void {
        visualizerContext.rpcClient.getMiDiagramRpcClient().highlightCode({
            range: { start: this.stNode.range.startTagRange.start, end: this.stNode.range.endTagRange.end || this.stNode.range.startTagRange.end },
        });
    }
}
