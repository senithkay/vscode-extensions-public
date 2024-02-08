/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { DIAGNOSTIC_SEVERITY } from "../../interfaces/ballerina";


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
