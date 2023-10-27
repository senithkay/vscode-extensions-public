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

import { NodePosition } from "@wso2-enterprise/syntax-tree";
import { BallerinaConstruct, BallerinaConstructRequest, BallerinaModuleResponse } from "./trigger-wizard-types";

export interface BallerinaConnectorsRequest extends BallerinaConstructRequest { }
export interface Connector extends BallerinaConstruct { }


export interface BallerinaConnectorsResponse extends BallerinaModuleResponse {
    central: Connector[];
    local?: Connector[];
    error?: string;
}

export interface BallerinaConnectorRequest {
    id?: string
    orgName?: string
    packageName?: string
    moduleName?: string
    version?: string
    name?: string
    targetFile?: string
}

export interface NonPrimitiveBal {
    orgName: string;
    moduleName: string;
    name: string;
    version?: string;
}

export interface DiagramDiagnostic {
    message: string,
    diagnosticInfo: {
        code: string,
        severity: string
    },
    range: NodePosition
}


export interface FormField {
    typeName: string;
    name?: string;
    displayName?: string;
    memberType?: FormField;
    inclusionType?: FormField;
    paramType?: FormField;
    selectedDataType?: string;
    description?: string;
    defaultValue?: any;
    value?: any;
    optional?: boolean;
    defaultable?: boolean;
    fields?: FormField[];
    members?: FormField[];
    references?: FormField[];
    restType?: FormField;
    constraintType?: FormField;
    rowType?: FormField;
    keys?: string[];
    isReturn?: boolean;
    isTypeDef?: boolean;
    isReference?: boolean;
    isStream?: boolean;
    isErrorUnion?: boolean;
    typeInfo?: NonPrimitiveBal;
    hide?: boolean;
    aiSuggestion?: string;
    noCodeGen?: boolean;
    requestName?: string; // only for http form used when there's a request object in the request
    tooltip?: string;
    tooltipActionLink?: string;
    tooltipActionText?: string;
    isErrorType?: boolean;
    isRestParam?: boolean; // TODO: unified rest params
    hasRestType?: boolean;
    isRestType?: boolean;
    customAutoComplete?: string[];
    validationRegex?: any;
    leftTypeParam?: any;
    rightTypeParam?: any;
    initialDiagnostics?: DiagramDiagnostic[];
    documentation?: string;
    displayAnnotation?: any;
    position?: NodePosition;
    selected?: boolean;
}

import { RequestType } from "vscode-messenger-common";

export interface PathParam {
    name: string;
    typeName: string;
    isRestType: boolean;
}

export interface FunctionDefinitionInfo {
    name: string;
    documentation: string;
    parameters: FormField[];
    pathParams?: PathParam[];
    returnType?: FormField;
    qualifiers?: string[];
    isRemote?: boolean; // TODO: remove this
    displayAnnotation?: any;
}

export interface BallerinaConnectorInfo extends Connector {
    functions: FunctionDefinitionInfo[];
    documentation?: string;
}

export interface BallerinaConnectorResponse extends BallerinaConnectorInfo {
    error?: string;
}

export interface ConnectorWizardAPI {
    getConnector: (
        params: BallerinaConnectorRequest
    ) => Thenable<BallerinaConnectorResponse>;
    getConnectors: (
        params: BallerinaConnectorsRequest
    ) => Thenable<BallerinaConnectorsResponse>;
}

const connectorWizard = "connectorWizard/"

export const getConnector: RequestType<BallerinaConnectorRequest, BallerinaConnectorResponse> = { method: `${connectorWizard}getConnector` };
export const getConnectors: RequestType<BallerinaConnectorsRequest, BallerinaConnectorsResponse> = { method: `${connectorWizard}getConnectors` };

