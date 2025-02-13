/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { FunctionDefinition, ModulePart, QualifiedNameReference, RequiredParam, STKindChecker } from "@wso2-enterprise/syntax-tree";
import { AI_EVENT_TYPE, ErrorCode, FormField, STModification, SyntaxTree, AttachmentResult } from "@wso2-enterprise/ballerina-core";
import { QuickPickItem, QuickPickOptions, window, workspace } from 'vscode';

import { StateMachine } from "../../stateMachine";
import {
    ENDPOINT_REMOVED,
    INVALID_PARAMETER_TYPE,
    INVALID_PARAMETER_TYPE_MULTIPLE_ARRAY,
    INVALID_TYPE_CONVERSION,
    MODIFIYING_ERROR,
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
import { getPluginConfig } from "../../../src/utils";

export const BACKEND_API_URL_V2 = getPluginConfig().get('rootUrl') as string;
export const CONTEXT_UPLOAD_URL_V1 = getPluginConfig().get('contextUploadServiceUrl') as string;
const REQUEST_TIMEOUT = 40000;

let abortController = new AbortController();
let nestedKeyArray: string[] = [];

export interface ParameterMetadata {
    inputs: object;
    output: object;
    inputMetadata: object;
    outputMetadata: object;
    mapping_fields?: object;
}

export interface RecordDefinitonObject {
    recordFields: object;
    recordFieldsMetadata: object;
}
export interface MappingFileRecord {
    mapping_fields: object;
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
    quickPicks.push({ label: "WSO2: Copilot Login", description: "Register/Login to WSO2 Copilot"});

    const options: QuickPickOptions = { canPickMany: false, title: "You need to login to access WSO2 Copilot features. Please login and retry." };
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
    let arrayParams = 0;

    for (const parameter of fnSt.functionSignature.parameters) {
        if (!STKindChecker.isRequiredParam(parameter)) {
            continue;
        }

        const param = parameter as RequiredParam;
        let paramName = param.paramName.value;
        let paramType = "";

        if (param.typeName.kind === "ArrayTypeDesc") {
            paramName = `${paramName}Item`; 
            arrayParams++;
        }

        if (param.typeData.typeSymbol.typeKind === "array") {
            paramType = param.typeName.source;
        } else if (param.typeData.typeSymbol.typeKind === "typeReference") {
            paramType = param.typeData.typeSymbol.name;
        } else {
            paramType = param.typeName.source;
        }

        const position = param.typeName.kind === "QualifiedNameReference"
            ? {
                line: (param.typeName as QualifiedNameReference).identifier.position.startLine,
                offset: (param.typeName as QualifiedNameReference).identifier.position.startColumn
            }
            : {
                line: parameter.position.startLine,
                offset: parameter.position.startColumn
            };
        const parameterDefinition = await StateMachine.langClient().getTypeFromSymbol({
            documentIdentifier: {
                uri: fileUri
            },
            positions: [position]
        });

        if ('types' in parameterDefinition && parameterDefinition.types.length > 1) {
            return INVALID_PARAMETER_TYPE;
        }

        let inputDefinition: ErrorCode | RecordDefinitonObject;
        if ('types' in parameterDefinition && parameterDefinition.types[0].type.hasOwnProperty('fields')) {
            inputDefinition = navigateTypeInfo(parameterDefinition.types[0].type.fields, false);
        } else {
            let singleFieldType = 'types' in parameterDefinition && parameterDefinition.types[0].type;
            inputDefinition = {
                "recordFields": { [paramName]: { "type": singleFieldType.typeName, "comment": "" } },
                "recordFieldsMetadata": {
                    [paramName]: {
                        "typeName": singleFieldType.typeName,
                        "type": singleFieldType.typeName,
                        "typeInstance": paramName,
                        "nullable": false,
                        "optional": false
                    }
                }
            };
        }
        inputs = { ...inputs, [paramName]: (inputDefinition as RecordDefinitonObject).recordFields };
        inputMetadata = {
            ...inputMetadata,
            [paramName]: {
                "isArrayType": parameter.typeName.kind === "ArrayTypeDesc",
                "parameterName": paramName,
                "parameterType": paramType,
                "type": parameter.typeName.kind === "ArrayTypeDesc" ? "record[]" : "record",
                "fields": (inputDefinition as RecordDefinitonObject).recordFieldsMetadata
            }
        };
        if (parameter.typeName.kind === "ArrayTypeDesc") {
            hasArrayParams = true;
        }
    }

    if (STKindChecker.isArrayTypeDesc(fnSt.functionSignature.returnTypeDesc.type)) {
        if (arrayParams > 1) {
            return INVALID_PARAMETER_TYPE_MULTIPLE_ARRAY;
        }
        if (!hasArrayParams) {
            return INVALID_PARAMETER_TYPE_MULTIPLE_ARRAY;
        }
        if (!STKindChecker.isSimpleNameReference(fnSt.functionSignature.returnTypeDesc.type.memberTypeDesc)) {
            return INVALID_PARAMETER_TYPE;
        }
    } else if (!STKindChecker.isSimpleNameReference(fnSt.functionSignature.returnTypeDesc.type) &&
        !STKindChecker.isQualifiedNameReference(fnSt.functionSignature.returnTypeDesc.type)) {
        return INVALID_PARAMETER_TYPE;
    } 

    const returnTypePosition = STKindChecker.isQualifiedNameReference(fnSt.functionSignature.returnTypeDesc.type)
        ? {
            line: fnSt.functionSignature.returnTypeDesc.type.identifier.position.startLine,
            offset: fnSt.functionSignature.returnTypeDesc.type.identifier.position.startColumn
        }
        : {
            line: fnSt.functionSignature.returnTypeDesc.type.position.startLine,
            offset: fnSt.functionSignature.returnTypeDesc.type.position.startColumn
        };

    const outputTypeDefinition = await StateMachine.langClient().getTypeFromSymbol({
        documentIdentifier: {
            uri: fileUri
        },
        positions: [returnTypePosition]
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

export async function processMappings(
    fnSt: FunctionDefinition,
    fileUri: string,
    file?: AttachmentResult
): Promise<SyntaxTree | ErrorCode> {
    let parameterDefinitions = await getParamDefinitions(fnSt, fileUri);
        if(file){
            parameterDefinitions = await mappingFileParameterDefinitions(file, parameterDefinitions);
        }

    if (isErrorCode(parameterDefinitions)) {
        return parameterDefinitions as ErrorCode;
    }

    const codeObject = await getDatamapperCode(parameterDefinitions);
    if (isErrorCode(codeObject) || Object.keys(codeObject).length === 0) {
        return codeObject as ErrorCode;
    }

    const { recordString, isCheckError } = await constructRecord(codeObject);
    let codeString: string;
    if (fnSt.functionSignature.returnTypeDesc.type.kind === "ArrayTypeDesc") {
        const parameter = fnSt.functionSignature.parameters[0] as RequiredParam;
        const paramName = parameter.paramName.value;
        const formattedRecordString = recordString.startsWith(":") ? recordString.substring(1) : recordString;
        codeString = isCheckError ? `|error => from var ${paramName}Item in ${paramName}\n select ${formattedRecordString};` : 
                                    `=> from var ${paramName}Item in ${paramName}\n select ${formattedRecordString};`;
    } else {
        codeString = isCheckError ? `|error => ${recordString};` : `=> ${recordString};`;
    }

    const modifications: STModification[] = [];
    modifications.push({
        type: "INSERT",
        config: { STATEMENT: codeString },
        endColumn: fnSt.functionBody.position.endColumn,
        endLine: fnSt.functionBody.position.endLine,
        startColumn: fnSt.functionBody.position.startColumn,
        startLine: fnSt.functionBody.position.startLine,
    });

    const stModifyResponse = await StateMachine.langClient().stModify({
        astModifications: modifications,
        documentIdentifier: {
            uri: fileUri
        }
    });

    return stModifyResponse as SyntaxTree;
}


export async function generateBallerinaCode(response: object, parameterDefinitions: ParameterMetadata | ErrorCode, nestedKey: string = ""): Promise<object|ErrorCode> {
    let recordFields: { [key: string]: any } = {};

    if (response.hasOwnProperty("code") && response.hasOwnProperty("message")) {
        return response as ErrorCode;
    }

    if (response.hasOwnProperty("operation") && response.hasOwnProperty("parameters") && response.hasOwnProperty("targetType")) {
        let path = await getMappingString(response, parameterDefinitions, nestedKey);
        if (isErrorCode(path)) {
            return INVALID_TYPE_CONVERSION;
        }        
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
                nestedKeyArray.pop();
                recordFields = { ...recordFields, ...recordFieldDetails };
            } else {
                let nestedResponseRecord = await generateBallerinaCode(subRecord, parameterDefinitions, key);
                recordFields = { ...recordFields, ...nestedResponseRecord };
            }
        }

        return { ...recordFields };
    }
}

async function getMappingString(mapping: object, parameterDefinitions: ParameterMetadata | ErrorCode, nestedKey:string): Promise<string | ErrorCode>  {
    let operation: string = mapping["operation"];
    let targetType: string = mapping["targetType"];
    let parameters: string[] = mapping["parameters"];
    
    let path: string = "";
    let modifiedPaths: string[] = [];
    let inputType: string = "";
    let baseType: string = "";
    let baseTargetType: string = "";
    let modifiedOutput = parameterDefinitions["outputMetadata"];
    const unionEnumIntersectionTypes = ["enum", "union", "intersection", "enum[]", 
        "enum[]|()", "union[]", "union[]|()", "intersection[]", "intersection[]|()"];

    let paths = parameters[0].split(".");
    let recordObjectName: string = paths[0];

    // Retrieve inputType
    if (paths.length > 2) {
        inputType = await getNestedType(paths.slice(1), parameterDefinitions["inputMetadata"][recordObjectName]);
    } else {
        inputType = parameterDefinitions["inputMetadata"][recordObjectName]["fields"][paths[1]]["typeName"];
    }
    baseType = inputType.replace("|()", "");
    baseTargetType= targetType.replace("|()", "");

    if (operation === "DIRECT") {
        if (parameters.length > 1) {
            return "";
        }
        modifiedPaths = await accessMetadata(
            paths, 
            parameterDefinitions, 
            modifiedOutput, 
            baseType, 
            baseTargetType,
            nestedKey, 
            operation,
            unionEnumIntersectionTypes
        );
        for (let index = 0; index < modifiedPaths.length; index++) {
            if (index > 0 && modifiedPaths[index] === modifiedPaths[index - 1]) {
                continue;
            }
            if (path !== "") {
                path = `${path}.`;
            }
            path = `${path}${modifiedPaths[index]}`;
        }
        // Add split operation if inputType is "string" and targetType is "string[]"
        if (baseType === "string" && baseTargetType === "string[]") {
            return `re \`,\`.split(${path})`;
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
                int: `check (${path}).ensureType()`,
                decimal: `check (${path}).ensureType()`
            },
            int: {
                float: `check (${path}).ensureType()`,
                decimal: `check (${path}).ensureType()`
            },
            decimal: {
                int: `check (${path}).ensureType()`,
                float: `check (${path}).ensureType()`
            }
        };

        const isStringInput = ["string", "string|()"].includes(inputType);
        const isStringTarget = ["string", "string|()"].includes(targetType);
        if (inputType === targetType || inputType === baseTargetType || unionEnumIntersectionTypes.includes(inputType)) {
            path = `${path}`;
        } else if (isStringInput) {
            const conversion = stringConversions[baseTargetType];
            if (conversion) {
                path = `${conversion}(${path})`;
            } else if (!isStringTarget) {
                return INVALID_TYPE_CONVERSION;
            }
        } else if (isStringTarget) {
            path = `(${path}).toString()`;
        } else {
            const conversion = numericConversions[inputType]?.[targetType];
            if (conversion && baseTargetType !== "boolean") {
                path = conversion;
            } else if (baseType === baseTargetType) {
                path = `${path}`;
            } else if ((targetType.includes("|()") && inputType !== baseTargetType) || inputType.includes("|()") && baseTargetType !== "boolean") {
                path = `check (${path}).ensureType()`;
            } else {
                return INVALID_TYPE_CONVERSION;
            }
        }
    } else if (operation === "LENGTH") {
        if (parameters.length > 1) {
            return "";
        }
        modifiedPaths = await accessMetadata(
            paths, 
            parameterDefinitions, 
            modifiedOutput, 
            baseType, 
            baseTargetType,
            nestedKey, 
            operation
        );
        for (let index = 0; index < modifiedPaths.length; index++) {
            if (path !== "") {
                path = `${path}.`;
            }
            path = `${path}${modifiedPaths[index]}`;
        }
        path = `(${path}).length()`;
    } else if (operation === "SPLIT") {
        if (parameters.length > 2) {
            return "";
        }
        modifiedPaths = await accessMetadata(
            paths, 
            parameterDefinitions, 
            modifiedOutput, 
            baseType, 
            baseTargetType,
            nestedKey, 
            operation
        );
        for (let index = 0; index < modifiedPaths.length; index++) {
            if (path !== "") {
                path = `${path}.`;
            }
            path = `${path}${modifiedPaths[index]}`;
        }
        path = `re \`${parameters[1]}\`.split(${path})`;
    }
    return path;
}

export async function refreshAccessToken(): Promise<string> {
    const CommonReqHeaders = {
        'Content-Type': 'application/x-www-form-urlencoded; charset=utf8',
        'Accept': 'application/json'
    };

    const config = getPluginConfig();
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

function navigateTypeInfo(
    typeInfos: FormField[],
    isNill: boolean
): RecordDefinitonObject | ErrorCode {
    let recordFields: { [key: string]: any } = {};
    let recordFieldsMetadata: { [key: string]: any } = {};
    let memberFieldsMetadata: { [key: string]: any } = {};
    let memberRecordFields: { [key: string]: any } = {};
    let temporaryRecord: RecordDefinitonObject | ErrorCode;
    let isNullable = false;
    let isArray = false;
    let memberName: string;

    const handleMember = (member: any): string => {
        if (member.typeName === "record" && member.fields) {
            temporaryRecord = navigateTypeInfo(member.fields, false);
            if (member.hasOwnProperty("name") && !member.hasOwnProperty("typeName")) {
                memberName = member.name;
            } else {
                memberName = "record";
            }
            memberRecordFields = {
                ...memberRecordFields,
                ...(temporaryRecord as RecordDefinitonObject).recordFields
            };
            memberFieldsMetadata = {
                ...memberFieldsMetadata,
                ...((temporaryRecord as RecordDefinitonObject).recordFieldsMetadata)
            };
        } else if (member.typeName === "array") {
            isArray = true;
            if (member.memberType.hasOwnProperty("fields") && member.memberType.typeName === "record") {
                temporaryRecord = navigateTypeInfo(member.memberType.fields, false);
                memberName = `${member.memberType.typeName}[]`;
                memberRecordFields = {
                    ...memberRecordFields,
                    ...(temporaryRecord as RecordDefinitonObject).recordFields
                };
                memberFieldsMetadata = {
                    ...memberFieldsMetadata,
                    ...((temporaryRecord as RecordDefinitonObject).recordFieldsMetadata)
                };
            } else if (member.memberType.hasOwnProperty("members") && 
            (member.memberType.typeName === "union" || member.memberType.typeName === "intersection")) {
                temporaryRecord = navigateTypeInfo(member.memberType.members, false);
                let memberTypes: string[] = [];
                for (const innerMember of member.memberType.members) {
                    const memberTypeName = handleMember(innerMember);
                    memberTypes.push(memberTypeName);
                }
                memberName = `(${memberTypes.join("|")})[]`;
            } else if (member.memberType.hasOwnProperty("members") && member.memberType.typeName === "enum") {
                let memberTypeNames: string[] = [];
                for (const innerMember of member.memberType.members) {
                    const memberTypeName = handleMember(innerMember);
                    memberTypeNames.push(memberTypeName);
                }
                memberName = `(${memberTypeNames.join("|")})[]`;
            } else if (member.memberType.hasOwnProperty("typeInfo")) {
                if (member.memberType.hasOwnProperty("name") && !member.memberType.hasOwnProperty("typeName")) {
                    memberName = `${member.memberType.name}`;
                } else {
                    memberName = "record[]"; 
                }
            } else {
                memberName = `${member.memberType.typeName}[]`;
            }
        } else if (member.typeName === "union" || member.typeName === "intersection" || member.typeName === "enum") {
            let memberTypeNames: string[] = [];
            for (const innerMember of member.members) {
                const memberTypeName = handleMember(innerMember);
                memberTypeNames.push(memberTypeName);
            }
            memberName = `${memberTypeNames.join("|")}`;
        } else if (member.typeName === "()") {
            memberName = member.typeName;
            isNullable = true;
        } else {
            memberName = member.typeName;
            if (member.hasOwnProperty("name")) {
                memberRecordFields = {
                    ...memberRecordFields,
                    [member.name]: {
                        type: memberName,
                        comment: ""
                    }
                };
                memberFieldsMetadata = {
                    ...memberFieldsMetadata,
                    [member.name]: {
                        typeName: memberName,
                        type: memberName,
                        typeInstance: member.name,
                        nullable: isNill,
                        optional: member.optional
                    }
                };
            } else {
                // Check if typeName is not one of the primitive types
                const primitiveTypes = ["int", "string", "float", "boolean", "decimal", "readonly"];
                if (!primitiveTypes.includes(memberName)) {
                    memberFieldsMetadata = {
                        ...memberFieldsMetadata,
                        [memberName]: {
                            typeName: memberName,
                            type: memberName,
                            typeInstance: memberName,
                            nullable: isNill,
                            optional: member.optional
                        }
                    };
                }
            }
        }
        return memberName;
    };

    for (const field of typeInfos) {
        memberRecordFields = {};
        memberFieldsMetadata = {};
        isNullable = false;
        isArray = false;
        let typeName = field.typeName;
        if (typeName) {
            if (typeName === "record") {
                const temporaryRecord = navigateTypeInfo(field.fields, false);
                recordFields[field.name] = (temporaryRecord as RecordDefinitonObject).recordFields;
                recordFieldsMetadata[field.name] = {
                    nullable: isNill,
                    optional: field.optional,
                    type: "record",
                    typeInstance: field.name,
                    typeName: field.typeName,
                    fields: (temporaryRecord as RecordDefinitonObject).recordFieldsMetadata
                };
            } else if (typeName === "union" || typeName === "intersection") {
                let memberTypeNames: string[] = [];
                for (const member of field.members) {
                    const memberTypeName = handleMember(member);
                    memberTypeNames.push(memberTypeName);
                }
                const resolvedTypeName = memberTypeNames.join("|");
                recordFields[field.name] = Object.keys(memberRecordFields).length > 0 
                                            ? memberRecordFields : { type: resolvedTypeName, comment: "" };
                recordFieldsMetadata[field.name] = {
                    nullable: isNullable,
                    optional: field.optional,
                    typeName: resolvedTypeName,
                    type: isArray ? `${field.typeName}[]` : field.typeName,
                    typeInstance: field.name,
                    ...(Object.keys(memberFieldsMetadata).length > 0 && { members: memberFieldsMetadata })
                };
            } else if (typeName === "array") {
                if (field.memberType.hasOwnProperty("members") && 
                (field.memberType.typeName === "union" || field.memberType.typeName === "intersection")) {
                    let memberTypeNames: string[] = [];
                    for (const member of field.memberType.members) {
                        const memberTypeName = handleMember(member);
                        memberTypeNames.push(memberTypeName);
                    }
                    const resolvedTypeName = memberTypeNames.join("|");
                    recordFields[field.name] = Object.keys(memberRecordFields).length > 0 
                                            ? memberRecordFields : { type: `(${resolvedTypeName})[]`, comment: "" };
                    recordFieldsMetadata[field.name] = {
                        nullable: isNullable,
                        optional: field.optional,
                        typeName: `(${resolvedTypeName})[]`,
                        type: `${field.memberType.typeName}[]`,
                        typeInstance: field.name,
                        ...(Object.keys(memberFieldsMetadata).length > 0 && { members: memberFieldsMetadata })
                    };
                    continue;
                } else if (field.memberType.hasOwnProperty("members")  && field.memberType.typeName === "enum") {
                    let memberTypeNames: string[] = [];
                    for (const member of field.memberType.members) {
                        const memberTypeName = handleMember(member);
                        memberTypeNames.push(memberTypeName);
                    }
                    const resolvedTypeName = memberTypeNames.join("|");
                    recordFields[field.name] = Object.keys(memberRecordFields).length > 0 
                                            ? memberRecordFields : { type: `${resolvedTypeName}[]`, comment: "" };
                    recordFieldsMetadata[field.name] = {
                        typeName: `(${resolvedTypeName})[]`,
                        type: `${field.memberType.typeName}[]`,
                        typeInstance: field.name,
                        nullable: isNill,
                        optional: field.optional,
                        ...(Object.keys(memberFieldsMetadata).length > 0 && { members: memberFieldsMetadata })
                    };
                    continue;
                } else if (field.memberType.hasOwnProperty("fields") && field.memberType.typeName === "record") {
                    const temporaryRecord = navigateTypeInfo(field.memberType.fields, false);
                    recordFields[field.name] = (temporaryRecord as RecordDefinitonObject).recordFields;
                    recordFieldsMetadata[field.name] = {
                        typeName: "record[]",
                        type: "record[]",
                        typeInstance: field.name,
                        nullable: isNill,
                        optional: field.optional,
                        fields: (temporaryRecord as RecordDefinitonObject).recordFieldsMetadata
                    };
                    continue;
                } else if (field.memberType.hasOwnProperty("typeInfo")) {
                    if (field.memberType.hasOwnProperty("name") && !field.memberType.hasOwnProperty("typeName")) {
                        typeName = `${field.memberType.name}[]`;
                    } else {
                        typeName = "record[]";
                    }
                } else {
                    typeName = `${field.memberType.typeName}[]`;
                }
                recordFields[field.name] = { type: typeName, comment: "" };
                recordFieldsMetadata[field.name] = {
                    typeName: typeName,
                    type: typeName,
                    typeInstance: field.name,
                    nullable: isNill,
                    optional: field.optional
                };
            } else if (typeName === "enum") {
                let memberTypeNames: string[] = [];
                for (const member of field.members) {
                    const memberTypeName = handleMember(member);
                    memberTypeNames.push(memberTypeName);
                }
                const resolvedTypeName = memberTypeNames.join("|");
                recordFields[field.name] = Object.keys(memberRecordFields).length > 0 
                                            ? memberRecordFields : { type: `${resolvedTypeName}`, comment: "" };
                recordFieldsMetadata[field.name] = {
                    nullable: isNill,
                    optional: field.optional,
                    type: field.typeName,
                    typeInstance: field.name,
                    typeName: resolvedTypeName,
                    ...(Object.keys(memberFieldsMetadata).length > 0 && { members: memberFieldsMetadata })

                };
            }
            else {
                if (field.hasOwnProperty("name")) {
                    recordFields[field.name] = { type: typeName, comment: "" };
                    recordFieldsMetadata[field.name] = {
                        typeName: typeName,
                        type: typeName,
                        typeInstance: field.name,
                        nullable: isNill,
                        optional: field.optional
                    };
                } else {
                    recordFields[typeName] = { type: "string", comment: "" };
                    recordFieldsMetadata[typeName] = {
                        typeName: typeName,
                        type: "string",
                        typeInstance: typeName,
                        nullable: isNill,
                        optional: field.optional
                    };
                }
            }
        } else {
            recordFields[field.name] = { type: field.typeInfo.name, comment: "" };
            recordFieldsMetadata[field.name] = {
                typeName: field.typeInfo.name,
                type: field.typeInfo.name,
                typeInstance: field.name,
                nullable: isNill,
                optional: field.optional
            };
        }
    }
    const response = { "recordFields": recordFields, "recordFieldsMetadata": recordFieldsMetadata };
    return response;
}

export async function getDatamapperCode(parameterDefinitions: ErrorCode | ParameterMetadata): Promise<object | ErrorCode> {
    console.log(JSON.stringify(parameterDefinitions));
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
            if (!newAccessToken) {
                await handleLogin();
                return;
            }
            let retryResponse: Response | ErrorCode = await sendDatamapperRequest(parameterDefinitions, newAccessToken);
            
            if (isErrorCode(retryResponse)) {
                return (retryResponse as ErrorCode);
            }

            retryResponse = (retryResponse as Response);
            let intermediateMapping = JSON.parse(await filterResponse(retryResponse) as string); 
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

export async function constructRecord(codeObject: object): Promise<{ recordString: string; isCheckError: boolean; }> {
    let recordString: string = ""; 
    let isCheckError: boolean = false;
    let objectKeys = Object.keys(codeObject);
    for (let index = 0; index < objectKeys.length; index++) {
        let key = objectKeys[index];
        let mapping = codeObject[key];
        if (typeof mapping === "string") {
            if (mapping.includes("check ")) {
                isCheckError = true; 
            }
            if (recordString !== "") {
                recordString += ",\n";
            }
            recordString += `${key}:${mapping}`;
        } else {
            let subRecordResult = await constructRecord(mapping);
            if (subRecordResult.isCheckError) {
                isCheckError = true; 
            }
            if (recordString !== "") {
                recordString += ",\n";
            }
            recordString += `${key}:${subRecordResult.recordString}`;
        }
    }
    return { recordString: `{\n${recordString}}`, isCheckError };
}

export async function getFunction(modulePart: ModulePart, functionName: string) {
    const fns = modulePart.members.filter((mem) =>
        STKindChecker.isFunctionDefinition(mem)
    ) as FunctionDefinition[];

    return fns.find(mem => mem.functionName.value === functionName);
}

export function notifyNoGeneratedMappings() {
    const msg = 'No automatic mappings detected. Try manual mapping for precise connections.';
    window.showInformationMessage(msg);
}

async function sendDatamapperRequest(parameterDefinitions: ParameterMetadata | ErrorCode, accessToken: string | ErrorCode): Promise<Response | ErrorCode> {
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

async function sendMappingFileUploadRequest(file: Blob): Promise<Response | ErrorCode> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(CONTEXT_UPLOAD_URL_V1 + "/file_upload/generate_mapping_instruction", {
        method: "POST",
        body: formData
    });
    return response;
}

export async function searchDocumentation(message: string): Promise<string | ErrorCode> {
    const BACKEND_API_URL ="https://d55e8fdd-f58b-44b7-9037-aef27b84efa2-dev.e1-us-east-azure.choreoapis.dev/ballerina-doc-assistant/doc-assistant-docker-buil/v1.0";
    const response = await fetch(BACKEND_API_URL + "/askAssistant", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            "query": `${message}`
        })
    });

    if (response as Response) {
        return await filterDocumentation(response as Response);
    } else {
        return UNKNOWN_ERROR;
    }
    
}

