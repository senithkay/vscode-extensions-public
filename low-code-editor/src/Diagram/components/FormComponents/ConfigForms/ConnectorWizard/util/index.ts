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
    BallerinaConnectorRequest,
    DiagramEditorLangClientInterface,
    FormField,
    FormFieldReturnType,
    PrimitiveBalType,
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    BlockStatement,
    DoStatement,
    ForeachStatement,
    IfElseStatement,
    NodePosition,
    QualifiedNameReference,
    STKindChecker,
    STNode,
    VisibleEndpoint,
    WhileStatement,
} from "@wso2-enterprise/syntax-tree";

import { isEndpointNode } from "../../../../../utils";
import { getFormattedModuleName } from "../../../../Portals/utils";
import { isAllDefaultableFields } from "../../../Utils";

export async function fetchConnectorInfo(
    connector: BallerinaConnectorInfo,
    langServerURL?: string,
    currentFilePath?: string,
    getDiagramEditorLangClient?: (url: string) => Promise<DiagramEditorLangClientInterface>
): Promise<BallerinaConnectorInfo> {
    let connectorInfo;
    const connectorRequest: BallerinaConnectorRequest = {};
    // Connector request with connector_id
    if (!connectorInfo && connector && connector.id) {
        connectorRequest.id = connector.id;
    }
    // Connector request with FQN
    if (!connectorInfo && connector && connector.moduleName && connector.package) {
        connectorRequest.name = connector.name;
        connectorRequest.moduleName = connector.moduleName;
        connectorRequest.orgName = connector.package.organization;
        connectorRequest.packageName = connector.package.name;
        connectorRequest.version = connector.package.version;
        connectorRequest.targetFile = currentFilePath;
    }
    if (!connectorInfo && connectorRequest) {
        const langClient = await getDiagramEditorLangClient(langServerURL);
        const connectorResp = await langClient?.getConnector(connectorRequest);
        if (connectorResp) {
            connectorInfo = connectorResp as BallerinaConnectorInfo;
        }
    }
    return connectorInfo;
}

export function getMatchingConnector(node: STNode): BallerinaConnectorInfo {
    let connector: BallerinaConnectorInfo;
    if (
        node &&
        isEndpointNode(node) &&
        (STKindChecker.isLocalVarDecl(node) || STKindChecker.isModuleVarDecl(node)) &&
        STKindChecker.isQualifiedNameReference(node.typedBindingPattern.typeDescriptor)
    ) {
        const nameReference = node.typedBindingPattern.typeDescriptor as QualifiedNameReference;
        const typeSymbol = nameReference.typeData?.typeSymbol;
        const module = typeSymbol?.moduleID;
        if (typeSymbol && module) {
            connector = {
                name: typeSymbol.name,
                moduleName: module.moduleName,
                package: {
                    organization: module.orgName,
                    name: module.packageName || module.moduleName,
                    version: module.version,
                },
                functions: [],
            };
        }
    }

    return connector;
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
                draftParameter = getFieldValuePair(parameter, `""`, depth);
                break;
            case PrimitiveBalType.Int:
            case PrimitiveBalType.Float:
            case PrimitiveBalType.Decimal:
                draftParameter = getFieldValuePair(parameter, `0`, depth);
                break;
            case PrimitiveBalType.Boolean:
                draftParameter = getFieldValuePair(parameter, `true`, depth);
                break;
            case PrimitiveBalType.Array:
                draftParameter = getFieldValuePair(parameter, `[]`, depth);
                break;
            case PrimitiveBalType.Xml:
                draftParameter = getFieldValuePair(parameter, "xml ``", depth);
                break;
            case PrimitiveBalType.Nil:
            case "()":
                draftParameter = getFieldValuePair(parameter, `()`, depth);
                break;
            case PrimitiveBalType.Json:
            case "map":
                draftParameter = getFieldValuePair(parameter, `{}`, depth);
                break;
            case PrimitiveBalType.Record:
                if (isAllDefaultableFields(parameter?.fields)) {
                    break;
                }
                const insideParamList = getDefaultParams(parameter.fields, depth + 1);
                draftParameter = getFieldValuePair(parameter, `{\n${insideParamList?.join()}}`, depth, valueOnly);
                break;
            case PrimitiveBalType.Union:
                const firstMember = parameter.members[ 0 ];
                const firstMemberParams = getDefaultParams([ firstMember ], depth + 1, true);
                draftParameter = getFieldValuePair(parameter, firstMemberParams?.join(), depth);
                break;
            case "inclusion":
                if (isAllDefaultableFields(parameter.inclusionType?.fields)) {
                    break;
                }
                const inclusionParams = getDefaultParams([ parameter.inclusionType ], depth + 1);
                draftParameter = getFieldValuePair(parameter, `${inclusionParams?.join()}`, depth);
                break;

            default:
                break;
        }
        if (draftParameter !== "") {
            parameterList.push(draftParameter);
        }
    });
    return parameterList;
}

