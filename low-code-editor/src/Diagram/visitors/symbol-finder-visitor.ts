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
import {
    ActionStatement,
    AssignmentStatement,
    CallStatement,
    CaptureBindingPattern,
    CheckAction,
    ForeachStatement,
    FunctionDefinition,
    ListenerDeclaration,
    LocalVarDecl,
    MethodCall, ModuleVarDecl, NumericLiteral,
    QualifiedNameReference,
    RecordTypeDesc,
    RequiredParam,
    SimpleNameReference,
    STKindChecker,
    STNode,
    Visitor
} from "@ballerina/syntax-tree";

import { STSymbolInfo } from "../../Definitions";
import { StatementViewState } from "../view-state";

const endPoints: Map<string, STNode> = new Map();
const actions: Map<string, STNode> = new Map();
const variables: Map<string, STNode[]> = new Map();
const configurables: Map<string, STNode> = new Map();
const callStatement: Map<string, STNode[]> = new Map();
const assignmentStatement: Map<string, STNode[]> = new Map();
const variableNameReferences: Map<string, STNode[]> = new Map();
const recordTypeDescriptions: Map<string, STNode> = new Map();
const listeners: Map<string, STNode> = new Map();


class SymbolFindingVisitor implements Visitor {
    public beginVisitLocalVarDecl(node: LocalVarDecl) {
        const stmtViewState: StatementViewState = node.viewState as StatementViewState;
        if (stmtViewState && stmtViewState.isEndpoint) {
            const captureBindingPattern: CaptureBindingPattern =
                node.typedBindingPattern.bindingPattern as CaptureBindingPattern;
            endPoints.set(captureBindingPattern.variableName.value, node);
        } else if (stmtViewState && stmtViewState.isAction) {
            const captureBindingPattern: CaptureBindingPattern =
                node.typedBindingPattern.bindingPattern as CaptureBindingPattern;
            actions.set(captureBindingPattern.variableName.value, node);
        }
        const type: string = getType(node.typedBindingPattern.typeDescriptor);
        if (!type) {
            return;
        }

        if (type.endsWith("[]")) {
            variables.get("array") ? variables.get("array").push(node) : variables.set("array", [node]);
        } else if (type.startsWith("map")) {
            variables.get("map") ? variables.get("map").push(node) : variables.set("map", [node]);
        } else {
            variables.get(type) ? variables.get(type).push(node) : variables.set(type, [node]);
        }
    }

    public beginVisitCallStatement(node: CallStatement) {
        const varType = STKindChecker.isMethodCall(node.expression) ?
            (node.expression as MethodCall).expression.typeData?.symbol?.kind
            : node.typeData?.symbol?.kind;

        const varName = STKindChecker.isMethodCall(node.expression) ?
            (((node.expression as MethodCall).expression) as SimpleNameReference).name?.value
            : node.typeData?.symbol?.name;

        if (varName === undefined || varName === null || varType !== "VARIABLE") {
            return;
        }
        callStatement.get(varName) ? callStatement.get(varName).push(node) : callStatement.set(varName, [node]);
    }

    public beginVisitAssignmentStatement(node: AssignmentStatement) {
        const varType = node.varRef ?
            node.varRef?.typeData?.symbol?.kind
            : node.typeData?.symbol?.kind;

        // TODO : Remove if not necessary
        // const varName = STKindChecker.isNumericLiteral(node.expression) ?
        //     (node.expression as NumericLiteral).literalToken.value
        //     : node.typeData?.symbol?.name;
        let varName;

        if (STKindChecker.isSimpleNameReference(node.varRef)) {
            varName = (node.varRef as SimpleNameReference).name.value;
        }

        if (varName === undefined || varName === null || varType !== "VARIABLE") {
            return;
        }
        assignmentStatement.get(varName) ? assignmentStatement.get(varName).push(node) : assignmentStatement.set(varName, [node]);
    }

    public beginVisitSimpleNameReference(node: SimpleNameReference) {
        const varType = node.typeData?.symbol?.kind;
        const varName = node.name?.value;

        if (varType === "VARIABLE" || varType === "TYPE") {
            variableNameReferences.get(varName) ?
                variableNameReferences.get(varName).push(node)
                : variableNameReferences.set(varName, [node]);
        }
    }

    public beginVisitForeachStatement(node: ForeachStatement) {
        const type: string = getType(node.typedBindingPattern.typeDescriptor);
        if (variables.get(type)) {
            variables.get(type).push(node);
        } else {
            variables.set(type, [node]);
        }
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        node.functionSignature.parameters.forEach((parameter) => {
            if (STKindChecker.isRequiredParam(parameter)) {
                const requiredParam = parameter as RequiredParam;
                const type = getType(requiredParam.typeName);
                if (variables.get(type)) {
                    variables.get(type).push(requiredParam);
                } else {
                    variables.set(type, [requiredParam]);
                }
            }
        });
    }

