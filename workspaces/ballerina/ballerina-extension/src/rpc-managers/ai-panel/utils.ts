/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FunctionDefinition, ModulePart, RequiredParam, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { AI_EVENT_TYPE, ErrorCode, FormField } from "@wso2-enterprise/ballerina-core";
import { QuickPickItem, QuickPickOptions, window, workspace } from 'vscode';

import { StateMachine } from "../../stateMachine";
import {
    ENDPOINT_REMOVED,
    INVALID_PARAMETER_TYPE,
    INVALID_PARAMETER_TYPE_MULTIPLE_ARRAY,
    PARSING_ERROR,
    TIMEOUT,
    UNAUTHORIZED,
    UNKNOWN_ERROR,
    USER_ABORTED
} from "../../views/ai-panel/errorCodes";
import { hasStopped } from "./rpc-manager";
import { StateMachineAI } from "../../views/ai-panel/aiMachine";
import { extension } from "../../BalExtensionContext";
import axios from "axios";

export const BACKEND_API_URL = "https://dev-tools.wso2.com/ballerina-copilot/v1.0";
export const BACKEND_API_URL_V2 = "https://dev-tools.wso2.com/ballerina-copilot/v2.0";
const REQUEST_TIMEOUT = 40000;

let abortController = new AbortController();
let nestedKeyArray: string[] = [];

export interface ParameterMetadata {
    inputs: object;
    output: object;
    inputMetadata: object;
    outputMetadata: object;
}

export interface RecordDefinitonObject {
    recordFields: object;
    recordFieldsMetadata: object;
}

export async function getAccessToken(): Promise<string> {
    let token:string = await extension.context.secrets.get("BallerinaAIUser");
    if (token) {
        return token;
    }
    return Promise.reject(new Error("Access token not found"));
}

export async function isLoggedin(): Promise<boolean> {
    try {
        await getAccessToken();
        return true;
    } catch (error) {
        return false;
    }
}

export async function handleLogin() : Promise<void> {
    const quickPicks: QuickPickItem[] = [];
    quickPicks.push({ label: "Ballerina: Copilot Login", description: "Register/Login to Ballerina Copilot"});

    const options: QuickPickOptions = { canPickMany: false, title: "You need to login to access Ballerina Copilot features. Please login and retry." };
    const selected = await window.showQuickPick(quickPicks, options);
    if (selected) {
        StateMachineAI.service().send(AI_EVENT_TYPE.LOGIN);
    }
}

export function handleStop() {
    abortController.abort();
}

