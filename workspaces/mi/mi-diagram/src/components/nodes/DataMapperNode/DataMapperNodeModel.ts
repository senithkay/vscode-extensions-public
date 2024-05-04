/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { STNode } from "@wso2-enterprise/mi-syntax-tree/lib/src";
import { NodeTypes } from "../../../resources/constants";
import { BaseNodeModel } from "../BaseNodeModel";
import { RpcClient } from '@wso2-enterprise/mi-rpc-client';
import { getDataFromXML } from "../../../utils/template-engine/mustach-templates/templateUtils";
import SidePanelContext from "../../sidePanel/SidePanelContexProvider";
import { EVENT_TYPE, MACHINE_VIEW } from "@wso2-enterprise/mi-core";
import { MediatorNodeModel } from "../MediatorNode/MediatorNodeModel";

export class DataMapperNodeModel extends MediatorNodeModel {
    constructor(stNode: STNode, mediatorName:string, documentUri:string, parentNode?: STNode, prevNodes: STNode[] = []) {
        super(NodeTypes.DATAMAPPER_NODE, stNode, mediatorName, documentUri, parentNode, prevNodes);
    }

    async openDataMapperView(rpcClient: RpcClient, sidePanelContext: SidePanelContext, operationName: string = this.mediatorName, stNode: STNode = this.stNode) {
        const formData = getDataFromXML(
            operationName,
            stNode
        );

        const request = {
            sourcePath: this.documentUri,
            regPath: formData.configurationLocalPath
        }

        const dmName = formData.configurationLocalPath.split("/")[formData.configurationLocalPath.split("/").length - 1].split(".")[0];

        const dmCreateRequest = {
            dmLocation: "",
            filePath: this.documentUri,
            dmName: dmName
        };

        rpcClient.getMiDataMapperRpcClient().createDMFiles(dmCreateRequest).then(response => {
            rpcClient.getMiDataMapperRpcClient().convertRegPathToAbsPath(request).then(response => {
                // open data mapper view
                rpcClient.getVisualizerState().then((state) => {
                rpcClient.getMiVisualizerRpcClient().openView({
                    type: EVENT_TYPE.OPEN_VIEW,
                    location: {
                        ...state,
                        documentUri: response.absPath,
                        view: MACHINE_VIEW.DataMapperView
                    }
                });
                });
            });
        });
    }

    async onClicked(e: any, node: BaseNodeModel, rpcClient: RpcClient, sidePanelContext: SidePanelContext, operationName: string = this.mediatorName, stNode: STNode = this.stNode) {
        const nodeRange = { start: stNode.range.startTagRange.start, end: stNode.range.endTagRange.end || stNode.range.startTagRange.end };
        if (e.ctrlKey || e.metaKey) {
            // open data mapper view
            this.openDataMapperView(rpcClient, sidePanelContext, operationName, stNode);

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
}