export async function filterDocumentation(resp: Response): Promise<string | ErrorCode> {
    if (resp.status == 200 || resp.status == 201) {
        const data = (await resp.json()) as any;
        console.log("data",data.response);
        const finalResponse = await (data.response).replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
        return finalResponse;
    }
    if (resp.status == 404) {
        return ENDPOINT_REMOVED;
    }
    if (resp.status == 400) {
        const data = (await resp.json()) as any;
        console.log(data);
        return PARSING_ERROR;
    } 
}

async function filterMappingResponse(resp: Response): Promise<string| ErrorCode> {
    if (resp.status == 200 || resp.status == 201) {
        const data = (await resp.json()) as any;
        return data.file_content;
    }
    if (resp.status == 404) {
        return ENDPOINT_REMOVED;
    }
    if (resp.status == 400) {
        const data = (await resp.json()) as any;
        console.log(data);
        return PARSING_ERROR;
    } else {
        //TODO: Handle more error codes
        return { code: 4, message: `An unknown error occured. ${resp.statusText}.` };
    }
}

export async function getMappingFromFile(file: Blob): Promise<MappingFileRecord | ErrorCode> {
    try {
        let response = await sendMappingFileUploadRequest(file);
        if (isErrorCode(response)) {
            return response as ErrorCode;
        }
        response = response as Response;
        let mappingContent = JSON.parse((await filterMappingResponse(response)) as string);
        if (isErrorCode(mappingContent)) {
            return mappingContent as ErrorCode;
        }
        console.log("mappingContent",mappingContent);
        return mappingContent;
    } catch (error) {
        console.error(error);
        return UNKNOWN_ERROR;
    }
}

