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

import {
    CompletionResponse,
    getDiagnosticMessage,
    getFilteredDiagnostics,
    LinePosition, ParameterInfo,
    STModification,
    STSymbolInfo, SymbolDocumentation
} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    FunctionCall,
    Minutiae,
    NodePosition,
    STKindChecker,
    STNode,
    traversNode
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import * as expressionTypeComponents from '../components/ExpressionTypes';
import { INPUT_EDITOR_PLACEHOLDERS } from "../components/InputEditor/constants";
import * as statementTypeComponents from '../components/Statements';
import {
    BAL_SOURCE,
    CUSTOM_CONFIG_TYPE,
    END_OF_LINE_MINUTIAE, EXPR_CONSTRUCTOR,
    OTHER_EXPRESSION,
    OTHER_STATEMENT,
    PLACEHOLDER_DIAGNOSTICS,
    StatementNodes, SymbolParameterType,
    WHITESPACE_MINUTIAE
} from "../constants";
import { MinutiaeJSX, RemainingContent, StmtDiagnostic, StmtOffset } from '../models/definitions';
import { visitor as DeleteConfigSetupVisitor } from "../visitors/delete-config-setup-visitor";
import { visitor as DiagnosticsMappingVisitor } from "../visitors/diagnostics-mapping-visitor";
import { visitor as ExpressionDeletingVisitor } from "../visitors/expression-deleting-visitor";
import { visitor as ModelFindingVisitor } from "../visitors/model-finding-visitor";
import { visitor as ModelTypeSetupVisitor } from "../visitors/model-type-setup-visitor";
import { visitor as MultilineConstructsConfigSetupVisitor } from "../visitors/multiline-constructs-config-setup-visitor";
import {nextNodeSetupVisitor} from "../visitors/next-node--setup-visitor"
import { parentSetupVisitor } from '../visitors/parent-setup-visitor';
import { viewStateSetupVisitor as ViewStateSetupVisitor } from "../visitors/view-state-setup-visitor";

import { ExpressionGroup, expressions } from "./expressions";
import { ModelType, StatementEditorViewState } from "./statement-editor-viewstate";
import { getImportModification, getStatementModification, keywords } from "./statement-modifications";

export function getModifications(model: STNode, configType: string, targetPosition: NodePosition,
                                 modulesToBeImported?: string[]): STModification[] {

    const modifications: STModification[] = [];
    let source = model.source;

    if (configType === CUSTOM_CONFIG_TYPE && source.trim().slice(-1) !== ';') {
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

export function getCurrentModel(position: NodePosition, model: STNode): STNode {
    ModelFindingVisitor.setPosition(position);
    traversNode(model, ModelFindingVisitor);

    return ModelFindingVisitor.getModel();
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
    return doc.includes(BAL_SOURCE);
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
            if (PLACEHOLDER_DIAGNOSTICS.some(msg => message.includes(msg))) {
                isPlaceHolderDiag = true;
            }
            if (!!message) {
                stmtDiagnostics.push({message, isPlaceHolderDiag});
            }
        });

    return stmtDiagnostics;
}