export async function getParamDefinitions(
    fnSt: FunctionDefinition,
    fileUri: string
): Promise<ParameterMetadata | ErrorCode> {

    let inputs: { [key: string]: any } = {};
    let inputMetadata: { [key: string]: any } = {};
    let output: { [key: string]: any } = {};
    let outputMetadata: { [key: string]: any } = {};
    let hasArrayParams = false;

    for (const parameter of fnSt.functionSignature.parameters) {
        if (!STKindChecker.isRequiredParam(parameter)) {
            continue;
        }

        const param = parameter as RequiredParam;
        let paramName = param.paramName.value;
        let paramType = "";

        if (fnSt.functionSignature.returnTypeDesc.type.kind === "ArrayTypeDesc") {
            paramName = `${paramName}Item`; 
        }

        if (param.typeData.typeSymbol.typeKind === "array") {
            paramType = param.typeName.source;
        } else {
            paramType = param.typeData.typeSymbol.name;
        }

        const parameterDefinition = await StateMachine.langClient().getTypeFromSymbol({
            documentIdentifier: {
                uri: fileUri
            },
            positions: [{ "line": parameter.position.startLine, "offset": parameter.position.startColumn }]
        });

        if ('types' in parameterDefinition && parameterDefinition.types.length > 1) {
            return INVALID_PARAMETER_TYPE;
        }

        const fieldTypes = 'types' in parameterDefinition && parameterDefinition.types[0].type.fields;
        const inputDefinition = navigateTypeInfo(fieldTypes, false);
        inputs = { ...inputs, [paramName]: (inputDefinition as RecordDefinitonObject).recordFields };
        inputMetadata = { ...inputMetadata, [paramName]: { "isArrayType": parameter.typeName.kind === "ArrayTypeDesc"? true : false ,"parameterName": paramName, "parameterType": paramType, "type": parameter.typeName.kind === "ArrayTypeDesc" ? "record[]" : "record", "fields": (inputDefinition as RecordDefinitonObject).recordFieldsMetadata } };
            
        if (parameter.typeName.kind === "ArrayTypeDesc") {
            hasArrayParams = true;
        }
    }

    if (STKindChecker.isArrayTypeDesc(fnSt.functionSignature.returnTypeDesc.type)) {
        if (fnSt.functionSignature.parameters.length > 1) {
            return INVALID_PARAMETER_TYPE_MULTIPLE_ARRAY;
        }
        if (!hasArrayParams) {
            return INVALID_PARAMETER_TYPE_MULTIPLE_ARRAY;
        }
        if (!STKindChecker.isSimpleNameReference(fnSt.functionSignature.returnTypeDesc.type.memberTypeDesc)) {
            return INVALID_PARAMETER_TYPE;
        }
    } else if (!STKindChecker.isSimpleNameReference(fnSt.functionSignature.returnTypeDesc.type)) {
        return INVALID_PARAMETER_TYPE;
    } 

    const outputTypeDefinition = await StateMachine.langClient().getTypeFromSymbol({
        documentIdentifier: {
            uri: fileUri
        },
        positions: [{
            "line": fnSt.functionSignature.returnTypeDesc.type.position.startLine,
            "offset": fnSt.functionSignature.returnTypeDesc.type.position.startColumn
        }]
    });

    const outputDefinition = navigateTypeInfo('types' in outputTypeDefinition && outputTypeDefinition.types[0].type.fields, false);

    if (isErrorCode(outputDefinition)) {
        return outputDefinition as ErrorCode;
    }

    output = { ...(outputDefinition as RecordDefinitonObject).recordFields };
    outputMetadata = { ...(outputDefinition as RecordDefinitonObject).recordFieldsMetadata };

    const response = {
        inputs,
        output,
        inputMetadata,
        outputMetadata
    };

    return response;
}

export async function generateBallerinaCode(response: object, parameterDefinitions: ParameterMetadata, nestedKey: string = ""): Promise<object> {
    let recordFields: { [key: string]: any } = {};

    if (response.hasOwnProperty("code") && response.hasOwnProperty("message")) {
        return response as ErrorCode;
    }

    if (response.hasOwnProperty("operation") && response.hasOwnProperty("parameters") && response.hasOwnProperty("targetType")) {
        let path = getMappingString(response, parameterDefinitions);
        let parameters: string[] = response["parameters"];
        let paths = parameters[0].split(".");
        let recordFieldName: string = nestedKey || paths[1];

        return { [recordFieldName]: path };
    } else {
        let objectKeys = Object.keys(response);
        for (let index = 0; index < objectKeys.length; index++) {
            let key = objectKeys[index];
            let subRecord = response[key];
            
            if (!subRecord.hasOwnProperty("operation") && !subRecord.hasOwnProperty("parameters") && !subRecord.hasOwnProperty("targetType")) {
                nestedKeyArray.push(key);
                let responseRecord = await generateBallerinaCode(subRecord, parameterDefinitions, key);
                let recordFieldDetails = await handleRecordArrays(key, nestedKey, responseRecord, parameterDefinitions);
                recordFields = { ...recordFields, ...recordFieldDetails };
            } else {
                let nestedResponseRecord = await generateBallerinaCode(subRecord, parameterDefinitions, key);
                recordFields = { ...recordFields, ...nestedResponseRecord };
            }
        }

        return { ...recordFields };
    }
}

