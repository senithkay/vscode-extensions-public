import { Canvas } from "../../utils/components/canvas";
import { SourceCode } from "../../utils/components/code-view";
import { TopLevelPlusWidget } from "../../utils/components/top-level-plus-widget";
import { getCurrentSpecFolder } from "../../utils/file-utils";
import { FunctionForm } from "../../utils/forms/function-form";
import { getIntegrationTestPageURL } from "../../utils/story-url-utils"

const BAL_FILE_PATH = "function/add-function-to-empty-file.bal";

describe('Add function and parameters via Low Code', () => {
  beforeEach(() => {
    cy.visit(getIntegrationTestPageURL(BAL_FILE_PATH))
  })

  it('Add a function param to empty file', () => {
    Canvas
      .welcomeMessageShouldBeVisible()
      .clickTopLevelPlusButton();
    TopLevelPlusWidget.clickOption("Function");

    FunctionForm
      .shouldBeVisible()
      .typeFunctionName("myfunction")
      .typeReturnType("json|error?")
      .addParameter("int", "p1")
      .addParameter("string", "p2")
      .updateParameter("int p1", "float", "p0")
      .save();

    SourceCode.shouldBeEqualTo(
        getCurrentSpecFolder() + "add-param-function.expected.bal");
  })
})
