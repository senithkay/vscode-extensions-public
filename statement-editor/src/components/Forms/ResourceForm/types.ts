/*
 * Copyright (c) 2022, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import { DiagramDiagnostic } from "@wso2-enterprise/ballerina-low-code-edtior-commons";

export interface PathSegment {
    id: number;
    isParam: boolean;
    type?: string;
    name: string;
    isLastSlash?: boolean;
}

export interface Path {
    segments: PathSegment[];
}

export interface QueryParam {
    id: number;
    type: string;
    name: string;
}

export interface ReturnType {
    id: number;
    type: string;
    isOptional: boolean
}

export const ReturnTypesMap: Map<string, string> = new Map([
    ["string", `""`],
    ["int", "1"],
    ["boolean", "false"],
    ["error", "()"],
]);

export interface ReturnTypeCollection {
    types: ReturnType[];
    defaultReturnValue?: string;
}

export interface QueryParamCollection {
    queryParams: QueryParam[];
}

export interface Resource {
    id: number;
    method: string;
    path: string;
    queryParams?: string;
    payload?: string;
    payloadError?: boolean;
    isCaller?: boolean;
    isRequest?: boolean;
    returnType?: string;
    isPathDuplicated?: boolean;
    returnTypeDefaultValue?: string;
    initialPathDiagnostics?: DiagramDiagnostic[];
}

export interface Payload {
    type: string;
    name: string;
}

export interface Advanced {
    isCaller?: boolean;
    isRequest?: boolean;
}

export interface AdvancedResourceState {
    path: Map<number, boolean>;
    payloadSelected: Map<number, boolean>;
}