function getMappingString(mapping: object, parameterDefinitions: ParameterMetadata): string {
    let operation: string = mapping["operation"];
    let targetType: string = mapping["targetType"];
    let parameters: string[] = mapping["parameters"];
    
    let path: string = "";
    let inputType: string = "";

    if (operation === "DIRECT") {
        if (parameters.length > 1) {
            return "";
        }
        let paths = parameters[0].split(".");
        let recordObjectName: string = paths[0];
        let modifiedPaths: string[] = accessMetadata(paths, 1, parameterDefinitions["inputMetadata"][recordObjectName], false);
        
        // Retrieve inputType
        if (paths.length > 2) {
            inputType = getNestedType(paths.slice(1), parameterDefinitions["inputMetadata"][recordObjectName]);
        } else {
            inputType = parameterDefinitions["inputMetadata"][recordObjectName]["fields"][paths[1]]["type"];
        }

        for (let index = 0; index < modifiedPaths.length; index++) {
            if (path !== "") {
                path = `${path}.`;
            }
            path = `${path}${modifiedPaths[index]}`;
        }

        // Type conversion logic
        const stringConversions: { [key: string]: string } = {
            int: "check int:fromString",
            float: "check float:fromString",
            decimal: "check decimal:fromString",
            boolean: "check boolean:fromString"
        };

        const numericConversions: { [key: string]: { [key: string]: string } } = {
            float: {
                int: `check ${path}.ensureType()`,
                decimal: `check ${path}.ensureType()`
            },
            int: {
                float: `check ${path}.ensureType()`,
                decimal: `check ${path}.ensureType()`
            },
            decimal: {
                int: `check ${path}.ensureType()`,
                float: `check ${path}.ensureType()`
            }
        };

        if (inputType !== targetType) {
            if (inputType === "string") {
                path = stringConversions[targetType] ? `${stringConversions[targetType]}(${path})` : path;
            } else if (numericConversions[inputType] && numericConversions[inputType][targetType]) {
                path = `${numericConversions[inputType][targetType]}`;
            } else if (targetType === "string") {
                path = `${path}.toString()`;
            }
        }
    } else if (operation === "LENGTH") {
        if (parameters.length > 1) {
            return "";
        }
        let paths = parameters[0].split(".");
        let recordObjectName: string = paths[0];
        let modifiedPaths: string[] = accessMetadata(paths, 1, parameterDefinitions["inputMetadata"][recordObjectName], false);
        for (let index = 0; index < modifiedPaths.length; index++) {
            if (path !== "") {
                path = `${path}.`;
            }
            path = `${path}${modifiedPaths[index]}`;
        }
        path = `(${path}).length()`;
    }
    return path;
}

export async function refreshAccessToken(): Promise<string> {
    const CommonReqHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
        'Accept': 'application/json'
    };

    const config = workspace.getConfiguration('ballerina');
    const AUTH_ORG = config.get('authOrg') as string;
    const AUTH_CLIENT_ID = config.get('authClientID') as string;

    const refresh_token = await extension.context.secrets.get('BallerinaAIRefreshToken');
    if (!refresh_token) {
        throw new Error("Refresh token is not available.");
    } else {
        try {
            console.log("Refreshing token...");
            const params = new URLSearchParams({
                client_id: AUTH_CLIENT_ID,
                refresh_token: refresh_token,
                grant_type: 'refresh_token',
                scope: 'openid'
            });
            const response = await axios.post(`https://api.asgardeo.io/t/${AUTH_ORG}/oauth2/token`, params.toString(), { headers: CommonReqHeaders });
            const newAccessToken = response.data.access_token;
            const newRefreshToken = response.data.refresh_token;
            await extension.context.secrets.store('BallerinaAIUser', newAccessToken);
            await extension.context.secrets.store('BallerinaAIRefreshToken', newRefreshToken);
            console.log("Token refreshed successfully!");
            const token = await extension.context.secrets.get('BallerinaAIUser');
            return token;
        } catch (error: any) {
            const errMsg = "Error while refreshing token! " + error?.message;
            console.error(errMsg);
        }
    }
}

