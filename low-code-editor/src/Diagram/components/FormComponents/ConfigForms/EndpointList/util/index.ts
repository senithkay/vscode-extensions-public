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

import { BallerinaConnectorInfo } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
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

export function getTargetBlock(targetPosition: NodePosition, blockNode: STNode): BlockStatement {
    // Go through block statements to identify which block represent the target position
    if (STKindChecker.isBlockStatement(blockNode) || STKindChecker.isFunctionBodyBlock(blockNode) &&
        blockNode.position?.startLine < targetPosition.startLine &&
        blockNode.position?.endLine >= targetPosition.startLine) {
        // Go through each statements to find exact block
        const blockStatements = blockNode.statements as STNode[];
        if (!blockStatements || blockStatements.length === 0) {
            // Empty block
            return blockNode;
        }

        const targetBlock = blockStatements?.find((block) =>
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
    if (STKindChecker.isIfElseStatement(blockNode) &&
        blockNode.ifBody.position?.startLine < targetPosition.startLine &&
        blockNode.ifBody.position?.endLine >= targetPosition.startLine) {
        return blockNode.ifBody;
    }
    if (STKindChecker.isIfElseStatement(blockNode) &&
        STKindChecker.isElseBlock(blockNode.elseBody) &&
        STKindChecker.isIfElseStatement(blockNode.elseBody.elseBody) &&
        blockNode.elseBody.elseBody.position?.startLine < targetPosition.startLine &&
        blockNode.elseBody.elseBody.position?.endLine >= targetPosition.startLine) {
        return getTargetIfBlock(targetPosition, blockNode.elseBody.elseBody);
    }
    if (STKindChecker.isElseBlock(blockNode.elseBody) &&
        STKindChecker.isBlockStatement(blockNode.elseBody.elseBody) &&
        blockNode.elseBody.position?.startLine < targetPosition.startLine &&
        blockNode.elseBody.position?.endLine >= targetPosition.startLine) {
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

export function getMatchingConnector(node: STNode): BallerinaConnectorInfo {
    let connector: BallerinaConnectorInfo;
    if (
        node && isEndpointNode(node) &&
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