export function getUpdatedSource(statement: string, currentFileContent: string,
                                 targetPosition: NodePosition, moduleList?: Set<string>): string {

    const updatedStatement = statement.trim().endsWith(';') ? statement : statement + ';';
    let updatedContent: string = addToTargetPosition(currentFileContent, targetPosition, updatedStatement);
    if (moduleList && !!moduleList.size) {
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

export function getStringForMinutiae(minutiae: Minutiae[]): string {
    return minutiae.map((element) => {
        return element.minutiae;
    }).join('');
}

export function getSuggestionIconStyle(suggestionType: number): string {
    let suggestionIconStyle: string;
    switch (suggestionType) {
        case 3:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-function"
            break;
        case 5:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-field"
            break;
        case 6:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-variable"
            break;
        case 11:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-ruler"
            break;
        case 14:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-keyword"
            break;
        case 20:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-enum-member"
            break;
        case 22:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-struct"
            break;
        case 25:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-type-parameter"
            break;
        default:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-variable"
            break;
    }
    return suggestionIconStyle;
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

export function isNodeDeletable(selectedNode: STNode): boolean {
    const stmtViewState: StatementEditorViewState = selectedNode.viewState as StatementEditorViewState;
    const currentModelSource = selectedNode.source
        ? selectedNode.source.trim()
        : selectedNode.value ? selectedNode.value.trim() : '';

    let exprDeletable = !stmtViewState.exprNotDeletable;
    if (INPUT_EDITOR_PLACEHOLDERS.has(currentModelSource)) {
        exprDeletable =  stmtViewState.templateExprDeletable;
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

export function getModuleIconStyle(label: string): string {
    let suggestionIconStyle: string;
    switch (label) {
        case "Functions":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-function"
            break;
        case "Classes":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-interface"
            break;
        case "Constants":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-variable"
            break;
        case "Errors":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-event"
            break;
        case "Enums":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-enum"
            break;
        case "Records":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-struct"
            break;
        case "Types":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-ruler"
            break;
        case "Listeners":
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-variable"
            break;
        default:
            suggestionIconStyle = "suggest-icon codicon codicon-symbol-interface"
            break;
    }
    return suggestionIconStyle;
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
    }
    position = {
        line : targetPos.startLine + currentModel.position.startLine,
        offset : targetPos.startColumn + currentModel.position.startColumn + userInput.length
    }
    return position;
}

export function isDocumentationSupportedModel(currentModel: STNode): boolean {
    return (STKindChecker.isFunctionCall(currentModel) || STKindChecker.isMethodCall(currentModel) ||
        STKindChecker.isImplicitNewExpression(currentModel) || STKindChecker.isExplicitNewExpression(currentModel));
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

export function getParamCheckedList(paramsInModel: STNode[], documentation : SymbolDocumentation) : any[] {
    const checkedList : any[] = [];
    paramsInModel.map((param: STNode, value: number) => {
        if (STKindChecker.isNamedArg(param)) {
            for (let i = 0; i < documentation.parameters.length; i++){
                const docParam : ParameterInfo = documentation.parameters[i];
                if (keywords.includes(docParam.name) ?
                    param.argumentName.name.value === "'" + docParam.name :
                    param.argumentName.name.value === docParam.name ||
                    docParam.kind === SymbolParameterType.INCLUDED_RECORD || docParam.kind === SymbolParameterType.REST){
                    if (checkedList.indexOf(i) === -1){
                        checkedList.push(i);
                        break;
                    }
                }
            }
        } else {
            checkedList.push(value);
        }
    });

    return checkedList
}

export function isAllowedIncludedArgsAdded(parameters: ParameterInfo[], checkedList: any[]): boolean {
    let isIncluded: boolean = true;
    for (let i = 0; i < parameters.length; i++){
        const docParam : ParameterInfo = parameters[i];
        if (docParam.kind === SymbolParameterType.INCLUDED_RECORD){
            if (!checkedList.includes(i)){
                isIncluded = false;
                break;
            }
        }
    }
    return isIncluded;
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

export function getUpdatedContentOnUncheck(currentModel: STNode, currentIndex: number) : string {
    const modelParams: string[] = [];
    if (STKindChecker.isFunctionCall(currentModel) || STKindChecker.isMethodCall(currentModel)) {
        currentModel.arguments.filter((parameter: any) => !STKindChecker.isCommaToken(parameter)).
        map((parameter: STNode, pos: number) => {
            if (pos !== currentIndex) {
                modelParams.push(parameter.source);
            }
        });
    } else if (STKindChecker.isImplicitNewExpression(currentModel) || STKindChecker.isExplicitNewExpression(currentModel)){
        currentModel.parenthesizedArgList.arguments.filter((parameter: any) => !STKindChecker.isCommaToken(parameter)).
        map((parameter: STNode, pos: number) => {
            if (pos !== currentIndex) {
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
    if (STKindChecker.isFunctionCall(model) || STKindChecker.isMethodCall(model)) {
        position = {
            startLine: model.openParenToken.position.startLine,
            startColumn: model.openParenToken.position.startColumn,
            endLine: model.closeParenToken.position.endLine,
            endColumn: model.closeParenToken.position.endColumn,
        }
    } else if (STKindChecker.isImplicitNewExpression(model) || STKindChecker.isExplicitNewExpression(model)){
        position = {
            startLine: model.parenthesizedArgList.openParenToken.position.startLine,
            startColumn: model.parenthesizedArgList.openParenToken.position.startColumn,
            endLine: model.parenthesizedArgList.closeParenToken.position.endLine,
            endColumn: model.parenthesizedArgList.closeParenToken.position.endColumn,
        }
    }
    return position;
}