function navigateTypeInfo(typeInfos: FormField[], isNill: boolean): RecordDefinitonObject | ErrorCode {
    let recordFields: { [key: string]: any } = {};
    let recordFieldsMetadata: { [key: string]: any } = {};
    for (const field of typeInfos) {
        if (field.typeName === "record") {
            const temporaryRecord = navigateTypeInfo(field.fields, false);
            recordFields = { ...recordFields, [field.name]: (temporaryRecord as RecordDefinitonObject).recordFields };
            recordFieldsMetadata = {
                ...recordFieldsMetadata,
                [field.name]: {
                    "nullable": isNill,
                    "optional": field.optional,
                    "type": "record",
                    "typeInstance": field.name,
                    "typeName": field.typeName,
                    "fields": (temporaryRecord as RecordDefinitonObject).recordFieldsMetadata
                }
            };
        } else if (field.typeName === "union") {
            if (field.members.length > 2) {
                continue;
            }
            for (const member of field.members) {
                if (member.typeName === "()") {
                    continue;
                } else {
                    const temporaryRecord = navigateTypeInfo(("fields" in member) ? member.fields : [{ ...member, "name": field.name }], ("fields" in member) ? false : true);
                    if ("fields" in member) {
                        recordFields = { ...recordFields, [field.name]: (temporaryRecord as RecordDefinitonObject).recordFields };
                        recordFieldsMetadata = {
                            ...recordFieldsMetadata,
                            [field.name]: {
                                "nullable": true,
                                "optional": field.optional,
                                "type": "record",
                                "typeName": member.typeName,
                                "typeInstance": field.name,
                                "fields": (temporaryRecord as RecordDefinitonObject).recordFieldsMetadata
                            }
                        };
                    } else {
                        recordFields = { ...recordFields, ...(temporaryRecord as RecordDefinitonObject).recordFields };
                        recordFieldsMetadata = { ...recordFieldsMetadata, ...(temporaryRecord as RecordDefinitonObject).recordFieldsMetadata };
                    }
                }
            }
        } else if (field.typeName === "array" && field.memberType.hasOwnProperty("fields")) {
            let arrayFields = {};
            let arrayFieldsMetadata = {};
            
            const temporaryRecord = navigateTypeInfo(field.memberType.fields, false);
            arrayFields = { ...arrayFields, ...(temporaryRecord as RecordDefinitonObject).recordFields };
            arrayFieldsMetadata = { ...arrayFieldsMetadata, ...(temporaryRecord as RecordDefinitonObject).recordFieldsMetadata };
            
            recordFields = { ...recordFields, [field.name]: arrayFields };
            recordFieldsMetadata = {
                ...recordFieldsMetadata,
                [field.name]: {
                    "typeName": "record[]",
                    "type": "record[]",
                    "typeInstance": field.name,
                    "nullable": isNill,
                    "optional": field.optional,
                    "fields": arrayFieldsMetadata
                }
            };
        } else {
            let typeName = field.typeName;
            if (field.typeName === "array") {
                typeName = `${field.memberType.typeName}[]`;
            }
            recordFields = { ...recordFields, [field.name]: { "type": typeName, "comment": "" } };
            recordFieldsMetadata = {
                ...recordFieldsMetadata,
                [field.name]: {
                    "typeName": typeName,
                    "type": typeName,
                    "typeInstance": field.name,
                    "nullable": isNill,
                    "optional": field.optional
                }
            };
        }
    }
    const response = { "recordFields": recordFields, "recordFieldsMetadata": recordFieldsMetadata };
    return response;
}

export async function getDatamapperCode(parameterDefinitions): Promise<object | ErrorCode> {
    try {
        const accessToken = await getAccessToken().catch((error) => {
            console.error(error);
            return UNAUTHORIZED;
        });
        let response = await sendDatamapperRequest(parameterDefinitions, accessToken);
        if (isErrorCode(response)) {
            return (response as ErrorCode);
        }

        response = (response as Response);

        // Refresh
        if (response.status === 401) {
            const newAccessToken = await refreshAccessToken();
            let retryResponse: Response | ErrorCode = await sendDatamapperRequest(parameterDefinitions, newAccessToken);
            if (isErrorCode(retryResponse)) {
                return (retryResponse as ErrorCode);
            }

            retryResponse = (retryResponse as Response);
            let intermediateMapping = JSON.parse(await filterResponse(response) as string); 
            let finalCode =  await generateBallerinaCode(intermediateMapping, parameterDefinitions, "");
            return finalCode;
        }
        let intermediateMapping = JSON.parse(await filterResponse(response) as string); 
        let finalCode =  await generateBallerinaCode(intermediateMapping, parameterDefinitions, "");
        return finalCode;
    } catch (error) {
        console.error(error);
        return UNKNOWN_ERROR;
    }
}

export function constructRecord(codeObject: object): string {
    let recordString: string = ""; 
    let objectKeys = Object.keys(codeObject);
    for (let index = 0; index < objectKeys.length; index++) {
        let key = objectKeys[index];
        let mapping = codeObject[key];
        if (typeof codeObject[key] == "string") {
            if (recordString != "") {
                recordString += ",\n";
            }
            recordString += `${key}:${mapping}`;
        } else {
            let subRecordString = constructRecord(codeObject[key]);
            if (recordString != "") {
                recordString += ",\n";
            }
            recordString += `${key}:${subRecordString}`;
        }
    }
    return `{${recordString}}`;
}

