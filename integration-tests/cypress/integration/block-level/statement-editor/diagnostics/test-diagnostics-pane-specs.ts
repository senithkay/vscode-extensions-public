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
import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";
import { Canvas } from "../../../../utils/components/canvas";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../../utils/components/statement-editor/input-editor";
import { BlockLevelPlusWidget } from "../../../../utils/components/block-level-plus-widget";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test statement editor diagnostics', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Test semantic diagnostics with disabled save button', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible();

        EditorPane
            .getStatementRenderer()
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var');

        InputEditor
            .typeInput("string");

        EditorPane
            .validateEmptyDiagnostics()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("\"testing LS diagnostics functionality\"");

        EditorPane
            .validateEmptyDiagnostics()
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('string');

        InputEditor
            .typeInput("int");

        EditorPane
            .validateNewExpression("TypedBindingPattern","int")
            .validateDiagnosticMessage("incompatible types: expected 'int', found 'string'");

        StatementEditor
            .saveDisabled()
            .close();
    });


    it('Test syntax diagnostics with disabled save button', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible();

        EditorPane
            .getStatementRenderer()
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var');

        InputEditor
            .typeInput("int");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("1 +");

        EditorPane
            .validateDiagnosticMessage("missing identifier");

        StatementEditor
            .saveDisabled();
    });

    it('Test statement with multiple diagnostics', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("ForEach");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var');

        InputEditor
            .typeInput("json");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("var1");

        EditorPane
            .validateNewExpression("SimpleNameReference","var1")
            .checkForMultipleDiagnostics();

        StatementEditor
            .saveDisabled()
            .cancel();
    });
})
