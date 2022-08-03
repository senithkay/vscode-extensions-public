/**
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
 *
 * WSO2 Inc. licenses this file to you under the Apache License,
 * Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations
 * under the License.
 *
 */

import { ANALYZE_TYPE, TopBarData } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { BlockStatement, FunctionDefinition, IfElseStatement, NodePosition, RemoteMethodCallAction, ResourceAccessorDefinition, ServiceDeclaration, STNode, traversNode, Visitor } from "@wso2-enterprise/syntax-tree";

export interface ConnectorLatency {
    name: string;
    latency: string;
}

// TODO: find out what kind of invocations analyse here. is it only action invocations.
export function mergeAnalysisDetails(
    stNode: STNode,
    serviceData: TopBarData,
    connectorLatencies: ConnectorLatency[],
    currentResourcePos: NodePosition
) {
    const analysisMerger = new AnalysisDetailMerger(serviceData, connectorLatencies, currentResourcePos);
    if (!stNode) {
        return;
    }
    traversNode(stNode, analysisMerger);
}

export class AnalysisDetailMerger implements Visitor {
    serviceData: TopBarData;
    connectorLatencies: ConnectorLatency[];
    currentResourcePos: NodePosition;
    blocks: BlockStatement[];
    currentResource: ResourceAccessorDefinition;
    constructor(serviceData: TopBarData, connectorLatencies: ConnectorLatency[], currentResourcePos: NodePosition) {
        this.serviceData = serviceData;
        this.connectorLatencies = connectorLatencies;
        this.currentResourcePos = currentResourcePos;
        this.blocks = [];
    }

    public beginVisitBlockStatement(node: BlockStatement) {
        node.isInSelectedPath = false;
        this.blocks.push(node);
    }

    public endVisitBlockStatement(node: BlockStatement) {
        this.blocks.pop();
    }

    public beginVisitRemoteMethodCallAction(node: RemoteMethodCallAction) {
        const { position: { startLine, startColumn, endLine, endColumn } } = node;
        const key = `(${startLine}:${startColumn},${endLine}:${endColumn})`;
        delete node.performance;

        this.connectorLatencies.forEach(data => {
            if (key === data.name) {
                node.performance = { latency: data.latency };
                const isAdvanced = this.serviceData.analyzeType === ANALYZE_TYPE.ADVANCED;

                if (this.blocks.length > 0) {
                    this.blocks[this.blocks.length - 1].isInSelectedPath = isAdvanced;
                }
                if (this.currentResource) {
                    this.currentResource.isInSelectedPath = isAdvanced;
                }
            }
        });
    }

    public beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition) {
        if (this.currentResourcePos && node.position.startLine === this.currentResourcePos.startLine &&
            node.position.startColumn === this.currentResourcePos.startColumn) {
            node.performance = {
                concurrency: this.serviceData.concurrency, latency: this.serviceData.latency,
                tps: this.serviceData.tps, analyzeType: this.serviceData.analyzeType
            };
        } else {
            delete node.performance;
        }
        node.isInSelectedPath = false;
        this.currentResource = node;
    }

    public endVisitResourceAccessorDefinition(node: ResourceAccessorDefinition) {
        this.currentResource = undefined;
    }
};
