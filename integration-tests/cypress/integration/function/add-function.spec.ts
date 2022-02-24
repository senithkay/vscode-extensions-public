import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { FunctionForm } from "../../utils/forms/function-form";
import { LogForm } from "../../utils/forms/log-form";
import { ReturnForm } from "../../utils/forms/return-form";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/add-function-to-empty-file.bal";

describe('Add functions via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Add a main function to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Main");

    FunctionForm
      .shouldBeVisible()
      .typeReturnType("string|error?")
      .save();

    Canvas.getFunction("main")
      .nameShouldBe("main")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Debug")
      .typeExpression(`"This is a debug message."`)
      .save();
    Canvas.getFunction("main")
      .getDiagram()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("Return");

    ReturnForm
      .shouldBeVisible()
      .typeExpression('"Hello"')
      .save();
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

    Canvas.getFunction("myfunction")
      .nameShouldBe("myfunction")
      .shouldBeExpanded()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Debug")
      .typeExpression(`"This is a debug message."`)
      .save();

    Canvas.clickTopLevelPlusButton(6);
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
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Debug")
      .typeExpression(`"This is a debug message."`)
      .save();

    // Add another log
    Canvas.getFunction("getGreeting")
      .getDiagram()
      .clickDefaultWorkerPlusBtn(1)
      .getBlockLevelPlusWidget()
      .clickOption("Log");

    LogForm
      .shouldBeVisible()
      .selectType("Warn")
      .typeExpression(`"This is a warning message."`)
      .save();

    Canvas.getFunction("getGreeting")
      .getDiagram()
      .clickDefaultWorkerPlusBtn(2)
      .getBlockLevelPlusWidget()
      .clickOption("Return");

    ReturnForm
      .shouldBeVisible()
      .typeExpression('"Hello"')
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-function.expected.bal");
  })

  it('Add functions via Low Code with parameters', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .addParameter("string", "name")
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
      .selectType("Debug")
      .typeExpression(`name`)
      .save();

    Canvas.clickTopLevelPlusButton(6);
    TopLevelPlusWidget.clickOption("Function");
    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("getGreeting")
      .addParameter("string", "name")
      .addParameter("int", "quantity")
      .typeReturnType("string")
      .save();

    // Add return
    Canvas.getFunction("getGreeting")
      .nameShouldBe("getGreeting")
      .expand()
      .getDiagram()
      .shouldBeRenderedProperly()
      .getBlockLevelPlusWidget()
      .clickOption("Return");

    ReturnForm
      .shouldBeVisible()
      .typeExpression('name + quantity.toString()')
      .save();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "add-function-with-parameters.expected.bal");
  })
})
