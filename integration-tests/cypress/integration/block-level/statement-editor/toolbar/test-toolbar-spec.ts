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
import { SuggestionsPane } from "../../../../utils/components/statement-editor/suggestions-pane";
import { Toolbar } from "../../../../utils/components/statement-editor/toolbar";
import { InputEditor } from "../../../../utils/components/statement-editor/input-editor";
import { SourceCode } from "../../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../../utils/file-utils";
import { BlockLevelPlusWidget } from "../../../../utils/components/block-level-plus-widget";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test statement editor toolbar functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Test Undo, Redo options', () => {
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
            .validateNewExpression("TypedBindingPattern", "int");

        Toolbar
            .clickUndoButton();

        EditorPane
            .validateNewExpression("TypedBindingPattern", "var");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("456");

        EditorPane
            .validateNewExpression("NumericLiteral", "456")
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-functionality.expected.bal");

    });

    it('Delete expression type', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(2);

        StatementEditor
            .shouldBeVisible();

        EditorPane
            .getExpression("IntTypeDesc")
            .clickExpressionContent('int');

        Toolbar
            .clickDeleteButton();

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-type>`);

        InputEditor
            .typeInput("float");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-type-delete.expected.bal");

    });

    it('Delete expression value', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(2);

        StatementEditor
            .shouldBeVisible();

        EditorPane
            .getExpression("NumericLiteral")
            .clickExpressionContent('2');

        Toolbar
            .clickDeleteButton();

        EditorPane
            .getExpression("NumericLiteral")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("3");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-variable-value-delete.expected.bal");

    });

    it('Add Configurable', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible();
    
        Toolbar
            .clickConfigurableButton();

        EditorPane
            .validateNewExpression("TypedBindingPattern", "conf");

        StatementEditor
            .add();
        
        EditorPane
            .validateNewExpression("SimpleNameReference", "conf");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-add-config.expected.bal");

    });

})