async function sendTypesFileUploadRequest(file: Blob): Promise<Response | ErrorCode> {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(CONTEXT_UPLOAD_URL_V1 + "/file_upload/generate_record", {
        method: "POST",
        body: formData
    });
    return response;
}

export async function getTypesFromFile(file: Blob): Promise<string | ErrorCode> {
    try {
        let response = await sendTypesFileUploadRequest(file);
        if (isErrorCode(response)) {
            return response as ErrorCode;
        }
        response = response as Response;
        let typesContent = await filterMappingResponse(response) as string;
        return typesContent;
    } catch (error) {
        console.error(error);
        return UNKNOWN_ERROR;
    }
}

export async function mappingFileParameterDefinitions(file: AttachmentResult, parameterDefinitions: ErrorCode | ParameterMetadata): Promise<ParameterMetadata | ErrorCode> {
    if (!file) { return parameterDefinitions; }

    const convertedFile = convertBase64ToBlob(file);
    if (!convertedFile) { throw new Error("Invalid file content"); }

    let mappingFile = await getMappingFromFile(convertedFile);
    if (isErrorCode(mappingFile)) { return mappingFile as ErrorCode; }

    mappingFile = mappingFile as MappingFileRecord;

    return {
        ...parameterDefinitions,
        mapping_fields: mappingFile.mapping_fields,
    };
}

