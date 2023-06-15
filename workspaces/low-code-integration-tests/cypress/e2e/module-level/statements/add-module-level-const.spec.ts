/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */

import { Canvas } from "../../../utils/components/canvas";
import { SourceCode } from "../../../utils/components/code-view";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";

const EMPTY_BAL_FILE_PATH = "default/empty-file.bal";

describe('Add const to module level via Low Code', () => {
    before(() => {
        cy.visit(getIntegrationTestPageURL(EMPTY_BAL_FILE_PATH));
    });

    it('Add constant to module level', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();

        TopLevelPlusWidget
            .clickOption("Constant");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent('CONST_NAME');

        InputEditor
            .typeInput('ONE');

        EditorPane
            .getStatementRenderer()
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput('"1"');

        EditorPane
            .validateNewExpression("StringLiteral", '"1"')
            .reTriggerDiagnostics("StringLiteral", '"1"');

        StatementEditor
            .save();
    });

    it('Add constant to module level with type', () => {
        Canvas.clickTopLevelPlusButton(1);

        TopLevelPlusWidget
            .clickOption("Constant");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent('CONST_NAME');

        InputEditor
            .typeInput('int TWO');

        EditorPane
            .validateNewExpression("IntTypeDesc", 'int')

        EditorPane
            .getStatementRenderer()
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput('2');

        EditorPane
            .validateNewExpression("NumericLiteral", '2')
            .reTriggerDiagnostics("NumericLiteral", '2');

        StatementEditor
            .save();
    });

    it('Edit constant in module level', () => {
        Canvas.getConstant("TWO").clickEdit();
        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent('TWO');

        InputEditor
            .typeInput('TWO_INT');
        
        EditorPane
            .validateNewExpression("IdentifierToken", 'TWO_INT')
            .reTriggerDiagnostics("IdentifierToken", 'TWO_INT');

        StatementEditor
            .save();

        cy.wait(1500);
        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-module-level-constant.expected.bal");
    });

});