    public beginVisitRecordTypeDesc(node: RecordTypeDesc) {
        const typeData = node.typeData;
        const typeSymbol = typeData.typeSymbol;
        if (typeSymbol.moduleID) {
            const recordMapKey = `${typeSymbol.moduleID.orgName}/${typeSymbol.moduleID.moduleName}:${typeSymbol.moduleID.version}:${typeSymbol.name}`
            recordTypeDescriptions.set(recordMapKey, node);
        }
    }

    public beginVisitModuleVarDecl(node: ModuleVarDecl) {
        if (STKindChecker.isCaptureBindingPattern(node.typedBindingPattern.bindingPattern) &&
            node.qualifiers.find(token => token.value === "configurable")) {
            const varName = node.typedBindingPattern.bindingPattern.variableName.value;
            configurables.set(varName, node);
        }
    }

    public beginVisitActionStatement(node: ActionStatement) {
        const actionName = (node.expression as CheckAction)?.expression?.methodName?.name?.value;
        if (actionName) {
            actions.set(actionName, node);
        }
    }

    public beginVisitResourcePathSegmentParam(node: any) {
        const type = getType(node.typeDescriptor);

        if (variables.get(type)) {
            variables.get(type).push(node);
        } else {
            variables.set(type, [node]);
        }
    }

    public beginVisitListenerDeclaration(node: ListenerDeclaration) {
        listeners.set(node.variableName.value, node);
    }

}

function getType(typeNode: any): any {
    if (STKindChecker.isVarTypeDesc(typeNode)) {
        return "var";
    } else if (STKindChecker.isIntTypeDesc(typeNode) || STKindChecker.isBooleanTypeDesc(typeNode) ||
        STKindChecker.isFloatTypeDesc(typeNode) || STKindChecker.isDecimalTypeDesc(typeNode) ||
        STKindChecker.isStringTypeDesc(typeNode) || STKindChecker.isJsonTypeDesc(typeNode)) {
        return typeNode.name.value;
    } else if (STKindChecker.isXmlTypeDesc(typeNode)) {
        return typeNode.xmlKeywordToken.value;
    } else if (STKindChecker.isQualifiedNameReference(typeNode)) {
        const nameRef: QualifiedNameReference = typeNode as QualifiedNameReference;
        const packageName = (nameRef.modulePrefix.value === "") ? "" : nameRef.modulePrefix.value + ":";
        return packageName + nameRef.identifier.value;
    } else if (STKindChecker.isSimpleNameReference(typeNode)) {
        const nameRef: SimpleNameReference = typeNode as SimpleNameReference;
        return nameRef.name.value;
    } else if (STKindChecker.isArrayTypeDesc(typeNode)) {
        return getType(typeNode.memberTypeDesc) + "[]";
    } else if (STKindChecker.isUnionTypeDesc(typeNode)) {
        return "union";
    } else if (STKindChecker.isTupleTypeDesc(typeNode)) {
        const tupleTypes: STNode[] = [];
        typeNode.memberTypeDesc.forEach((type) => {
            if (!STKindChecker.isCommaToken(type)) {
                const tupleType: STNode = type as STNode;
                tupleTypes.push(tupleType);
            }
        });
        return "[" + tupleTypes.map((memType) => getType(memType)) + "]";
    } else if (STKindChecker.isParameterizedTypeDesc(typeNode)) {
        return "map<" + getType(typeNode.typeParameter.typeNode) + ">";
    } else if (STKindChecker.isStreamTypeDesc(typeNode)) {
        return "stream<" + getType(typeNode.streamTypeParamsNode.leftTypeDescNode) + ">";
    } else if (STKindChecker.isErrorTypeDesc(typeNode)) {
        return "error";
    } else if (STKindChecker.isOptionalTypeDesc(typeNode)) {
        // return "var";
        return getType(typeNode.typeDescriptor);
    } else if (STKindChecker.isRecordTypeDesc(typeNode)) {
        return 'record';
    } else if (STKindChecker.isSimpleNameReference(typeNode)) {
        return typeNode?.name?.value;
    }
}

export function cleanAll() {
    endPoints.clear();
    actions.clear();
    variables.clear();
    configurables.clear();
    callStatement.clear();
    variableNameReferences.clear();
    assignmentStatement.clear();
    recordTypeDescriptions.clear();
}

export function getSymbolInfo(): STSymbolInfo {
    return {
        endpoints: endPoints,
        actions,
        variables,
        configurables,
        callStatement,
        variableNameReferences,
        assignmentStatement,
        recordTypeDescriptions,
        listeners
    }
}

export const visitor = new SymbolFindingVisitor();
