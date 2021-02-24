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

// Some of these are types are not primitive types, and will need to be refactored
export enum PrimitiveBalType {
    String = "string",
    Record = "record",
    Union = "union",
    Int = "int",
    Float = "float",
    Boolean = "boolean",
    Collection = "collection",
    Json = "json",
    Xml = "xml",
    Nil = "nil",
    Var = "var",
    Error = "error",
    HttpReq = "http:Request",
}

export interface NonPrimitiveBal {
    orgName: string;
    moduleName: string;
    typeName: string;
}

export const httpResponse: NonPrimitiveBal = {
    orgName: 'ballerina',
    moduleName: 'http',
    typeName: 'Response',
}

export const NonPrimitiveBalType = {
    httpResponse,
}

// tslint:disable-next-line: max-classes-per-file
export type balTypes = "string" | "record" | "union" | "int" | "float" | "boolean" | "collection" | "json" | "xml" | "nil" | "http:Request" | "var" | "error" | undefined;

export type BallerinaType = PrimitiveBalType | NonPrimitiveBal;

export type ExpressionEditorType = BallerinaType | BallerinaType[];

export interface FormField {
    type: ExpressionEditorType | any;
    name?: string;
    displayName?: string;
    collectionDataType?: PrimitiveBalType;
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
    tooltip?: string;
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

export function getType(type: string): PrimitiveBalType {
    let typeString: PrimitiveBalType;
    switch (type) {
        case "var":
            typeString = PrimitiveBalType.Var;
            break;
        case "string":
            typeString = PrimitiveBalType.String;
            break;
        case "int":
            typeString = PrimitiveBalType.Int;
            break;
        case "float":
            typeString = PrimitiveBalType.Float;
            break;
        case "record":
            typeString = PrimitiveBalType.Record;
            break;
        case "|":
            typeString = PrimitiveBalType.Union;
            break;
        case "boolean":
            typeString = PrimitiveBalType.Boolean;
            break;
        case "[]":
            typeString = PrimitiveBalType.Collection;
            break;
        case "json":
            typeString = PrimitiveBalType.Json;
            break;
        case "xml":
            typeString = PrimitiveBalType.Xml;
            break;
        case "nil":
            typeString = PrimitiveBalType.Nil;
            break;
        default:
            typeString = undefined;
            break;
    }
    return typeString;
}