export function getFunction(modulePart: ModulePart, functionName: string) {
    const fns = modulePart.members.filter((mem) =>
        STKindChecker.isFunctionDefinition(mem)
    ) as FunctionDefinition[];

    return fns.find(mem => mem.functionName.value === functionName);
}

export function notifyNoGeneratedMappings() {
    const msg = 'No automatic mappings detected. Try manual mapping for precise connections.';
    window.showInformationMessage(msg);
}

async function sendDatamapperRequest(parameterDefinitions, accessToken): Promise<Response | ErrorCode> {
    const response = await fetchWithTimeout(BACKEND_API_URL_V2 + "/datamapper", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'Ballerina-VSCode-Plugin',
            'Authorization': 'Bearer ' + accessToken
        },
        body: JSON.stringify(parameterDefinitions)
    }, REQUEST_TIMEOUT);

    return response;
}

async function fetchWithTimeout(url, options, timeout = 100000): Promise<Response | ErrorCode> {
    abortController = new AbortController();
    const id = setTimeout(() => abortController.abort(), timeout);
    try {
        const response = await fetch(url, { ...options, signal: abortController.signal });
        clearTimeout(id);
        return response;
    } catch (error: any) {
        if (error.name === 'AbortError' && !hasStopped) {
            return TIMEOUT;
        } else if (error.name === 'AbortError' && hasStopped) {
            return USER_ABORTED;
        } else {
            console.error(error);
            return UNKNOWN_ERROR;
        }
    }
}

export function isErrorCode(error: any): boolean {
    return error.hasOwnProperty("code") && error.hasOwnProperty("message");
}

function accessMetadata(paths: string[], index: number, parameterDefinitions: ParameterMetadata, isContinued: boolean): string[] {
    if (index == paths.length) {
        return paths;
    } else {
        let modifiedInputs: object = parameterDefinitions;
        if (parameterDefinitions["type"] == "typeReference" || parameterDefinitions["type"] == "record" || parameterDefinitions["type"] == "record[]") {
            modifiedInputs = parameterDefinitions["fields"];
        }
        let pathIndex: string = paths[index];
        let tempObject = modifiedInputs[pathIndex];
        if (!tempObject) {
            throw new Error(`Field ${pathIndex} not found in metadata.`);
        }
        let isNullable: boolean = tempObject["nullable"];
        let isOptional: boolean = tempObject["optional"];

        if (index == paths.length - 1) {
            if (!isNullable && !isOptional && isContinued) {
                let dataType: string = tempObject["typeName"];
                if (!dataType) {
                    throw new Error(`Type name for field ${pathIndex} is not specified.`);
                }
                let defaultValue = getDefaultValue(dataType);
                paths[index] = `${paths[index]}?:${defaultValue}`;
            }
        } else if (isNullable || isOptional) {
            if (index == 0) {
                throw new Error(`Nullable or optional field ${pathIndex} at the root level is not supported.`);
            }
            paths[index] = `${paths[index]}?`;
            isContinued = true;
        }
        return accessMetadata(paths, index + 1, tempObject, isContinued);
    }
}

function getDefaultValue(dataType: string): string {
    switch (dataType) {
        case "string":
            return "\"\"";
        case "int":
            return "0";
        case "decimal":
            return "0d";
        case "float":
            return "0f";
        case "boolean":
            return "false";
        case "int[]":
        case "string[]":
        case "float[]":
        case "decimal[]":
            return "[]";
        default:
            // change the following to a appropriate value
            return "void";
    }
}

function getNestedType(paths: string[], metadata: object): string {
    let currentMetadata = metadata;
    for (let i = 0; i < paths.length; i++) {
        if (currentMetadata["fields"] && currentMetadata["fields"][paths[i]]) {
            currentMetadata = currentMetadata["fields"][paths[i]];
        } else {
            throw new Error(`Field ${paths[i]} not found in metadata.`);
        }
    }
    return currentMetadata["type"];
}

function resolveOutputMetadataType(parameterDefinitions: ParameterMetadata, nestedKeyArray: string[], key: string): string {
    let metadata = parameterDefinitions["outputMetadata"];
    let type:string = "";

    for (let nk of nestedKeyArray) {
        if (metadata[nk] && metadata[nk]["fields"]) {
            if (nk === key){
                type = metadata[nk]["type"];
                return type;
            }
            metadata = metadata[nk]["fields"];
        } else {
            return "";
        }
    }
}

