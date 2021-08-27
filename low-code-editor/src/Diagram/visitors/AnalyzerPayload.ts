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

import { CaptureBindingPattern, CheckExpression, ImplicitNewExpression, LocalVarDecl, NodePosition, PositionalArg, RemoteMethodCallAction, StringLiteral} from "@ballerina/syntax-tree";
import { AnalyzerAction, AnalyzerEndPoint } from "../../Definitions";

export default class AnalyzerPayload {
    private endPointIdDictionary: { id: string, variableName: string }[][] = [[]];
    private analyzerActionStack: AnalyzerAction[] = [];
    private analyzerPayload: AnalyzerAction;
    private endPointPayload: { [id: string]: AnalyzerEndPoint } = {};
    private endPointId = 1000;

    private getLastIndex(array: Array<any>) {
        if (array.length) {
            return array.length - 1;
        } else {
            return 0;
        }
    }

    public addNextNode() {
        const lastIndex = this.getLastIndex(this.analyzerActionStack);
        const parentBranch = this.analyzerActionStack[lastIndex];
        const newNode: AnalyzerAction = {};
        parentBranch.nextNode = newNode;
        this.analyzerActionStack[lastIndex] = newNode;

    }

    public pushIfBranch() {
        const lastIndex = this.getLastIndex(this.analyzerActionStack);
        const parentBranch = this.analyzerActionStack[lastIndex];

        if (!this.isEmptyNode(parentBranch)) {
            this.addNextNode()
        }

        const nextAction: AnalyzerAction = {};
        this.analyzerActionStack[lastIndex].ifBody = nextAction;
        this.analyzerActionStack.push(nextAction);
    }

    public pushElseBranch() {
        const lastIndex = this.getLastIndex(this.analyzerActionStack);
        const parentBranch = this.analyzerActionStack[lastIndex];

        if (!this.isEmptyNodeForElse(parentBranch)) {
            this.addNextNode()
        }

        const nextAction: AnalyzerAction = {};
        this.analyzerActionStack[lastIndex].elseBody = nextAction;
        this.analyzerActionStack.push(nextAction);
    }

    public pushForBranch() {
        const lastIndex = this.getLastIndex(this.analyzerActionStack);
        const parentBranch = this.analyzerActionStack[lastIndex];

        if (!this.isEmptyNode(parentBranch)) {
            this.addNextNode()
        }

        const nextAction: AnalyzerAction = {};
        this.analyzerActionStack[lastIndex].forBody = nextAction;
        this.analyzerActionStack.push(nextAction);
    }

    public popBranch() {
        const lastBranch = this.analyzerActionStack.pop();
        const lastIndex = this.getLastIndex(this.analyzerActionStack);
        const parentBranch = this.analyzerActionStack[lastIndex];

        if (this.isEmptyNode(lastBranch)) {
            if (parentBranch?.elseBody && this.isEmptyNode(parentBranch?.elseBody)) {
                parentBranch.elseBody = null
            }

            if (parentBranch?.forBody && this.isEmptyNode(parentBranch?.forBody)) {
                parentBranch.forBody = null
            }

            if (parentBranch?.ifBody && this.isEmptyNode(parentBranch?.ifBody)) {
                parentBranch.ifBody = null
            }

            if (parentBranch?.nextNode && this.isEmptyNode(parentBranch?.nextNode)) {
                parentBranch.nextNode = null
            }
        }
    }

    private getEndpointId(variableName: string) {
        for (const bodyData of this.endPointIdDictionary) {
            const result = bodyData.find((endPointData) => endPointData.variableName === variableName);
            if (result) {
                return result.id;
            }
        }
    }

    public pushActionNode(node: RemoteMethodCallAction) {
        const endPointReference = this.getEndpointId(node?.expression?.source);

        // Abort the execution on no reference end point found
        if (!endPointReference) {
            return;
        }

        const positionalArg = node?.arguments.filter(element => element.kind === "PositionalArg")
            .map(element => element.source).join("/").replace(/"/g, "");
        const analyzerAction: AnalyzerAction = {
            endPointRef: endPointReference,
            name: node.methodName.name.value,
            path: positionalArg,
            pos: `choreo.ball:${(node.position as NodePosition).startLine}:${(node.position as NodePosition).startColumn}`
        }

        const lastIndex = this.getLastIndex(this.analyzerActionStack);
        if (this.isEmptyNode(this.analyzerActionStack[lastIndex])) {
            this.analyzerActionStack[lastIndex].endPointRef = endPointReference;
            this.analyzerActionStack[lastIndex].name = analyzerAction.name;
            this.analyzerActionStack[lastIndex].path = positionalArg;
            this.analyzerActionStack[lastIndex].pos = analyzerAction.pos;
        } else {
            this.analyzerActionStack[lastIndex].nextNode = analyzerAction;
            this.analyzerActionStack[lastIndex] = analyzerAction;
        }

    }

    public pushBody() {
        this.endPointIdDictionary.push([]);
    }

    public popBody() {
        this.endPointIdDictionary.pop();
    }

    public pushEndPointNode(node: LocalVarDecl,) {
        const variableName = (node.typedBindingPattern.bindingPattern as CaptureBindingPattern).variableName.value;
        const position = node.position as NodePosition;
        const analyzerEndPoint: AnalyzerEndPoint = {
            name: node.typeData.typeSymbol.name,
            baseUrl: ((((node.initializer as CheckExpression)?.expression as ImplicitNewExpression)
                ?.parenthesizedArgList?.arguments[0] as PositionalArg )?.expression as StringLiteral)?.literalToken?.value.replace(/"/g, ""),
            pkgID: node?.typeData?.typeSymbol?.moduleID?.orgName + "/" + node?.typeData?.typeSymbol?.moduleID?.moduleName,
            pos: `(${position?.startLine}:${position?.startColumn},${position?.endLine}:${position?.endColumn})`
        }

        const id = (++this.endPointId).toString();
        this.endPointIdDictionary[this.getLastIndex(this.endPointIdDictionary)].push({ id, variableName })
        this.endPointPayload[id] = analyzerEndPoint;
    }


    private isEmptyNode(action: AnalyzerAction) {
        return !(action.elseBody || action.ifBody || action.forBody || action.endPointRef || action.nextNode)
    }

    private isEmptyNodeForElse(action: AnalyzerAction) {
        return !(action.forBody)
    }

    public cleanup() {
        const newAction: AnalyzerAction = {};
        this.endPointPayload = {};
        this.endPointIdDictionary = [[]];
        this.analyzerPayload = newAction;
        this.analyzerActionStack = [newAction];
        this.endPointId = 1000;
    }

    public getPayload() {
        return { endpoints: this.endPointPayload, actionInvocations: this.analyzerPayload }
    }
}
