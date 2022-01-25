import { BlockLevelPlusWidget } from "../../utils/components/block-level-plus-widget";
import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { FunctionForm } from "../../utils/forms/function-form";
import { LogForm } from "../../utils/forms/log-form";
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/add-function-to-empty-file.bal";

describe('Add functions via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
  })

  it('Add a function to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");
    
    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-function.expected.bal");

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly();

    BlockLevelPlusWidget.clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Debug")
      .typeExpression(`"Hello World!"`)
      .save();

    Canvas.clickTopLevelPlusButton(4);
    TopLevelPlusWidget.clickOption("Function");
    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("getGreeting")
      .typeReturnType("string")
      .save();
    
    Canvas.getFunction("getGreeting")
      .nameShouldBe("getGreeting")
      .expand()
      .getDiagram()
      .shouldBeRenderedProperly();
  })
})