export async function typesFileParameterDefinitions(file: AttachmentResult): Promise<string | ErrorCode> {
    if (!file) { throw new Error("File is undefined"); }

    const convertedFile = convertBase64ToBlob(file);
    if (!convertedFile) { throw new Error("Invalid file content"); }

    let typesFile = await getTypesFromFile(convertedFile);
    if (isErrorCode(typesFile)) { return typesFile as ErrorCode; }

    return typesFile;
}

function convertBase64ToBlob(file: AttachmentResult): Blob | null {
    try {
        const { content: base64Content, name: fileName } = file;
        const binaryString = atob(base64Content);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);

        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const mimeType = determineMimeType(fileName);
        return new Blob([bytes], { type: mimeType });
    } catch (error) {
        console.error("Error converting Base64 to Blob", error);
        return null;
    }
}

function determineMimeType(fileName: string): string {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
        case "pdf": return "application/pdf";
        case "txt": return "text/plain";
        case "jpg":
        case "jpeg": return "image/jpeg";
        case "png": return "image/png";
        case "docx": return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        case "doc": return "application/msword";
        case "heic":
        case "heif": return "image/heif";
        default: return "application/octet-stream";
    }
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

async function accessMetadata(
    paths: string[],
    parameterDefinitions: ParameterMetadata | ErrorCode,
    modifiedOutput: object,
    baseType: string,
    baseTargetType: string,
    nestedKey: string,
    operation: string,
    unionEnumIntersectionTypes?: string[]
): Promise<string[]> {
    const newPath: string[] = [...paths];
    let outputObject: object;
    let isOutputNullable = false;
    let isOutputOptional = false;
    let isUsingDefault = false;
    let defaultValue: string;

    // Resolve output metadata
    if (nestedKeyArray.length > 0) {
        outputObject = await resolveMetadata(parameterDefinitions, nestedKeyArray, nestedKey, "outputMetadata");
        if (!outputObject) { throw new Error(`Metadata not found for ${nestedKey}.`); }
    } else if (modifiedOutput.hasOwnProperty("fields") || !modifiedOutput[nestedKey]) {
        throw new Error(`Invalid or missing metadata for nestedKey: ${nestedKey}.`);
    } else {
        outputObject = modifiedOutput[nestedKey];
    }

    const outputMetadataType = outputObject["typeName"];
    baseTargetType = outputMetadataType.replace("|()", "");
    isOutputNullable = outputObject["nullable"];
    isOutputOptional = outputObject["optional"];

    // Process paths for metadata
    for (let index = 1; index < paths.length; index++) {
        const pathIndex = paths[index];
        let inputObject = await resolveMetadata(parameterDefinitions, paths, pathIndex, "inputMetadata");
        if (!inputObject) { throw new Error(`Field ${pathIndex} not found in metadata.`); }

        const isInputNullable = inputObject["nullable"];
        const isInputOptional = inputObject["optional"];

        if (inputObject.hasOwnProperty("members") || inputObject.hasOwnProperty("fields") || operation === "LENGTH") {
            const inputMetadataType = inputObject["type"];
            const metadataTypeName = inputObject["typeName"];
            const isInputRecordNullable = inputObject["nullable"];
            const isInputRecordOptional = inputObject["optional"];
            isUsingDefault = false;
            if (isInputRecordNullable || isInputRecordOptional) {
                const recordTypes = [
                    "record", "record|()", "readonly|record", "readonly|record|()",
                    "record[]", "record[]|()", "(readonly|record)[]", "(readonly|record)[]|()"
                ];
                // Handle record types
                if (recordTypes.includes(metadataTypeName)) {
                    if (!metadataTypeName.includes("[]")) {
                        newPath[index] = `${paths[index]}?`;
                        isUsingDefault = true;
                    }
                    if (metadataTypeName.includes("[]") && operation === "LENGTH") {
                        let lastInputObject = await resolveMetadata(parameterDefinitions, paths, paths[paths.length - 1], "inputMetadata");
                        let inputDataType = lastInputObject["typeName"].replace("|()", "");
                        defaultValue = await getDefaultValue(inputDataType);
                        newPath[paths.length - 1] = `${paths[paths.length - 1]}?:${defaultValue}`;
                    }
                    if (isInputRecordNullable && isInputRecordOptional) {
                        newPath[index - 1] = `${paths[index - 1]}?`;
                    }
                // Handle enum, union, and intersection types    
                } else if (unionEnumIntersectionTypes.includes(inputMetadataType)) {
                    if (isInputRecordNullable && isInputRecordOptional) {
                        newPath[index - 1] = `${paths[index - 1]}?`;
                    }  
                    if (!isOutputNullable && !isOutputOptional) {
                        let typeName = inputMetadataType.includes("[]") 
                            ? inputMetadataType.replace("|()", "") 
                            : (inputObject as any).members[Object.keys((inputObject as any).members)[0]].typeName;
                        
                        let defaultValue = await getDefaultValue(typeName);
                        newPath[paths.length - 1] = `${paths[paths.length - 1]}?:${defaultValue !== "void" ? defaultValue : JSON.stringify(typeName)}`;
                    }
                }
            } else {
                if (unionEnumIntersectionTypes.includes(inputMetadataType)) {
                    if (!isOutputNullable && !isOutputOptional) {
                        let typeName = inputMetadataType.includes("[]") 
                            ? inputMetadataType.replace("|()", "") 
                            : (inputObject as any).members[Object.keys((inputObject as any).members)[0]].typeName;
                        
                        let defaultValue = await getDefaultValue(typeName);
                        newPath[paths.length - 1] = `${paths[paths.length - 1]}?:${defaultValue !== "void" ? defaultValue : JSON.stringify(typeName)}`;
                    }
                }
            }
        } else {
            if (isInputNullable && isInputOptional) {
                newPath[index - 1] = `${paths[index - 1]}?`;
            }
            defaultValue = await getDefaultValue(baseType);

            if (isUsingDefault && !isOutputNullable && !isOutputOptional) {
                newPath[index] = `${pathIndex}?:${defaultValue}`;
            } else if (isInputNullable || isInputOptional) {
                if (!isOutputNullable && !isOutputOptional) {
                    newPath[index] = baseType === "string" || baseType === baseTargetType
                        ? `${pathIndex}?:${defaultValue}`
                        : `${pathIndex}`;
                } else {
                    newPath[index] = baseType !== baseTargetType && baseType === "string"
                        ? `${pathIndex}?:${defaultValue}`
                        : `${pathIndex}`;
                }
            }
            return newPath;
        }
    }
    return newPath;
}

