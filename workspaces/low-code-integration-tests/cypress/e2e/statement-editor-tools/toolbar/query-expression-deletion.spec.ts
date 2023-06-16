/**
 * Copyright (c) 2022, WSO2 LLC. (https://www.wso2.com). All Rights Reserved.
 *
 * This software is the property of WSO2 LLC. and its suppliers, if any.
 * Dissemination of any information or reproduction of any material contained
 * herein in any form is strictly forbidden, unless permitted by WSO2 expressly.
 * You may not alter or remove any copyright or other notice from copies of this content."
 */
import { SuggestionsPane } from "../../../utils/components/statement-editor/suggestions-pane";
import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { StatementEditor } from "../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../utils/components/statement-editor/editor-pane";
import { Toolbar } from "../../../utils/components/statement-editor/toolbar";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";

const BAL_FILE_PATH = "block-level/statement-editor/query-expression.bal";

describe('Test statement editor query expression deletion functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Test deletion on intermediate query clause placeholder', () => {
        Canvas.getFunction("main")
            .nameShouldBe("main")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(2);

        StatementEditor
            .shouldBeVisible();

        EditorPane
            .getExpression("WhereClause")
            .ClickHoverPlusOfExpression("WhereClause", 1, `i % 2 == 0`);

        Toolbar
            .clickDeleteButton()

        EditorPane
            .reTriggerDiagnostics("NumericLiteral", "0");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "query-expression.expected.bal");

    });

    it('Test delete button disabled on required query expressions', () => {
        Canvas.getFunction("main")
            .nameShouldBe("main")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(2);

        StatementEditor
            .shouldBeVisible();

        EditorPane
            .getExpression("WhereClause")
            .ClickHoverPlusOfExpression("WhereClause", 1, `i % 2 == 0`);

        SuggestionsPane
            .tabShouldFocused("Expressions")
            .clickExpressionSuggestion("let var i = Ex");

        EditorPane
            .getExpression("LetClause")
            .clickExpressionContent("<add-expression>");

        Toolbar
            .deleteDisabled();

        EditorPane
            .getExpression("WhereClause")
            .ClickHoverPlusOfExpression("WhereClause", 1, `i % 2 == 0`);

        SuggestionsPane
            .clickExpressionSuggestion("order by Ex ascending")

        EditorPane
            .getExpression("OrderByClause")
            .clickExpressionContent("ascending");

        Toolbar
            .deleteDisabled();

    });
})
