import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { FunctionForm } from "../../utils/forms/function-form";
import { LogForm } from "../../utils/forms/log-form";
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils";


const BAL_FILE_PATH = "function/add-function-to-empty-file.bal";

describe('Update log statement type', () => {
    beforeEach(() => {
        cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
    })

    it('Delete a log statement', () => {
        Canvas
          .welcomeMessageShouldBeVisible()
          .clickTopLevelPlusButton();
        TopLevelPlusWidget.clickOption("Function");
    
        FunctionForm
          .shouldBeVisible()
          .typeFunctionName("myfunction")
          .typeReturnType("json|error?")
          .save();
    
        Canvas.getFunction("myfunction")
          .nameShouldBe("myfunction")
          .shouldBeExpanded()
          .getDiagram()
          .shouldBeRenderedProperly()
          .getBlockLevelPlusWidget()
          .clickOption("Log");
    
        LogForm
          .shouldBeVisible()
          .selectType("Info")
          .typeExpression(`"This is an info message."`)
          .save();    
        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-info-log.expected.bal");

        Canvas.getFunction("myfunction")
            .shouldBeExpanded()
            .getDiagram()
            .shouldBeRenderedProperly()
            .deleteExistingLogStatement()

        SourceCode.shouldBeEqualTo(
            getCurrentSpecFolder() + "add-empty-function.expected.bal");

})
})