async function getDefaultValue(dataType: string): Promise<string> {
    switch (dataType) {
        case "string":
            return "\"\"";
        case "int":
            return "0";
        case "decimal":
            return "0.0";
        case "float":
            return "0.0";
        case "boolean":
            return "false";
        case "int[]":
        case "string[]":
        case "float[]":
        case "decimal[]":
        case "boolean[]":
        case "record[]":
        case "(readonly|record)[]":
        case "enum[]":
        case "union[]":
        case "intersection[]":
            return "[]";
        default:
            // change the following to a appropriate value
            return "void";
    }
}

async function getNestedType(paths: string[], metadata: object): Promise<string> {
    let currentMetadata = metadata;
    for (let i = 0; i < paths.length; i++) {
        let cleanPath = paths[i].replace(/\?.*$/, "");
        if (currentMetadata["fields"] && currentMetadata["fields"][cleanPath]) {
            currentMetadata = currentMetadata["fields"][cleanPath];
        } else if (currentMetadata["members"] && currentMetadata["members"][cleanPath]) {
            currentMetadata = currentMetadata["members"][cleanPath];
        } else {
            throw new Error(`Field ${cleanPath} not found in metadata.`);
        }
    }
    return currentMetadata["typeName"];
}

async function resolveMetadata(parameterDefinitions: ParameterMetadata | ErrorCode, nestedKeyArray: string[], key: string, metadataKey: "inputMetadata" | "outputMetadata"): Promise<object|null> {
    let metadata = parameterDefinitions[metadataKey];
    for (let nk of nestedKeyArray) {
        if (metadata[nk] && (metadata[nk]["fields"] || metadata[nk]["members"])) {
            if (nk === key){
                return metadata[nk];
            }
            metadata = metadata[nk]["fields"] || metadata[nk]["members"];
        } else {
            return metadata[key];
        }
    }
    return metadata[key];
}

