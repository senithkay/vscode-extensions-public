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

/* eslint-disable @typescript-eslint/no-empty-interface */

import { RequestType } from "vscode-messenger-common";

export interface BallerinaConstructRequest {
    query: string;
    packageName?: string;
    organization?: string;
    connector?: string;
    description?: string;
    template?: string;
    keyword?: string;
    ballerinaVersion?: string;
    platform?: boolean;
    userPackages?: boolean;
    limit?: number;
    offset?: number;
    sort?: string;
    targetFile?: string;
}

export interface Package {
    organization: string;
    name: string;
    version: string;
    platform?: string;
    languageSpecificationVersion?: string;
    URL?: string;
    balaURL?: string;
    balaVersion?: string;
    digest?: string;
    summary?: string;
    readme?: string;
    template?: boolean;
    licenses?: any[];
    authors?: any[];
    sourceCodeLocation?: string;
    keywords?: any[];
    ballerinaVersion?: string;
    icon?: string;
    pullCount?: number;
    createdDate?: number;
    visibility?: string;
    modules?: any[];
}

export interface BallerinaConstruct {
    id?: string;
    name: string;
    displayName?: string;
    moduleName?: string;
    package: Package;
    displayAnnotation?: any;
    icon?: string;
}

export interface BallerinaModuleResponse {
    central: BallerinaConstruct[];
    local?: BallerinaConstruct[];
    error?: string;
}

export interface BallerinaTriggerRequest {
    id: string
}

export interface BallerinaTriggerInfo extends Trigger {
    serviceTypes: ServiceType[],
    listenerParams: Parameter[],
    documentation?: string,
}

export interface ServiceType {
    name: string;
    description?: string;
    functions?: RemoteFunction[];
}

export interface TypeInfo {
    name?: string;
    orgName?: string;
    moduleName?: string;
    version?: string;
}

export interface DisplayAnnotation {
    label?: string;
}

export interface ReturnType {
    name?: string;
    typeName?: string;
    optional?: boolean;
    defaultable?: boolean;
    displayAnnotation?: DisplayAnnotation;
}

export interface RemoteFunction {
    isRemote?: boolean;
    documentation?: string;
    name: string;
    parameters?: Parameter[];
    returnType?: ReturnType;
}

export interface MemberField {
    typeName?: string;
    optional?: boolean;
    defaultable?: boolean;
}

export interface Field {
    name?: string;
    typeName?: string;
    optional?: boolean;
    defaultable?: boolean;
    fields?: ReturnType[];
    hasRestType?: boolean;
    restType?: ReturnType;
    members?: MemberField[];
    defaultType?: string;
}

export interface Parameter {
    name: string;
    typeName: string;
    optional?: boolean;
    typeInfo?: TypeInfo;
    displayAnnotation?: DisplayAnnotation;
    fields?: Field[];
    hasRestType?: boolean;
    restType?: ReturnType;
    defaultable?: boolean;
}

export interface BallerinaTriggerResponse extends BallerinaTriggerInfo {
    error?: string;
}

export interface Trigger extends BallerinaConstruct { }

export interface BallerinaTriggersRequest extends BallerinaConstructRequest { }

export interface BallerinaTriggersResponse extends BallerinaModuleResponse {
    central: Trigger[];
    error?: string;
}

export interface TriggerWizardAPI {
    getTriggers: (
        params: BallerinaTriggersRequest
    ) => Thenable<BallerinaTriggersResponse>;
    getTrigger: (
        params: BallerinaTriggerRequest
    ) => Thenable<BallerinaTriggerResponse>;
}

const triggerWizard = "triggerWizard/"

export const getTriggers: RequestType<BallerinaTriggersRequest, BallerinaTriggersResponse> = { method: `${triggerWizard}getTriggers` };
export const getTrigger: RequestType<BallerinaTriggerResponse, BallerinaTriggerResponse> = { method: `${triggerWizard}getTrigger` };
