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
import { AnydataType, PrimitiveBalType} from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import {
    CaptureBindingPattern,
    ExpressionFunctionBody,
    FunctionDefinition,
    IdentifierToken,
    JoinClause,
    LetClause,
    LetVarDecl,
    ListConstructor,
    MappingConstructor,
    NodePosition,
    QueryExpression,
    SelectClause,
    SimpleNameReference,
    SpecificField,
    STKindChecker,
    STNode,
    traversNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { DataMapperContext } from "../../../utils/DataMapperContext/DataMapperContext";
import { isPositionsEquals } from "../../../utils/st-utils";
import { SelectionState } from "../../DataMapper/DataMapper";
import {
    MappingConstructorNode,
    QueryExpressionNode,
    RequiredParamNode
} from "../Node";
import { DataMapperNodeModel } from "../Node/commons/DataMapperNode";
import { ExpandedMappingHeaderNode } from "../Node/ExpandedMappingHeader";
import { FromClauseNode } from "../Node/FromClause";
import { JoinClauseNode } from "../Node/JoinClause";
import { LetClauseNode } from "../Node/LetClause";
import { LetExpressionNode } from "../Node/LetExpression";
import { LinkConnectorNode } from "../Node/LinkConnector";
import { ListConstructorNode } from "../Node/ListConstructor";
import { ModuleVariable, ModuleVariableNode } from "../Node/ModuleVariable";
import { PrimitiveTypeNode } from "../Node/PrimitiveType";
import { SearchNode, SearchType } from "../Node/Search";
import { RightAnglePortModel } from "../Port/RightAnglePort/RightAnglePortModel";
import { EXPANDED_QUERY_INPUT_NODE_PREFIX, FUNCTION_BODY_QUERY, OFFSETS } from "../utils/constants";
import {
    constructTypeFromSTNode,
    getAssignedUnionType,
    getExprBodyFromLetExpression,
    getFilteredUnionOutputTypes,
    getInputNodes,
    getModuleVariables,
    getPrevOutputType,
    getTypeFromStore,
    getTypeOfOutput,
    isComplexExpression
} from "../utils/dm-utils";

import { QueryParentFindingVisitor } from "./QueryParentFindingVisitor"

export class NodeInitVisitor implements Visitor {

    private inputNodes: DataMapperNodeModel[] = [];
    private outputNode: DataMapperNodeModel;
    private intermediateNodes: DataMapperNodeModel[] = [];
    private queryNode: DataMapperNodeModel;
    private mapIdentifiers: STNode[] = [];
    private isWithinQuery = 0;
    private isWithinLetVarDecl = 0;

    constructor(
        private context: DataMapperContext,
        private selection: SelectionState
    ) { }

    beginVisitFunctionDefinition(node: FunctionDefinition) {
        const typeDesc = node.functionSignature?.returnTypeDesc && node.functionSignature.returnTypeDesc.type;
        const exprFuncBody = STKindChecker.isExpressionFunctionBody(node.functionBody) && node.functionBody;
        let moduleVariables: Map<string, ModuleVariable> = getModuleVariables(exprFuncBody, this.context.stSymbolInfo);
        let isFnBodyQueryExpr = false;
        if (typeDesc && exprFuncBody) {
            let returnType = getTypeOfOutput(typeDesc, this.context.ballerinaVersion);

            const isAnydataTypedField = returnType
                && (returnType.typeName === AnydataType
                    || (returnType.typeName === PrimitiveBalType.Array
                        && returnType?.memberType?.typeName === AnydataType));
            if (isAnydataTypedField) {
                returnType = constructTypeFromSTNode(exprFuncBody.expression);
            }

            if (returnType) {

                let bodyExpr: STNode = exprFuncBody.expression;
                if (STKindChecker.isLetExpression(exprFuncBody.expression)) {
                    bodyExpr = getExprBodyFromLetExpression(exprFuncBody.expression);
                } else if (
                    STKindChecker.isIndexedExpression(exprFuncBody.expression) &&
                    STKindChecker.isBracedExpression(exprFuncBody.expression.containerExpression) &&
                    STKindChecker.isQueryExpression(exprFuncBody.expression.containerExpression.expression)
                ) {
                    bodyExpr = exprFuncBody.expression.containerExpression.expression;
                }

                if (returnType?.typeName === PrimitiveBalType.Union) {
                    const matchingType = getAssignedUnionType(returnType, bodyExpr)
                    if (matchingType){
                        returnType = matchingType;
                        returnType.originalTypeName = PrimitiveBalType.Union;
                    }
                }

                if (STKindChecker.isQueryExpression(bodyExpr)) {
                    if (this.context.selection.selectedST.fieldPath === FUNCTION_BODY_QUERY) {
                        isFnBodyQueryExpr = true;
                        const selectClause = bodyExpr.selectClause;
                        const intermediateClausesHeight = 100 + bodyExpr.queryPipeline.intermediateClauses.length * OFFSETS.INTERMEDIATE_CLAUSE_HEIGHT;
                        if (returnType?.typeName === PrimitiveBalType.Record || returnType?.memberType?.typeName === PrimitiveBalType.Record) {
                            this.outputNode = new MappingConstructorNode(
                                this.context,
                                selectClause,
                                typeDesc,
                                returnType,
                                bodyExpr
                            );
                        } else if (returnType?.memberType && returnType.memberType.typeName === PrimitiveBalType.Array) {
                            this.outputNode = new ListConstructorNode(
                                this.context,
                                selectClause,
                                typeDesc,
                                returnType,
                                bodyExpr
                            );
                        } else {
                            this.outputNode = new PrimitiveTypeNode(
                                this.context,
                                selectClause,
                                typeDesc,
                                returnType,
                                bodyExpr
                            );
                        }

                        this.outputNode.setPosition(OFFSETS.TARGET_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, intermediateClausesHeight + OFFSETS.QUERY_VIEW_TOP_MARGIN);

                        const expandedHeaderPorts: RightAnglePortModel[] = [];
                        const fromClauseNode = new FromClauseNode(this.context, bodyExpr.queryPipeline.fromClause);
                        if (fromClauseNode.getSourceType()){
                            fromClauseNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, intermediateClausesHeight + OFFSETS.QUERY_VIEW_TOP_MARGIN + 100);
                            this.inputNodes.push(fromClauseNode);

                            const fromClauseNodeValueLabel = (bodyExpr.queryPipeline.fromClause?.typedBindingPattern?.bindingPattern as CaptureBindingPattern
                            )?.variableName?.value;
                            const fromClausePort = new RightAnglePortModel(true, `${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${fromClauseNodeValueLabel}`);
                            expandedHeaderPorts.push(fromClausePort);
                            fromClauseNode.addPort(fromClausePort);
                        }

                        const inputSearchNode = new SearchNode(this.context, SearchType.Input)
                        inputSearchNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, intermediateClausesHeight + OFFSETS.QUERY_VIEW_TOP_MARGIN);
                        this.inputNodes.push(inputSearchNode);

                        const letClauses = bodyExpr.queryPipeline.intermediateClauses?.filter((item) => {
                            return (
                                (STKindChecker.isLetClause(item) && item.typeData?.diagnostics?.length === 0) ||
                                (STKindChecker.isJoinClause(item) && item.typeData?.diagnostics?.length === 0)
                            );
                        });

                        for (const [, item] of letClauses.entries()) {
                            if (STKindChecker.isLetClause(item)) {
                                const paramNode = new LetClauseNode(this.context, item as LetClause);
                                if (paramNode.getSourceType()){
                                    paramNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, 0);
                                    this.inputNodes.push(paramNode);
                                    const letClauseValueLabel = (
                                        ((item as LetClause)?.letVarDeclarations[0] as LetVarDecl)?.typedBindingPattern
                                            ?.bindingPattern as CaptureBindingPattern
                                    )?.variableName?.value;
                                    const letClausePort = new RightAnglePortModel(true, `${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${letClauseValueLabel}`);
                                    expandedHeaderPorts.push(letClausePort);
                                    paramNode.addPort(letClausePort);
                                }
                            } else if (STKindChecker.isJoinClause(item)) {
                                const paramNode = new JoinClauseNode(this.context, item as JoinClause);
                                if (paramNode.getSourceType()){
                                    paramNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, 0);
                                    this.inputNodes.push(paramNode);
                                    const joinClauseValueLabel = ((item as JoinClause)?.typedBindingPattern?.bindingPattern as CaptureBindingPattern)?.variableName?.value;
                                    const joinClausePort = new RightAnglePortModel(true, `${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${joinClauseValueLabel}`);
                                    expandedHeaderPorts.push(joinClausePort);
                                    paramNode.addPort(joinClausePort);
                                }
                            }
                        }

                        const queryNode = new ExpandedMappingHeaderNode(this.context, bodyExpr);
                        queryNode.setLocked(true)
                        this.queryNode = queryNode;
                        queryNode.targetPorts = expandedHeaderPorts;
                        queryNode.height = intermediateClausesHeight;
                        moduleVariables = getModuleVariables(bodyExpr.selectClause.expression, this.context.stSymbolInfo);
                    } else {
                        if (returnType.typeName === PrimitiveBalType.Array) {
                            this.outputNode = new ListConstructorNode(
                                this.context,
                                exprFuncBody,
                                typeDesc,
                                returnType
                            );
                        } else {
                            this.outputNode = new PrimitiveTypeNode(
                                this.context,
                                (exprFuncBody.expression as any).containerExpression as any,
                                typeDesc,
                                returnType
                            );
                        }
                    }
                } else if (STKindChecker.isMappingConstructor(bodyExpr)) {
                    this.outputNode = new MappingConstructorNode(
                        this.context,
                        exprFuncBody,
                        typeDesc,
                        returnType
                    );
                } else if (STKindChecker.isListConstructor(bodyExpr)) {
                    this.outputNode = new ListConstructorNode(
                        this.context,
                        exprFuncBody,
                        typeDesc,
                        returnType
                    );
                } else {
                    this.outputNode = new PrimitiveTypeNode(
                        this.context,
                        exprFuncBody,
                        typeDesc,
                        returnType
                    );
                }
                this.outputNode.setPosition(OFFSETS.TARGET_NODE.X, OFFSETS.QUERY_VIEW_TOP_MARGIN);
            }
        }
        // create input nodes
        if (!isFnBodyQueryExpr) {
            const params = node.functionSignature.parameters;
            if (params.length) {
                for (const param of params) {
                    if (STKindChecker.isRequiredParam(param)) {
                        const paramNode = new RequiredParamNode(
                            this.context,
                            param,
                            param.typeName
                        );
                        if (paramNode.getSourceType()){
                            paramNode.setPosition(OFFSETS.SOURCE_NODE.X, 0);
                            this.inputNodes.push(paramNode);
                        }
                    } else {
                        // TODO for other param types
                    }
                }
            }
            const inputSearchNode = new SearchNode(this.context, SearchType.Input)
            inputSearchNode.setPosition(OFFSETS.SOURCE_NODE.X, OFFSETS.QUERY_VIEW_TOP_MARGIN);
            this.inputNodes.push(inputSearchNode);
        }

        // create node for configuring local variables
        const letExprNode = new LetExpressionNode(
            this.context,
            exprFuncBody
        );
        letExprNode.setPosition(OFFSETS.SOURCE_NODE.X + (isFnBodyQueryExpr ? 80 : 0), 0);
        this.inputNodes.push(letExprNode);

        // create node for module variables
        if (moduleVariables.size > 0) {
            const moduleVarNode = new ModuleVariableNode(
                this.context,
                moduleVariables
            );
            moduleVarNode.setPosition(OFFSETS.SOURCE_NODE.X + (isFnBodyQueryExpr ? 80 : 0), 0);
            this.inputNodes.push(moduleVarNode);
        }
    }

    beginVisitQueryExpression?(node: QueryExpression, parent?: STNode) {
        // TODO: Implement a way to identify the selected query expr without using the positions since positions might change with imports, etc.
        const selectedSTNode = this.selection.selectedST.stNode;
        const isLetVarDecl = STKindChecker.isLetVarDecl(parent);
        let parentIdentifier: IdentifierToken;
        let parentNode = parent;

        if (STKindChecker.isSpecificField(parent) && STKindChecker.isIdentifierToken(parent.fieldName)) {
            parentIdentifier = parent.fieldName;
        } else if (STKindChecker.isLetVarDecl(parent)
            && STKindChecker.isCaptureBindingPattern(parent.typedBindingPattern.bindingPattern)) {
            parentIdentifier = parent.typedBindingPattern.bindingPattern.variableName;
        } else {
            // Find specific field node if query is nested within braced or indexed expressions
            const specificFieldFindingVisitor = new QueryParentFindingVisitor(node.position)
            traversNode(this.context.selection.selectedST.stNode, specificFieldFindingVisitor);
            const specificField = specificFieldFindingVisitor.getSpecificField();
            if (specificField && STKindChecker.isSpecificField(specificField) && STKindChecker.isIdentifierToken(specificField.fieldName)) {
                parentIdentifier = specificField.fieldName as IdentifierToken
                parentNode = specificField;
            }
        }

        const isSelectedExpr = parentNode
            && (STKindChecker.isSpecificField(selectedSTNode) || STKindChecker.isLetVarDecl(selectedSTNode))
            && isPositionsEquals(parentNode.position, selectedSTNode.position);

        if (isSelectedExpr) {
            if (parentIdentifier) {
                const intermediateClausesHeight = 100 + node.queryPipeline.intermediateClauses.length * OFFSETS.INTERMEDIATE_CLAUSE_HEIGHT;
                // create output node
                let exprType = getTypeOfOutput(parentIdentifier, this.context.ballerinaVersion);
                // Fetch types from let var decl expression to ensure the backward compatibility
                if (!exprType && STKindChecker.isLetVarDecl(parentNode)) {
                    exprType = getTypeFromStore(parentNode.expression.position as NodePosition);
                }

                const isAnydataTypedField = exprType
                    && (exprType.typeName === AnydataType
                        || (exprType.typeName === PrimitiveBalType.Array
                            && exprType?.memberType?.typeName === AnydataType));
                if (!exprType || isAnydataTypedField) {
                    const prevOutputType = getPrevOutputType(this.selection.prevST, this.context.ballerinaVersion);
                    const isPrevOutputAnydata = prevOutputType
                        && (prevOutputType.typeName === AnydataType
                            || (prevOutputType.typeName === PrimitiveBalType.Array
                                && prevOutputType.memberType.typeName === AnydataType));
                    if (isPrevOutputAnydata || isAnydataTypedField) {
                        exprType = constructTypeFromSTNode(node);
                    }
                }

                if (exprType?.typeName === PrimitiveBalType.Array && exprType?.memberType?.typeName === PrimitiveBalType.Record) {
                    this.outputNode = new MappingConstructorNode(
                        this.context,
                        node.selectClause,
                        parentIdentifier,
                        exprType,
                        node
                    );
                } else if (exprType?.typeName === PrimitiveBalType.Record) {
                    this.outputNode = new MappingConstructorNode(
                        this.context,
                        node.selectClause,
                        parentIdentifier,
                        exprType
                    );
                } else if (exprType?.memberType && exprType?.memberType?.typeName === PrimitiveBalType.Array) {
                    this.outputNode = new ListConstructorNode(
                        this.context,
                        node.selectClause,
                        parentIdentifier,
                        exprType,
                        node
                    );
                } else {
                    this.outputNode = new PrimitiveTypeNode(
                        this.context,
                        node.selectClause,
                        parentIdentifier,
                        exprType,
                        node
                    );

                    if (isComplexExpression(node.selectClause.expression)){
                        const inputNodes = getInputNodes(node.selectClause);
                        const linkConnectorNode = new LinkConnectorNode(
                            this.context,
                            node,
                            "",
                            parent,
                            inputNodes,
                            this.mapIdentifiers.slice(0)
                        );
                        this.intermediateNodes.push(linkConnectorNode);
                    }
                }

                this.outputNode.setPosition(OFFSETS.TARGET_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, intermediateClausesHeight + 50);

                const expandedHeaderPorts: RightAnglePortModel[] = [];

                // create input nodes
                const fromClauseNode = new FromClauseNode(this.context, node.queryPipeline.fromClause);
                if (fromClauseNode.getSourceType()){
                    fromClauseNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, intermediateClausesHeight + OFFSETS.QUERY_VIEW_TOP_MARGIN + 100);
                    this.inputNodes.push(fromClauseNode);

                    const fromClauseNodeValueLabel = (
                        node.queryPipeline.fromClause?.typedBindingPattern?.bindingPattern as CaptureBindingPattern
                    )?.variableName?.value;
                    const fromClausePort = new RightAnglePortModel(true, `${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${fromClauseNodeValueLabel}`);
                    expandedHeaderPorts.push(fromClausePort);
                    fromClauseNode.addPort(fromClausePort);
                }

                const inputSearchNode = new SearchNode(this.context, SearchType.Input)
                inputSearchNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, intermediateClausesHeight + OFFSETS.QUERY_VIEW_TOP_MARGIN);
                this.inputNodes.push(inputSearchNode);

                const letClauses = node.queryPipeline.intermediateClauses?.filter((item) => {
                    return (
                        (STKindChecker.isLetClause(item) && item.typeData?.diagnostics?.length === 0) ||
                        (STKindChecker.isJoinClause(item) && item.typeData?.diagnostics?.length === 0)
                    );
                });

                for (const [, item] of letClauses.entries()) {
                    if (STKindChecker.isLetClause(item)) {
                        const paramNode = new LetClauseNode(this.context, item as LetClause);
                        if (paramNode.getSourceType()){
                            paramNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, 0);
                            this.inputNodes.push(paramNode);

                            const letClauseValueLabel = (
                                ((item as LetClause)?.letVarDeclarations[0] as LetVarDecl)?.typedBindingPattern
                                    ?.bindingPattern as CaptureBindingPattern
                            )?.variableName?.value;
                            const letClausePort = new RightAnglePortModel(true, `${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${letClauseValueLabel}`);
                            expandedHeaderPorts.push(letClausePort);
                            paramNode.addPort(letClausePort);
                        }
                    } else if (STKindChecker.isJoinClause(item)) {
                        const paramNode = new JoinClauseNode(this.context, item as JoinClause);
                        if (paramNode.getSourceType()){
                            paramNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, 0);
                            this.inputNodes.push(paramNode);

                            const joinClauseValueLabel = ((item as JoinClause)?.typedBindingPattern?.bindingPattern as CaptureBindingPattern)?.variableName?.value;
                            const joinClausePort = new RightAnglePortModel(true, `${EXPANDED_QUERY_INPUT_NODE_PREFIX}.${joinClauseValueLabel}`);
                            expandedHeaderPorts.push(joinClausePort);
                            paramNode.addPort(joinClausePort);
                        }
                    }
                }

                const queryNode = new ExpandedMappingHeaderNode(this.context, node);
                queryNode.setLocked(true);
                this.queryNode = queryNode;
                queryNode.targetPorts = expandedHeaderPorts;
                queryNode.height = intermediateClausesHeight;

                // create node for local variables
                const letExprNode = new LetExpressionNode(
                    this.context,
                    this.context.functionST.functionBody as ExpressionFunctionBody,
                    true
                );
                letExprNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, 0);
                this.inputNodes.push(letExprNode);

                // create node for module variables
                const moduleVariables: Map<string, ModuleVariable> = getModuleVariables(node.selectClause.expression, this.context.stSymbolInfo);
                if (moduleVariables.size > 0) {
                    const moduleVarNode = new ModuleVariableNode(
                        this.context,
                        moduleVariables
                    );
                    moduleVarNode.setPosition(OFFSETS.SOURCE_NODE.X + OFFSETS.QUERY_VIEW_LEFT_MARGIN, 0);
                    this.inputNodes.push(moduleVarNode);
                }
            }
        } else if (this.context.selection.selectedST.fieldPath !== FUNCTION_BODY_QUERY && !isLetVarDecl && parentNode) {
            const queryNode = new QueryExpressionNode(this.context, node, parentNode);
            if (this.isWithinQuery === 0) {
                this.intermediateNodes.push(queryNode);
            }
            this.isWithinQuery += 1;
        } else {
            if (STKindChecker.isFunctionDefinition(selectedSTNode)
                && STKindChecker.isExpressionFunctionBody(selectedSTNode.functionBody)
                && !isLetVarDecl)
            {
                let queryExpr: STNode = selectedSTNode.functionBody.expression;
                if (STKindChecker.isLetExpression(selectedSTNode.functionBody.expression)) {
                    getExprBodyFromLetExpression(selectedSTNode.functionBody.expression)
                } else if (!STKindChecker.isQueryExpression(queryExpr)) {
                    queryExpr = node;
                }

                if (!isPositionsEquals(queryExpr.position, node.position) && this.isWithinQuery === 0) {
                    const queryNode = new QueryExpressionNode(this.context, node, parentNode);
                    this.intermediateNodes.push(queryNode);
                    this.isWithinQuery += 1;
                }
            }

        }
    }

    beginVisitSpecificField(node: SpecificField, parent?: STNode) {
        const selectedSTNode = this.selection.selectedST.stNode;
        if ((selectedSTNode.position as NodePosition).startLine !== (node.position as NodePosition).startLine
            && (selectedSTNode.position as NodePosition).startColumn !== (node.position as NodePosition).startColumn) {
            this.mapIdentifiers.push(node)
        }
        if (this.isWithinQuery === 0
            && (this.isWithinLetVarDecl === 0
                || (this.isWithinLetVarDecl > 0 && STKindChecker.isLetVarDecl(this.selection.selectedST.stNode)))
            && node.valueExpr
            && !STKindChecker.isMappingConstructor(node.valueExpr)
            && !STKindChecker.isListConstructor(node.valueExpr)
        ) {
            const inputNodes = getInputNodes(node.valueExpr);
            if (inputNodes.length > 1
                || (inputNodes.length === 1 && isComplexExpression(node.valueExpr))) {
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node,
                    node.fieldName.value as string,
                    parent,
                    inputNodes,
                    this.mapIdentifiers.slice(0)
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    beginVisitListConstructor(node: ListConstructor, parent?: STNode): void {
        this.mapIdentifiers.push(node);
        if (this.isWithinQuery === 0 && node.expressions) {
            node.expressions.forEach((expr) => {
                if (!STKindChecker.isMappingConstructor(expr) && !STKindChecker.isListConstructor(expr)) {
                    const inputNodes = getInputNodes(expr);
                    if (inputNodes.length > 1
                        || (inputNodes.length === 1 && isComplexExpression(expr))) {
                        const linkConnectorNode = new LinkConnectorNode(
                            this.context,
                            expr,
                            "",
                            parent,
                            inputNodes,
                            [...this.mapIdentifiers, expr],
                            true
                        );
                        this.intermediateNodes.push(linkConnectorNode);
                    }
                }
            })
        }

    }

    beginVisitSelectClause(node: SelectClause, parent?: STNode): void {
        if (this.isWithinQuery === 0
            && !STKindChecker.isMappingConstructor(node.expression)
            && !STKindChecker.isListConstructor(node.expression)) {
            const inputNodes = getInputNodes(node.expression);
            if (inputNodes.length > 1) {
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node.expression,
                    "",
                    parent,
                    inputNodes,
                    [...this.mapIdentifiers, node.expression]
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    beginVisitExpressionFunctionBody(node: ExpressionFunctionBody, parent?: STNode): void {
        const expr = STKindChecker.isLetExpression(node.expression)
            ? getExprBodyFromLetExpression(node.expression)
            : node.expression;
        if (!STKindChecker.isMappingConstructor(expr)
            && !STKindChecker.isListConstructor(expr)
            && !STKindChecker.isExplicitAnonymousFunctionExpression(parent))
        {
            const inputNodes = getInputNodes(expr);
            if (inputNodes.length > 1) {
                const linkConnectorNode = new LinkConnectorNode(
                    this.context,
                    node.expression,
                    "",
                    parent,
                    inputNodes,
                    [node.expression]
                );
                this.intermediateNodes.push(linkConnectorNode);
            }
        }
    }

    beginVisitLetVarDecl(node: LetVarDecl): void {
        this.isWithinLetVarDecl += 1;
    }

    endVisitLetVarDecl(node: LetVarDecl): void {
        this.isWithinLetVarDecl -= 1;
    }

    beginVisitMappingConstructor(node: MappingConstructor): void {
        this.mapIdentifiers.push(node);
    }

    endVisitQueryExpression?() {
        if (this.isWithinQuery > 0) {
            this.isWithinQuery -= 1;
        }
    };

    endVisitSpecificField() {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    endVisitListConstructor() {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    endVisitMappingConstructor() {
        if (this.mapIdentifiers.length > 0) {
            this.mapIdentifiers.pop()
        }
    }

    getNodes() {
        const nodes = [...this.inputNodes];
        if (this.outputNode) {
            nodes.push(this.outputNode);
        }
        nodes.push(...this.intermediateNodes);
        if (this.queryNode){
            nodes.unshift(this.queryNode);
        }
        return nodes;
    }
}