async function handleRecordArrays(key: string, nestedKey: string, responseRecord: object, parameterDefinitions: ParameterMetadata | ErrorCode) {
    let recordFields: { [key: string]: any } = {};
    let subObjectKeys = Object.keys(responseRecord);

    let formattedRecordsArray: string[] = [];
    let itemKey: string = "";
    let combinedKey: string = "";
    let modifiedOutput: object;
    let outputMetadataType: string = "";
    const arrayRecords = [
        "record[]", "record[]|()", "(readonly|record)[]", "(readonly|record)[]|()"
    ];

    for (let subObjectKey of subObjectKeys) {
        if (!nestedKey) {
            modifiedOutput = parameterDefinitions["outputMetadata"][key];
        } else {
            modifiedOutput = await resolveMetadata(parameterDefinitions, nestedKeyArray, key, "outputMetadata");
            if (!modifiedOutput) {
                throw new Error(`Metadata not found for ${nestedKey}.`);
            }
        }
        outputMetadataType = modifiedOutput["typeName"];
        let isDeeplyNested = (arrayRecords.includes(outputMetadataType));

        let { itemKey: currentItemKey, combinedKey: currentCombinedKey } = await extractKeys(responseRecord[subObjectKey], parameterDefinitions, arrayRecords);
        if (currentItemKey.includes('?')) {
            currentItemKey = currentItemKey.replace('?', '');
        }
        if (modifiedOutput.hasOwnProperty("fields") || modifiedOutput.hasOwnProperty("members")) {
            if (isDeeplyNested) {
                const subArrayRecord = responseRecord[subObjectKey];
                const isCombinedKeyModified = currentCombinedKey.endsWith('?');
                const replacementKey = isCombinedKeyModified 
                    ? `${currentItemKey}Item?.` 
                    : `${currentItemKey}Item.`;
        
                const regex = new RegExp(
                    currentCombinedKey.replace(/\?/g, '\\?').replace(/\./g, '\\.') + '\\.', 'g'
                );
        
                formattedRecordsArray.push(
                    `${subObjectKey}: ${subArrayRecord.replace(regex, replacementKey)}`
                );

                itemKey = currentItemKey;
                combinedKey = currentCombinedKey;
            } else {
                formattedRecordsArray.push(`${subObjectKey}: ${responseRecord[subObjectKey]}`);
            }
        } else {
            recordFields = { ...recordFields, [key]: responseRecord };
        }
    }

    if (formattedRecordsArray.length > 0 && itemKey && combinedKey) {
        const formattedRecords = formattedRecordsArray.join(",\n");
        const keyToReplace = combinedKey.endsWith('?') ? combinedKey.replace(/\?$/, '') : combinedKey;
        const processedKeys = await processCombinedKey(combinedKey, parameterDefinitions, arrayRecords);
        const combinedKeyExpression = (processedKeys.isinputRecordArrayNullable || processedKeys.isinputRecordArrayOptional || processedKeys.isinputArrayNullable || processedKeys.isinputArrayOptional)
            ? `${keyToReplace} ?: []`
            : keyToReplace;
        recordFields[key] = `from var ${itemKey}Item in ${combinedKeyExpression}\n select {\n ${formattedRecords}\n}`;
    } else {
        recordFields[key] = `{\n ${formattedRecordsArray.join(",\n")} \n}`;
    }

    return { ...recordFields };
}

