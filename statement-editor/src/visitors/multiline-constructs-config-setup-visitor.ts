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
    LetClause,
    MappingConstructor, QueryPipeline,
    STKindChecker,
    STNode,
    Visitor
} from "@wso2-enterprise/syntax-tree";

import { StatementEditorViewState } from "../utils/statement-editor-viewstate";

class MultilineConstructsConfigSetupVisitor implements Visitor {
    public beginVisitSTNode(node: STNode, parent?: STNode) {
        if (parent && (parent.viewState as StatementEditorViewState).multilineConstructConfig.isFieldWithNewLine) {
            (node.viewState as StatementEditorViewState).multilineConstructConfig.isFieldWithNewLine = true;
        }
    }

    public beginVisitMappingConstructor(node: MappingConstructor, parent?: STNode) {
        node.fields.map((field: STNode, index: number) => {
            if (node.fields.length - 1 === index) {
                (field.viewState as StatementEditorViewState).multilineConstructConfig.isFieldWithNewLine = true;
            }
        });
        if (node.openBrace.position.endLine !== node.closeBrace.position.startLine) {
            (node.closeBrace.viewState as StatementEditorViewState)
                .multilineConstructConfig.isClosingBraceWithNewLine = true;
        }
        if (STKindChecker.isSpecificField(parent) || STKindChecker.isComputedNameField(parent)) {
            (node.closeBrace.viewState as StatementEditorViewState)
                .multilineConstructConfig.isFieldWithNewLine = true;
        }
    }

    public beginVisitQueryPipeline(node: QueryPipeline, parent?: STNode) {
        (node.fromClause.viewState as StatementEditorViewState).multilineConstructConfig.isFieldWithNewLine = true;
        node.intermediateClauses.map((clause: STNode, index: number) => {
            (clause.viewState as StatementEditorViewState).multilineConstructConfig.isFieldWithNewLine = true;
        })
    }

    public beginVisitLetClause(node: LetClause, parent?: STNode) {
        (node.viewState as StatementEditorViewState).multilineConstructConfig.isFieldWithNewLine = false;
        node.letVarDeclarations.map((letVarDeclaration: STNode, index: number) => {
            (letVarDeclaration.viewState as StatementEditorViewState).multilineConstructConfig.isFieldWithNewLine =
                node.letVarDeclarations.length - 1 === index;
        });
    }
}

export const visitor = new MultilineConstructsConfigSetupVisitor();
