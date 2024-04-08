/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeModel } from "@projectstorm/react-diagrams";
import { STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { getNodeIdFromModel } from "../../utils/node";
import { NodePortModel } from "../NodePort/NodePortModel";
import { Colors, NodeTypes } from "../../resources/constants";
import { RpcClient } from '@wso2-enterprise/mi-rpc-client';
import { Diagnostic } from "vscode-languageserver-types";
import { getDataFromXML } from "../../utils/template-engine/mustach-templates/templateUtils";
import SidePanelContext from "../sidePanel/SidePanelContexProvider";
import styled from "@emotion/styled";

export class BaseNodeModel extends NodeModel {
    readonly stNode: STNode;
    protected portIn: NodePortModel;
    protected portOut: NodePortModel;
    protected parentNode: STNode;
    protected prevNodes: STNode[];
    readonly documentUri: string;
    readonly mediatorName: string;

    constructor(type: NodeTypes, mediatorName: string, documentUri: string, stNode: STNode, parentNode?: STNode, prevNodes: STNode[] = []) {
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
        this.documentUri = documentUri;
        this.mediatorName = mediatorName;
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

    async onClicked(e: any, node: BaseNodeModel, rpcClient: RpcClient, sidePanelContext: SidePanelContext, operationName: string = this.mediatorName, stNode: STNode = this.stNode) {
        const nodeRange = { start: stNode.range.startTagRange.start, end: stNode.range.endTagRange.end || stNode.range.startTagRange.end };
        if (e.ctrlKey || e.metaKey) {
            // open code and highlight the selected node
            rpcClient.getMiDiagramRpcClient().highlightCode({
                range: nodeRange,
                force: true,
            });
        } else if (node.isSelected()) {
            // highlight the selected node
            rpcClient.getMiDiagramRpcClient().highlightCode({
                range: nodeRange,
            });

            const formData = getDataFromXML(
                operationName,
                stNode
            );

            sidePanelContext.setSidePanelState({
                isOpen: true,
                operationName: operationName.toLowerCase(),
                nodeRange: nodeRange,
                isEditing: true,
                formValues: formData,
                parentNode: node.mediatorName
            });
        }
    }

    async delete(rpcClient: RpcClient) {
        rpcClient.getMiDiagramRpcClient().applyEdit({
            documentUri: this.documentUri,
            range: { start: this.stNode.range.startTagRange.start, end: this.stNode.range.endTagRange.end ?? this.stNode.range.startTagRange.end },
            text: "",
        });
    };

    hasDiagnotics(): boolean {
        return this.stNode.diagnostics !== undefined && this.stNode.diagnostics.length > 0;
    }

    getDiagnostics(): Diagnostic[] {
        return this.stNode.diagnostics || [];
    }
}


export const Header = styled.div<{ showBorder: boolean }>`
    color: ${Colors.ON_SURFACE};
    display: flex;
    width: 100%;
    margin-top: 2px;
    border-bottom: ${(props: { showBorder: any; }) => props.showBorder ? `0.2px solid ${Colors.OUTLINE_VARIANT};` : "none"};
    text-align: center;
`;

export const Description = styled.div`
    color: ${Colors.ON_SURFACE};
    max-width: 90px;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-align: left;
    font-family: var(--font-family);
    font-size: var(--type-ramp-minus1-font-size);
`;

export const Name = styled(Description)`
    font-size: var(--type-ramp-base-font-size);
    font-weight: var(--font-weight);
`;
