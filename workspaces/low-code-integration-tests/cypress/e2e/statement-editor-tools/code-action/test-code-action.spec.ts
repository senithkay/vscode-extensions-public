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
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";

const BAL_FILE_PATH = "block-level/statement-editor/empty-function-with-error.bal";

describe('Test statement editor code action functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Code action type change quick fix', () => {
        Canvas.getFunction("main")
            .nameShouldBe("main")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(1);

        StatementEditor
            .shouldBeVisible()
            .getEditorPane();

        EditorPane
            .validateDiagnosticMessage("incompatible types: expected 'string', found 'int'")
            .clickCodeActionButton()
            .clickCodeActionMenuItem();

        EditorPane
            .reTriggerDiagnostics("CaptureBindingPattern", "s");

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "type-fix-code-action.expected.bal");
    });
});
