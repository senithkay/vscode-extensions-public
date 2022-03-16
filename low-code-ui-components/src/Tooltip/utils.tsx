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

import { DiagnosticMsgSeverity, DiagramDiagnostic } from "@wso2-enterprise/ballerina-low-code-edtior-commons";
import { ForeachStatement, IfElseStatement, STNode, WhileStatement } from '@wso2-enterprise/syntax-tree';

export function getSourceFromST(componentSTNode: STNode): string {
    if (componentSTNode) {
        return componentSTNode?.source?.trim().split(')')[0]
    }
}

export function getDiagnosticsFromST(componentSTNode: STNode): DiagnosticMsgSeverity {
    let diagnostics;
    if (componentSTNode) {
        if (componentSTNode.kind === "ForeachStatement") {
            const forEachModel = componentSTNode as ForeachStatement
            diagnostics = (forEachModel?.actionOrExpressionNode?.typeData?.diagnostics).length !== 0 ?
                (forEachModel?.actionOrExpressionNode?.typeData?.diagnostics)
                : (forEachModel?.typedBindingPattern?.typeData?.diagnostics);
        }
        else if (componentSTNode.kind === "WhileStatement") {
            const modelWhile = componentSTNode as WhileStatement;
            diagnostics = modelWhile?.condition?.typeData?.diagnostics;
        }
        else if (componentSTNode.kind === "IfElseStatement") {
            const modelIf = componentSTNode as IfElseStatement;
            diagnostics = modelIf?.condition?.typeData?.diagnostics;
        }
        else {
            diagnostics = componentSTNode?.typeData?.diagnostics;
        }
        return (getDiagnosticInfo(diagnostics));
    }
}

export function getDiagnosticInfo(diagnostics: DiagramDiagnostic[]): DiagnosticMsgSeverity {
    /* tslint:disable prefer-for-of */
    const diagnosticMsgsArray: string[] = [];
    if (diagnostics?.length === 0 || diagnostics === undefined) {
        return undefined;
    }
    else {
        if (diagnostics[0]?.diagnosticInfo?.severity === "WARNING") {
            for (let i = 0; i < diagnostics?.length; i++) {
                diagnosticMsgsArray.push(diagnostics[i]?.message)
            }
            return {
                message: diagnosticMsgsArray?.join(',\n'),
                severity: "WARNING"
            }
        }
        else {
            for (let i = 0; i < diagnostics?.length; i++) {
                diagnosticMsgsArray.push(diagnostics[i]?.message)
            }
            return {
                message: diagnosticMsgsArray?.join(',\n'),
                severity: "ERROR"
            }
        }
    }
}
