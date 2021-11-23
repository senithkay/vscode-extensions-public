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

import { FunctionDefinition, ServiceDeclaration, STNode, traversNode, Visitor } from "@ballerina/syntax-tree";
import { DiagramEditorLangClientInterface, ExecutorPosition, LineRange } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export async function addExecutorPositions(st: any, langClient: DiagramEditorLangClientInterface, file: string) {
    let executorPositions: ExecutorPosition[] = [];

    await langClient.getExecutorPositions({
        documentIdentifier: {
            uri: `file://${file}`
        }
    }).then((response: any) => {
        if (response.executorPositions) {
            executorPositions = response.executorPositions;
        }
    });
    mergeExecutorDetails(st, executorPositions);

}

function mergeExecutorDetails(
    stNode: STNode,
    executorPositions: ExecutorPosition[]
) {
    const executorDetailMerger = new ExecutorDetailMerger(executorPositions);
    if (!stNode) {
        return;
    }
    traversNode(stNode, executorDetailMerger);
}

class ExecutorDetailMerger implements Visitor {
    executorPositions: ExecutorPosition[] = [];
    constructor(executorPositions: ExecutorPosition[]) {
        this.executorPositions = executorPositions;
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        this.isExecutable(node)
    }

    public beginVisitServiceDeclaration(node: ServiceDeclaration) {
        this.isExecutable(node)
    }

    isExecutable(node: FunctionDefinition | ServiceDeclaration) {
        const nodePosition = node.position;
        if (!nodePosition) {
            return;
        }

        this.executorPositions.forEach((position: ExecutorPosition) => {
            if (this.isInRange(position.range, nodePosition)) {
                node.isRunnable = true;
                node.runArgs = [position.name];
            }
        })
    }

    isInRange(executorRange: LineRange, nodeRange: any) {
        return executorRange.startLine.line === nodeRange.startLine &&
            executorRange.startLine.offset >= nodeRange.startColumn &&
            executorRange.endLine.line <= nodeRange.endLine
    }
}
