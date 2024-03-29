/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import * as ts from 'typescript';
import { Visitor } from '../../../ts/base-visitor';

export function traversNode(node: ts.Node, visitor: Visitor, parent?: ts.Node) {
    const nodeKind = ts.SyntaxKind[node.kind];
    let beginVisitFn: any = (visitor as any)[`beginVisit${nodeKind}`];

    if (!beginVisitFn) {
        beginVisitFn = visitor.beginVisit && visitor.beginVisit;
    }

    if (beginVisitFn) {
        beginVisitFn.bind(visitor)(node, parent);
    }

    ts.forEachChild(node, childNode => {
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
