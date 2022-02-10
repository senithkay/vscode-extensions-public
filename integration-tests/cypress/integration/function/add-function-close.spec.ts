import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { FunctionForm } from "../../utils/forms/function-form";
import { getIntegrationTestStoryURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "default/empty-file.bal";

describe('Add a function and close the panel without saving', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestStoryURL(BAL_FILE_PATH))
  })

  it('Add a function and close the panel without saving', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .close();

    Canvas.welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");
    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("getGreeting")
      .typeReturnType("string")
      .close();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "blank.expected.bal");
  })

  it('Add a function and click cancel button', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .cancel();

    Canvas.welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");
    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("getGreeting")
      .typeReturnType("string")
      .cancel();

    SourceCode.shouldBeEqualTo(
      getCurrentSpecFolder() + "blank.expected.bal");
  })
})
