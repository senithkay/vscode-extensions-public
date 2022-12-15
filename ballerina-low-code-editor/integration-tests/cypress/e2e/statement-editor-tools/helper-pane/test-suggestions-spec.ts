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
import { SuggestionsPane } from "../../../utils/components/statement-editor/suggestions-pane";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";
import { InputEditor } from "../../../utils/components/statement-editor/input-editor";
import { BlockLevelPlusWidget } from "../../../utils/components/block-level-plus-widget";

const BAL_FILE_PATH = "block-level/statement-editor/statement-editor-init.bal";

describe('Test helper pane functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Add Variable Declaration Statement with Ls-Suggestions', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('var1');

        EditorPane
            .validateNewExpression("SimpleNameReference", "var1")
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var');

        InputEditor
            .typeInput("float");

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('int');

        EditorPane
        .reTriggerDiagnostics("CaptureBindingPattern", "variable");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "suggestions-functionality.expected.bal");

    });

    it('Add Variable Declaration Statement with Expression and Operator Suggestions', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .clickExpressionSuggestion('Es + Ex');

        EditorPane
            .validateNewExpression("BinaryExpression", "<add-expression> + <add-expression>")
            .getExpression("BinaryExpression")
            .clickSpecificExpression("SimpleNameReference", 0, `<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('var2');

        EditorPane
            .validateNewExpression("BinaryExpression", "var2")
            .getExpression("BinaryExpression")
            .clickExpressionContent('+');

        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .clickExpressionSuggestion('-');

        EditorPane
            .getExpression("BinaryExpression")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput("1");

        EditorPane
            .validateNewExpression("NumericLiteral", "1")
            .reTriggerDiagnostics("NumericLiteral", "1")
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "expression-and-operator-suggestions.expected.bal");
    });

    it('Add Variable Declaration Statement with Type Expression Suggestions', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('var1');

        EditorPane
            .validateNewExpression("SimpleNameReference", "var1")
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var');

        InputEditor
            .typeInput("decimal");

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('int');

        EditorPane
            .validateNewExpression("TypedBindingPattern", "int");

        SuggestionsPane
            .clickSuggestionsTab("Expressions");

        EditorPane
            .getExpression("TypedBindingPattern")
            .clickExpressionContent('int');

        SuggestionsPane
            .clickExpressionSuggestion('Es | Ex');

        EditorPane
            .getExpression("UnionTypeDesc")
            .clickSpecificExpression("SimpleNameReference", 0, '<add-type>');

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('float');

        EditorPane
            .reTriggerDiagnostics("CaptureBindingPattern", "variable");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "type-suggestion.expected.bal");
    });

    it('Validate correct expression suggestion filtering with search', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .typeExpressionInSearchBar("record")
            .validateUnrelatedSuggestions("record{Es Ex;}");

        EditorPane
            .getExpression("TypedBindingPattern")
            .clickExpressionContent("var");

        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .typeExpressionInSearchBar("record")
            .clickExpressionSuggestion("record{Es Ex;}");

        // TODO: Find way to show and capture diagnostic message
        // EditorPane
        //     .checkForDiagnostics();

        EditorPane
            .checkForSyntaxDiagnosticsHighlighting();
    });

    it('Test Library-suggestions and filtering of libraries with dropdown', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Libraries")
            .clickLibrarySuggestion('lang.int')
            .clickSearchedLibSuggestion('lang.int:abs');

        EditorPane
            .validateNewExpression("FunctionCall", "int0:abs(<add-n>)")
            .getExpression("IdentifierToken")
            .doubleClickExpressionContent('<add-n>');

        InputEditor
            .typeInput("285");

        SuggestionsPane
            .clickSuggestionsTab("Libraries")
            .waitForLoading()
            .clickOnLibraryDropdown("Standard")
            .validateFilteredLib("lang.int")
            .clickSuggestionsTab("Libraries")
            .clickOnLibraryDropdown("Language")
            .validateFilteredLib("auth");

        EditorPane
            .reTriggerDiagnostics("NumericLiteral", "285");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "lib-suggestion.expected.bal");

    });

    it('Test a suggestion for partially typed value', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsSuggestion('var1');

        EditorPane
            .validateNewExpression("SimpleNameReference", "var1")
            .getExpression("TypedBindingPattern")
            .doubleClickExpressionContent('var');

        InputEditor
            .typeInput("in");

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('int');

        EditorPane
            .reTriggerDiagnostics("CaptureBindingPattern", "variable");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "partial-type-suggestion.expected.bal");
    });

    it('Test second level suggestions', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Suggestions")
            .clickLsTypeSuggestion('var2')
            .waitForLoading()
            .clickLsTypeSuggestion('toString()');

        EditorPane
            .validateEmptyDiagnostics();

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "second-level-suggestion.expected.bal");
    });

    it('Validate correct expression suggestions in query expressions', () => {
        Canvas.getFunction("testStatementEditorComponents")
            .nameShouldBe("testStatementEditorComponents")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickDefaultWorkerPlusBtn(2);

        BlockLevelPlusWidget.clickOption("Variable");

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .getStatementRenderer()
            .getExpression("SimpleNameReference")
            .clickExpressionContent(`<add-expression>`);

        SuggestionsPane
            .clickSuggestionsTab("Expressions")
            .typeExpressionInSearchBar("query")
            .clickExpressionSuggestion('from var i in Ex1 where Ex2 select Ex3');

        EditorPane
            .ClickHoverPlusOfExpression("FromClause", 0, `<add-expression>`);

        SuggestionsPane
            .validateUnrelatedSuggestions("record{Es Ex;}")
            .clickExpressionSuggestion("limit Ex");

        EditorPane
            .getExpression("LimitClause")
            .ClickHoverPlusOfExpression("LimitClause", 1, `<add-expression>`);

        SuggestionsPane
            .clickExpressionSuggestion('order by Ex ascending');

        EditorPane
            .getExpression("OrderByClause")
            .clickExpressionContent(`ascending`);

        SuggestionsPane
            .validateUnrelatedSuggestions("limit Ex")
            .clickExpressionSuggestion("descending");
    });
});
