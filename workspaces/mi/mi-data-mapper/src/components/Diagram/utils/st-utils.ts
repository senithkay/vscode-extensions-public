/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { ts, Node, PropertyAssignment, FunctionDeclaration, ReturnStatement, VariableStatement, Block } from 'ts-morph';

import { Visitor } from '../../../ts/base-visitor';
import { View } from "../../../components/DataMapper/Views/DataMapperView";
import { FocusedSTFindingVisitor } from '../../../components/Visitors/FocusedSTFindingVisitor';
import { getTnfFnReturnStatement, isMapFunction } from './common-utils';

enum SyntaxKindWithRepeatedValue {
    NumericLiteral = 9,
    NoSubstitutionTemplateLiteral = 15,
    TemplateTail = 18,
    QualifiedName = 166,
    TypePredicate = 182,
    ImportType = 205,
    VariableStatement = 243,
    DebuggerStatement = 259,
    JSDocTypeExpression = 316,
    JSDocTag = 334,
    JSDocSatisfiesTag = 357,
}

export interface NodePosition {
    start: number;
    end: number;
}

export function traversNode(node: Node, visitor: Visitor, parent?: Node) {
    const nodeKind = SyntaxKindWithRepeatedValue[node.getKind()] || ts.SyntaxKind[node.getKind()];
    let beginVisitFn: any = (visitor as any)[`beginVisit${nodeKind}`];

    if (!beginVisitFn) {
        beginVisitFn = visitor.beginVisit && visitor.beginVisit;
    }

    if (beginVisitFn) {
        beginVisitFn.bind(visitor)(node, parent);
    }

    node.forEachChild(childNode => {
        traversNode(childNode, visitor, node);
    });

    let endVisitFn: any = (visitor as any)[`endVisit${nodeKind}`];
    if (!endVisitFn) {
        endVisitFn = visitor.endVisit && visitor.endVisit;
    }

    if (endVisitFn) {
        endVisitFn.bind(visitor)(node, parent);
    }
}

export function getPosition(node: Node): NodePosition {
    return {
        start: node.getStart(),
        end: node.getEnd()
    };
}

export function isPositionsEquals(node1: NodePosition, node2: NodePosition): boolean {
    return node1.start === node2.start
        && node1.end === node2.end;
}

export function getFocusedST(focusedView: View, fnST: FunctionDeclaration): PropertyAssignment | ReturnStatement {
    const { targetFieldFQN, mapFnIndex } = focusedView;

    if (!targetFieldFQN) {
        const tnfFnReturnStmt = getTnfFnReturnStatement(fnST);
        if (mapFnIndex === 0) {
            // When focused into map function located in the root level return statement
            return tnfFnReturnStmt;
        } else if (mapFnIndex > 0) {
            // When focused into map function which is a descendant of the map function located in the root level return statement
            return getMapFunctionReturnStatement(tnfFnReturnStmt, mapFnIndex);
        }
    }

    const focusedSTFindingVisitor = new FocusedSTFindingVisitor(targetFieldFQN);
    traversNode(fnST, focusedSTFindingVisitor);
    let resolvedNode: PropertyAssignment | ReturnStatement = focusedSTFindingVisitor.getResolvedNode();

    if (mapFnIndex !== undefined) {
        // When focused into chained map function located in a property assignment
        resolvedNode = getMapFunctionReturnStatement(resolvedNode, mapFnIndex);
    }

    return resolvedNode;
}

export function getMapFunctionReturnStatement(
    resolvedNode: PropertyAssignment | ReturnStatement,
    index: number
): PropertyAssignment | ReturnStatement {

    // Constraint: In focused views, return statements are only allowed at map functions
    const returnStmts = resolvedNode.getDescendantsOfKind(ts.SyntaxKind.ReturnStatement);

    if (returnStmts.length >= index) {
        return returnStmts.filter(stmt => {
            const returnExpr = stmt.getExpression();
            return Node.isCallExpression(returnExpr) && isMapFunction(returnExpr);
        })[index - 1];
    }
    return resolvedNode;
}

export function getFocusedSubMapping(subMappingIndex: number, fnST: FunctionDeclaration): VariableStatement {
    const fnBlock = fnST.getBody() as Block;
    const variableStatements = fnBlock.getVariableStatements();
    return variableStatements[subMappingIndex];
}