async function filterResponse(resp: Response): Promise<string | ErrorCode> {
    if (resp.status == 200 || resp.status == 201) {
        const data = (await resp.json()) as any;
        console.log(JSON.stringify(data.mappings));
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

async function extractKeys(
    key: string,
    parameterDefinitions: ParameterMetadata | ErrorCode,
    arrayRecords: string[]
): Promise<{
    itemKey: string;
    combinedKey: string;
}> {
    let innerKey: string;
    let itemKey: string = "";
    let combinedKey: string = "";

    // Handle the key for nullable and optional fields
    key = key.replace(/\?*$/, "");

    // Check for a nested mapping like 'from var ... in ...'
    const nestedMappingMatch = key.match(/from\s+var\s+(\w+)\s+in\s+([\w?.]+)/);
    if (nestedMappingMatch) {
        itemKey = nestedMappingMatch[1];
        innerKey = nestedMappingMatch[2];

        const keys = innerKey.split(".");
        combinedKey = keys.slice(0, keys.length - 1).join(".");
    } else if (key.startsWith("{") && key.endsWith("}")) {
        // Handle complex nested mappings in braces
        const matches = key.match(/\{\s*([^}]+)\s*\}/);
        innerKey = matches ? matches[1] : key;

        // Use regex to find each deeply nested mapping within braces
        const nestedKeys = innerKey.match(/[\w\s]+:\s*([\w?.]+)/g);
        if (nestedKeys) {
            const parsedKeys = nestedKeys.map(kv => kv.split(":")[1].trim());
            innerKey = parsedKeys[0] || ""; // Assume the first entry for simplicity if multiple mappings
        } else {
            // Fallback for simpler cases
            innerKey = innerKey.split(",").map(kv => kv.split(":")[1].trim())[0] || "";
        }
    } else {
        // Standard case
        innerKey = key.match(/\(([^)]+)\)/)?.[1] || key;

        innerKey = innerKey
            .replace(/^check\s*/, '')
            .replace(/\.ensureType\(\)$/, '')
            .replace(/\.toString\(\)$/, '');
    }
    // Call the helper function to process parent keys
    const processedKeys = await processParentKey(innerKey, parameterDefinitions, arrayRecords);
    itemKey = processedKeys.itemKey;
    combinedKey = processedKeys.combinedKey;
    return { itemKey, combinedKey };
}