function getFieldValuePair(parameter: FormField, defaultValue: string, depth: number, valueOnly = false): string {
    if (depth === 1 && !valueOnly) {
        // Handle named args
        return `${parameter.name} = ${defaultValue}`;
    }
    if (depth > 1 && !valueOnly) {
        return `${parameter.name}: ${defaultValue}`;
    }
    return defaultValue;
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
                    response.importTypeInfo = [ ...response.importTypeInfo, ...returnTypeResponse.importTypeInfo ];

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
                        response.returnType = returnTypes[ 0 ];
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
                    response.importTypeInfo = [ ...response.importTypeInfo, ...returnTypeResponse.importTypeInfo ];
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
                    response.importTypeInfo = [ ...response.importTypeInfo, ...returnTypeResponseLeft.importTypeInfo ];
                }
                if (formField?.rightTypeParam) {
                    returnTypeResponseRight = getFormFieldReturnType(formField.rightTypeParam, depth + 1);
                    response.importTypeInfo = [ ...response.importTypeInfo, ...returnTypeResponseRight.importTypeInfo ];
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
                    response.importTypeInfo = [ ...response.importTypeInfo, ...returnTypeResponse.importTypeInfo ];
                    // collector
                    if (returnType && returnType !== "var") {
                        returnTypes.push(returnType);
                    }
                });

                if (returnTypes.length > 0) {
                    response.returnType = returnTypes.length > 1 ? `[${returnTypes.join(",")}]` : returnTypes[ 0 ];
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

export function getTargetBlock(targetPosition: NodePosition, blockNode: STNode): BlockStatement {
    // Go through block statements to identify which block represent the target position
    if (
        STKindChecker.isBlockStatement(blockNode) ||
        (STKindChecker.isFunctionBodyBlock(blockNode) &&
            blockNode.position?.startLine < targetPosition.startLine &&
            blockNode.position?.endLine >= targetPosition.startLine)
    ) {
        // Go through each statements to find exact block
        const blockStatements = blockNode.statements as STNode[];
        if (!blockStatements || blockStatements.length === 0) {
            // Empty block
            return blockNode;
        }

        const targetBlock = blockStatements?.find(
            (block) =>
                block.position?.startLine < targetPosition.startLine &&
                block.position?.endLine >= targetPosition.startLine
        );
        if (!targetBlock) {
            return blockNode;
        }

        switch (targetBlock.kind) {
            case "IfElseStatement":
                const ifBlock = getTargetIfBlock(targetPosition, targetBlock as IfElseStatement);
                return getTargetBlock(targetPosition, ifBlock);
            case "ForeachStatement":
                return getTargetBlock(targetPosition, (targetBlock as ForeachStatement).blockStatement);
            case "WhileStatement":
                return getTargetBlock(targetPosition, (targetBlock as WhileStatement).whileBody);
            case "DoStatement":
                return getTargetBlock(targetPosition, (targetBlock as DoStatement).blockStatement);
            default:
                return targetBlock as BlockStatement;
        }
    }
    return null;
}

export function getTargetIfBlock(targetPosition: NodePosition, blockNode: IfElseStatement): BlockStatement {
    if (
        STKindChecker.isIfElseStatement(blockNode) &&
        blockNode.ifBody.position?.startLine < targetPosition.startLine &&
        blockNode.ifBody.position?.endLine >= targetPosition.startLine
    ) {
        return blockNode.ifBody;
    }
    if (
        STKindChecker.isIfElseStatement(blockNode) &&
        STKindChecker.isElseBlock(blockNode.elseBody) &&
        STKindChecker.isIfElseStatement(blockNode.elseBody.elseBody) &&
        blockNode.elseBody.elseBody.position?.startLine < targetPosition.startLine &&
        blockNode.elseBody.elseBody.position?.endLine >= targetPosition.startLine
    ) {
        return getTargetIfBlock(targetPosition, blockNode.elseBody.elseBody);
    }
    if (
        STKindChecker.isElseBlock(blockNode.elseBody) &&
        STKindChecker.isBlockStatement(blockNode.elseBody.elseBody) &&
        blockNode.elseBody.position?.startLine < targetPosition.startLine &&
        blockNode.elseBody.position?.endLine >= targetPosition.startLine
    ) {
        return blockNode.elseBody.elseBody;
    }
    return null;
}

export function getConnectorFromVisibleEp(endpoint: VisibleEndpoint) {
    const connector: BallerinaConnectorInfo = {
        name: endpoint.typeName,
        moduleName: endpoint.moduleName,
        package: {
            organization: endpoint.orgName,
            name: endpoint.packageName,
            version: endpoint.version,
        },
        functions: [],
    };
    return connector;
}
