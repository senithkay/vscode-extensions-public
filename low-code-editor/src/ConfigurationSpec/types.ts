/*
 * Copyright (c) 2020, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 Inc. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein is strictly forbidden, unless permitted by WSO2 in accordance with
 * the WSO2 Commercial License available at http://wso2.com/licenses.
 * For specific language governing the permissions and limitations under
 * this license, please see the license as well as any agreement you’ve
 * entered into with WSO2 governing the purchase of this software and any
 * associated services.
 */

import { DraftUpdateStatement } from "../Diagram/view-state/draft";


// tslint:disable-next-line: max-classes-per-file
export type balTypes = "string" | "record" | "union" | "int" | "float" | "boolean" | "collection" | "json" | "xml" | "nil" | "http:Request" | "var" | "error" | undefined;

export interface FormField {
    type: balTypes;
    name?: string;
    displayName?: string;
    collectionDataType?: balTypes;
    selectedDataType?: string;
    typeName?: string;
    description?: string;
    defaultValue?: any;
    value?: any;
    optional?: boolean;
    fields?: FormField[];
    references?: FormField[];
    isReturn?: boolean;
    isParam?: boolean;
    isUnion?: boolean;
    isArray?: boolean;
    isTypeDef?: boolean;
    isReference?: boolean;
    typeInfo?: any;
    hide?: boolean;
    aiSuggestion?: string;
    noCodeGen?: boolean;
    requestName?: string; // only for http form used when there's a request object in the request
}

// tslint:disable-next-line: max-classes-per-file
export class ResponsePayloadMap {
    payloadTypes: Map<string, string> = new Map();
    isPayloadSelected: boolean = false;
    selectedPayloadType?: string;
    payloadVariableName?: string;
}


// tslint:disable-next-line: max-classes-per-file
export class ActionConfig {
    public name: string = "";
    public returnVariableName?: string = "";
    public fields: FormField[] = [];
}

// tslint:disable-next-line: max-classes-per-file
export class ConnectorConfig {
    public name?: string = "";
    public connectorInit: FormField[] = [];
    public action: ActionConfig;
    public existingConnections?: any;
    public isExistingConnection?: boolean;
    public subExitingConnection?: string;
    public isNewConnector?: boolean;
    public responsePayloadMap?: ResponsePayloadMap;
    public initPosition?: DraftUpdateStatement;
}

export interface ConfigurationSpec {
    type: string;
    name: string;
    icon?: symbol;
    description?: string;
    size?: "small" | "medium";
}

export enum WizardType {
    NEW,
    EXISTING
}

export function getType(type: string): balTypes {
    let typeString: balTypes;
    switch (type) {
        case "var":
            typeString = "var";
            break;
        case "string":
            typeString = "string";
            break;
        case "int":
            typeString = "int";
            break;
        case "float":
            typeString = "float";
            break;
        case "record":
            typeString = "record";
            break;
        case "|":
            typeString = "union";
            break;
        case "boolean":
            typeString = "boolean";
            break;
        case "[]":
            typeString = "collection";
            break;
        case "json":
            typeString = "json";
            break;
        case "xml":
            typeString = "xml";
            break;
        case "nil":
            typeString = "nil";
            break;
        default:
            typeString = undefined;
            break;
    }
    return typeString;
}
