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

import { GraphPoint, SequenceGraphPointValue } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { NodePosition, RemoteMethodCallAction, ResourceAccessorDefinition, STNode, traversNode, Visitor } from "@wso2-enterprise/syntax-tree";

import { ANALYZE_TYPE } from "./performanceUtil";

// TODO: find out what kind of invocations analyse here. is it only action invocations.
export function mergeAnalysisDetails(
    stNode: STNode,
    serviceData: GraphPoint,
    analysisData: SequenceGraphPointValue[],
    cUnit: string,
    currentResourcePos: NodePosition,
    isClear = false
) {
    const analysisMerger = new AnalysisDetailMerger(serviceData, analysisData, cUnit, currentResourcePos);
    if (!stNode) {
        return;
    }
    traversNode(stNode, analysisMerger);
    if (isClear) {
        analysisMerger.clear();
    } else {
        analysisMerger.merge();
    }
}

export class AnalysisDetailMerger implements Visitor {
    anaylisisDetailMap: { [key: string]: RemoteMethodCallAction } = {};
    serviceData: GraphPoint;
    analysisData: SequenceGraphPointValue[];
    cUnit: string;
    currentResourcePos: NodePosition;
    constructor(serviceData: GraphPoint, analysisData: SequenceGraphPointValue[], cUnit: string,
                currentResourcePos: NodePosition) {
        this.serviceData = serviceData;
        this.analysisData = analysisData;
        this.cUnit = cUnit;
        this.currentResourcePos = currentResourcePos;
    }
    public beginVisitRemoteMethodCallAction(node: RemoteMethodCallAction) {
        const { position: { startLine, startColumn, endLine, endColumn } } = node;
        const key = `${this.cUnit}/${startLine}:${startColumn},${endLine}:${endColumn}`;
        (node as any).performance = {};
        this.anaylisisDetailMap[key] = node;
    }

    public beginVisitResourceAccessorDefinition(node: ResourceAccessorDefinition) {
        if (this.currentResourcePos && node.position.startLine === this.currentResourcePos.startLine &&
            node.position.startColumn === this.currentResourcePos.startColumn) {
            node.performance = {
                concurrency: this.serviceData.concurrency, latency: this.serviceData.latency,
                tps: this.serviceData.tps, analyzeType: ANALYZE_TYPE.ADVANCED
            };
        } else {
            delete node.performance;
        }
    }

    public merge() {
        this.analysisData.forEach(data => {

            const invocation = this.anaylisisDetailMap[Object.keys(this.anaylisisDetailMap).find((key) => (
                key === data.name)
            )] as any;
            if (invocation) {
                invocation.performance.latency = data.latency.toFixed(2);
            }
        });
    }

    public clear() {
        Object.values(this.anaylisisDetailMap).forEach((value) => {
            const invocation = value as any;
            delete invocation.performance;
        })
    }
};
