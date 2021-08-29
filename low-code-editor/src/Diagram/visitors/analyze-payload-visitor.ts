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

import {
    BlockStatement,
    CheckExpression,
    ElseBlock,
    FunctionDefinition,
    LocalVarDecl,
    RemoteMethodCallAction,
    STKindChecker,
    STNode,
    Visitor
} from "@ballerina/syntax-tree";

import { AnalyzerRequestPayload } from "../../Definitions";

import AnalyzerPayload from "./AnalyzerPayload";

const analyzerPayload = new AnalyzerPayload();
class AnalyzePayloadVisitor implements Visitor {

    public beginVisitLocalVarDecl(node: LocalVarDecl) {
        if ((node.initializer as CheckExpression).typeData.isEndpoint) {
            analyzerPayload.pushEndPointNode(node);
        }
    }

    public beginVisitRemoteMethodCallAction(node: RemoteMethodCallAction) {
        analyzerPayload.pushActionNode(node);
    }

    public beginVisitElseBlock(node: ElseBlock) {
        if (STKindChecker.isIfElseStatement(node.elseBody)) {
            analyzerPayload.pushElseBranch();
        }
    }
    public endVisitElseBlock(node: ElseBlock) {
        if (STKindChecker.isIfElseStatement(node.elseBody)) {
            analyzerPayload.popBranch();
        }
    }

    public beginVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        analyzerPayload.pushBody();
        if (STKindChecker.isElseBlock(parent)) {
            analyzerPayload.pushElseBranch();
        } else if (STKindChecker.isIfElseStatement(parent)) {
            analyzerPayload.pushIfBranch();
        } else if (STKindChecker.isWhileStatement(parent) || STKindChecker.isForeachStatement(parent)) {
            analyzerPayload.pushForBranch();
        }
    }

    public endVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        if (STKindChecker.isElseBlock(parent) || STKindChecker.isIfElseStatement(parent)
            || STKindChecker.isWhileStatement(parent) || STKindChecker.isForeachStatement(parent)) {
                analyzerPayload.popBranch();
        }
        analyzerPayload.popBody();
    }

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        analyzerPayload.pushBody();
        analyzerPayload.addNextNode();
    }

}

export function getPayload(): AnalyzerRequestPayload {
    return analyzerPayload.getPayload();
}

export function analyzerVisitorReset() {
    analyzerPayload.cleanup();
}

export const visitor = new AnalyzePayloadVisitor();
