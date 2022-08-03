/*
 * Copyright (c) 2021, WSO2 Inc. (http://www.wso2.com). All Rights Reserved.
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
import React, { ReactNode } from 'react';
import { IconType } from "react-icons";
import {
    VscSymbolEnum,
    VscSymbolEnumMember, VscSymbolEvent,
    VscSymbolField, VscSymbolInterface, VscSymbolKeyword,
    VscSymbolMethod,
    VscSymbolParameter, VscSymbolRuler,
    VscSymbolStructure,
    VscSymbolVariable
} from "react-icons/vsc";

import {
    CompletionResponse,
    getDiagnosticMessage,
    getFilteredDiagnostics,
    LinePosition,
    ParameterInfo,
    STModification,
    STSymbolInfo,
    SymbolDocumentation
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    Minutiae,
    NodePosition,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import * as expressionTypeComponents from '../components/ExpressionTypes';
import * as formComponents from '../components/Forms/Form';
import { INPUT_EDITOR_PLACEHOLDERS } from "../components/InputEditor/constants";
import * as statementTypeComponents from '../components/Statements';
import {
    ACTION,
    BAL_SOURCE,
    CALL_CONFIG_TYPE,
    CONNECTOR,
    CUSTOM_CONFIG_TYPE,
    END_OF_LINE_MINUTIAE,
    EXPR_CONSTRUCTOR,
    FUNCTION_CALL,
    IGNORABLE_DIAGNOSTICS,
    OTHER_EXPRESSION,
    OTHER_STATEMENT,
    PLACEHOLDER_DIAGNOSTICS,
    StatementNodes, SymbolParameterType,
    WHITESPACE_MINUTIAE
} from "../constants";
import {
    EditorModel, MinutiaeJSX,
    RemainingContent,
    StmtDiagnostic,
    StmtOffset, SuggestionIcon,
    SuggestionItem,
    SymbolIcon
} from '../models/definitions';
import { visitor as ClearDiagnosticVisitor } from "../visitors/clear-diagnostics-visitor";
import { visitor as DeleteConfigSetupVisitor } from "../visitors/delete-config-setup-visitor";
import { visitor as DiagnosticsMappingVisitor } from "../visitors/diagnostics-mapping-visitor";
import { visitor as ExpressionDeletingVisitor } from "../visitors/expression-deleting-visitor";
import { visitor as ModelFindingVisitor } from "../visitors/model-finding-visitor";
import { visitor as ModelTypeSetupVisitor } from "../visitors/model-type-setup-visitor";
import { visitor as MultilineConstructsConfigSetupVisitor } from "../visitors/multiline-constructs-config-setup-visitor";
import { nextNodeSetupVisitor } from "../visitors/next-node--setup-visitor";
import { parentFunctionSetupVisitor } from "../visitors/parent-function-setup-visitor";
import { visitor as ParentModelFindingVisitor } from "../visitors/parent-model-finding-visitor";
import { parentSetupVisitor } from '../visitors/parent-setup-visitor';
import { viewStateSetupVisitor as ViewStateSetupVisitor } from "../visitors/view-state-setup-visitor";

import { ExpressionGroup } from "./expressions";
import { ModelType, StatementEditorViewState } from "./statement-editor-viewstate";
import { getImportModification, getStatementModification, keywords } from "./statement-modifications";

export function getModifications(model: STNode, configType: string, targetPosition: NodePosition,
                                 modulesToBeImported?: string[]): STModification[] {

    const modifications: STModification[] = [];
    let source = model.source;

    if (configType === CUSTOM_CONFIG_TYPE && !isEndsWithoutSemicolon(model) && source.trim().slice(-1) !== ';') {
        source += ';';
    }
    modifications.push(getStatementModification(source, targetPosition));

    if (modulesToBeImported) {
        modulesToBeImported.map((moduleNameStr: string) => {
            modifications.push(getImportModification(moduleNameStr));
        });
    }

    return modifications;
}

export function getExpressionTypeComponent(expression: STNode, stmtPosition?: NodePosition): ReactNode {
    let ExprTypeComponent = (expressionTypeComponents as any)[expression.kind];

    if (!ExprTypeComponent) {
        ExprTypeComponent = (expressionTypeComponents as any)[OTHER_EXPRESSION];
    }

    return (
        <ExprTypeComponent
            model={expression}
            stmtPosition={stmtPosition}
        />
    );
}

export function getStatementTypeComponent(
    model: StatementNodes
): ReactNode {
    let StatementTypeComponent = (statementTypeComponents as any)[model?.kind];

    if (!StatementTypeComponent) {
        StatementTypeComponent = (statementTypeComponents as any)[OTHER_STATEMENT];
    }

    return (
        <StatementTypeComponent
            model={model}
        />
    );
}

export function getFormComponent(type: string, model: STNode, completions: SuggestionItem[]): ReactNode {
    const FormComponent = (formComponents as any)[type];
    return (
        <FormComponent
            model={model}
            completions={completions}
        />
    );
}

export function getCurrentModel(position: NodePosition, model: STNode): STNode {
    ModelFindingVisitor.setPosition(position);
    traversNode(model, ModelFindingVisitor);

    return ModelFindingVisitor.getModel();
}

export function getParentFunctionModel(position: NodePosition, model: STNode): STNode {
    ParentModelFindingVisitor.setPosition(position);
    traversNode(model, ParentModelFindingVisitor);

    return ParentModelFindingVisitor.getModel();
}

export function getNextNode(currentModel: STNode, statementModel: STNode): STNode {
    nextNodeSetupVisitor.setPropetiesDefault();
    nextNodeSetupVisitor.setCurrentNode(currentModel)

    traversNode(statementModel, nextNodeSetupVisitor);

    return nextNodeSetupVisitor.getNextNode();
}
export function getPreviousNode(currentModel: STNode, statementModel: STNode): STNode {
    nextNodeSetupVisitor.setPropetiesDefault();
    nextNodeSetupVisitor.setCurrentNode(currentModel)

    traversNode(statementModel, nextNodeSetupVisitor);

    return nextNodeSetupVisitor.getPreviousNode();
}

export function enrichModel(model: STNode, targetPosition: NodePosition, diagnostics?: Diagnostic[]): STNode {
    traversNode(model, ViewStateSetupVisitor);
    traversNode(model, parentSetupVisitor);
    traversNode(model, MultilineConstructsConfigSetupVisitor);
    model = enrichModelWithDiagnostics(model, targetPosition, diagnostics);
    return enrichModelWithViewState(model);
}

export function enrichModelWithDiagnostics(model: STNode, targetPosition: NodePosition,
                                           diagnostics: Diagnostic[]): STNode {
    if (diagnostics) {
        const offset: StmtOffset = {
            startColumn: targetPosition.startColumn,
            startLine: targetPosition.startLine
        }
        traversNode(model, ClearDiagnosticVisitor);
        diagnostics.map(diagnostic => {
            DiagnosticsMappingVisitor.setDiagnosticsNOffset(diagnostic, offset);
            traversNode(model, DiagnosticsMappingVisitor);
        });
    }
    return model;
}

export function enrichModelWithViewState(model: STNode): STNode  {
    traversNode(model, DeleteConfigSetupVisitor);
    traversNode(model, ModelTypeSetupVisitor);
    traversNode(model, parentFunctionSetupVisitor);

    return model;
}

export function getRemainingContent(position: NodePosition, model: STNode): RemainingContent {
    ExpressionDeletingVisitor.setPosition(position);
    traversNode(model, ExpressionDeletingVisitor);

    return ExpressionDeletingVisitor.getContent();
}

export function isPositionsEquals(position1: NodePosition, position2: NodePosition): boolean {
    return position1?.startLine === position2?.startLine &&
        position1?.startColumn === position2?.startColumn &&
        position1?.endLine === position2?.endLine &&
        position1?.endColumn === position2?.endColumn;
}

export function isDiagnosticInRange(diagPosition: NodePosition, nodePosition: NodePosition): boolean {
    return diagPosition?.startLine >= nodePosition?.startLine &&
        diagPosition?.startColumn >= nodePosition?.startColumn &&
        diagPosition?.endLine <= nodePosition?.endLine &&
        (((diagPosition?.startLine === nodePosition?.startLine) && (diagPosition?.endLine === nodePosition?.
            endLine)) ? (diagPosition?.endColumn <= nodePosition?.endColumn) : true);
}

export function isNodeInRange(nodePosition: NodePosition, parentPosition: NodePosition): boolean {
    return nodePosition?.startLine >= parentPosition?.startLine &&
        (nodePosition?.startLine === parentPosition?.startLine ? nodePosition?.startColumn >= parentPosition?.startColumn : true) &&
        nodePosition?.endLine <= parentPosition?.endLine &&
        (nodePosition?.endLine === parentPosition?.endLine ? nodePosition?.endColumn <= parentPosition?.endColumn : true);
}

export function isOperator(modelType: number): boolean {
    return modelType === ModelType.OPERATOR;
}

export function isBindingPattern(modelType: number): boolean {
    return modelType === ModelType.BINDING_PATTERN;
}

export function isDescriptionWithExample(doc : string): boolean {
    return doc?.includes(BAL_SOURCE);
}

export function getDocDescription(doc: string) : string[] {
    return doc.split(BAL_SOURCE);
}

export function getFilteredDiagnosticMessages(statement: string, targetPosition: NodePosition,
                                              diagnostics: Diagnostic[]): StmtDiagnostic[] {

    const stmtDiagnostics: StmtDiagnostic[] = [];
    const diag = getFilteredDiagnostics(diagnostics, false);
    const noOfLines = statement.trim().split('\n').length;
    const diagTargetPosition: NodePosition = {
        startLine: targetPosition.startLine || 0,
        startColumn: targetPosition.startColumn || 0,
        endLine: targetPosition?.startLine + noOfLines - 1 || targetPosition.startLine,
        endColumn: targetPosition?.endColumn || 0
    };

    getDiagnosticMessage(diag, diagTargetPosition, 0, statement.length, 0, 0).split('. ').map(message => {
            let isPlaceHolderDiag = false;
            if (PLACEHOLDER_DIAGNOSTICS.some(msg => message.includes(msg))
                || (/const.+=.*EXPRESSION.*;/.test(statement) && IGNORABLE_DIAGNOSTICS.includes(message))) {
                isPlaceHolderDiag = true;
            }
            if (!!message) {
                stmtDiagnostics.push({message, isPlaceHolderDiag});
            }
        });

    return stmtDiagnostics;
}

export function isPlaceHolderExists (statement: string) : boolean {
    return PLACEHOLDER_DIAGNOSTICS.some(placeHolder => (statement ? statement : "").includes(placeHolder))
}

export function getUpdatedSource(statement: string, currentFileContent: string,
                                 targetPosition: NodePosition, moduleList?: Set<string>,
                                 skipSemiColon?: boolean): string {

    const updatedStatement = skipSemiColon ? statement : (statement.trim().endsWith(';') ? statement : statement + ';');
    let updatedContent: string = addToTargetPosition(currentFileContent, targetPosition, updatedStatement);
    if (moduleList?.size > 0) {
        updatedContent = addImportStatements(updatedContent, Array.from(moduleList) as string[]);
    }

    return updatedContent;
}

export function addToTargetPosition(currentContent: string, position: NodePosition, codeSnippet: string): string {

    const splitContent: string[] = currentContent.split(/\n/g) || [];
    const splitCodeSnippet: string[] = codeSnippet.trimEnd().split(/\n/g) || [];
    const noOfLines: number = position.endLine - position.startLine + 1;
    const startLine = splitContent[position.startLine].slice(0, position.startColumn);
    const endLine = isFinite(position?.endLine) ?
        splitContent[position.endLine].slice(position.endColumn || position.startColumn) : '';

    const replacements = splitCodeSnippet.map((line, index) => {
        let modifiedLine = line;
        if (index === 0) {
            modifiedLine = startLine + modifiedLine;
        }
        if (index === splitCodeSnippet.length - 1) {
            modifiedLine = modifiedLine + endLine;
        }
        if (index > 0) {
            modifiedLine = " ".repeat(position.startColumn) + modifiedLine;
        }
        return modifiedLine;
    });

    splitContent.splice(position.startLine, noOfLines, ...replacements);

    return splitContent.join('\n');
}

export function addImportStatements(
    currentFileContent: string,
    modulesToBeImported: string[]): string {
    let moduleList : string = "";
    modulesToBeImported.forEach(module => {
        moduleList += "import " + module + "; ";
    });
    return moduleList + currentFileContent;
}

export function getMinutiaeJSX(model: STNode): MinutiaeJSX {
    return {
        leadingMinutiaeJSX: getJSXForMinutiae(model?.leadingMinutiae),
        trailingMinutiaeJSX: getJSXForMinutiae(model?.trailingMinutiae)
    };
}

export function getJSXForMinutiae(minutiae: Minutiae[], dropEndOfLineMinutiaeJSX: boolean = false): ReactNode[] {
    return minutiae?.map((element) => {
        if (element.kind === WHITESPACE_MINUTIAE) {
            return Array.from({length: element.minutiae.length}, () => <>&nbsp;</>);
        } else if (element.kind === END_OF_LINE_MINUTIAE && !dropEndOfLineMinutiaeJSX) {
            return <br/>;
        }
    });
}

export function getClassNameForToken(model: STNode): string {
    let className = '';

    if (STKindChecker.isBooleanLiteral(model)) {
        className = 'boolean-literal';
    } else if (STKindChecker.isNumericLiteral(model)) {
        className = 'numeric-literal';
    } else if (STKindChecker.isStringLiteralToken(model)) {
        className = 'string-literal';
    } else if (STKindChecker.isBooleanKeyword(model)) {
        className = 'type-descriptor boolean';
    } else if (STKindChecker.isDecimalKeyword(model)) {
        className = 'type-descriptor decimal';
    } else if (STKindChecker.isFloatKeyword(model)) {
        className = 'type-descriptor float';
    } else if (STKindChecker.isIntKeyword(model)) {
        className = 'type-descriptor int';
    } else if (STKindChecker.isJsonKeyword(model)) {
        className = 'type-descriptor json';
    } else if (STKindChecker.isStringKeyword(model)) {
        className = 'type-descriptor string';
    } else if (STKindChecker.isVarKeyword(model)) {
        className = 'type-descriptor var';
    }

    return className;
}

export function getSuggestionIconStyle(suggestionType: number): SuggestionIcon {
    let suggestionIconColor: string;
    let suggestionIcon: IconType;
    switch (suggestionType) {
        case 3:
            suggestionIcon = VscSymbolMethod;
            suggestionIconColor = "#652d90";
            break;
        case 5:
            suggestionIcon = VscSymbolField;
            suggestionIconColor = "#007acc";
            break;
        case 6:
            suggestionIcon = VscSymbolVariable;
            suggestionIconColor = "#007acc";
            break;
        case 11:
            suggestionIcon = VscSymbolRuler;
            suggestionIconColor = "#616161";
            break;
        case 14:
            suggestionIcon = VscSymbolKeyword;
            suggestionIconColor = "#616161";
            break;
        case 20:
            suggestionIcon = VscSymbolEnumMember;
            suggestionIconColor = "#007acc";
            break;
        case 22:
            suggestionIcon = VscSymbolStructure;
            suggestionIconColor = "#616161";
            break;
        case 25:
            suggestionIcon = VscSymbolParameter;
            suggestionIconColor = "#616161";
            break;
        default:
            suggestionIcon = VscSymbolVariable;
            suggestionIconColor = "#007acc";
            break;
    }
    return {
        SuggestIcon: suggestionIcon,
        color: suggestionIconColor
    };
}

export function sortSuggestions(x: CompletionResponse, y: CompletionResponse) {
    if (!!x.sortText && !!y.sortText) {
        return x.sortText.localeCompare(y.sortText);
    }
    return 0;
}

export function getSelectedModelPosition(codeSnippet: string, targetedPosition: NodePosition): NodePosition {
    let selectedModelPosition : NodePosition = {
        ...targetedPosition,
        endColumn: targetedPosition.startColumn + codeSnippet.length
    };

    if (codeSnippet.startsWith(',\n') || codeSnippet.startsWith('\n')) {
        selectedModelPosition = {
            startLine: targetedPosition.startLine + 1,
            endLine: targetedPosition.endLine + codeSnippet.split('\n').length - 1,
            startColumn: 0,
            endColumn: targetedPosition.startColumn + codeSnippet.length
        };
    }

    return selectedModelPosition;
}

export function getModuleElementDeclPosition(syntaxTree: STNode): NodePosition {
    const position: NodePosition = {
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 0,
    };
    if (STKindChecker.isModulePart(syntaxTree) && syntaxTree.imports.length > 0) {
        const lastImportPosition = syntaxTree.imports[syntaxTree.imports.length - 1].position;
        position.startLine = lastImportPosition?.endLine + 1;
        position.endLine = lastImportPosition?.endLine + 1;
    }
    return position;
}

export function isNodeDeletable(selectedNode: STNode, formType: string): boolean {
    const stmtViewState: StatementEditorViewState = selectedNode.viewState as StatementEditorViewState;
    const currentModelSource = selectedNode.source
        ? selectedNode.source.trim()
        : selectedNode.value ? selectedNode.value.trim() : '';

    let exprDeletable = !stmtViewState.exprNotDeletable;
    if (INPUT_EDITOR_PLACEHOLDERS.has(currentModelSource)) {
        exprDeletable =  stmtViewState.templateExprDeletable;
    }else if (formType === CALL_CONFIG_TYPE && STKindChecker.isFunctionCall(selectedNode)) {
        exprDeletable = false;
    }

    return exprDeletable;
}

export function isConfigAllowedTypeDesc(typeDescNode: STNode): boolean {
    return (
        !STKindChecker.isAnyTypeDesc(typeDescNode)
        && !STKindChecker.isErrorTypeDesc(typeDescNode)
        && !STKindChecker.isFunctionTypeDesc(typeDescNode)
        && !STKindChecker.isJsonTypeDesc(typeDescNode)
        && !STKindChecker.isObjectTypeDesc(typeDescNode)
        && !STKindChecker.isOptionalTypeDesc(typeDescNode)
        && !STKindChecker.isMapTypeDesc(typeDescNode)
        && !STKindChecker.isStreamTypeDesc(typeDescNode)
        && !STKindChecker.isTableTypeDesc(typeDescNode)
        && !STKindChecker.isVarTypeDesc(typeDescNode)
    );
}

export function enclosableWithParentheses(model: any): boolean {
    return (model.viewState as StatementEditorViewState).modelType === ModelType.EXPRESSION
        && (
            !STKindChecker.isBracedExpression(model)
            && !STKindChecker.isBlockStatement(model)
            && !STKindChecker.isFieldAccess(model)
            && !STKindChecker.isOptionalFieldAccess(model)
            && !STKindChecker.isFunctionCall(model)
            && !STKindChecker.isMethodCall(model)
            && !STKindChecker.isInterpolation(model)
            && !STKindChecker.isListConstructor(model)
            && !STKindChecker.isMappingConstructor(model)
            && !STKindChecker.isTableConstructor(model)
            && !STKindChecker.isQualifiedNameReference(model)
            && !STKindChecker.isRawTemplateExpression(model)
            && !STKindChecker.isStringTemplateExpression(model)
            && !STKindChecker.isXmlTemplateExpression(model)
            && !STKindChecker.isComputedNameField(model)
            && !STKindChecker.isSpecificField(model)
            && !STKindChecker.isTypeTestExpression(model)
            && !STKindChecker.isStringLiteral(model)
            && !STKindChecker.isNumericLiteral(model)
            && !STKindChecker.isBooleanLiteral(model)
            && !STKindChecker.isNilLiteral(model)
            && !STKindChecker.isNullLiteral(model)
            && !model?.isToken
        );
}

export function getExistingConfigurable(selectedModel: STNode, stSymbolInfo: STSymbolInfo): STNode {
    const currentModelSource = selectedModel.source ? selectedModel.source.trim() : selectedModel.value.trim();
    const isExistingConfigurable = stSymbolInfo.configurables.has(currentModelSource);
    if (isExistingConfigurable) {
        return stSymbolInfo.configurables.get(currentModelSource);
    }
    return undefined;
}

export function getModuleIconStyle(label: string): SuggestionIcon {
    let suggestionIcon: IconType;
    let suggestionIconColor: string;
    switch (label) {
        case "Functions":
            suggestionIcon = VscSymbolMethod;
            suggestionIconColor = "#652d90";
            break;
        case "Classes":
            suggestionIcon = VscSymbolInterface;
            suggestionIconColor = "#007acc";
            break;
        case "Constants":
            suggestionIcon = VscSymbolVariable;
            suggestionIconColor = "#007acc";
            break;
        case "Errors":
            suggestionIcon = VscSymbolEvent;
            suggestionIconColor = "#d67e00";
            break;
        case "Enums":
            suggestionIcon = VscSymbolEnum;
            suggestionIconColor = "#d67e00";
            break;
        case "Records":
            suggestionIcon = VscSymbolStructure;
            suggestionIconColor = "#616161";
            break;
        case "Types":
            suggestionIcon = VscSymbolRuler;
            break;
        case "Listeners":
            suggestionIcon = VscSymbolVariable;
            suggestionIconColor = "#007acc";
            break;
        default:
            suggestionIcon = VscSymbolInterface;
            suggestionIconColor = "#007acc";
            break;
    }
    return {
        SuggestIcon: suggestionIcon,
        color: suggestionIconColor
    };
}

export function isFunctionOrMethodCall(currentModel: STNode): boolean {
    return STKindChecker.isFunctionCall(currentModel) || STKindChecker.isMethodCall(currentModel);
}

export function isInsideConnectorParams(currentModel: STNode, editorConfigType: string): boolean {
    const paramPosition = (currentModel.viewState as StatementEditorViewState)?.parentFunctionPos;
    const modelPosition = currentModel.position as NodePosition;
    return (
        (editorConfigType === CONNECTOR || editorConfigType === ACTION) &&
        paramPosition &&
        (paramPosition.startLine < modelPosition.startLine ||
            (getNumericPosition(paramPosition.startLine) === getNumericPosition(modelPosition.startLine) &&
                getNumericPosition(paramPosition.startColumn) <= getNumericPosition(modelPosition.startColumn) &&
                getNumericPosition(paramPosition.endLine) > getNumericPosition(modelPosition.endLine)) ||
            (getNumericPosition(paramPosition.endLine) === getNumericPosition(modelPosition.endLine) &&
                getNumericPosition(paramPosition.endColumn) >= getNumericPosition(modelPosition.endColumn)))
    );
}

function getNumericPosition(position: number) {
    return position || 0;
}

export function isConfigurableEditor(editors: EditorModel[], activeEditorId: number): boolean {
    if (editors?.length > activeEditorId) {
        const activeEditor = editors[activeEditorId];
        return activeEditor.isConfigurableStmt ?? false;
    }
    return false;
}

export function getSymbolPosition(targetPos: NodePosition, currentModel: STNode, userInput: string): LinePosition{
    let position: LinePosition;
    if (STKindChecker.isFunctionCall(currentModel)){
        position = {
            line : targetPos.startLine + currentModel.position.startLine,
            offset : (STKindChecker.isQualifiedNameReference(currentModel.functionName)) ?
                targetPos.startColumn + currentModel.functionName.identifier.position.endColumn - 1 :
                targetPos.startColumn + currentModel.functionName.name.position.endColumn - 1

        }
        return  position;
    } else if (STKindChecker.isImplicitNewExpression(currentModel) || STKindChecker.isExplicitNewExpression(currentModel)){
        position = {
            line : targetPos.startLine + currentModel.position.startLine,
            offset : targetPos.startColumn + currentModel.parenthesizedArgList.position.startColumn
        }
        return  position;
    } else if (STKindChecker.isMethodCall(currentModel)) {
        position = {
            line: targetPos.startLine + currentModel.methodName.position.startLine,
            offset: targetPos.startColumn + currentModel.methodName.position.startColumn
        }
        return position;
    } else if (STKindChecker.isImplicitNewExpression(currentModel)){
        position = {
            line : targetPos.startLine + currentModel.position.startLine,
            offset : targetPos.startColumn + currentModel.parenthesizedArgList.position.startColumn
        }
        return  position;
    } else if (STKindChecker.isMethodCall(currentModel)) {
        position = {
            line: targetPos.startLine + currentModel.methodName.position.startLine,
            offset: targetPos.startColumn + currentModel.methodName.position.startColumn
        }
        return position;
    }
    position = {
        line : targetPos.startLine + currentModel.position.startLine,
        offset : targetPos.startColumn + currentModel.position.startColumn + userInput.length
    }
    return position;
}

export function isDocumentationSupportedModel(currentModel: STNode): boolean {
    return (isFunctionOrMethodCall(currentModel) || STKindChecker.isImplicitNewExpression(currentModel) ||
        STKindChecker.isExplicitNewExpression(currentModel));
}

export function getCurrentModelParams(currentModel: STNode): STNode[] {
    const paramsInModel: STNode[] = [];
    if (STKindChecker.isFunctionCall(currentModel) || STKindChecker.isMethodCall(currentModel)) {
        currentModel.arguments.forEach((parameter: any) => {
            if (!parameter.isToken) {
                paramsInModel.push(parameter);
            }
        });
    } else if (STKindChecker.isImplicitNewExpression(currentModel) || STKindChecker.isExplicitNewExpression(currentModel)) {
        currentModel.parenthesizedArgList.arguments.forEach((parameter: any) => {
            if (!parameter.isToken) {
                paramsInModel.push(parameter);
            }
        });
    }
    return paramsInModel;
}

export function updateParamDocWithParamPositions(paramsInModel: STNode[], documentation : SymbolDocumentation) : SymbolDocumentation {
    const updatedDocWithPositions : SymbolDocumentation = JSON.parse(JSON.stringify(documentation));
    paramsInModel.map((param: STNode, value: number) => {
        if (STKindChecker.isNamedArg(param)) {
            for (const docParam of updatedDocWithPositions.parameters){
                if (keywords.includes(docParam.name) ?
                    param.argumentName.name.value === "'" + docParam.name :
                    param.argumentName.name.value === docParam.name ||
                    docParam.kind === SymbolParameterType.INCLUDED_RECORD ||
                    docParam.kind === SymbolParameterType.REST){
                    // TODO: remove the special case for included records once the LS support the documentation for fields in records
                    if (docParam.kind === SymbolParameterType.INCLUDED_RECORD) {
                        const includedRecordFields : ParameterInfo = {
                            type: undefined,
                            name: param.argumentName.name.value,
                            kind: undefined,
                            modelPosition: param.position
                        }
                        if (docParam.fields) {
                            if (!docParam.fields.find((filedParam) => {
                                return (isPositionsEquals(filedParam.modelPosition, param.position) &&
                                    filedParam.name === param.argumentName.name.value)
                            }
                            )){
                                docParam.fields.push(includedRecordFields);
                            }
                        } else {
                            const fieldList : ParameterInfo[] = [includedRecordFields];
                            docParam.fields = fieldList;
                        }
                        break;
                    }
                    docParam.modelPosition = param.position;
                    break;
                }
            }
        } else {
            if (updatedDocWithPositions.parameters[value]){
                updatedDocWithPositions.parameters[value].modelPosition = param.position;
            }
        }
    });

    return updatedDocWithPositions;
}

export function getUpdatedContentOnCheck(currentModel: STNode, param: ParameterInfo, parameters: ParameterInfo[]) : string {
    const modelParams: string[] = getModelParamSourceList(currentModel);

    if (param.kind === SymbolParameterType.DEFAULTABLE) {
        containsMultipleDefaultableParams(parameters) ? (
                modelParams.push((keywords.includes(param.name) ?
                `'${param.name} = ${EXPR_CONSTRUCTOR}` :
                `${param.name} = ${EXPR_CONSTRUCTOR}`))
            ) :
            modelParams.push(`${EXPR_CONSTRUCTOR}`);
    } else if (param.kind === SymbolParameterType.REST) {
        modelParams.push(EXPR_CONSTRUCTOR);
    } else {
        modelParams.push(param.name);
    }

    const content: string = "(" + modelParams.join(",") + ")";
    return content;
}

function containsMultipleDefaultableParams(parameters: ParameterInfo[]): boolean {
    let defaultableParams = 0;
    const found = parameters.find((param) => {
        if (param.kind === SymbolParameterType.DEFAULTABLE) {
            if (defaultableParams > 0) {
                return param;
            } else {
                defaultableParams++;
            }
        }
    })
    return !!found;
}

export function getUpdatedContentOnUncheck(currentModel: STNode, paramPosition: NodePosition) : string {
    const modelParams: string[] = [];
    if (STKindChecker.isFunctionCall(currentModel) || STKindChecker.isMethodCall(currentModel)) {
        currentModel.arguments.filter((parameter: any) => !STKindChecker.isCommaToken(parameter)).
        map((parameter: STNode) => {
            if (parameter.position !== paramPosition) {
                modelParams.push(parameter.source);
            }
        });
    } else if (STKindChecker.isImplicitNewExpression(currentModel) || STKindChecker.isExplicitNewExpression(currentModel)){
        currentModel.parenthesizedArgList.arguments.filter((parameter: any) => !STKindChecker.isCommaToken(parameter)).
        map((parameter: STNode) => {
            if (parameter.position !== paramPosition) {
                modelParams.push(parameter.source);
            }
        });
    }

    const content: string = "(" + modelParams.join(",") + ")";
    return content;
}

export function getUpdatedContentForNewNamedArg(currentModel: STNode, userInput: string) : string {
    const modelParams: string[] = getModelParamSourceList(currentModel);
    modelParams.push(`${userInput} = ${EXPR_CONSTRUCTOR}`);
    const content: string = "(" + modelParams.join(",") + ")";
    return content
}

// TODO: Remove this function once the methodCall param filter is added to the LS
export function updateParamListFordMethodCallDoc(paramsInModel: STNode[],  documentation : SymbolDocumentation) : SymbolDocumentation {
    const updatedMethodParams : SymbolDocumentation = JSON.parse(JSON.stringify(documentation));
    if (paramsInModel[0]?.source === undefined || updatedMethodParams.parameters[0]?.name !==  paramsInModel[0]?.source){
        if (updatedMethodParams.parameters[0]?.kind === SymbolParameterType.REQUIRED){
            updatedMethodParams.parameters.splice(0, 1);
        }
    }

    return updatedMethodParams;
}

export function getExprWithArgs(suggestionValue: string, prefix?: string): string {
    const paramRegex = /\w+\((.*)\)/m;
    const params = paramRegex.exec(suggestionValue);
    let exprWithArgs = suggestionValue;
    if (params) {
        let paramList = params[1].split(',');
        paramList = paramList.map((param: string) => {
            return param.trim().split(' ').pop();
        });
        exprWithArgs = suggestionValue.replace(params[1], paramList.toString());
    }
    return prefix ? prefix + exprWithArgs : exprWithArgs;
}

export function getFilteredExpressions(expression : ExpressionGroup[], currentModel: STNode): ExpressionGroup[] {
    return expression.filter(
        (exprGroup) => exprGroup.relatedModelType === currentModel.viewState.modelType ||
            (currentModel.viewState.modelType === ModelType.FIELD_ACCESS &&
                exprGroup.relatedModelType === ModelType.EXPRESSION) ||
            (currentModel.viewState.modelType === ModelType.ORDER_KEY &&
                (exprGroup.relatedModelType === ModelType.EXPRESSION ||
                    exprGroup.relatedModelType === ModelType.ORDER_KEY)));
}

export function eligibleForLevelTwoSuggestions(selectedModel: STNode, selection: string): boolean {
    return (selectedModel.viewState as StatementEditorViewState).modelType === ModelType.EXPRESSION
        && selection !== '?';
}

function getModelParamSourceList(currentModel: STNode): string[] {
    const modelParams: string[] = [];
    if (STKindChecker.isFunctionCall(currentModel) || STKindChecker.isMethodCall(currentModel)) {
        currentModel.arguments.filter((parameter: any) => !STKindChecker.isCommaToken(parameter)).
        map((parameter: STNode) => {
            modelParams.push(parameter.source);
        });
    } else if (STKindChecker.isImplicitNewExpression(currentModel) || STKindChecker.isExplicitNewExpression(currentModel)){
        currentModel.parenthesizedArgList.arguments.filter((parameter: any) => !STKindChecker.isCommaToken(parameter)).
        map((parameter: STNode) => {
            modelParams.push(parameter.source);
        });
    }
    return modelParams;
}

export function getParamUpdateModelPosition(model: STNode) {
    let position : NodePosition;
    if (
        STKindChecker.isFunctionCall(model) ||
        STKindChecker.isMethodCall(model) ||
        STKindChecker.isRemoteMethodCallAction(model)
    ) {
        position = {
            startLine: model.openParenToken.position.startLine,
            startColumn: model.openParenToken.position.startColumn,
            endLine: model.closeParenToken.position.endLine,
            endColumn: model.closeParenToken.position.endColumn,
        };
    } else if (STKindChecker.isImplicitNewExpression(model) || STKindChecker.isExplicitNewExpression(model)) {
        position = {
            startLine: model.parenthesizedArgList.openParenToken.position.startLine,
            startColumn: model.parenthesizedArgList.openParenToken.position.startColumn,
            endLine: model.parenthesizedArgList.closeParenToken.position.endLine,
            endColumn: model.parenthesizedArgList.closeParenToken.position.endColumn,
        };
    } else if (STKindChecker.isCheckExpression(model) && STKindChecker.isImplicitNewExpression(model.expression)) {
        position = {
            startLine: model.expression.parenthesizedArgList.openParenToken.position.startLine,
            startColumn: model.expression.parenthesizedArgList.openParenToken.position.startColumn,
            endLine: model.expression.parenthesizedArgList.closeParenToken.position.endLine,
            endColumn: model.expression.parenthesizedArgList.closeParenToken.position.endColumn,
        };
    }
    return position;
}

export function isEndsWithoutSemicolon(completeModel: STNode): boolean {
    return STKindChecker.isForeachStatement(completeModel)
        || STKindChecker.isIfElseStatement(completeModel)
        || STKindChecker.isWhileStatement(completeModel)
        || STKindChecker.isDoStatement(completeModel)
        || STKindChecker.isMatchStatement(completeModel)
        || STKindChecker.isNamedWorkerDeclaration(completeModel)
        || STKindChecker.isTransactionStatement(completeModel)
        || STKindChecker.isForkStatement(completeModel)
        || STKindChecker.isLockStatement(completeModel)
        || STKindChecker.isBlockStatement(completeModel)
}

export function getParamHighlight(currentModel : STNode, param: ParameterInfo){
    return (
        currentModel && param ?
            { backgroundColor: isPositionsEquals(currentModel.position, param.modelPosition) ?
                    "rgba(204,209,242,0.61)" : 'inherit'} : undefined
    );
}
