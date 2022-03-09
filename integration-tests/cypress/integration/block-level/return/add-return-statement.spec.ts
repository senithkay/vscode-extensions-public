import { getIntegrationTestPageURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { FunctionForm } from "../../../utils/forms/function-form";
import { ReturnForm } from "../../../utils/forms/return-form";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";

const BAL_FILE_PATH = "block-level/return/add-return-statement-empty-file.bal";

describe('Add return statement', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
    })

    it('Add return statement of type string', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Function");

        FunctionForm
            .shouldBeVisible()
            .typeFunctionName("getGreetings")
            .typeReturnType("string?")
            .save();

        Canvas.getFunction("getGreetings")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .getBlockLevelPlusWidget()
            .clickOption("Return");

        ReturnForm
            .shouldBeVisible()
            .typeExpression('"Hello World!!!"')
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-return-statement.expected.bal");
    })

    it.skip('Type a return statement and Cancel', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Function");

        FunctionForm
            .shouldBeVisible()
            .typeFunctionName("getGreetings")
            .typeReturnType("string?")
            .save();

        Canvas.getFunction("getGreetings")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .getBlockLevelPlusWidget()
            .clickOption("Return");

        ReturnForm
            .shouldBeVisible()
            .typeExpression('"Hello World!!!"')
            .cancel()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "delete-return-statement.expected.bal");
    })

    it('Type invalid return statement and check for diagnostics', () => {
        Canvas
            .welcomeMessageShouldBeVisible()
            .clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Function");

        FunctionForm
            .shouldBeVisible()
            .typeFunctionName("getGreetings")
            .typeReturnType("string?")
            .save();

        Canvas.getFunction("getGreetings")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .getBlockLevelPlusWidget()
            .clickOption("Return");

        ReturnForm
            .shouldBeVisible()
            .typeExpression('true')
            .checkForDiagnostics()
            .clearExpression()
            .typeExpression('"Hello World!!!"')
            .save()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-return-statement.expected.bal");
    })
})
