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
import {
    BlockStatement,
    NodePosition,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";
import { Diagnostic } from "vscode-languageserver-protocol";

import { StmtOffset } from "../models/definitions";
import { isPositionsEquals } from "../utils";
import { StatementEditorViewState } from "../utils/statement-editor-viewstate";

class DiagnosticsMappingVisitor implements Visitor {
    private diagnostic: Diagnostic;
    private offset: StmtOffset;

    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (parent && (parent.viewState as StatementEditorViewState)?.isWithinBlockStatement) {
            (node.viewState as StatementEditorViewState).isWithinBlockStatement = true;
        }
    }

    public beginVisitBlockStatement(node: BlockStatement, parent?: STNode) {
        node.statements.map((stmt: STNode) => {
            (stmt.viewState as StatementEditorViewState).isWithinBlockStatement = true;
        });
    }

    public endVisitSTNode(node: STNode, parent?: STNode) {
        const isWithinBlockStatement = (node.viewState as StatementEditorViewState)?.isWithinBlockStatement;
        const diagPosition: NodePosition = {
            startLine: this.diagnostic.range.start.line,
            startColumn: this.diagnostic.range.start.character,
            endLine: this.diagnostic.range.end.line,
            endColumn: this.diagnostic.range.end.character
        }
        const nodePosition: NodePosition = {
            startLine: node?.position?.startLine + this.offset.startLine,
            startColumn: node?.position?.startColumn + (!isWithinBlockStatement ? this.offset.startColumn : 0),
            endLine: node?.position?.endLine + this.offset.startLine,
            endColumn: node?.position?.endColumn + (!isWithinBlockStatement ? this.offset.startColumn : 0)
        }
        if (isPositionsEquals(diagPosition, nodePosition)) {
            node?.syntaxDiagnostics?.push({
                diagnosticInfo: {
                    code: this.diagnostic.code.toString(),
                    severity: this.diagnostic.severity.toString()
                },
                message: this.diagnostic.message
            });
        }
    }

    setDiagnosticsNOffset(diagnostic: Diagnostic, offset: StmtOffset) {
        this.diagnostic = diagnostic;
        this.offset = offset;
    }
}

export const visitor = new DiagnosticsMappingVisitor();