async function handleRecordArrays(key: string, nestedKey:string, responseRecord: object, parameterDefinitions: ParameterMetadata) {
    let recordFields: { [key: string]: any } = {};
    let subObjectKeys = Object.keys(responseRecord);

    let formattedRecordsArray: string[] = [];
    let itemKey: string = "";
    let combinedKey: string = "";

    for (let subObjectKey of subObjectKeys) {
        let { parentKey, itemKey: currentItemKey, combinedKey: currentCombinedKey } = extractKeys(responseRecord[subObjectKey]);
        let isDeeplyNested = checkDeeplyNestedRecordArray(parentKey, parameterDefinitions, "inputMetadata");
        let outputMetadataType: string;
        if (!nestedKey) {
            outputMetadataType = parameterDefinitions["outputMetadata"][key]["type"];
        } else {
            outputMetadataType = resolveOutputMetadataType(parameterDefinitions, nestedKeyArray, key);
        }

        if (outputMetadataType === "record[]") {
            if(isDeeplyNested){
                let subArrayRecord = responseRecord[subObjectKey];
                formattedRecordsArray.push(`${subObjectKey}: ${subArrayRecord.replace(new RegExp(`${currentCombinedKey}\.`, 'g'), `${currentItemKey}Item.`)}`);

                itemKey = currentItemKey;
                combinedKey = currentCombinedKey;
            } else {
                formattedRecordsArray.push(`${subObjectKey}: ${responseRecord[subObjectKey].replace(new RegExp(`${combinedKey}\.`, 'g'), `${itemKey}Item.`)}`);
            }
        } else {
            recordFields = { ...recordFields, [key]: responseRecord};
        }
    }

    if (formattedRecordsArray.length > 0 && itemKey && combinedKey) {
        let formattedRecords = formattedRecordsArray.join(",\n");
        recordFields[key] = `from var ${itemKey}Item in ${combinedKey}\n select {\n ${formattedRecords}\n}`;
    }

    return { ...recordFields };
}

async function filterResponse(resp: Response): Promise<string | ErrorCode> {
    if (resp.status == 200 || resp.status == 201) {
        const data = (await resp.json()) as any;
        return JSON.stringify(data.mappings);
    }
    if (resp.status == 404) {
        return ENDPOINT_REMOVED;
    }
    if (resp.status == 400) {
        const data = (await resp.json()) as any;
        console.log(data);
        return PARSING_ERROR;
    }
    else {
        //TODO: Handle more error codes
        return { code: 4, message: `An unknown error occured. ${resp.statusText}.` };
    }
}

function extractKeys(key: string): { parentKey: string[], itemKey:string, combinedKey: string } {
    let innerKey: string;

    // Check if the key matches the 'from var...select' structure
    if (key.includes('from var') && key.includes('select')) {
        const match = key.match(/from\s+var\s+\w+\s+in\s+([\w.]+)\s+/);
        innerKey = match ? match[1] : key;
    } else {
        // Handle simpler key format with 'check' and 'fromString' or 'ensureType'
        innerKey = key.match(/\(([^)]+)\)/)?.[1] || key;

        innerKey = innerKey
            .replace(/^check\s*/, '')
            .replace(/\.ensureType\(\)$/, '')
            .replace(/\.toString\(\)$/, '');
    }

    let keys = innerKey.split(".");
    let itemKey = keys[keys.length - 1];

    let parentKey = keys.slice(0, keys.length);
    let combinedKey = parentKey.join(".");
    return { parentKey, itemKey, combinedKey };
}

function checkDeeplyNestedRecordArray(parentKey: string[], parameterDefinitions: ParameterMetadata, metadataType: string): boolean {
    let currentMetadata = parameterDefinitions[metadataType];

    for (let i = 0; i < parentKey.length; i++) {
        if (currentMetadata[parentKey[i]]["type"] === "record[]") {
            if (i === parentKey.length - 1) {
                return true;
            } else {
                currentMetadata = currentMetadata[parentKey[i]]["fields"];
            }
        } else {
            if (i === parentKey.length - 1) {
                return false;
            } else {
                currentMetadata = currentMetadata[parentKey[i]]["fields"];
                continue;
            }
        }
    }
    return false;
}
