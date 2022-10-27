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
import { Canvas } from "../../../../utils/components/canvas";
import { getIntegrationTestPageURL } from "../../../../utils/story-url-utils";
import { StatementEditor } from "../../../../utils/components/statement-editor/statement-editor";
import { EditorPane } from "../../../../utils/components/statement-editor/editor-pane";
import { InputEditor } from "../../../../utils/components/statement-editor/input-editor";
import { SourceCode } from "../../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../../utils/file-utils";
import { ParameterTab } from "../../../../utils/components/statement-editor/parameter-tab";

const BAL_FILE_PATH = "block-level/statement-editor/edit-function-call-in-function.bal";

describe('Test helper plane parameter tab functionality', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH));
    });

    it('Edit functions form in function', () => {
        Canvas.getFunction("main")
            .nameShouldBe("main")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(20);

        StatementEditor
            .shouldBeVisible();

        ParameterTab
            .shouldBeFocused()
            .shouldHaveParameterList()
            .shouldHaveRequiredArg("str")
            .shouldHaveOptionalArg("n")
            .shouldHaveOptionalArg("student")
            .toggleOptionalArg("student");

        EditorPane
            .getExpression("SimpleNameReference")
            .doubleClickExpressionContent(`<add-expression>`);

        InputEditor
            .typeInput('{}');

        StatementEditor
            .save();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "edit-function-call-in-function.expected.bal");
    });

    it('Edit function call and cancel', () => {
        Canvas.getFunction("main")
            .nameShouldBe("main")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .clickEditExistingBlockStatement(19);

        StatementEditor
            .shouldBeVisible()
            .cancel();

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-function-call-to-function.expected.bal");
    });
});
