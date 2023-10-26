/*
 *  Copyright (c) 2023, WSO2 LLC. (http://www.wso2.com). All Rights Reserved.
 * 
 *  This software is the property of WSO2 LLC. and its suppliers, if any.
 *  Dissemination of any information or reproduction of any material contained
 *  herein is strictly forbidden, unless permitted by WSO2 in accordance with
 *  the WSO2 Commercial License available at http://wso2.com/licenses.
 *  For specific language governing the permissions and limitations under
 *  this license, please see the license as well as any agreement you’ve
 *  entered into with WSO2 governing the purchase of this software and any
 *  associated services.
 */

import { RequestType } from "vscode-messenger-common";
import { BallerinaSTModifyResponse, DocumentIdentifier, LineRange } from "./basic-lang-server-types";

export interface GetBallerinaPackagesParams {
    documentIdentifiers: DocumentIdentifier[];
}

export interface ComponentSummary {
    functions: ComponentInfo[],
    services: ComponentInfo[],
    records: ComponentInfo[],
    objects: ComponentInfo[],
    classes: ComponentInfo[],
    types: ComponentInfo[],
    constants: ComponentInfo[],
    enums: ComponentInfo[],
    listeners: ComponentInfo[],
    moduleVariables: ComponentInfo[],
}

export interface ModuleSummary extends ComponentSummary {
    name: string
}

export interface ComponentInfo {
    name: string,
    filePath: string,
    startLine: number,
    startColumn: number,
    endLine: number,
    endColumn: number,
}

export interface BallerinaProjectComponents {
    packages?: PackageSummary[];
}

export interface PackageSummary {
    name: string,
    filePath: string,
    modules: ModuleSummary[]
}

export interface BallerinaFunctionSTRequest {
    lineRange: Range;
    documentIdentifier: DocumentIdentifier;
}

export interface GetBallerinaProjectParams {
    documentIdentifier: DocumentIdentifier;
}

export interface ExecutorPositionsResponse {
    executorPositions?: ExecutorPosition[];
}
export interface ExecutorPosition {
    kind: string;
    range: LineRange;
    name: string;
}

export interface ProjectOverviewAPI {
    getBallerinaProjectComponents: (
        params: GetBallerinaPackagesParams
    ) => Promise<BallerinaProjectComponents>;
    getSTForFunction: (
        params: BallerinaFunctionSTRequest
    ) => Thenable<BallerinaSTModifyResponse>;
    getExecutorPositions: (
        params: GetBallerinaProjectParams
    ) => Thenable<ExecutorPositionsResponse>;
}

const projectOverview = "projec-overview/"

export const getBallerinaProjectComponents: RequestType<GetBallerinaPackagesParams, BallerinaProjectComponents> = { method: `${projectOverview}getBallerinaProjectComponents` };
export const getSTForFunction: RequestType<BallerinaFunctionSTRequest, BallerinaSTModifyResponse> = { method: `${projectOverview}getSTForFunction` };
export const getExecutorPositions: RequestType<GetBallerinaProjectParams, ExecutorPositionsResponse> = { method: `${projectOverview}getExecutorPositions` };

