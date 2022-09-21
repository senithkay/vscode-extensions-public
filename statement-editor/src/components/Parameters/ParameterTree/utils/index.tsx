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

import {
    BallerinaConnectorInfo,
    FormField,
    FormFieldReturnType,
    getFormattedModuleName,
    keywords,
    PrimitiveBalType,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    ImplicitNewExpression,
    ListConstructor,
    MappingConstructor,
    NamedArg,
    NumericLiteral,
    ParenthesizedArgList,
    PositionalArg,
    RemoteMethodCallAction,
    SpecificField,
    STKindChecker,
    STNode,
    StringLiteral,
} from "@wso2-enterprise/syntax-tree";

import { EXPR_PLACEHOLDER } from "../../../../utils/expressions";

export function isRequiredParam(param: FormField): boolean {
    return !(param.optional || param.defaultable);
}

export function isAllDefaultableFields(recordFields: FormField[]): boolean {
    return recordFields?.every((field) => field.defaultable || (field.fields && isAllDefaultableFields(field.fields)));
}

export function isAnyFieldSelected(recordFields: FormField[]): boolean {
    return recordFields?.some((field) => field.selected || (field.fields && isAnyFieldSelected(field.fields)));
}

export function getSelectedUnionMember(unionFields: FormField): FormField {
    let selectedMember = unionFields.members?.find((member) => member.selected === true);
    if (!selectedMember) {
        selectedMember = unionFields.members?.find(
            (member) => getUnionFormFieldName(member) === unionFields.selectedDataType
        );
    }
    if (!selectedMember) {
        selectedMember = unionFields.members?.find(
            (member) => member.typeName === unionFields.value?.replace(/['"]+/g, "")
        );
    }
    if (!selectedMember) {
        selectedMember = unionFields.members[0];
    }
    return selectedMember;
}

export function getDefaultParams(parameters: FormField[], depth = 1, valueOnly = false): string[] {
    if (!parameters) {
        return [];
    }
    const parameterList: string[] = [];
    parameters.forEach((parameter) => {
        if ((parameter.defaultable || parameter.optional) && !parameter.selected) {
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
                const allFieldsDefaultable = isAllDefaultableFields(parameter?.fields);
                if (!parameter.selected && allFieldsDefaultable && (parameter.optional || parameter.defaultValue)) {
                    break;
                }
                if (
                    parameter.selected &&
                    allFieldsDefaultable &&
                    (parameter.optional || parameter.defaultValue) &&
                    !isAnyFieldSelected(parameter?.fields)
                ) {
                    break;
                }
                const insideParamList = getDefaultParams(parameter.fields, depth + 1);
                draftParameter = getFieldValuePair(
                    parameter,
                    `{\n${insideParamList?.join()}}`,
                    depth,
                    valueOnly,
                    false
                );
                break;
            case PrimitiveBalType.Enum:
            case PrimitiveBalType.Union:
                const selectedMember = getSelectedUnionMember(parameter);
                const selectedMemberParams = getDefaultParams([selectedMember], depth + 1, true);
                draftParameter = getFieldValuePair(parameter, selectedMemberParams?.join(), depth, false, false);
                break;
            case "inclusion":
                if (isAllDefaultableFields(parameter.inclusionType?.fields) && !parameter.selected) {
                    break;
                }
                const inclusionParams = getDefaultParams([parameter.inclusionType], depth + 1, true);
                draftParameter = getFieldValuePair(parameter, `${inclusionParams?.join()}`, depth);
                break;
            case "object":
                const typeInfo = parameter.typeInfo;
                if (
                    typeInfo &&
                    typeInfo.orgName === "ballerina" &&
                    typeInfo.moduleName === "sql" &&
                    typeInfo.name === "ParameterizedQuery"
                ) {
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

function getFieldValuePair(
    parameter: FormField,
    defaultValue: string,
    depth: number,
    valueOnly = false,
    useParamValue = true
): string {
    let value = defaultValue || EXPR_PLACEHOLDER;
    if (useParamValue && parameter.value) {
        value = parameter.value;
    }
    if (depth === 1 && !valueOnly) {
        // Handle named args
        return `${getFieldName(parameter.name)} = ${value}`;
    }
    if (depth > 1 && !valueOnly) {
        return `${getFieldName(parameter.name)}: ${value}`;
    }
    return value;
}

export function getFormFieldReturnType(formField: FormField, depth = 1): FormFieldReturnType {
    const response: FormFieldReturnType = {
        hasError: formField?.isErrorType ? true : false,
        hasReturn: false,
        returnType: "var",
        importTypeInfo: [],
    };
    const primitives = [
        "string",
        "int",
        "float",
        "decimal",
        "boolean",
        "json",
        "xml",
        "handle",
        "byte",
        "object",
        "handle",
        "anydata",
    ];
    const returnTypes: string[] = [];

    if (formField) {
        switch (formField.typeName) {
            case "union":
                formField?.members?.forEach((field) => {
                    const returnTypeResponse = getFormFieldReturnType(field, depth + 1);
                    const returnType = returnTypeResponse.returnType;
                    response.hasError = returnTypeResponse.hasError || response.hasError;
                    response.hasReturn = returnTypeResponse.hasReturn || response.hasReturn;
                    response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];

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
                    response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];
                }

                if (response.returnType && formField.typeName === PrimitiveBalType.Array) {
                    // set array type
                    response.returnType = response.returnType.includes("|")
                        ? `(${response.returnType})[]`
                        : `${response.returnType}[]`;
                }
                break;

            case "stream":
                let returnTypeResponseLeft = null;
                let returnTypeResponseRight = null;
                if (formField?.leftTypeParam) {
                    returnTypeResponseLeft = getFormFieldReturnType(formField.leftTypeParam, depth + 1);
                    response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponseLeft.importTypeInfo];
                }
                if (formField?.rightTypeParam) {
                    returnTypeResponseRight = getFormFieldReturnType(formField.rightTypeParam, depth + 1);
                    response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponseRight.importTypeInfo];
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
                formField?.fields.forEach((field) => {
                    const returnTypeResponse = getFormFieldReturnType(field, depth + 1);
                    const returnType = returnTypeResponse.returnType;
                    response.hasError = returnTypeResponse.hasError || response.hasError;
                    response.hasReturn = returnTypeResponse.hasReturn || response.hasReturn;
                    response.importTypeInfo = [...response.importTypeInfo, ...returnTypeResponse.importTypeInfo];
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
                    response.returnType = "error";
                }
                if (type === "" && formField.typeInfo && !formField.isErrorType) {
                    // set class/record types
                    type = `${getFormattedModuleName(formField.typeInfo.moduleName)}:${formField.typeInfo.name}`;
                    response.hasReturn = true;
                    response.importTypeInfo.push(formField.typeInfo);
                }
                if (type === "" && formField.typeInfo && formField?.isStream && formField.isErrorType) {
                    // set stream record type with error
                    type = `${getFormattedModuleName(formField.typeInfo.moduleName)}:${formField.typeInfo.name},error`;
                    response.hasReturn = true;
                    response.importTypeInfo.push(formField.typeInfo);
                    // remove error return
                    response.hasError = false;
                }
                if (
                    type === "" &&
                    !formField.typeInfo &&
                    primitives.includes(formField.typeName) &&
                    formField?.isStream &&
                    formField.isErrorType
                ) {
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
                if (
                    type === "" &&
                    !formField.isStream &&
                    formField.typeName &&
                    primitives.includes(formField.typeName)
                ) {
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

export function mapEndpointToFormField(model: STNode, formFields: FormField[]): FormField[] {
    let expression: ImplicitNewExpression;
    if (
        model &&
        (STKindChecker.isLocalVarDecl(model) || STKindChecker.isModuleVarDecl(model)) &&
        STKindChecker.isCheckExpression(model.initializer) &&
        STKindChecker.isImplicitNewExpression(model.initializer.expression)
    ) {
        expression = model.initializer.expression;
    } else if (
        model &&
        STKindChecker.isCheckExpression(model) &&
        STKindChecker.isImplicitNewExpression(model.expression)
    ) {
        expression = model.expression;
    } else if (model && STKindChecker.isImplicitNewExpression(model)) {
        expression = model;
    } else {
        return;
    }

    const parenthesizedArgs = expression.parenthesizedArgList as ParenthesizedArgList;
    let nextValueIndex = 0;
    for (const arg of parenthesizedArgs.arguments) {
        if (parenthesizedArgs.arguments === undefined || formFields.length <= nextValueIndex) {
            break;
        }
        const positionalArg = arg as PositionalArg;
        let formField = formFields[nextValueIndex];
        if (STKindChecker.isNamedArg(positionalArg)) {
            const argName = positionalArg.argumentName.name.value;
            formFields.forEach((field) => {
                if (field.name === argName) {
                    formField = field;
                    return;
                }
                if (field.typeName === "inclusion") {
                    field.inclusionType?.fields?.forEach((subField) => {
                        if (subField.name === argName) {
                            formField = subField;
                            return;
                        }
                    });
                }
            });
        }
        if (positionalArg.kind === "PositionalArg" || positionalArg.kind === "NamedArg") {
            if (
                formField.typeName === "string" ||
                formField.typeName === "int" ||
                formField.typeName === "boolean" ||
                formField.typeName === "float" ||
                formField.typeName === "decimal" ||
                formField.typeName === "json" ||
                formField.typeName === "xml"
            ) {
                if (STKindChecker.isStringLiteral(positionalArg.expression)) {
                    const stringLiteral: StringLiteral = positionalArg.expression as StringLiteral;
                    formField.value = stringLiteral.literalToken.value;
                } else if (STKindChecker.isNumericLiteral(positionalArg.expression)) {
                    const numericLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                    formField.value = numericLiteral.literalToken.value;
                } else if (STKindChecker.isBooleanLiteral(positionalArg.expression)) {
                    const booleanLiteral: NumericLiteral = positionalArg.expression as NumericLiteral;
                    formField.value = booleanLiteral.literalToken.value;
                } else {
                    formField.value = positionalArg.expression.source;
                }
                formField.selected = checkFormFieldValue(formField);
                formField.initialDiagnostics = positionalArg?.typeData?.diagnostics;
                nextValueIndex++;
            } else if (formField.typeName === "record" && formField.fields && formField.fields.length > 0) {
                const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
                if (mappingConstructor) {
                    mapRecordLiteralToRecordTypeFormField(
                        mappingConstructor.fields as SpecificField[],
                        formField.fields
                    );
                    formField.selected = formField.selected || isAnyFieldSelected(formField.fields);
                    nextValueIndex++;
                }
            } else if (
                formField.typeName === "inclusion" &&
                formField.inclusionType &&
                formField.inclusionType.fields
            ) {
                const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
                if (mappingConstructor) {
                    mapRecordLiteralToRecordTypeFormField(
                        mappingConstructor.fields as SpecificField[],
                        formField.inclusionType?.fields
                    );
                    nextValueIndex++;
                }
                formField.inclusionType.selected =
                    formField.inclusionType.selected || isAnyFieldSelected(formField.inclusionType?.fields);
                formField.selected = formField.inclusionType.selected;
            } else if (formField.typeName === "union") {
                formField.value = positionalArg.expression?.source;
                formField.initialDiagnostics = positionalArg?.typeData?.diagnostics;
                formField.selected = isAnyFieldSelected(formField.members);
            }
        }
    }
    return formFields;
}

export function mapActionToFormField(model: STNode, formFields: FormField[]) {
    let expression: RemoteMethodCallAction;
    if (
        model &&
        STKindChecker.isLocalVarDecl(model) &&
        STKindChecker.isCheckAction(model.initializer) &&
        STKindChecker.isRemoteMethodCallAction(model.initializer.expression)
    ) {
        expression = model.initializer.expression;
    } else if (
        model &&
        STKindChecker.isLocalVarDecl(model) &&
        STKindChecker.isRemoteMethodCallAction(model.initializer)
    ) {
        expression = model.initializer;
    } else if (
        model &&
        STKindChecker.isActionStatement(model) &&
        STKindChecker.isCheckAction(model.expression) &&
        STKindChecker.isRemoteMethodCallAction(model.expression.expression)
    ) {
        expression = model.expression.expression;
    } else if (model && STKindChecker.isRemoteMethodCallAction(model)) {
        expression = model;
    } else {
        return;
    }

    const methodArgs = expression.arguments.filter((arg) => arg.kind !== "CommaToken");
    let nextValueIndex = 0;
    for (const formField of formFields) {
        if (methodArgs === undefined || methodArgs.length <= nextValueIndex) {
            break;
        }
        if (STKindChecker.isNamedArg(methodArgs[nextValueIndex])) {
            const namedArg: NamedArg = methodArgs[nextValueIndex] as NamedArg;
            const fieldForNamedArg = formFields.find((field) => field.name === namedArg.argumentName.name.value);
            if (fieldForNamedArg) {
                fieldForNamedArg.value = namedArg.expression.source;
                fieldForNamedArg.selected = checkFormFieldValue(fieldForNamedArg);
            }
            nextValueIndex++;
        } else {
            const positionalArg: PositionalArg = methodArgs[nextValueIndex] as PositionalArg;
            if (
                formField.typeName === "string" ||
                formField.typeName === "int" ||
                formField.typeName === "boolean" ||
                formField.typeName === "float" ||
                formField.typeName === "decimal" ||
                formField.typeName === "httpRequest"
            ) {
                if (
                    STKindChecker.isStringLiteral(positionalArg.expression) ||
                    STKindChecker.isNumericLiteral(positionalArg.expression) ||
                    STKindChecker.isBooleanLiteral(positionalArg.expression)
                ) {
                    if (formField.isRestParam) {
                        formField.value = getRestParamFieldValue(methodArgs as PositionalArg[], nextValueIndex);
                    } else {
                        const literalExpression = positionalArg.expression;
                        formField.value = literalExpression.literalToken.value;
                    }
                } else {
                    formField.value = positionalArg.expression.source;
                }
                nextValueIndex++;
            } else if (
                formField.typeName === "handle" ||
                formField.typeName === "object" ||
                formField.typeName === "collection" ||
                formField.typeName.includes("array")
            ) {
                formField.value = positionalArg.expression?.source;
                nextValueIndex++;
            } else if (formField.typeName === "record" && formField.fields && formField.fields.length > 0) {
                const mappingConstructor: MappingConstructor = positionalArg.expression as MappingConstructor;
                if (mappingConstructor) {
                    mapRecordLiteralToRecordTypeFormField(
                        mappingConstructor.fields as SpecificField[],
                        formField.fields
                    );
                    nextValueIndex++;
                }
            } else if (
                formField.typeName === "record" &&
                STKindChecker.isSimpleNameReference(positionalArg.expression)
            ) {
                formField.value = positionalArg.expression.name.value;
                nextValueIndex++;
            } else if (formField.typeName === "union") {
                formField.value = positionalArg.expression?.source;
                nextValueIndex++;
            } else if (formField.typeName === "enum") {
                formField.value = positionalArg.expression?.source;
                nextValueIndex++;
            } else if (formField.typeName === "json") {
                formField.value = positionalArg.expression?.source;
                nextValueIndex++;
            }
            formField.selected = checkFormFieldValue(formField);
        }
    }
}

export function mapRecordLiteralToRecordTypeFormField(specificFields: SpecificField[], formFields: FormField[]) {
    specificFields?.forEach((specificField) => {
        if (specificField.kind !== "CommaToken") {
            formFields.forEach((formField) => {
                if (getFieldName(formField.name) === specificField.fieldName.value) {
                    formField.value =
                        STKindChecker.isStringLiteral(specificField.valueExpr) ||
                        STKindChecker.isNumericLiteral(specificField.valueExpr) ||
                        STKindChecker.isBooleanLiteral(specificField.valueExpr)
                            ? (formField.value = specificField.valueExpr.literalToken.value)
                            : (formField.value = specificField.valueExpr.source);
                    formField.selected = checkFormFieldValue(formField);

                    if (specificField.valueExpr.kind === "MappingConstructor") {
                        const mappingField = specificField.valueExpr as MappingConstructor;
                        if (formField.typeName === "union") {
                            formField.members.forEach((subFormField) => {
                                if (subFormField.typeName === "record" && subFormField.fields) {
                                    const subFields = subFormField.fields;
                                    if (subFields) {
                                        mapRecordLiteralToRecordTypeFormField(
                                            mappingField.fields as SpecificField[],
                                            subFields
                                        );
                                        let allFieldsFilled = true; // FIXME: fix this union type selection
                                        subFields.forEach((field) => {
                                            if (
                                                field.optional === false &&
                                                field.defaultable === false &&
                                                !field.value
                                            ) {
                                                allFieldsFilled = false;
                                            }
                                        });
                                        if (allFieldsFilled) {
                                            formField.selectedDataType = getUnionFormFieldName(subFormField);
                                            formField.selected = true;
                                        }
                                    }
                                }
                            });
                        } else {
                            mapRecordLiteralToRecordTypeFormField(
                                mappingField.fields as SpecificField[],
                                formField.fields
                            );
                            formField.selected = formField.selected || isAnyFieldSelected(formField.fields);
                        }
                    }

                    if (specificField.valueExpr.kind === "ListConstructor") {
                        const listExpr = specificField.valueExpr as ListConstructor;
                        formField.value = listExpr.source;
                        formField.fields = formField?.fields ? formField.fields : [];
                    }
                    formField.initialDiagnostics = specificField?.typeData?.diagnostics;
                }
            });
        }
    });
}

export function getRestParamFieldValue(remoteMethodCallArguments: PositionalArg[], currentFieldIndex: number) {
    const varArgValues: string[] = [];
    for (let i = currentFieldIndex; i < remoteMethodCallArguments.length; i++) {
        const varArgs: PositionalArg = remoteMethodCallArguments[i] as PositionalArg;
        const literalExpression: any = varArgs.expression;
        varArgValues.push(literalExpression.literalToken.value);
    }
    return varArgValues.join(",");
}

export function getFieldName(fieldName: string): string {
    return keywords.includes(fieldName) ? "'" + fieldName : fieldName;
}

export function getUnionFormFieldName(field: FormField): string {
    return field.name || field.typeInfo?.name || field.typeName;
}

export function checkFormFieldValue(field: FormField): boolean {
    return field.value !== undefined && field.value !== null;
}

export function retrieveUsedAction(actionModel: STNode, connector: BallerinaConnectorInfo) {
    let methodName = "";
    const methods = connector.functions;
    if (
        STKindChecker.isLocalVarDecl(actionModel) &&
        STKindChecker.isCheckAction(actionModel.initializer) &&
        STKindChecker.isRemoteMethodCallAction(actionModel.initializer.expression)
    ) {
        methodName = actionModel.initializer.expression.methodName.name.value;
    } else if (
        STKindChecker.isLocalVarDecl(actionModel) &&
        STKindChecker.isRemoteMethodCallAction(actionModel.initializer)
    ) {
        methodName = actionModel.initializer.methodName.name.value;
    } else if (
        STKindChecker.isActionStatement(actionModel) &&
        STKindChecker.isCheckAction(actionModel.expression) &&
        STKindChecker.isRemoteMethodCallAction(actionModel.expression.expression)
    ) {
        methodName = actionModel.expression.expression.methodName.name.value;
    }
    if (methodName && methodName !== "" && methods?.length > 0) {
        const usedMethod = methods.find((func) => func.name === methodName);
        if (usedMethod) {
            return usedMethod;
        }
    }
    return undefined;
}

export function getActionExprWithArgs(suggestion: string, connector: BallerinaConnectorInfo): string {
    const newActionName = suggestion.split("(")[0];
    const newAction = connector?.functions.find((func) => func.name === newActionName);
    const modelParams = getDefaultParams(newAction.parameters);
    return newActionName + "(" + modelParams.join(",") + ")";
}
