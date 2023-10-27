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

export interface JsonToRecordRequest {
    jsonString: string;
    recordName: string;
    isRecordTypeDesc: boolean;
    isClosed: boolean;
}

export interface JsonToRecordResponse {
    codeBlock: string;
    diagnostics?: JsonToRecordMapperDiagnostic[];
}

export enum DIAGNOSTIC_SEVERITY {
    INTERNAL = "INTERNAL",
    HINT = "HINT",
    INFO = "INFO",
    WARNING = "WARNING",
    ERROR = "ERROR"
}

export interface JsonToRecordMapperDiagnostic {
    message: string;
    severity?: DIAGNOSTIC_SEVERITY;
}

export interface XMLToRecordRequest {
    xmlValue: string;
    isRecordTypeDesc?: boolean;
    isClosed?: boolean;
    forceFormatRecordFields?: boolean;
}

export interface XMLToRecordResponse {
    codeBlock: string;
    diagnostics?: XMLToRecordConverterDiagnostic[];
}

export interface XMLToRecordConverterDiagnostic {
    message: string;
    severity?: DIAGNOSTIC_SEVERITY;
}

export interface ConverterAPI {
    convert: (
        params: JsonToRecordRequest
    ) => Thenable<JsonToRecordResponse>;
    convertXml: (
        params: XMLToRecordRequest
    ) => Thenable<XMLToRecordResponse>;
}

const converterAPI = "converter/"

export const convert: RequestType<JsonToRecordRequest, JsonToRecordResponse> = { method: `${converterAPI}convert` };
export const convertXml: RequestType<XMLToRecordRequest, XMLToRecordResponse> = { method: `${converterAPI}convertXml` };