async function processParentKey(
    innerKey: string, 
    parameterDefinitions: ParameterMetadata | ErrorCode, 
    arrayRecords: string[]
): Promise<{ 
    itemKey: string; 
    combinedKey: string; 
}> {
    let inputMetadataType: string = "";
    let itemKey: string = "";
    let combinedKey: string = "";
    let refinedInnerKey: string;
    let isSet: boolean = false;

    // Split the innerKey to get parent keys and field name
    let keys = innerKey.split(".");
    let fieldName = keys.pop()!;
    let parentKey = keys.slice(0, keys.length);

    refinedInnerKey = innerKey
        .replace(/\?\./g, ".") // Replace `?.` with `.`
        .replace(/\?$/g, "") // Remove a trailing `?`
        .replace(/\s*\?:.*$/g, "") // Remove `?: <value>`
        .replace(/[\(\)]/g, ""); // Remove parentheses

    let refinedKeys = refinedInnerKey.split(".");
    let refinedFieldName = refinedKeys.pop()!;
    let refinedParentKey = refinedKeys.slice(0, refinedKeys.length);

    for (let index = refinedParentKey.length - 1; index > 0; index--) {
        const modifiedInputs = await resolveMetadata(parameterDefinitions, refinedParentKey, refinedParentKey[index], "inputMetadata");
        if (!modifiedInputs) {
            throw new Error(`Metadata not found for ${refinedParentKey[index]}.`);
        }
        inputMetadataType = modifiedInputs["typeName"];

        if (!isSet && (arrayRecords.includes(inputMetadataType))) {
            itemKey = parentKey[index];
            combinedKey = parentKey.slice(0, index + 1).join(".");
            isSet = true;
        }
    }
    return { itemKey, combinedKey };
}

async function processCombinedKey(
    combinedKey: string,
    parameterDefinitions: ParameterMetadata | ErrorCode,
    arrayRecords: string[]
): Promise<{
    isinputRecordArrayNullable: boolean;
    isinputRecordArrayOptional: boolean;
    isinputArrayNullable: boolean;
    isinputArrayOptional: boolean;
}> {
    let isinputRecordArrayNullable: boolean = false;
    let isinputRecordArrayOptional: boolean = false;
    let isinputArrayNullable: boolean = false;
    let isinputArrayOptional: boolean = false;
    let currentNullable: boolean = false;
    let currentOptional: boolean = false;
    let inputMetadataType: string = "";
    let refinedCombinedKey: string = "";
    let isSet: boolean = false;

    // Refine and split the inner key
    refinedCombinedKey = combinedKey
        .replace(/\?\./g, ".") // Replace `?.` with `.`
        .replace(/\?$/g, "") // Remove a trailing `?`
        .replace(/\s*\?:.*$/g, "") // Remove `?: <value>`
        .replace(/[\(\)]/g, ""); // Remove parentheses

    let refinedCombinedKeys = refinedCombinedKey.split(".");

    // Iterate through parent keys in reverse
    let index = refinedCombinedKeys.length - 1;
    const modifiedInputs = await resolveMetadata(parameterDefinitions, refinedCombinedKeys, refinedCombinedKeys[index], "inputMetadata");
    if (!modifiedInputs) {
        throw new Error(`Metadata not found for ${refinedCombinedKeys[index]}.`);
    }

    currentNullable = modifiedInputs["nullable"];
    currentOptional = modifiedInputs["optional"];
    inputMetadataType = modifiedInputs["typeName"];

    if (!isSet && arrayRecords.includes(inputMetadataType)) {
        isSet = true;
    }

    if (isSet) {
        // Update record array flags
        if (currentNullable) { isinputRecordArrayNullable = true; }
        if (currentOptional) { isinputRecordArrayOptional = true; }

        // Check preceding elements for non-`record[]` types
        for (let nextIndex = index - 1; nextIndex >= 0; nextIndex--) {
            const nextModifiedInputs = await resolveMetadata(parameterDefinitions, refinedCombinedKeys, refinedCombinedKeys[nextIndex], "inputMetadata");
            const nextMetadataType = nextModifiedInputs["typeName"];
            const nextNullable = nextModifiedInputs["nullable"];
            const nextOptional = nextModifiedInputs["optional"];

            if (!arrayRecords.includes(nextMetadataType)) {
                if (nextNullable) { isinputArrayNullable = true; }
                if (nextOptional) { isinputArrayOptional = true; }
            } else {
                return { isinputRecordArrayNullable, isinputRecordArrayOptional, isinputArrayNullable, isinputArrayOptional };
            }
        }
    }
    return { isinputRecordArrayNullable, isinputRecordArrayOptional, isinputArrayNullable, isinputArrayOptional };
}
