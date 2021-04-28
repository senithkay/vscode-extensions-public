'use strict';
/**
 * Copyright (c) 2018, WSO2 Inc. (http://www.wso2.org) All Rights Reserved.
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

import { LanguageClient } from "vscode-languageclient";
import { Uri } from "vscode";

export const BALLERINA_LANG_ID = "ballerina";

export interface BallerinaSyntaxTree {
    kind: string;
    topLevelNodes: any[];
}

export interface BallerinaSyntaxTreeResponse {
    syntaxTree?: BallerinaSyntaxTree;
}

export interface GetSyntaxTreeRequest {
    documentIdentifier: DocumentIdentifier;
}

export interface BallerinaExample {
    title: string;
    url: string;
}

export interface BallerinaExampleCategory {
    title: string;
    column: number;
    samples: Array<BallerinaExample>;
}

export interface BallerinaExampleListRequest {
    filter?: string;
}

export interface BallerinaExampleListResponse {
    samples: Array<BallerinaExampleCategory>;
}

export interface BallerinaProject {
    kind?: string;
    path?: string;
    version?: string;
    author?: string;
    packageName?: string;
}

export interface BallerinaProjectComponents {
    packages?: any[];
}

export interface GetBallerinaProjectParams {
    documentIdentifier: DocumentIdentifier;
}

export interface SyntaxTreeNodeRequestParams {
    documentIdentifier: DocumentIdentifier;
    range: RangeObject;
}

export interface SyntaxTreeNodeResponse {
    kind: string;
}

export interface GetBallerinaPackagesParams {
    documentIdentifiers: DocumentIdentifier[];
}

export interface DocumentIdentifier {
    uri: string;
}

export interface Range {
    startLine: Position;
    endLine: Position;
}

export interface Position {
    line: number;
    offset: number;
}

export interface RangeObject {
    start: PositionObject;
    end: PositionObject;
}

export interface PositionObject {
    line: number;
    character: number;
}

export interface BallerinaServiceListRequest {
    documentIdentifier: DocumentIdentifier;
}

export interface BallerinaServiceListResponse {
    services: string[];
}

export interface BallerinaSynResponse {
    syn?: String;
}

export interface GetSynRequest {
    Params: string;
}

export interface ExecutorPositionsResponse {
    executorPositions?: ExecutorPosition[];
}

export interface ExecutorPosition {
    kind: string;
    range: Range;
    name: string;
}

export class ExtendedLangClient extends LanguageClient {
    getSyntaxTree(uri: Uri): Thenable<BallerinaSyntaxTreeResponse> {
        const req: GetSyntaxTreeRequest = {
            documentIdentifier: {
                uri: uri.toString()
            }
        };
        return this.sendRequest("ballerinaDocument/syntaxTree", req);
    }

    fetchExamples(args: BallerinaExampleListRequest = {}): Thenable<BallerinaExampleListResponse> {
        return this.sendRequest("ballerinaExample/list", args);
    }

    getBallerinaProject(params: GetBallerinaProjectParams): Thenable<BallerinaProject> {
        return this.sendRequest("ballerinaPackage/metadata", params);
    }

    getBallerinaProjectComponents(params: GetBallerinaPackagesParams): Thenable<BallerinaProjectComponents> {
        return this.sendRequest("ballerinaPackage/components", params);
    }

    getSyntaxTreeNode(params: SyntaxTreeNodeRequestParams): Thenable<SyntaxTreeNodeResponse> {
        return this.sendRequest("ballerinaDocument/syntaxTreeNode", params);
    }

    getExecutorPositions(params: GetBallerinaProjectParams): Thenable<ExecutorPositionsResponse> {
        return this.sendRequest("ballerinaDocument/executorPositions", params);
    }
}
