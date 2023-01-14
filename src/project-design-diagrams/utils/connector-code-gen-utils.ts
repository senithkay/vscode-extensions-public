/*
 * Copyright (c) 2023, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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

// TODO: Move these utils to a common repo.

import { ModulePart, STKindChecker, STNode } from "@wso2-enterprise/syntax-tree";
import { FormField, FormFieldReturnType, PrimitiveBalType } from "@wso2-enterprise/ballerina-low-code-edtior-commons/src/types";
import { getFormattedModuleName, keywords } from "@wso2-enterprise/ballerina-low-code-edtior-commons/src/utils/Diagram/modification-util";

const EXPR_PLACEHOLDER = "()";

export function getConnectorImports(syntaxTree: STNode, organization: string, moduleName: string) {
    let isDriverImported = false;
    const imports = new Set<string>([`${organization}/${moduleName}`]);

    if (STKindChecker.isModulePart(syntaxTree)) {
        (syntaxTree as ModulePart).imports?.forEach((imp: any) => {
            if (
                STKindChecker.isImportDeclaration(imp) &&
                imp.orgName?.orgName.value === organization &&
                imp.typeData?.symbol?.moduleID?.moduleName === `${moduleName}.driver`
            ) {
                isDriverImported = true;
            }
        });
        if (!isDriverImported && isDependOnDriver(moduleName)) {
            imports.add(`${organization}/${moduleName}.driver as _`);
        }
    }
    return imports;
}

export function isDependOnDriver(connectorModule: string): boolean {
    const dbConnectors = ["mysql", "mssql", "postgresql", "oracledb", "cdata.connect", "snowflake"];
    if (dbConnectors.includes(connectorModule)) {
        return true;
    }
    return false;
}

export function getDefaultParams(parameters: FormField[], depth = 1, valueOnly = false): string[] {
    if (!parameters) {
        return [];
    }
    const parameterList: string[] = [];
    parameters.forEach((parameter) => {
        if (parameter.defaultable || parameter.optional) {
            return;
        }
        let draftParameter = "";
        switch (parameter.typeName) {
            case PrimitiveBalType.String:
                draftParameter = getFieldValuePair(parameter, `""`, depth, valueOnly);
                break;
            case PrimitiveBalType.Int:
            case PrimitiveBalType.Float:
            case PrimitiveBalType.Decimal:
                draftParameter = getFieldValuePair(parameter, `0`, depth, valueOnly);
                break;
            case PrimitiveBalType.Boolean:
                draftParameter = getFieldValuePair(parameter, `true`, depth, valueOnly);
                break;
            case PrimitiveBalType.Array:
                draftParameter = getFieldValuePair(parameter, `[]`, depth, valueOnly);
                break;
            case PrimitiveBalType.Xml:
                draftParameter = getFieldValuePair(parameter, "xml ``", depth, valueOnly);
                break;
            case PrimitiveBalType.Nil:
            case "anydata":
            case "()":
                draftParameter = getFieldValuePair(parameter, `()`, depth, true);
                break;
            case PrimitiveBalType.Json:
            case "map":
                draftParameter = getFieldValuePair(parameter, `{}`, depth, valueOnly);
                break;
            case PrimitiveBalType.Record:
                if (!parameter?.fields) {
                    break;
                }
                const allFieldsDefaultable = isAllDefaultableFields(parameter.fields);
                if (!parameter.selected && allFieldsDefaultable && (parameter.optional || parameter.defaultValue)) {
                    break;
                }
                if (parameter.selected && allFieldsDefaultable && (parameter.optional || parameter.defaultValue) && !isAnyFieldSelected(parameter?.fields)) {
                    break;
                }
                const insideParamList = getDefaultParams(parameter.fields, depth + 1);
                draftParameter = getFieldValuePair(parameter, `{\n${insideParamList?.join()}}`, depth, valueOnly, false);
                break;
            case PrimitiveBalType.Enum:
            case PrimitiveBalType.Union:
                const selectedMember = getSelectedUnionMember(parameter);
                if (!selectedMember) {
                    break;
                }
                const selectedMemberParams = getDefaultParams([selectedMember], depth + 1, true);
                draftParameter = getFieldValuePair(parameter, selectedMemberParams?.join(), depth, false, false);
                break;
            case "inclusion":
                if (!parameter?.inclusionType?.fields) {
                    break;
                }
                if (isAllDefaultableFields(parameter.inclusionType?.fields) && !parameter.selected) {
                    break;
                }
                const inclusionParams = getDefaultParams([parameter.inclusionType], depth + 1, true);
                draftParameter = getFieldValuePair(parameter, `${inclusionParams?.join()}`, depth);
                break;
            case "object":
                const typeInfo = parameter.typeInfo;
                if (typeInfo && typeInfo.orgName === "ballerina" && typeInfo.moduleName === "sql" && typeInfo.name === "ParameterizedQuery") {
                    draftParameter = getFieldValuePair(parameter, "``", depth);
                }
                break;
            default:
                if (!parameter.name) {
                    // Handle Enum type
                    draftParameter = getFieldValuePair(parameter, `"${parameter.typeName}"`, depth, true);
                }
                if (parameter.name === "rowType") {
                    // Handle custom return type
                    draftParameter = getFieldValuePair(parameter, EXPR_PLACEHOLDER, depth);
                }
                break;
        }
        if (draftParameter !== "") {
            parameterList.push(draftParameter);
        }
    });
    return parameterList;
}

function getFieldValuePair(parameter: FormField, defaultValue: string, depth: number, valueOnly = false, useParamValue = true): string {
    let value = defaultValue || EXPR_PLACEHOLDER;
    if (useParamValue && parameter.value) {
        value = parameter.value;
    }
    if (depth === 1 && !valueOnly && parameter.name) {
        // Handle named args
        return `${getFieldName(parameter.name)} = ${defaultValue}`;
    }
    if (depth > 1 && !valueOnly && parameter.name) {
        return `${getFieldName(parameter.name)}: ${defaultValue}`;
    }
    return defaultValue;
}

export function isAllDefaultableFields(recordFields: FormField[]): boolean {
    return recordFields?.every((field) => field.defaultable || (field.fields && isAllDefaultableFields(field.fields)));
}

export function isAnyFieldSelected(recordFields: FormField[]): boolean {
    return recordFields?.some((field) => field.selected || (field.fields && isAnyFieldSelected(field.fields)));
}

export function getFieldName(fieldName: string): string {
    return keywords.includes(fieldName) ? "'" + fieldName : fieldName;
}

export function getUnionFormFieldName(field: FormField): string {
    let name = field.name;
    if (!name) {
        name = field.typeInfo?.name;
    }
    if (!name) {
        name = field.typeName;
    }
    return name;
}

export function getSelectedUnionMember(unionFields: FormField): FormField | undefined {
    let selectedMember = unionFields.members?.find((member) => member.selected === true);
    if (!selectedMember) {
        selectedMember = unionFields.members?.find((member) => getUnionFormFieldName(member) === unionFields.selectedDataType);
    }
    if (!selectedMember) {
        selectedMember = unionFields.members?.find((member) => member.typeName === unionFields.value?.replace(/['"]+/g, ""));
    }
    if (!selectedMember && unionFields.members && unionFields.members.length > 0) {
        selectedMember = unionFields.members[0];
    }
    return selectedMember;
}

export function getFormFieldReturnType(formField: FormField, depth = 1): FormFieldReturnType {
    const response: FormFieldReturnType = {
        hasError: formField?.isErrorType ? true : false,
        hasReturn: false,
        returnType: "var",
        importTypeInfo: [],
    };
    const primitives = ["string", "int", "float", "decimal", "boolean", "json", "xml", "handle", "byte", "object", "handle", "anydata"];
    const returnTypes: string[] = [];

    if (formField) {
        switch (formField.typeName) {
            case "union":
                formField?.members?.forEach((field) => {
                    const returnTypeResponse = getFormFieldReturnType(field, depth + 1);
                    const returnType = returnTypeResponse.returnType;
                    response.hasError = returnTypeResponse.hasError || response.hasError;
                    response.hasReturn = returnTypeResponse.hasReturn || response.hasReturn;
                    if (response.importTypeInfo && returnTypeResponse.importTypeInfo) {
                        response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];
                    }

                    // collector
                    if (returnType && returnType !== "var") {
                        returnTypes.push(returnType);
                    }
                });

                if (returnTypes.length > 0) {
                    if (returnTypes.length > 1) {
                        // concat all return types with | character
                        response.returnType = returnTypes.reduce((fullType, subType) => {
                            return `${fullType}${subType !== "?" ? "|" : ""}${subType}`;
                        });
                    } else {
                        response.returnType = returnTypes[0];
                        if (response.returnType === "?") {
                            response.hasReturn = false;
                        }
                    }
                }
                break;

            case "map":
                if (!formField?.paramType) {
                    break;
                }
                const paramType = getFormFieldReturnType(formField.paramType, depth + 1);
                response.hasError = paramType.hasError;
                response.hasReturn = true;
                response.returnType = `map<${paramType.returnType}>`;
                break;

            case "array":
                if (formField?.memberType) {
                    const returnTypeResponse = getFormFieldReturnType(formField.memberType, depth + 1);
                    response.returnType = returnTypeResponse.returnType;
                    response.hasError = returnTypeResponse.hasError || response.hasError;
                    response.hasReturn = returnTypeResponse.hasReturn || response.hasReturn;
                    if (response.importTypeInfo && returnTypeResponse.importTypeInfo) {
                        response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];
                    }
                }

                if (response.returnType && formField.typeName === PrimitiveBalType.Array) {
                    // set array type
                    response.returnType = response.returnType.includes("|") ? `(${response.returnType})[]` : `${response.returnType}[]`;
                }
                break;

            case "stream":
                let returnTypeResponseLeft;
                let returnTypeResponseRight;
                if (formField?.leftTypeParam) {
                    returnTypeResponseLeft = getFormFieldReturnType(formField.leftTypeParam, depth + 1);
                    if (response.importTypeInfo) {
                        response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponseLeft.importTypeInfo];
                    }
                }
                if (formField?.rightTypeParam) {
                    returnTypeResponseRight = getFormFieldReturnType(formField.rightTypeParam, depth + 1);
                    if (response.importTypeInfo) {
                        response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponseRight.importTypeInfo];
                    }
                }
                if (
                    returnTypeResponseLeft.returnType &&
                    returnTypeResponseRight &&
                    (returnTypeResponseRight.returnType || returnTypeResponseRight.hasError)
                ) {
                    const rightType = returnTypeResponseRight.hasError ? "error?" : returnTypeResponseRight.returnType;
                    response.returnType = `stream<${returnTypeResponseLeft.returnType},${rightType}>`;
                }
                if (returnTypeResponseLeft.returnType && !returnTypeResponseRight?.returnType) {
                    response.returnType = `stream<${returnTypeResponseLeft.returnType}>`;
                }
                if (response.returnType) {
                    response.hasReturn = true;
                    formField.isErrorType = false;
                    response.hasError = false;
                }
                break;

            case "tuple":
                formField?.fields?.forEach((field) => {
                    const returnTypeResponse = getFormFieldReturnType(field, depth + 1);
                    const returnType = returnTypeResponse.returnType;
                    response.hasError = returnTypeResponse.hasError || response.hasError;
                    response.hasReturn = returnTypeResponse.hasReturn || response.hasReturn;
                    if (response.importTypeInfo && returnTypeResponse.importTypeInfo) {
                        response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];
                    }
                    // collector
                    if (returnType && returnType !== "var") {
                        returnTypes.push(returnType);
                    }
                });

                if (returnTypes.length > 0) {
                    response.returnType = returnTypes.length > 1 ? `[${returnTypes.join(",")}]` : returnTypes[0];
                }
                break;

            default:
                let type = "";
                if (depth <= 2 && (formField.typeName.trim() === "error" || formField.isErrorType)) {
                    formField.isErrorType = true;
                    response.hasError = true;
                }
                if (depth > 2 && (formField.typeName.trim() === "error" || formField.isErrorType)) {
                    response.hasReturn = true;
                    response.hasError = true;
                    response.returnType = "error";
                }
                if (type === "" && formField.typeInfo && !formField.isErrorType) {
                    // set class/record types
                    type = `${getFormattedModuleName(formField.typeInfo.moduleName)}:${formField.typeInfo.name}`;
                    response.hasReturn = true;
                    if (response.importTypeInfo) {
                        response.importTypeInfo.push(formField.typeInfo);
                    }
                }
                if (type === "" && formField.typeInfo && formField?.isStream && formField.isErrorType) {
                    // set stream record type with error
                    type = `${getFormattedModuleName(formField.typeInfo.moduleName)}:${formField.typeInfo.name},error`;
                    response.hasReturn = true;
                    if (response.importTypeInfo) {
                        response.importTypeInfo.push(formField.typeInfo);
                    }
                    // remove error return
                    response.hasError = false;
                }
                if (type === "" && !formField.typeInfo && primitives.includes(formField.typeName) && formField?.isStream && formField.isErrorType) {
                    // set stream record type with error
                    type = `${formField.typeName},error`;
                    response.hasReturn = true;
                    // remove error return
                    response.hasError = false;
                }
                if (type === "" && formField.typeName.includes("map<")) {
                    // map type
                    type = formField.typeName;
                    response.hasReturn = true;
                }
                if (type === "" && formField.typeName.includes("[") && formField.typeName.includes("]")) {
                    // tuple type
                    type = formField.typeName;
                    response.hasReturn = true;
                }
                if (type === "" && !formField.isStream && formField.typeName && primitives.includes(formField.typeName)) {
                    // set primitive types
                    type = formField.typeName;
                    response.hasReturn = true;
                }
                if (formField.typeName === "parameterized") {
                    type = "record{}";
                    response.hasReturn = true;
                }
                // filters
                if (type !== "" && formField.typeName === PrimitiveBalType.Array) {
                    // set array type
                    type = type.includes("|") ? `(${type})[]` : `${type}[]`;
                }
                if ((type !== "" || formField.isErrorType) && formField?.optional) {
                    // set optional tag
                    type = type.includes("|") ? `(${type})?` : `${type}?`;
                }
                if (type === "" && depth > 1 && formField.typeName.trim() === "()") {
                    // set optional tag for nil return types
                    type = "?";
                }
                if (type) {
                    response.returnType = type;
                }
        }
    }
    if (formField === null) {
        response.returnType = "record{}";
        response.hasReturn = true;
    }
    return response;
}
