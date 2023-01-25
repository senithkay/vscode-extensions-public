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
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { Toolbar } from "../../../utils/components/statement-editor/toolbar";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";
import { SuggestionsPane } from "../../../utils/components/statement-editor/suggestions-pane";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test statement editor toolbar operator functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Test statement update with toolbar operators', () => {
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
            .clickOperator("()");

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("var1");

        EditorPane
            .validateNewExpression("SimpleNameReference", "var1");

        Toolbar
            .clickOperator("+");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("var2");

        EditorPane
            .validateNewExpression("SimpleNameReference", "var2")
            .reTriggerDiagnostics("SimpleNameReference", "var2")
            .validateEmptyDiagnostics();
        
        Toolbar
            .clickOperator("/");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("var1");
            
        EditorPane
            .validateNewExpression("SimpleNameReference", "var1")
            .reTriggerDiagnostics("SimpleNameReference", "var1")
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-operator-functionality.expected.bal");
    });

    it('Test context based toolbar operators on statements', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("If");

        StatementEditor
            .shouldBeVisible();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("var1");

        EditorPane
            .validateNewExpression("SimpleNameReference", "var1");

        Toolbar
            .clickOperator(">=");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("var2");

        EditorPane
            .validateNewExpression("SimpleNameReference", "var2")
            .reTriggerDiagnostics("SimpleNameReference", "var2")
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(3);

        BlockLevelPlusWidget.clickOption("ForEach");

        StatementEditor
            .shouldBeVisible();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("1");

        EditorPane
            .validateNewExpression("NumericLiteral", "1");

        Toolbar
            .clickOperator("..<");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("3");

        EditorPane
            .validateNewExpression("NumericLiteral", "3")
            .reTriggerDiagnostics("NumericLiteral", "3")
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-operator-statement-context.expected.bal");
    });

    it('Test context based toolbar operators on expression', () => {
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
            .clickOperator("()");

        Toolbar
            .clickMoreExpressions();

        SuggestionsPane
            .tabShouldFocused("Expressions")
            .typeExpressionInSearchBar("query")
            .clickExpressionSuggestion('from var i in Ex1 where Ex2 select Ex3');

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-type>');

        InputEditor
            .typeInput("int");

        EditorPane
            .validateNewExpression("TypedBindingPattern", "int");

        Toolbar
            .clickOperator("?");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("[1,2,3]");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("item");
        
        Toolbar
            .clickOperator("!=");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("var1");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent('<add-expression>');

        InputEditor
            .typeInput("var1");
            
        EditorPane
            .validateNewExpression("SimpleNameReference", "var1")
            .reTriggerDiagnostics("SimpleNameReference", "var1")
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "toolbar-operator-expression-context.expected.bal");
    });

});
