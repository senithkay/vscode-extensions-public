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

export interface DocumentIdentifier {
    uri: string;
}

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

export interface ProjectOverviewAPI {
    getBallerinaProjectComponents: (
        params: GetBallerinaPackagesParams
    ) => Promise<BallerinaProjectComponents>;
}

const projectOverview = "projec-overview/"

export const getBallerinaProjectComponents: RequestType<GetBallerinaPackagesParams, BallerinaProjectComponents> = { method: `${projectOverview}getBallerinaProjectComponents` };