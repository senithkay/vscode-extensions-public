import { Canvas } from "../../utils/components/canvas";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { FunctionForm } from "../../utils/forms/function-form";
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
      .typeReturnType("error?")
      .save();
  })
})
