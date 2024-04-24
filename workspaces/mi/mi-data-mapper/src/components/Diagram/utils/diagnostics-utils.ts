/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */
import { Diagnostic, Node } from "ts-morph";

export function getDiagnostics(node: Node): Diagnostic[] {

    if (!node) {
        return [];
    }

    const diagnostics = node.getSourceFile().getPreEmitDiagnostics();
    let targetNode = node;

    const parent = node.getParent();
    if (parent && Node.isPropertyAssignment(parent)) {
        targetNode = parent;
    }

    return diagnostics.filter(diagnostic =>
        diagnostic.getStart() >= targetNode.getStart()
        && diagnostic.getStart() + diagnostic.getLength() <= targetNode.getEnd()
    );
}
