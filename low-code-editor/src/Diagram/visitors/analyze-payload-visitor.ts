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
    CaptureBindingPattern,
    CheckExpression,
    ElseBlock,
    FunctionDefinition,
    ImplicitNewExpression,
    LocalVarDecl,
    NodePosition,
    RemoteMethodCallAction,
    STKindChecker,
    STNode,
    Visitor
} from "@ballerina/syntax-tree";

import { AnalyzerAction, AnalyzerEndPoint, AnalyzerRequestPayload } from "../../Definitions";

let endPointIdDictionary: { id: string, variableName: string }[][] = [[]];
let analyzerActionStack: AnalyzerAction[] = [];
let analyzerPayload: AnalyzerAction;
let endPointPayload: { [s: string]: AnalyzerEndPoint } = {};
let endPointId = 1000;

class AnalyzePayloadVisitor implements Visitor {

    private getEndpointId(variableName: string) {
        for (const bodyData of endPointIdDictionary) {
            const result = bodyData.find((endPointData) => endPointData.variableName === variableName);
            if (result) {
                return result.id;
            }
        }
    }

    public beginVisitLocalVarDecl(node: LocalVarDecl, parent?: STNode) {
        if ((node.initializer as CheckExpression).typeData.isEndpoint) {
            const variableName = (node.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
            const position = node.position as NodePosition;
            const analyzerEndPoint: AnalyzerEndPoint = {
                name: node.typeData.typeSymbol.name,
                baseUrl: ((node.initializer as CheckExpression)?.expression as ImplicitNewExpression)?.parenthesizedArgList?.arguments[0]?.source.replace(/"/g, ""),
                pkgID: node?.typeData?.typeSymbol?.moduleID?.orgName + "/" + node?.typeData?.typeSymbol?.moduleID?.moduleName,
                pos: `(${position?.startLine}:${position?.startColumn},${position?.endLine}:${position?.endColumn})`
            }

            const id = (++endPointId).toString();
            endPointIdDictionary[endPointIdDictionary.length - 1].push({ id, variableName })
            endPointPayload[id] = analyzerEndPoint;
        }
    }

    public beginVisitRemoteMethodCallAction(node: RemoteMethodCallAction) {
        const positionalArg = node?.arguments.filter(element => element.kind === "PositionalArg").map(element => element.source).join("/").replace(/"/g, "");
        const analyzerAction: AnalyzerAction = {
            endPointRef: this.getEndpointId(node?.expression?.source),
            name: node.methodName.name.value,
            path: positionalArg,
            pos: `choreo.ball:${(node.position as NodePosition).startLine}:${(node.position as NodePosition).startColumn}`
        }

        if (!analyzerAction.endPointRef) {
            return;
        }

        if (analyzerActionStack.length) {
            const lastIndex = analyzerActionStack.length - 1;
            if (analyzerActionStack[lastIndex].endPointRef || analyzerActionStack[lastIndex].elseBody || analyzerActionStack[lastIndex].ifBody || analyzerActionStack[lastIndex].forBody) {
                analyzerActionStack[lastIndex].nextNode = analyzerAction;
                analyzerActionStack[lastIndex] = analyzerAction;
            } else {
                analyzerActionStack[lastIndex].endPointRef = analyzerAction.endPointRef;
                analyzerActionStack[lastIndex].name = analyzerAction.name;
                analyzerActionStack[lastIndex].path = positionalArg;
                analyzerActionStack[lastIndex].pos = analyzerAction.pos;
            }
        } else {
            analyzerPayload = analyzerAction;
            analyzerActionStack = [analyzerAction];
        }
    }

    public beginVisitElseBlock(node: ElseBlock) {
        if (STKindChecker.isIfElseStatement(node.elseBody)) {
            const newAction: AnalyzerAction = {};
            const lastIndex = analyzerActionStack.length - 1;
            analyzerActionStack[lastIndex].elseBody = newAction;
            analyzerActionStack.push(newAction);
        }
    }
    public endVisitElseBlock(node: ElseBlock) {
        if (STKindChecker.isIfElseStatement(node.elseBody)) {

            if (analyzerActionStack.length && (analyzerActionStack[analyzerActionStack.length - 1] === {})) {
                delete analyzerActionStack[analyzerActionStack.length - 1]
            } else {
                analyzerActionStack.pop();
            }
        }
    }

    public beginVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        endPointIdDictionary.push([]);
        const newAction: AnalyzerAction = {};
        const lastIndex = analyzerActionStack.length - 1;
        if (analyzerActionStack[lastIndex].endPointRef) {
            const nextAction: AnalyzerAction = {};
            analyzerActionStack[lastIndex].nextNode = nextAction;
            analyzerActionStack[lastIndex] = nextAction;
        }
        if (STKindChecker.isElseBlock(parent)) {
            analyzerActionStack[lastIndex].elseBody = newAction;
            analyzerActionStack.push(newAction);
        } else if (STKindChecker.isIfElseStatement(parent)) {
            analyzerActionStack[lastIndex].ifBody = newAction;
            analyzerActionStack.push(newAction);
        } else if (STKindChecker.isWhileStatement(parent) || STKindChecker.isForeachStatement(parent)) {
            analyzerActionStack[lastIndex].forBody = newAction;
            analyzerActionStack.push(newAction);
        }
    }

    private isEmtyNode(action: AnalyzerAction) {
        return !(action.elseBody || action.ifBody || action.forBody || action.endPointRef || action.nextNode)
    }
    public endVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        if (STKindChecker.isElseBlock(parent) || STKindChecker.isIfElseStatement(parent) || STKindChecker.isWhileStatement(parent) || STKindChecker.isForeachStatement(parent)) {
            const lastBody = analyzerActionStack.pop();
            const newAction: AnalyzerAction = {};
            const lastIndex = analyzerActionStack.length - 1;
            if (STKindChecker.isWhileStatement(parent) || STKindChecker.isForeachStatement(parent)) {
                if (this.isEmtyNode(lastBody)) {
                    analyzerActionStack[lastIndex].forBody = null;
                } else {
                    analyzerActionStack[lastIndex].nextNode = newAction;
                    analyzerActionStack[lastIndex] = newAction;
                }
            } else if (STKindChecker.isElseBlock(parent)) {
                if (this.isEmtyNode(lastBody)) {
                    analyzerActionStack[lastIndex].elseBody = null;
                }
            } else if (STKindChecker.isIfElseStatement(parent)) {
                if (this.isEmtyNode(lastBody)) {
                    analyzerActionStack[lastIndex].ifBody = null;
                }
            }
        }
        endPointIdDictionary.pop();

    }

    public beginVisitFunctionDefinition(node: FunctionDefinition) {
        const newAction: AnalyzerAction = {};
        const lastIndex = analyzerActionStack.length - 1;
        analyzerActionStack[lastIndex].nextNode = newAction;
        endPointIdDictionary.push([]);
    }
}

export function getPayload(): AnalyzerRequestPayload {
    return { endpoints: endPointPayload, actionInvocations: analyzerPayload }
}

export function analyzerVisitorReset() {
    const newAction: AnalyzerAction = {};
    endPointPayload = {};
    endPointIdDictionary = [];
    analyzerPayload = newAction;
    analyzerActionStack = [newAction];
    endPointId = 1000;
}

export const visitor = new AnalyzePayloadVisitor();
