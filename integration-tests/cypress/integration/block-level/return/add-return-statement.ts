import { getIntegrationTestStoryURL } from "../../../utils/story-url-utils";
import { Canvas } from "../../../utils/components/canvas";
import { TopLevelPlusWidget } from "../../../utils/components/top-level-plus-widget";
import { FunctionForm } from "../../../utils/forms/function-form";
import { ReturnForm } from "../../../utils/forms/return-form";
import { SourceCode } from "../../../utils/components/code-view";
import { getCurrentSpecFolder } from "../../../utils/file-utils";

const BAL_FILE_PATH = "default/empty-file.bal";

describe('Add return statement', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
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
            getCurrentSpecFolder() + "add-return-statement-expected.bal");
    })

    it('Type a return statement and Cancel', () => {
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
            getCurrentSpecFolder() + "delete-return-statement-expected.bal");
    })

    it('Type invalid return statement and check for validation', () => {
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
            .typeExpression('"boolean"')
            .cancel()
        // TODO check for diagnostics


        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "delete-return-statement-expected.bal");
    })
})