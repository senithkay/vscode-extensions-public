/**
 * Copyright (c) 2024, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content.
 */

import { NodeProperties } from "@wso2-enterprise/ballerina-core";
import { NodePosition, STNode, traversNode } from "@wso2-enterprise/syntax-tree";

import { FunctionFindingVisitor } from "../../utils/function-finding-visitor";
import { Position, Range, Uri, workspace, WorkspaceEdit } from "vscode";
import { TextEdit } from "@wso2-enterprise/ballerina-core";

export const DATA_MAPPING_FILE_NAME = "data_mappings.bal";

export function getFunctionNodePosition(nodeProperties: NodeProperties, syntaxTree: STNode): NodePosition {
    const functionName = nodeProperties.hasOwnProperty("functionName")
        ? nodeProperties["functionName"].value as string
        : "";
    const functionFindingVisitor = new FunctionFindingVisitor(functionName);
    traversNode(syntaxTree, functionFindingVisitor);
    const functionNode = functionFindingVisitor.getFunctionNode();

    return functionNode.position;
}

export async function applyBallerinaTomlEdit(tomlPath: Uri, textEdit: TextEdit) {
    const workspaceEdit = new WorkspaceEdit();
    const range = new Range(new Position(textEdit.range.start.line, textEdit.range.start.character),
        new Position(textEdit.range.end.line, textEdit.range.end.character));

    // Create the position and range
    workspaceEdit.replace(tomlPath, range, textEdit.newText);
    // Apply the edit
    await workspace.applyEdit(workspaceEdit);
}
